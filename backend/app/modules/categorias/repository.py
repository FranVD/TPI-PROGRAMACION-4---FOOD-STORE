from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def get_activas(self) -> list[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo == True)).all())  # noqa: E712
