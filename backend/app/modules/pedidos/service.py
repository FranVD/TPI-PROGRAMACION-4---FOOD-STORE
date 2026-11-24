from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

# Máquina de estados (RN-02): de cada estado, a qué estados se puede pasar.
# PENDIENTE y EN_PREPARACION tienen transiciones; ENTREGADO y CANCELADO son
# terminales (conjunto vacío).
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    """El pedido no existe."""


class PedidoAjeno(Exception):
    """El pedido pertenece a otro usuario y quien pregunta no es admin."""


class ProductoRepetido(Exception):
    """El mismo producto aparece más de una vez entre los ítems del pedido."""


class ProductoNoDisponible(Exception):
    """El producto existe y está activo, pero disponible=False."""


class StockInsuficiente(Exception):
    """No hay stock suficiente para la cantidad pedida."""


class TransicionInvalida(Exception):
    """La transición de estado pedida no es válida desde el estado actual."""


def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
    """RN-03: devuelve a cada producto el stock de cada línea del pedido."""
    for detalle in pedido.items:
        producto = uow.productos.get_by_id(detalle.producto_id)
        if producto is not None:
            producto.stock += detalle.cantidad
            uow.productos.add(producto)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            producto_ids = [item.producto_id for item in datos.items]
            if len(producto_ids) != len(set(producto_ids)):
                raise ProductoRepetido("No se puede repetir un producto en el mismo pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0,
            )
            uow.pedidos.add(pedido)
            uow.session.flush()  # asigna pedido.id para las líneas

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado("Producto no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para '{producto.nombre}'")

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = producto.precio_base * item.cantidad
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                total += subtotal

            pedido.total = total
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: Usuario, skip: int = 0, limit: int = 20, estado: str | None = None) -> PedidosPaginados:
        with self.uow as uow:
            # admin ve todos; un user solo los propios (RN-04).
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.listar(skip, limit, estado, usuario_id)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés ver un pedido de otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """admin avanza o cancela desde cualquier estado no terminal (RN-02, RN-04)."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            permitidos = TRANSICIONES.get(pedido.estado, set())
            if nuevo_estado not in permitidos:
                raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")

            if nuevo_estado == "CANCELADO":
                _restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """El cliente dueño cancela su propio pedido, solo desde PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en PENDIENTE")

            _restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
