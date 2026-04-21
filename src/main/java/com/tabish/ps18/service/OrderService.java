package com.tabish.ps18.service;

import com.tabish.ps18.model.Order;
import com.tabish.ps18.model.Product;
import com.tabish.ps18.repository.OrderRepository;
import com.tabish.ps18.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByCustomer(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order createOrder(Order order) {
        Product product = order.getProduct();
        if (product == null || product.getId() == null) {
            throw new IllegalArgumentException("Product is required");
        }

        Product dbProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (dbProduct.getStockQuantity() < order.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + dbProduct.getStockQuantity());
        }

        // Deduct stock
        dbProduct.setStockQuantity(dbProduct.getStockQuantity() - order.getQuantity());
        productRepository.save(dbProduct);

        // Calculate total
        order.setProduct(dbProduct);
        order.setTotalAmount(dbProduct.getPrice() * order.getQuantity());
        order.setStatus(Order.OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    public Optional<Order> updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(newStatus);
            return orderRepository.save(order);
        });
    }

    @Transactional
    public Optional<Order> cancelOrder(Long id) {
        return orderRepository.findById(id).map(order -> {
            if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
                throw new IllegalArgumentException("Cannot cancel order that is already " + order.getStatus());
            }
            // Restore stock
            Product product = order.getProduct();
            product.setStockQuantity(product.getStockQuantity() + order.getQuantity());
            productRepository.save(product);

            order.setStatus(Order.OrderStatus.CANCELLED);
            return orderRepository.save(order);
        });
    }
}
