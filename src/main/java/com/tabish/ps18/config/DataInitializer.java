package com.tabish.ps18.config;

import com.tabish.ps18.model.Category;
import com.tabish.ps18.model.Order;
import com.tabish.ps18.model.Product;
import com.tabish.ps18.repository.CategoryRepository;
import com.tabish.ps18.repository.OrderRepository;
import com.tabish.ps18.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(CategoryRepository categoryRepo, ProductRepository productRepo, OrderRepository orderRepo) {
        return args -> {
            // Create Categories
            Category electronics = categoryRepo.save(new Category("Electronics", "Electronic devices and gadgets"));
            Category clothing = categoryRepo.save(new Category("Clothing", "Apparel and fashion items"));
            Category books = categoryRepo.save(new Category("Books", "Physical and digital books"));

            // Create Products
            Product iphone = new Product("iPhone 15 Pro", "Latest Apple smartphone with A17 Pro chip", 999.99, 50, "APL-IPH15P-256");
            iphone.setCategory(electronics);
            productRepo.save(iphone);

            Product macbook = new Product("MacBook Air M3", "Lightweight laptop with M3 chip", 1299.99, 30, "APL-MBA-M3");
            macbook.setCategory(electronics);
            productRepo.save(macbook);

            Product tshirt = new Product("Classic T-Shirt", "100% cotton comfortable t-shirt", 29.99, 200, "CLT-TS-001");
            tshirt.setCategory(clothing);
            productRepo.save(tshirt);

            Product jeans = new Product("Slim Fit Jeans", "Modern slim fit denim jeans", 79.99, 100, "CLT-JN-001");
            jeans.setCategory(clothing);
            productRepo.save(jeans);

            Product javaBook = new Product("Effective Java", "Best practices for Java programming by Joshua Bloch", 45.99, 75, "BK-JAVA-001");
            javaBook.setCategory(books);
            productRepo.save(javaBook);

            // Create sample orders
            Order order1 = new Order();
            order1.setCustomerEmail("john@example.com");
            order1.setCustomerName("John Doe");
            order1.setProduct(iphone);
            order1.setQuantity(1);
            order1.setTotalAmount(999.99);
            order1.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepo.save(order1);

            Order order2 = new Order();
            order2.setCustomerEmail("jane@example.com");
            order2.setCustomerName("Jane Smith");
            order2.setProduct(tshirt);
            order2.setQuantity(3);
            order2.setTotalAmount(89.97);
            order2.setStatus(Order.OrderStatus.PENDING);
            orderRepo.save(order2);

            System.out.println("Sample data initialized successfully!");
        };
    }
}
