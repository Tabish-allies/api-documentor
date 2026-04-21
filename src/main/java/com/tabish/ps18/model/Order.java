package com.tabish.ps18.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Schema(description = "Order entity representing a customer purchase. Business Rule: Orders transition through states: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED or CANCELLED")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique order identifier", example = "1001")
    private Long id;

    @NotBlank
    @Schema(description = "Customer email for order communication", example = "customer@example.com")
    private String customerEmail;

    @NotBlank
    @Schema(description = "Customer full name", example = "John Doe")
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @Schema(description = "The product being ordered")
    private Product product;

    @NotNull
    @Positive
    @Schema(description = "Quantity of product ordered. Business Rule: Must not exceed available stock", example = "2")
    private Integer quantity;

    @Schema(description = "Total order amount (price * quantity)", example = "1999.98")
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Schema(description = "Current order status. Business Rule: Can only move forward in lifecycle (except CANCELLED)", example = "PENDING")
    private OrderStatus status = OrderStatus.PENDING;

    @Schema(description = "Timestamp when order was created", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp of last status update", example = "2024-01-15T11:00:00")
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    public Order() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; this.updatedAt = LocalDateTime.now(); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
