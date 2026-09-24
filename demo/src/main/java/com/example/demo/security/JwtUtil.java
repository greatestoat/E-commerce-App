// package com.example.demo.security;

// import java.nio.charset.StandardCharsets;
// import java.util.Date;

// import javax.crypto.SecretKey;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Component;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.JwtException;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.security.Keys;

// /**
//  * Utility for generating, validating, and parsing HS256-signed JWTs.
//  *
//  * <p>Configure {@code jwt.secret} (≥ 32 chars) and {@code jwt.expirationMs}
//  * in {@code application.properties}.
//  */
// @Component
// public class JwtUtil {

// 	@Value("${jwt.secret}")
// 	private String secret;

// 	@Value("${jwt.expirationMs}")
// 	private long expirationMs;

// 	// ── Private helpers ──────────────────────────────────────────────────────

// 	private SecretKey signingKey() {
// 		return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
// 	}

// 	// ── Public API ───────────────────────────────────────────────────────────

// 	/** Issue a signed JWT containing {@code username} as the subject. */
// 	public String generateToken(String username) {
// 		Date now = new Date();
// 		return Jwts.builder()
// 				.subject(username)
// 				.issuedAt(now)
// 				.expiration(new Date(now.getTime() + expirationMs))
// 				.signWith(signingKey())
// 				.compact();
// 	}

// 	/**
// 	 * Return {@code true} if the token has a valid signature and has not expired.
// 	 */
// 	public boolean validateToken(String token) {
// 		try {
// 			Jwts.parser()
// 					.verifyWith(signingKey())
// 					.build()
// 					.parseSignedClaims(token);
// 			return true;
// 		} catch (JwtException | IllegalArgumentException e) {
// 			return false;
// 		}
// 	}

// 	/** Extract the username (subject) from a previously validated token. */
// 	public String getUsernameFromToken(String token) {
// 		Claims claims = Jwts.parser()
// 				.verifyWith(signingKey())
// 				.build()
// 				.parseSignedClaims(token)
// 				.getPayload();
// 		return claims.getSubject();
// 	}
// }

package com.example.demo.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.expirationMs}")
	private long expirationMs;

	private SecretKey signingKey() {
		return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}

	/** Issue a signed JWT containing username as subject and role as a claim. */
	public String generateToken(String username, String role) {
		Date now = new Date();
		return Jwts.builder()
				.subject(username)
				.claim("role", role)
				.issuedAt(now)
				.expiration(new Date(now.getTime() + expirationMs))
				.signWith(signingKey())
				.compact();
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parser()
					.verifyWith(signingKey())
					.build()
					.parseSignedClaims(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	public String getUsernameFromToken(String token) {
		return getClaims(token).getSubject();
	}

	/** Extract the role claim from a previously validated token. */
	public String getRoleFromToken(String token) {
		return getClaims(token).get("role", String.class);
	}

	private Claims getClaims(String token) {
		return Jwts.parser()
				.verifyWith(signingKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}