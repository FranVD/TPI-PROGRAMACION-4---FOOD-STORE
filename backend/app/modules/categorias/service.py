from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoría no existe, o fue dada de baja y se trata como inexistente."""


class NombreDuplicado(Exception):
    """Ya existe una categoría con ese nombre (único)."""


class CategoriaService:
    """Reglas de negocio de categorías. No conoce HTTP: lanza excepciones de
    dominio: el Router las captura y traduce al código correspondiente."""

    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.get_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(nombre=datos.nombre, descripcion=datos.descripcion)
            uow.categorias.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            if datos.nombre is not None and datos.nombre != categoria.nombre:
                duplicada = uow.categorias.get_by_nombre(datos.nombre)
                if duplicada is not None:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = datos.nombre

            if datos.descripcion is not None:
                categoria.descripcion = datos.descripcion

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)
