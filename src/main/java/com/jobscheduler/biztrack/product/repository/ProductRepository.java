package com.jobscheduler.biztrack.product.repository;

import com.jobscheduler.biztrack.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    long countByStockQuantityLessThan(Integer quantity);
}
