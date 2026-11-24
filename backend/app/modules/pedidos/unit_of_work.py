from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Expone los repositorios de pedidos Y de productos sobre la misma
    sesión: crear o cancelar un pedido descuenta/restituye stock de
    Producto dentro de la misma transacción que crea/cambia el Pedido."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session, Pedido)
        self.productos = ProductoRepository(self.session, Producto)
        return self
