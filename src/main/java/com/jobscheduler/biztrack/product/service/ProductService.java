package com.jobscheduler.biztrack.product.service;

import com.jobscheduler.biztrack.product.dto.ProductRequest;
import com.jobscheduler.biztrack.product.entity.Product;
import com.jobscheduler.biztrack.product.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(ProductRequest request) {

        String sku = request.getSku().trim().toUpperCase();

        if (productRepository.existsBySkuIgnoreCase(sku)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product with this SKU already exists"
            );
        }

        Product product = new Product();

        product.setName(request.getName().trim());
        product.setSku(sku);
        product.setCategory(request.getCategory().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found with ID: " + id
                ));
    }

    public Product updateProduct(Long id, ProductRequest request) {

        Product product = getProductById(id);

        String sku = request.getSku().trim().toUpperCase();

        if (productRepository.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another product already uses this SKU"
            );
        }

        product.setName(request.getName().trim());
        product.setSku(sku);
        product.setCategory(request.getCategory().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
