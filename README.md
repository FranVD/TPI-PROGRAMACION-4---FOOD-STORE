# Food Store — Trabajo Práctico Integrador

**Alumno:** Reynoso Arellano, Franco
**Materia:** Programación IV — Tecnicatura Universitaria en Programación a Distancia (UTN)

Repositorio: `<PEGAR ACÁ LA URL PÚBLICA DEL REPOSITORIO DE GITHUB>`

Video de demostración (10–15 min): `<PEGAR ACÁ EL LINK PÚBLICO DEL VIDEO>`

---

## Descripción

Sistema de pedidos para un local de comidas, con backend FastAPI + SQLModel
(arquitectura Router → Service → Unit of Work → Repository → Model) y
frontend React + TypeScript organizado por features. Incluye catálogo
público, carrito y checkout para clientes, y un panel de administración
completo (categorías, productos, pedidos y usuarios).

## Requisitos

- Python 3.11 o superior
- Node.js 22 y pnpm 9+ (`npm install -g pnpm` si no lo tenés)
- No hace falta tener PostgreSQL instalado: por defecto corre con SQLite
  (archivo local, cero configuración). Postgres es opcional, ver más abajo.

---

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

El `.env` ya queda funcionando con SQLite sin tocar nada más (no hace falta
tener Postgres instalado). Si se prefiere Postgres, comentar la línea de
`DATABASE_URL` con SQLite y descomentar la de Postgres con las credenciales
propias.

Cargar el usuario admin, categorías y productos de ejemplo (idempotente, se
puede correr más de una vez sin duplicar nada):

```bash
python -m app.db.seed
```

Levantar el servidor:

```bash
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1` y la documentación interactiva
(Swagger) en `http://localhost:8000/docs`.

### Variables de entorno (`backend/.env.example`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión (Postgres o SQLite) |
| `SECRET_KEY` | Clave de firma del JWT (cambiar en producción) |
| `ALGORITHM` | Algoritmo del JWT (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez de la sesión (30) |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (`http://localhost:5173`) |

### Usuarios cargados por el seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

---

## Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm build    # compila y verifica los tipos de TypeScript
pnpm dev
```

La app queda en `http://localhost:5173`. Necesita el backend corriendo (ver
arriba) en la URL configurada en `frontend/.env`.

### Variables de entorno (`frontend/.env.example`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (`http://localhost:8000/api/v1`) |

---

## Estructura del proyecto

```
tpi-food-store/
├── backend/
│   ├── app/
│   │   ├── core/              # config, DB, seguridad, UnitOfWork y Repository base
│   │   ├── modules/
│   │   │   ├── auth/          # registro, login, logout, /me
│   │   │   ├── usuarios/      # ABM de usuarios (admin)
│   │   │   ├── categorias/    # ABM de categorías
│   │   │   ├── productos/     # ABM de productos, stock
│   │   │   └── pedidos/       # pedidos y reglas de negocio (RN-01 a RN-06)
│   │   ├── db/seed.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── features/          # auth, catalog, cart, orders, admin
    │   ├── shared/             # api client, componentes UI, layout
    │   ├── store/               # authStore y cartStore (Zustand + persist)
    │   └── routes/             # AppRouter y ProtectedRoute
    └── .env.example
```

## Notas de arquitectura

- El backend separa estrictamente Router → Service → Unit of Work →
  Repository → Model. Los módulos `categorias`, `productos` y `pedidos`
  usan excepciones de dominio propias (traducidas a HTTP en el Router);
  `auth` y `usuarios` responden con `HTTPException` directamente, como
  indica la consigna.
- Las reglas de negocio de pedidos (stock atómico, máquina de estados,
  restitución de stock al cancelar, visibilidad por rol) están implementadas
  en `app/modules/pedidos/service.py`.
- El frontend guarda la sesión en una cookie HttpOnly (nunca en
  `localStorage`); `authStore` solo cachea los datos del usuario para no
  mostrar pantallas en blanco mientras se confirma la sesión con `/auth/me`.
