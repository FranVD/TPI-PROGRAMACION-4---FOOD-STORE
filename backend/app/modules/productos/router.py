from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    disponible: bool | None = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def detalle(producto_id: int, service: ProductoService = Depends(get_producto_service)) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=ProductoRead, status_code=201)
def crear(
    datos: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{producto_id}", status_code=204)
def eliminar(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=204)
