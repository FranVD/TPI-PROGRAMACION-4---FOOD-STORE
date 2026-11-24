from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# check_same_thread solo aplica a SQLite (desarrollo local); Postgres lo ignora.
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


def create_all_tables() -> None:
    """Crea las tablas si no existen (no reemplaza a una migración real, pero
    alcanza para este TPI: el seed es idempotente y no depende de Alembic)."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Una Session nueva por Unit of Work. Quien la abre es responsable de
    cerrarla (lo hace UnitOfWork.__exit__)."""
    return Session(engine)
