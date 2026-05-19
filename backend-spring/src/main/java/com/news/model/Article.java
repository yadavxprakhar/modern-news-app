package com.news.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "article_id", updatable = false, nullable = false)
    private UUID articleId;

    @Column(name = "external_id", unique = true, length = 255)
    private String externalId;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "author", length = 255)
    private String author;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "url", nullable = false, unique = true, columnDefinition = "TEXT")
    private String url;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "category", length = 50)
    private String category;

    @CreationTimestamp
    @Column(name = "cached_at", updatable = false, nullable = false)
    private LocalDateTime cachedAt;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;
}
