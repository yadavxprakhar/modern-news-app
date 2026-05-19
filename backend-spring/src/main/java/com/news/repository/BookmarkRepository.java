package com.news.repository;

import com.news.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUser_UserId(UUID userId);

    Optional<Bookmark> findByUser_UserIdAndArticle_ArticleId(UUID userId, UUID articleId);

    boolean existsByUser_UserIdAndArticle_ArticleId(UUID userId, UUID articleId);

    void deleteByUser_UserIdAndArticle_ArticleId(UUID userId, UUID articleId);
}
