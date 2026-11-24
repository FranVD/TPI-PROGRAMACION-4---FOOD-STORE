from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Lista solo productos activos, con búsqueda por nombre (sin
        distinguir mayúsculas) y filtros opcionales. Devuelve (total, items)
        para armar ProductosPaginados."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if search:
            condiciones.append(func.lower(Producto.nombre).contains(search.lower()))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = list(
            self.session.exec(
                select(Producto).where(*condiciones).offset(skip).limit(limit)
            ).all()
        )
        return total, items
