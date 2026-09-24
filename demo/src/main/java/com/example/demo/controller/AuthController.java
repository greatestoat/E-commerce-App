package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRepository userRepository;
	private final JwtUtil jwtUtil;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.jwtUtil = jwtUtil;
	}

	// ── Register ─────────────────────────────────────────────────────────────

	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
		if (userRepository.existsByUsername(request.getUsername())) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
		}
		if (userRepository.existsByEmail(request.getEmail())) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
		}

		User user = new User(
				request.getUsername(),
				request.getEmail(),
				passwordEncoder.encode(request.getPassword()));
		userRepository.save(user);

		String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole()));
	}

	// ── Login ─────────────────────────────────────────────────────────────────

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
		User user = userRepository.findByUsername(request.getUsername()).orElse(null);
		if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
		}

		String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
		return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole()));
	}

	// ── Current user (validate JWT) ───────────────────────────────────────────

	@PostMapping("/me")
	public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or malformed Authorization header");
		}
		String token = authHeader.substring(7);

		if (!jwtUtil.validateToken(token)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
		}

		String username = jwtUtil.getUsernameFromToken(token);
		User user = userRepository.findByUsername(username).orElse(null);
		if (user == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
		}
		return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole()));
	}
}
