# API

Base URL: `/api`

Health: `GET /api/health`

Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`

Products: `GET /api/v1/products`, `GET /api/v1/products/:id`, admin `POST/PATCH/DELETE`

Categories: `GET /api/v1/categories`, admin `POST /api/v1/categories`

Enquiries: `POST /api/v1/enquiries`, authenticated `GET /api/v1/enquiries`, `GET /api/v1/enquiries/:id`, admin `PATCH`

Inventory: admin `GET /api/v1/inventory`, `GET /api/v1/inventory/:productId`, `POST /api/v1/inventory/movements`

Orders: authenticated `POST/GET /api/v1/orders`, `GET /api/v1/orders/:id`, admin `PATCH /api/v1/orders/:id/status`

Admin: `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/customers`
