package com.example.demo.controller;

import com.example.demo.model.Banner;
import com.example.demo.repository.BannerRepository;
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
@RequestMapping("/api/banners")
public class BannerController {
    private final BannerRepository repository;
    private final JwtUtil jwtUtil;
    @Value("${upload.dir:uploads}") private String uploadDir;
    public BannerController(BannerRepository repository, JwtUtil jwtUtil) {
        this.repository = repository; this.jwtUtil = jwtUtil;
    }
    private ResponseEntity<?> requireAdmin(String header) {
        if (header == null || !header.startsWith("Bearer ")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        String token = header.substring(7);
        if (!jwtUtil.validateToken(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (!"ADMIN".equals(jwtUtil.getRoleFromToken(token))) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        return null;
    }
    @GetMapping public List<Banner> all() { return repository.findAll(); }
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> create(@RequestHeader("Authorization") String header, @RequestParam("image") MultipartFile image) throws IOException {
        ResponseEntity<?> denied = requireAdmin(header); if (denied != null) return denied;
        if (image == null || image.isEmpty()) return ResponseEntity.badRequest().body("Image required");
        File dir = new File(uploadDir); if (!dir.exists()) dir.mkdirs();
        String filename = UUID.randomUUID() + "_" + Path.of(image.getOriginalFilename()).getFileName();
        Files.write(Path.of(uploadDir, filename), image.getBytes());
        return ResponseEntity.ok(repository.save(new Banner("/api/products/images/" + filename)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String header, @PathVariable Long id) {
        ResponseEntity<?> denied = requireAdmin(header); if (denied != null) return denied;
        repository.deleteById(id); return ResponseEntity.noContent().build();
    }
}
