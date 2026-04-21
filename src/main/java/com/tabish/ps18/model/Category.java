package com.tabish.ps18.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "categories")
@Schema(description = "Product category for organizing the catalog. Business Rule: Each product must belong to exactly one category.")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier for the category", example = "1")
    private Long id;

    @NotBlank
    @Column(unique = true)
    @Schema(description = "Category name - must be unique across the system", example = "Electronics")
    private String name;

    @Schema(description = "Detailed description of what products belong in this category", example = "Electronic devices including phones, laptops, and accessories")
    private String description;

    @Schema(description = "Whether this category is active and visible to customers", example = "true")
    private boolean active = true;

    public Category() {}

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
