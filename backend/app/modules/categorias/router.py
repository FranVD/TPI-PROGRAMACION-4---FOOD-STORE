from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)) -> list[CategoriaRead]:
    return service.listar_activas()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def detalle(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=201)
def crear(
    datos: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.crear(datos)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(
    categoria_id: int,
    datos: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{categoria_id}", status_code=204)
def eliminar(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=204)
