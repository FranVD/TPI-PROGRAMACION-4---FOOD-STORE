from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=201)
def crear(
    datos: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    usuario: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.crear(datos, usuario.id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("", response_model=PedidosPaginados)
def listar(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = Query(default=None),
    service: PedidoService = Depends(get_pedido_service),
    usuario: Usuario = Depends(get_current_active_user),
) -> PedidosPaginados:
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id} para que FastAPI no interprete "resumen"
# como un pedido_id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen(
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def detalle(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    usuario: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    usuario: Usuario = Depends(get_current_active_user),
) -> PedidoRead:
    try:
        return service.cancelar_propio(pedido_id, usuario.id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
