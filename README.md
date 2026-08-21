# SE 2144 Lab 3 — E-Commerce & Logistics Backend REST API

A Node.js/TypeScript backend API built with **Express** and **node-postgres (`pg`)**, serving CRUD endpoints over the E-Commerce & Logistics database schema. All database access uses raw parameterized SQL — no ORMs or query builders.

## Tech Stack

- **Language:** TypeScript
- **Server:** Express 5
- **DB Driver:** node-postgres (`pg`) with a connection pool (`src/db.ts`)
- **Database:** PostgreSQL

## Prerequisites

- Node.js 18+
- A local PostgreSQL instance

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/KabbalahTreeofLife/castillo-sanol_se2144-lab3.git
   cd castillo-sanol_se2144-lab3
   npm install
   ```

2. **Create the database and load the schema + sample data**

   ```bash
   createdb -U postgres ecommerce_lab
   psql -U postgres -d ecommerce_lab -f sql/schema.sql
   ```

   `sql/schema.sql` creates the six tables (`customer`, `orders`, `product`, `order_item`, `vendor`, `supplies`) and inserts the sample data. It is safe to re-run (drops existing tables first).

3. **Configure environment variables** — create a `.env` file in the project root:

   ```env
   PGUSER=postgres
   PGHOST=localhost
   PGPASSWORD=your_password
   PGDATABASE=ecommerce_lab
   PGPORT=5432
   PORT=3000
   ```

4. **Start the server**

   ```bash
   npm run dev    # nodemon + ts-node, watches src/
   # or
   npm start      # tsx watch
   ```

   The API listens on `http://localhost:3000`.

## API Endpoints

All endpoints are prefixed with `/api/v1`. Request/response bodies are JSON.

### Customers — `/api/v1/customers`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all customers |
| GET | `/:id` | Get one customer (404 if missing) |
| POST | `/` | Create a customer |
| PUT | `/:id` | Update `city` / `membership_level` |
| DELETE | `/:id` | Delete a customer |

### Products — `/api/v1/products`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all products; optional filter: `?category=Electronics` |
| GET | `/:id` | Get one product |
| POST | `/` | Add a product to the catalog |
| PATCH | `/:id/price` | Update a product's `unit_price` |

### Orders — `/api/v1/orders`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all orders |
| GET | `/customer/:customerId` | List orders for one customer |
| POST | `/` | Place a new order |
| DELETE | `/:id` | Delete an order (rejected with 400 if line items exist) |

### Order Items — `/api/v1/order-items`

| Method | Path | Description |
|---|---|---|
| GET | `/:orderId` | List line items for an order |
| POST | `/` | Add a line item to an order |

### Vendors & Supplies — `/api/v1/vendors`, `/api/v1/supplies`

| Method | Path | Description |
|---|---|---|
| GET | `/vendors` | List all vendors |
| GET | `/supplies/vendor/:vendorId` | List stock entries for a vendor |
| PUT | `/supplies/:vendorId/:productId` | Update a supply's `stock_quantity` |

## Error Handling

- All queries use **parameterized values** (`$1`, `$2`, …) to prevent SQL injection.
- Route handlers wrap DB calls in `try/catch`.
- PostgreSQL error codes are mapped per spec:
  - `23503` (foreign key violation) → `400 Bad Request`
  - `23505` (unique/primary key violation) → `400 Bad Request`
  - Missing record → `404 Not Found`
  - Anything else → `500 Internal Server Error`

## Project Structure

```
src/
├── db.ts                  # pg.Pool connection (reads .env)
├── index.ts               # Express app + route mounting
├── types.ts               # Shared row interfaces
└── routes/
    ├── customerRoutes.ts  # /api/v1/customers
    ├── productRoutes.ts   # /api/v1/products
    ├── orderRoutes.ts     # /api/v1/orders
    ├── orderItemRoutes.ts # /api/v1/order-items
    └── vendorSupplyRoutes.ts # /api/v1/vendors, /api/v1/supplies
sql/
└── schema.sql             # DDL + seed data
api-tests/                 # API test collections
```
