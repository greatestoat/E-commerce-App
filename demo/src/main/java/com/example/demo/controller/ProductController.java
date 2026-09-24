package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final JwtUtil jwtUtil;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public ProductController(ProductRepository productRepository, JwtUtil jwtUtil) {
        this.productRepository = productRepository;
        this.jwtUtil = jwtUtil;
    }

    // Returns null if OK, or a ResponseEntity to return immediately if rejected
    private ResponseEntity<?> requireAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or malformed Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        return null; // OK
    }

    // Public — anyone can browse products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getImage(@PathVariable String filename) throws IOException {
        Path filePath = Path.of(uploadDir, filename);
        org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header("Content-Type", Files.probeContentType(filePath))
                .body(resource);
    }

    // Admin only — create product
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam("image") MultipartFile image) throws IOException {

        ResponseEntity<?> denied = requireAdmin(authHeader);
        if (denied != null) return denied;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path filePath = Path.of(uploadDir, filename);
        Files.write(filePath, image.getBytes());

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setImageUrl("/api/products/images/" + filename);

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Admin only — delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        ResponseEntity<?> denied = requireAdmin(authHeader);
        if (denied != null) return denied;

        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}