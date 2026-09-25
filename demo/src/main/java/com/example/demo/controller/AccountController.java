package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final UserRepository users;
    private final JwtUtil jwt;
    private final ObjectMapper mapper = new ObjectMapper();
    public AccountController(UserRepository users, JwtUtil jwt) { this.users = users; this.jwt = jwt; }

    private User user(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        String token = header.substring(7);
        if (!jwt.validateToken(token)) return null;
        return users.findByUsername(jwt.getUsernameFromToken(token)).orElse(null);
    }
    private ResponseEntity<?> denied() { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sign in to access your account"); }
    private List<Map<String, Object>> parse(String json) {
        try { return mapper.readValue(json == null ? "[]" : json, new TypeReference<List<Map<String, Object>>>() {}); }
        catch (Exception e) { return new ArrayList<>(); }
    }
    private ResponseEntity<?> get(String auth, String key) {
        User user = user(auth); if (user == null) return denied();
        return ResponseEntity.ok(parse(value(user, key)));
    }
    private ResponseEntity<?> put(String auth, String key, List<Map<String, Object>> data) {
        User user = user(auth); if (user == null) return denied();
        try { setValue(user, key, mapper.writeValueAsString(data == null ? List.of() : data)); users.save(user); return ResponseEntity.ok(data); }
        catch (Exception e) { return ResponseEntity.internalServerError().body("Could not save account data"); }
    }
    private String value(User u, String k) { return switch (k) { case "cart" -> u.getCartData(); case "wishlist" -> u.getWishlistData(); case "addresses" -> u.getAddressData(); default -> u.getOrderData(); }; }
    private void setValue(User u, String k, String v) { switch (k) { case "cart" -> u.setCartData(v); case "wishlist" -> u.setWishlistData(v); case "addresses" -> u.setAddressData(v); default -> u.setOrderData(v); } }

    @GetMapping("/{section}")
    public ResponseEntity<?> read(@RequestHeader(value="Authorization", required=false) String auth, @PathVariable String section) {
        if (!List.of("cart", "wishlist", "addresses", "orders").contains(section)) return ResponseEntity.notFound().build();
        return get(auth, section);
    }
    @PutMapping("/{section}")
    public ResponseEntity<?> write(@RequestHeader(value="Authorization", required=false) String auth, @PathVariable String section, @RequestBody List<Map<String, Object>> data) {
        if (!List.of("cart", "wishlist", "addresses", "orders").contains(section)) return ResponseEntity.notFound().build();
        return put(auth, section, data);
    }
}
