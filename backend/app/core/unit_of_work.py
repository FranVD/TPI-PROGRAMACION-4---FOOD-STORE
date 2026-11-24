from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work base: abre la sesión en __enter__, hace commit o rollback
    y cierra la sesión en __exit__. Ningún Service ni Router llama a
    session.commit() directamente — es la única responsable de confirmar o
    descartar la transacción completa.

    Los módulos con su propio UnitOfWork (categorias, productos, pedidos)
    heredan de esta clase y, en su __enter__, además instancian los
    repositorios que exponen sobre self.session.
    """

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()
