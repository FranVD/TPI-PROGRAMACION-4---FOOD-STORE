from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel

from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    estado: str = Field(default="PENDIENTE", nullable=False)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(nullable=False, min_length=5, max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    usuario: Usuario = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    producto_id: int = Field(foreign_key="producto.id", nullable=False)
    cantidad: int = Field(nullable=False, ge=1)
    # Copia inmutable al momento de crear el pedido (RN-05): si el producto
    # cambia de nombre o precio después, esta línea no se entera.
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)

    pedido: Pedido = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="detalles")
