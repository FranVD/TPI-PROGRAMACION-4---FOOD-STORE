from collections.abc import Generator

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_session() -> Generator[Session, None, None]:
    """Sesión de corta vida para las dependencias de auth (que no pasan por
    el Unit of Work de ningún módulo: leen al usuario de la cookie antes de
    que el Router/Service del endpoint abra su propio UoW)."""
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    """Lee la cookie HttpOnly access_token, valida el JWT y carga el Usuario.
    401 si falta la cookie, el token es inválido/vencido, o el usuario ya
    no existe."""
    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No hay sesión activa")

    username = decode_access_token(access_token)
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o vencida")

    usuario = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o vencida")

    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Igual que get_current_user, pero además rechaza una cuenta desactivada."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(allowed_roles: list[str]):
    """Factory de dependencia: 403 si el rol del usuario no está en la lista."""

    def dependency(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permisos para esta acción")
        return usuario

    return dependency
