package com.tabish.ps18.controller;

import com.tabish.ps18.model.Product;
import com.tabish.ps18.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product catalog management. Business Context: Core service for managing product inventory, pricing, and availability for the e-commerce platform.")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(
            summary = "Get all products",
            description = "Retrieves all products in the catalog. Business Rule: Includes both available and unavailable products (admin view)."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/available")
    @Operation(
            summary = "Get available products",
            description = "Retrieves only products that are currently available for purchase. Business Rule: Products with stock > 0 and available=true are shown to customers."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved available products")
    public ResponseEntity<List<Product>> getAvailableProducts() {
        return ResponseEntity.ok(productService.getAvailableProducts());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get product by ID",
            description = "Retrieves a single product with full details including category and stock information."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<Product> getProductById(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sku/{sku}")
    @Operation(
            summary = "Get product by SKU",
            description = "Retrieves a product by its Stock Keeping Unit identifier. Business Rule: SKU is the primary identifier used by warehouse and fulfillment teams."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product with given SKU not found")
    })
    public ResponseEntity<Product> getProductBySku(
            @Parameter(description = "Product SKU", example = "APL-IPH15P-256") @PathVariable String sku) {
        return productService.getProductBySku(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search products by name",
            description = "Searches products by name (case-insensitive partial match). Business Rule: Used for storefront search functionality."
    )
    @ApiResponse(responseCode = "200", description = "Search results returned")
    public ResponseEntity<List<Product>> searchProducts(
            @Parameter(description = "Search query", example = "iPhone") @RequestParam String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(
            summary = "Get products by category",
            description = "Retrieves all products in a specific category. Business Rule: Used for category-based browsing on the storefront."
    )
    @ApiResponse(responseCode = "200", description = "Products in category returned")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @Parameter(description = "Category ID", example = "1") @PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @PostMapping
    @Operation(
            summary = "Create a new product",
            description = "Creates a new product in the catalog. Business Rule: SKU must be unique, price must be positive, initial stock must be >= 0.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(examples = @ExampleObject(
                            name = "Create Product",
                            value = """
                                    {
                                      "name": "iPhone 15 Pro",
                                      "description": "Latest Apple smartphone with A17 Pro chip",
                                      "price": 999.99,
                                      "stockQuantity": 50,
                                      "sku": "APL-IPH15P-256",
                                      "available": true,
                                      "category": { "id": 1 }
                                    }
                                    """
                    ))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input - check price, stock, and SKU uniqueness")
    })
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update a product",
            description = "Updates all fields of an existing product. Business Rule: Price changes take effect immediately for new orders.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(examples = @ExampleObject(
                            name = "Update Product",
                            value = """
                                    {
                                      "name": "iPhone 15 Pro Max",
                                      "description": "Updated description",
                                      "price": 1199.99,
                                      "stockQuantity": 30,
                                      "sku": "APL-IPH15PM-256",
                                      "available": true,
                                      "category": { "id": 1 }
                                    }
                                    """
                    ))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<Product> updateProduct(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id,
            @Valid @RequestBody Product product) {
        return productService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/stock")
    @Operation(
            summary = "Update product stock",
            description = "Adjusts product stock by a given quantity (positive to add, negative to deduct). Business Rule: Stock cannot go below 0. Used by warehouse team for inventory adjustments.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(examples = @ExampleObject(
                            name = "Add Stock",
                            value = """
                                    {
                                      "quantityChange": 10
                                    }
                                    """
                    ))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stock updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid stock adjustment (would result in negative stock)"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<?> updateStock(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        try {
            int quantityChange = body.getOrDefault("quantityChange", 0);
            return productService.updateStock(id, quantityChange)
                    .map(p -> ResponseEntity.ok(p))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a product",
            description = "Removes a product from the catalog. Business Rule: Products with pending orders should be marked unavailable instead of deleted."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
