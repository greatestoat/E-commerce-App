package com.example.demo.security;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/** Simple in-memory bearer token store (demo-only, not for production use). */
@Component
public class TokenStore {

	private final Map<String, String> tokenToUsername = new ConcurrentHashMap<>();

	public String issueToken(String username) {
		String token = UUID.randomUUID().toString();
		tokenToUsername.put(token, username);
		return token;
	}

	public String getUsername(String token) {
		return tokenToUsername.get(token);
	}
}
