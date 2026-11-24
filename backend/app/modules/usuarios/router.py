from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.core.unit_of_work import UnitOfWork as _UoWBase  # noqa: F401  (solo para tipado implícito)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    return service.desactivar(usuario_id, admin)
