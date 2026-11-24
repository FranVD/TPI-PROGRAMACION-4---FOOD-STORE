from fastapi import HTTPException, status

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """CRUD de administración de usuarios (listar, activar, desactivar).
    El registro y el login viven en auth/service.py, que usa el mismo
    modelo Usuario pero no pasa por este Unit of Work (ver nota de
    arquitectura del PDF: auth y usuarios pueden conservar el estilo del
    proyecto de seguridad del que se parte)."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all()
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, usuario_actual: Usuario) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if usuario.id == usuario_actual.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un admin no puede desactivarse a sí mismo",
                )
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
