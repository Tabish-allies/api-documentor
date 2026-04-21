# PS 18 - Auto API Documentation Generator

An automated API documentation system that generates rich documentation from Spring Boot code annotations, enriched with business context, usage examples, and published to a searchable internal portal.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          React Documentation Portal (Port 3000)  │
│  - Searchable & browsable endpoint catalog       │
│  - Request/Response schema display               │
│  - cURL examples & copy-to-clipboard             │
│  - Business context & rules highlighted          │
└─────────────────────┬───────────────────────────┘
                      │ Fetches OpenAPI 3.0 JSON
                      ▼
┌─────────────────────────────────────────────────┐
│     Spring Boot Service (Port 8080)              │
│  - SpringDoc OpenAPI auto-generation             │
│  - Annotated REST controllers                    │
│  - Business logic with documented rules          │
│  - H2 in-memory database with sample data        │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Backend:** Spring Boot 3.4, Spring Data JPA, H2 Database, SpringDoc OpenAPI 3
- **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons
- **Documentation:** OpenAPI 3.0 auto-generated from code annotations

## Quick Start

### 1. Start the Spring Boot Backend

```bash
cd /path/to/ps18
./mvnw spring-boot:run
```

Backend runs at: http://localhost:8080

### 2. Start the React Documentation Portal

```bash
cd docs-portal
npm install
npm run dev
```

Portal runs at: http://localhost:3000

## Key URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Documentation Portal (React UI) |
| http://localhost:8080/swagger-ui.html | Swagger UI (built-in) |
| http://localhost:8080/api-docs | Raw OpenAPI 3.0 JSON spec |
| http://localhost:8080/h2-console | H2 Database Console |

## Sample Service: E-Commerce Inventory

The sample service demonstrates a fully documented e-commerce inventory management system with:

### Endpoints

- **Categories** - CRUD for product categories
- **Products** - Full product catalog management with stock tracking
- **Orders** - Order lifecycle (create, confirm, ship, deliver, cancel)

### Business Rules (Documented via Annotations)

- Products must have positive prices
- Stock cannot go below zero
- Orders auto-deduct inventory on creation
- Cancelled orders restore stock
- Order status follows lifecycle: PENDING → CONFIRMED → SHIPPED → DELIVERED

### Auto-Documentation Features

1. **OpenAPI annotations** on every controller method with:
   - Summary & detailed description
   - Business context & rules
   - Example request/response payloads
   - Parameter descriptions with examples
   - Response code documentation

2. **Schema annotations** on model classes with:
   - Field descriptions
   - Validation constraints
   - Business rules
   - Example values

3. **Searchable portal** with:
   - Full-text search across endpoints
   - Filter by tag/category
   - Expandable endpoint details
   - Copy-to-clipboard cURL commands
   - Schema browser

## Project Structure

```
ps18/
├── src/main/java/com/tabish/ps18/
│   ├── Ps18Application.java          # Main application
│   ├── config/
│   │   ├── OpenApiConfig.java        # OpenAPI metadata config
│   │   ├── CorsConfig.java           # CORS for frontend
│   │   └── DataInitializer.java      # Sample data seeding
│   ├── model/
│   │   ├── Category.java             # Category entity
│   │   ├── Product.java              # Product entity
│   │   └── Order.java                # Order entity
│   ├── repository/
│   │   ├── CategoryRepository.java
│   │   ├── ProductRepository.java
│   │   └── OrderRepository.java
│   ├── service/
│   │   ├── CategoryService.java
│   │   ├── ProductService.java
│   │   └── OrderService.java
│   └── controller/
│       ├── CategoryController.java   # Annotated REST endpoints
│       ├── ProductController.java
│       ├── OrderController.java
│       └── DocMetaController.java    # Documentation metadata
├── docs-portal/                       # React frontend
│   ├── src/App.jsx                   # Main documentation UI
│   └── package.json
└── pom.xml
```

## How It Solves the Problem Statement

| Criteria | Implementation |
|----------|---------------|
| Auto-generated documentation | SpringDoc generates OpenAPI spec from code annotations at runtime |
| All endpoints documented | Every controller method has @Operation, @ApiResponse annotations |
| Request/Response schemas | Models annotated with @Schema including examples |
| Example payloads | @ExampleObject on every POST/PUT endpoint |
| Business context | Descriptions include business rules and domain context |
| Searchable web UI | React portal with full-text search and tag filtering |
| Browsable | Expandable endpoint cards with organized tag navigation |
