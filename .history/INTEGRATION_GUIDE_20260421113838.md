# Plug & Play Integration Guide

## You have an existing Spring Boot project? Follow these 2 steps:

---

## Step 1: Add ONE dependency to your `pom.xml` (30 seconds)

```xml
<!-- Add this inside <dependencies> -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.7.0</version>
</dependency>
```

**That's it.** Your service now auto-exposes:
- `http://your-service:port/api-docs` → OpenAPI JSON spec
- `http://your-service:port/swagger-ui.html` → Swagger UI

No code changes needed. SpringDoc auto-scans all your `@RestController` classes.

---

## Step 2: Connect to the Documentation Portal (10 seconds)

1. Open the portal at `http://localhost:3000`
2. Click **"+ Connect"** button (top right)
3. Enter:
   - **Service Name**: Your service name (e.g., "Payment Service")
   - **API Docs URL**: `http://your-service:port/api-docs`
4. Click **Connect Service**

Done! Your API documentation is now searchable and browsable in the portal.

---

## (Optional) Step 3: Enrich with Business Context

Add annotations to your existing controllers for richer documentation:

### Before (basic - still works):
```java
@PostMapping("/payments")
public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
    return ResponseEntity.ok(paymentService.create(payment));
}
```

### After (enriched with business context):
```java
@Operation(
    summary = "Create a payment",
    description = "Business Rule: Payments over $10,000 require manager approval. "
                + "Duplicate payments within 5 minutes are auto-rejected."
)
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Payment created"),
    @ApiResponse(responseCode = "400", description = "Invalid payment details"),
    @ApiResponse(responseCode = "409", description = "Duplicate payment detected")
})
@PostMapping("/payments")
public ResponseEntity<Payment> createPayment(@Valid @RequestBody Payment payment) {
    return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(payment));
}
```

### Model enrichment:
```java
@Schema(description = "Payment amount in USD. Business Rule: Must be positive, max $100,000 per transaction")
private Double amount;

@Schema(description = "Payment status", example = "PENDING")
private String status;
```

---

## Required imports (add to your controller):

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Parameter;
```

---

## For Gradle projects:

```groovy
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
```

---

## For Spring Boot 2.x projects:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.7.0</version>
</dependency>
```

(Uses `javax.*` instead of `jakarta.*`)

---

## CORS Configuration (if portal and service are on different hosts):

Add this to your service:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api-docs/**").allowedOrigins("*");
            }
        };
    }
}
```

---

## Summary

| What you do | Time |
|---|---|
| Add 1 Maven dependency | 30 sec |
| Click "Connect" in portal | 10 sec |
| (Optional) Add @Operation annotations | 5-10 min |

**Total integration time: Under 1 minute for basic docs, 10 minutes for enriched docs.**
