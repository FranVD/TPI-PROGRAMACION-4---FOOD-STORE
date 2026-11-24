from datetime import datetime, timedelta, timezone

from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
        usuario_id: int | None = None,
    ) -> tuple[int, list[Pedido]]:
        """usuario_id=None lista todos (admin); con usuario_id filtra los
        propios del cliente."""
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        items = list(
            self.session.exec(
                select(Pedido)
                .where(*condiciones)
                .order_by(Pedido.created_at.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_hoy(self) -> int:
        inicio_hoy = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        fin_hoy = inicio_hoy + timedelta(days=1)
        return self.session.exec(
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy, Pedido.created_at < fin_hoy)
        ).one()

    def sum_ingresos_entregados(self) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == "ENTREGADO")
        ).one()
        return float(total)
