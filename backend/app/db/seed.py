"""Seed idempotente: admin + categorías + productos de ejemplo.

Correrlo varias veces no duplica nada: busca por username/nombre antes de
crear. Uso: python -m app.db.seed
"""

from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401 (registra las tablas en el mapper)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def seed_admin(session) -> None:
    existente = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
    if existente:
        print("admin ya existe, no se crea de nuevo")
        return
    admin = Usuario(
        username="admin",
        full_name="Administrador Food Store",
        email="admin@foodstore.com",
        hashed_password=hash_password("Admin1234!"),
        role="admin",
        disabled=False,
    )
    session.add(admin)
    print("creado usuario admin (username=admin, password=Admin1234!)")


def seed_cliente_demo(session) -> None:
    existente = session.exec(select(Usuario).where(Usuario.username == "cliente")).first()
    if existente:
        print("cliente demo ya existe, no se crea de nuevo")
        return
    cliente = Usuario(
        username="cliente",
        full_name="Cliente de Prueba",
        email="cliente@foodstore.com",
        hashed_password=hash_password("Cliente1234!"),
        role="user",
        disabled=False,
    )
    session.add(cliente)
    print("creado usuario cliente (username=cliente, password=Cliente1234!)")


def seed_categorias(session) -> dict[str, Categoria]:
    nombres = ["Hamburguesas", "Pizzas", "Bebidas", "Postres"]
    categorias: dict[str, Categoria] = {}
    for nombre in nombres:
        existente = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if existente:
            categorias[nombre] = existente
            continue
        categoria = Categoria(nombre=nombre, descripcion=f"Categoría {nombre}", activo=True)
        session.add(categoria)
        session.flush()
        categorias[nombre] = categoria
        print(f"creada categoría '{nombre}'")
    return categorias


def seed_productos(session, categorias: dict[str, Categoria]) -> None:
    productos = [
        ("Hamburguesa Clásica", "Hamburguesas", 4500.0, 30),
        ("Hamburguesa Doble Cheddar", "Hamburguesas", 5800.0, 20),
        ("Hamburguesa Veggie", "Hamburguesas", 4800.0, 15),
        ("Pizza Muzzarella", "Pizzas", 6200.0, 25),
        ("Pizza Napolitana", "Pizzas", 6800.0, 20),
        ("Coca-Cola 500ml", "Bebidas", 1500.0, 50),
        ("Agua Mineral 500ml", "Bebidas", 1000.0, 50),
        ("Brownie con Helado", "Postres", 3200.0, 18),
        ("Flan Casero", "Postres", 2800.0, 12),
    ]
    for nombre, nombre_categoria, precio, stock in productos:
        existente = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existente:
            continue
        producto = Producto(
            categoria_id=categorias[nombre_categoria].id,
            nombre=nombre,
            descripcion=f"{nombre} - producto de catálogo",
            precio_base=precio,
            stock=stock,
            disponible=True,
            activo=True,
        )
        session.add(producto)
        print(f"creado producto '{nombre}'")


def main() -> None:
    create_all_tables()
    with session_factory() as session:
        seed_admin(session)
        seed_cliente_demo(session)
        categorias = seed_categorias(session)
        session.flush()
        seed_productos(session, categorias)
        session.commit()
    print("seed completo.")


if __name__ == "__main__":
    main()
