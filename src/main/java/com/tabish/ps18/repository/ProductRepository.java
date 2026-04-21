package com.tabish.ps18.repository;

import com.tabish.ps18.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByAvailableTrue();
    List<Product> findByNameContainingIgnoreCase(String name);
}
