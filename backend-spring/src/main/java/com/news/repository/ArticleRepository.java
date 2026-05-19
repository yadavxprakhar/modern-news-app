package com.news.repository;

import com.news.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    Optional<Article> findByUrl(String url);

    Optional<Article> findByExternalId(String externalId);

    boolean existsByUrl(String url);
}
