package com.tabish.ps18.controller;

import com.tabish.ps18.model.Order;
import com.tabish.ps18.service.OrderService;
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
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Order lifecycle management. Business Context: Handles the complete order lifecycle from creation to delivery/cancellation. Integrates with inventory for stock management.")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(
            summary = "Get all orders",
            description = "Retrieves all orders in the system. Business Rule: Admin-only endpoint for order management dashboard."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get order by ID",
            description = "Retrieves a single order with full details including product and status history."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<Order> getOrderById(
            @Parameter(description = "Order ID", example = "1001") @PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer")
    @Operation(
            summary = "Get orders by customer email",
            description = "Retrieves all orders for a specific customer. Business Rule: Customers can only view their own orders."
    )
    @ApiResponse(responseCode = "200", description = "Customer orders returned")
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @Parameter(description = "Customer email address", example = "customer@example.com") @RequestParam String email) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(email));
    }

    @GetMapping("/status/{status}")
    @Operation(
            summary = "Get orders by status",
            description = "Retrieves all orders with a specific status. Business Rule: Used by operations team to manage order fulfillment pipeline."
    )
    @ApiResponse(responseCode = "200", description = "Orders with specified status returned")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @Parameter(description = "Order status filter", example = "PENDING") @PathVariable Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PostMapping
    @Operation(
            summary = "Create a new order",
            description = """
                    Places a new order. Business Rules:
                    - Product must exist and be available
                    - Requested quantity must not exceed available stock
                    - Stock is automatically deducted upon order creation
                    - Total amount is calculated as price × quantity
                    - Initial status is always PENDING
                    """,
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(examples = @ExampleObject(
                            name = "Create Order",
                            value = """
                                    {
                                      "customerEmail": "john.doe@example.com",
                                      "customerName": "John Doe",
                                      "product": { "id": 1 },
                                      "quantity": 2
                                    }
                                    """
                    ))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid order - insufficient stock or invalid product")
    })
    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order) {
        try {
            Order created = orderService.createOrder(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Update order status",
            description = """
                    Updates the status of an order. Business Rules:
                    - Valid transitions: PENDING → CONFIRMED → SHIPPED → DELIVERED
                    - CANCELLED can be set from PENDING or CONFIRMED only
                    - Status cannot move backwards (except to CANCELLED)
                    """,
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(examples = @ExampleObject(
                            name = "Confirm Order",
                            value = """
                                    {
                                      "status": "CONFIRMED"
                                    }
                                    """
                    ))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order status updated"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<Order> updateOrderStatus(
            @Parameter(description = "Order ID", example = "1001") @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(body.get("status"));
        return orderService.updateOrderStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    @Operation(
            summary = "Cancel an order",
            description = """
                    Cancels an order and restores inventory. Business Rules:
                    - Only PENDING and CONFIRMED orders can be cancelled
                    - Stock is automatically restored to the product inventory
                    - Cannot cancel SHIPPED or DELIVERED orders
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order cancelled successfully, stock restored"),
            @ApiResponse(responseCode = "400", description = "Order cannot be cancelled (already shipped/delivered)"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> cancelOrder(
            @Parameter(description = "Order ID", example = "1001") @PathVariable Long id) {
        try {
            return orderService.cancelOrder(id)
                    .map(o -> ResponseEntity.ok(o))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
