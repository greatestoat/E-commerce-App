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

    private ResponseEntity<?> requireAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or malformed Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }
        if (!"ADMIN".equals(jwtUtil.getRoleFromToken(token))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        return null;
    }

    // Public — optional ?category=Fashion filter
    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return productRepository.findByCategoryIgnoreCase(category);
        }
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

    private String saveImage(MultipartFile file) throws IOException {
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.write(Path.of(uploadDir, filename), file.getBytes());
        return "/api/products/images/" + filename;
    }

    // Admin only — create product
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam Double price,
            @RequestParam(required = false) Double originalPrice,
            @RequestParam String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String highlights,
            @RequestParam(required = false) String specifications,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {

        ResponseEntity<?> denied = requireAdmin(authHeader);
        if (denied != null) return denied;

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setCategory(category);
        product.setBrand(brand);
        product.setStock(stock);
        product.setRating(rating);
        product.setHighlights(highlights);
        product.setSpecifications(specifications);
        product.setImageUrl(saveImage(image));

        if (images != null) {
            for (MultipartFile f : images) {
                if (f != null && !f.isEmpty()) product.getImages().add(saveImage(f));
            }
        }
        return ResponseEntity.ok(productRepository.save(product));
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

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam Double price,
            @RequestParam(required = false) Double originalPrice,
            @RequestParam String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String highlights,
            @RequestParam(required = false) String specifications,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ResponseEntity<?> denied = requireAdmin(authHeader);
        if (denied != null) return denied;
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setCategory(category);
        product.setBrand(brand);
        product.setStock(stock);
        product.setRating(rating);
        product.setHighlights(highlights);
        product.setSpecifications(specifications);
        if (image != null && !image.isEmpty()) product.setImageUrl(saveImage(image));
        if (images != null) {
            for (MultipartFile f : images) if (f != null && !f.isEmpty()) product.getImages().add(saveImage(f));
        }
        return ResponseEntity.ok(productRepository.save(product));
    }
}
