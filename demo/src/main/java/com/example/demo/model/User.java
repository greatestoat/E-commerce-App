// package com.example.demo.model;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "users", uniqueConstraints = {
// 		@jakarta.persistence.UniqueConstraint(columnNames = "username"),
// 		@jakarta.persistence.UniqueConstraint(columnNames = "email")
// })
// public class User {

// 	@Id
// 	@GeneratedValue(strategy = GenerationType.IDENTITY)
// 	private Long id;

// 	@Column(nullable = false)
// 	private String username;

// 	@Column(nullable = false)
// 	private String email;

// 	@Column(nullable = false)
// 	private String password;

// 	public User() {
// 	}

// 	public User(String username, String email, String password) {
// 		this.username = username;
// 		this.email = email;
// 		this.password = password;
// 	}

// 	public Long getId() {
// 		return id;
// 	}

// 	public void setId(Long id) {
// 		this.id = id;
// 	}

// 	public String getUsername() {
// 		return username;
// 	}

// 	public void setUsername(String username) {
// 		this.username = username;
// 	}

// 	public String getEmail() {
// 		return email;
// 	}

// 	public void setEmail(String email) {
// 		this.email = email;
// 	}

// 	public String getPassword() {
// 		return password;
// 	}

// 	public void setPassword(String password) {
// 		this.password = password;
// 	}
// }
package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users", uniqueConstraints = {
		@jakarta.persistence.UniqueConstraint(columnNames = "username"),
		@jakarta.persistence.UniqueConstraint(columnNames = "email")
})
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String username;

	@Column(nullable = false)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String role = "USER"; // "USER" or "ADMIN"

	@Column(length = 50000)
	private String cartData = "[]";
	@Column(length = 50000)
	private String wishlistData = "[]";
	@Column(length = 50000)
	private String addressData = "[]";
	@Column(length = 100000)
	private String orderData = "[]";

	public User() {
	}

	public User(String username, String email, String password) {
		this.username = username;
		this.email = email;
		this.password = password;
		this.role = "USER";
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
	public String getCartData() { return cartData; }
	public void setCartData(String value) { this.cartData = value; }
	public String getWishlistData() { return wishlistData; }
	public void setWishlistData(String value) { this.wishlistData = value; }
	public String getAddressData() { return addressData; }
	public void setAddressData(String value) { this.addressData = value; }
	public String getOrderData() { return orderData; }
	public void setOrderData(String value) { this.orderData = value; }
}
