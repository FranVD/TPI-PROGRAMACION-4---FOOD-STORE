from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """El producto no existe, o fue dado de baja y se trata como inexistente."""


def _categoria_valida(uow: ProductoUnitOfWork, categoria_id: int) -> None:
    categoria = uow.categorias.get_by_id(categoria_id)
    if categoria is None or not categoria.activo:
        raise CategoriaNoEncontrada("Categoría no encontrada")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            _categoria_valida(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump())
            uow.productos.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            cambios = datos.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                _categoria_valida(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)
