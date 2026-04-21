package com.tabish.ps18.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "products")
@Schema(description = "Product entity representing an item in the catalog. Business Rule: Price must be positive, stock cannot go negative.")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique product identifier (auto-generated)", example = "1")
    private Long id;

    @NotBlank
    @Schema(description = "Product name displayed to customers", example = "iPhone 15 Pro")
    private String name;

    @Schema(description = "Detailed product description for the product page", example = "Latest Apple smartphone with A17 Pro chip")
    private String description;

    @NotNull
    @Positive
    @Schema(description = "Product price in USD. Business Rule: Must be greater than 0", example = "999.99")
    private Double price;

    @NotNull
    @Min(0)
    @Schema(description = "Current stock quantity. Business Rule: Orders are rejected if stock is insufficient", example = "50")
    private Integer stockQuantity;

    @Schema(description = "Stock Keeping Unit - unique product identifier for inventory", example = "APL-IPH15P-256")
    @Column(unique = true)
    private String sku;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @Schema(description = "Category this product belongs to")
    private Category category;

    @Schema(description = "Whether the product is currently available for purchase", example = "true")
    private boolean available = true;

    public Product() {}

    public Product(String name, String description, Double price, Integer stockQuantity, String sku) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.sku = sku;
        this.available = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
