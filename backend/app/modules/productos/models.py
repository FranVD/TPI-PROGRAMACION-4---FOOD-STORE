from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.modules.categorias.models import Categoria

if TYPE_CHECKING:
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", nullable=False)
    nombre: str = Field(nullable=False)
    descripcion: str | None = Field(default=None)
    precio_base: float = Field(nullable=False, ge=0)
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0, nullable=False, ge=0)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    categoria: Categoria = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
