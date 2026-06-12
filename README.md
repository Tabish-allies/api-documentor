# API Documentor

An open-source automated API documentation system that generates rich, searchable documentation from Spring Boot code annotations. It enriches standard OpenAPI specs with business context, usage examples, and publishes them to a browsable React-based portal.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Integrating Your Own Service](#integrating-your-own-service)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Auto-generated OpenAPI 3.0 documentation** from Spring Boot code annotations at runtime
- **Searchable web portal** with full-text search across all endpoints
- **Business context documentation** via enriched annotations (rules, constraints, examples)
- **Copy-to-clipboard cURL commands** for quick API testing
- **Tag-based filtering** and organized endpoint navigation
- **Request/Response schema browser** with validation constraints and example values
- **Plug-and-play integration** for any existing Spring Boot service (under 1 minute)
- **Zero configuration required** for basic documentation generation

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│          React Documentation Portal (Port 3000)  │
│  - Searchable and browsable endpoint catalog     │
│  - Request/Response schema display               │
│  - cURL examples with copy-to-clipboard          │
│  - Business context and rules highlighted        │
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

---

## Tech Stack

- **Backend:** Spring Boot 3.4, Spring Data JPA, H2 Database, SpringDoc OpenAPI 3
- **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons
- **Documentation Standard:** OpenAPI 3.0 (auto-generated from code annotations)

---

## Prerequisites

- Java 21 or higher
- Maven 3.8+ (or use the included Maven wrapper `./mvnw`)
- Node.js 18+ and npm 9+
- Git

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/api-documentor.git
cd api-documentor
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if you need to customize any settings. The defaults work out of the box for local development using an H2 in-memory database.

### 3. Start the Backend

```bash
./mvnw spring-boot:run
```

The backend starts at http://localhost:8080

### 4. Start the Documentation Portal

```bash
cd docs-portal
npm install
npm run dev
```

The portal starts at http://localhost:3000

---

## Configuration

All configuration is managed through environment variables. Copy `.env.example` to `.env` and customize as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `api-documentor` | Application name |
| `SERVER_PORT` | `8080` | Backend server port |
| `DATASOURCE_URL` | `jdbc:h2:mem:apidocs` | Database JDBC URL |
| `DATASOURCE_DRIVER` | `org.h2.Driver` | Database driver class |
| `DATASOURCE_USERNAME` | `sa` | Database username |
| `DATASOURCE_PASSWORD` | *(empty)* | Database password |
| `JPA_PLATFORM` | `org.hibernate.dialect.H2Dialect` | Hibernate dialect |
| `JPA_DDL_AUTO` | `create-drop` | Schema generation strategy |
| `H2_CONSOLE_ENABLED` | `true` | Enable H2 web console |

For production deployments, configure a persistent database (PostgreSQL, MySQL, etc.) via these environment variables. See `.env.example` for a PostgreSQL configuration example.

---

## Usage

Once both services are running, access:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Documentation Portal (React UI) |
| http://localhost:8080/swagger-ui.html | Swagger UI (built-in) |
| http://localhost:8080/api-docs | Raw OpenAPI 3.0 JSON spec |
| http://localhost:8080/h2-console | H2 Database Console |

### Sample Service

The project includes a sample E-Commerce Inventory service to demonstrate the documentation capabilities:

- **Categories** - CRUD for product categories
- **Products** - Full product catalog management with stock tracking
- **Orders** - Order lifecycle management (create, confirm, ship, deliver, cancel)

---

## Integrating Your Own Service

You can connect any existing Spring Boot service to the documentation portal. See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed instructions.

**Quick version:**

1. Add the SpringDoc dependency to your `pom.xml`:
   ```xml
   <dependency>
       <groupId>org.springdoc</groupId>
       <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
       <version>2.3.0</version>
   </dependency>
   ```

2. Start your service and open the portal at http://localhost:3000

3. Click "+ Connect" and enter your service's `/api-docs` URL

Alternatively, use the integration script:
```bash
./integrate.sh /path/to/your/spring-boot-project
```

---

## Project Structure

```
api-documentor/
├── src/main/java/com/tabish/ps18/
│   ├── Ps18Application.java            # Application entry point
│   ├── config/
│   │   ├── OpenApiConfig.java          # OpenAPI metadata configuration
│   │   ├── CorsConfig.java             # CORS configuration
│   │   └── DataInitializer.java        # Sample data seeding
│   ├── model/
│   │   ├── Category.java               # Category entity
│   │   ├── Product.java                # Product entity
│   │   └── Order.java                  # Order entity
│   ├── repository/
│   │   ├── CategoryRepository.java
│   │   ├── ProductRepository.java
│   │   └── OrderRepository.java
│   ├── service/
│   │   ├── CategoryService.java
│   │   ├── ProductService.java
│   │   └── OrderService.java
│   └── controller/
│       ├── CategoryController.java     # Annotated REST endpoints
│       ├── ProductController.java
│       ├── OrderController.java
│       ├── DocMetaController.java      # Documentation metadata
│       └── RegistryController.java     # Service registry
├── docs-portal/                         # React documentation frontend
│   ├── src/
│   │   ├── App.jsx                     # Main documentation UI
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Styles
│   ├── package.json
│   └── vite.config.js
├── .env.example                         # Environment variable template
├── .gitignore
├── CONTRIBUTING.md                      # Contribution guidelines
├── INTEGRATION_GUIDE.md                 # Guide for integrating services
├── LICENSE                              # MIT License
├── integrate.sh                         # One-click integration script
└── pom.xml                              # Maven configuration
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the development workflow, coding standards, and how to submit pull requests.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
