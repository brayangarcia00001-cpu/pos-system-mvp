# POS Pro — Sistema Punto de Venta

MVP completo con backend Express + SQLite/Prisma y frontend React + Vite + Tailwind.

## Stack
- **Backend**: Node.js, Express, Prisma, SQLite, JWT, bcryptjs
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, html5-qrcode, Zustand

## Módulos
- ✅ Auth JWT (login/register, roles admin/cashier)
- ✅ Dashboard (ventas del día, resumen, transacciones recientes)
- ✅ POS (carrito, scanner cámara, descuentos, efectivo/tarjeta)
- ✅ Inventario (CRUD completo, scanner barcode, stock alerts)
- ✅ Estadísticas (gráficas de ventas, top productos)
- ✅ Responsive móvil

## Setup rápido

```bash
# 1. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 2. Inicializar base de datos
cd backend
npx prisma db push
node src/utils/seed.js

# 3. Iniciar backend (terminal 1)
cd backend && npm run dev

# 4. Iniciar frontend (terminal 2)
cd frontend && npm run dev
```

## Acceso
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Credenciales demo
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@pos.com | admin123 |
| Cajero | cajero@pos.com | cashier123 |

## Estructura
```
pos-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos DB
│   └── src/
│       ├── index.js            # Express server
│       ├── middleware/
│       │   └── auth.js         # JWT middleware
│       ├── routes/
│       │   ├── auth.js
│       │   ├── products.js
│       │   ├── sales.js
│       │   ├── categories.js
│       │   └── dashboard.js
│       └── utils/
│           ├── prisma.js       # DB client
│           └── seed.js         # Datos iniciales
└── frontend/
    └── src/
        ├── App.jsx             # Router
        ├── store/
        │   └── authStore.js    # Zustand auth
        ├── utils/
        │   └── api.js          # Axios instance
        ├── components/
        │   └── layout/
        │       └── Layout.jsx  # Sidebar + nav
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── InventoryPage.jsx
            ├── POSPage.jsx
            └── StatsPage.jsx
```

## API Endpoints
```
POST /api/auth/login
POST /api/auth/register  
GET  /api/auth/me

GET  /api/products
POST /api/products
PUT  /api/products/:id
DEL  /api/products/:id
GET  /api/products/barcode/:code
GET  /api/products/low-stock

GET  /api/sales
POST /api/sales
GET  /api/sales/:id

GET  /api/categories
POST /api/categories

GET  /api/dashboard/summary
GET  /api/dashboard/sales-chart?days=7
GET  /api/dashboard/top-products
```
