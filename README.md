# BizTrack - Business Management Dashboard & REST API

BizTrack is a full-stack business management application built with React, Java Spring Boot, and PostgreSQL. It provides a centralized dashboard for managing customers, products, inventory, and customer orders.

## Features

- **Dashboard Analytics:** View customer, product, order, revenue, and inventory statistics.
- **Customer Management:** Create, view, update, and delete customer records.
- **Product Management:** Manage product details, prices, SKUs, categories, and stock quantities.
- **Order Management:** Create orders, view order history, update order statuses, and cancel eligible orders.
- **Inventory Management:** Automatically deduct stock when orders are created and restore stock when eligible orders are cancelled.
- **Validation:** Validate required fields, email addresses, product prices, stock quantities, and unique SKUs.
- **Error Handling:** Handle missing records, duplicate data, insufficient stock, and invalid order status transitions.
- **Frontend Feedback:** Provide loading states and error messages during API operations.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Axios
- Recharts
- Lucide React

### Backend
- Java 21
- Spring Boot 3.5.7
- Spring Web
- Spring Data JPA
- Hibernate
- Maven

### Database
- PostgreSQL 17

## Project Structure

```text
biztrack/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/jobscheduler/biztrack/
│   │   │   ├── config/
│   │   │   ├── customer/
│   │   │   ├── dashboard/
│   │   │   ├── order/
│   │   │   └── product/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

- Java 21
- PostgreSQL 17
- Node.js and npm

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd biztrack
```

### 2. Create the PostgreSQL database

```sql
CREATE DATABASE biztrack_db;
```

### 3. Configure backend environment variables

In PowerShell, set:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/biztrack_db"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_postgres_password"
```

Never commit real database passwords or secrets.

### 4. Run the backend

From the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs at `http://localhost:8080`.

### 5. Run the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

The frontend defaults to `http://localhost:8080/api`. To override it, configure `VITE_API_BASE_URL` in a frontend environment file.

## REST API Endpoints

| Module | Endpoint | Operations |
|---|---|---|
| Dashboard | `/api/dashboard/summary` | GET |
| Customers | `/api/customers` | GET, POST |
| Customers | `/api/customers/{id}` | GET, PUT, DELETE |
| Products | `/api/products` | GET, POST |
| Products | `/api/products/{id}` | GET, PUT, DELETE |
| Orders | `/api/orders` | GET, POST |
| Orders | `/api/orders/{id}` | GET |
| Orders | `/api/orders/{id}/status` | PATCH |
| Orders | `/api/orders/{id}/cancel` | PATCH |

## Order Workflow

```text
PENDING → CONFIRMED → SHIPPED → DELIVERED
```

Eligible pending or confirmed orders can be cancelled. Inventory is restored when an order is cancelled.

## Running Tests

Run backend tests from the project root:

```powershell
.\mvnw.cmd clean test
```

## Production Build

Build the frontend:

```powershell
cd frontend
npm run build
```

Production files are generated in `frontend/dist`.

## Project Status

The core backend APIs, customer and product CRUD, order workflows, inventory updates, dashboard analytics, and React frontend have been implemented. Backend tests and the frontend production build have been run successfully during development.
