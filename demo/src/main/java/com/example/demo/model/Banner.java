package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "home_banners")
public class Banner {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imageUrl;

    public Banner() {}
    public Banner(String imageUrl) { this.imageUrl = imageUrl; }
    public Long getId() { return id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
