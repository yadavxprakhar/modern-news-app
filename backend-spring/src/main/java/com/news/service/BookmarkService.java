package com.news.service;

import com.news.model.Article;
import com.news.model.Bookmark;
import com.news.model.User;
import com.news.repository.ArticleRepository;
import com.news.repository.BookmarkRepository;
import com.news.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           ArticleRepository articleRepository,
                           UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    /**
     * Saves a news article persistently and maps it to a user's bookmark portfolio.
     */
    @Transactional
    public Bookmark addBookmark(String username, Article article) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // 1. Check if the article has already been cached in our relational system by URL
        Article savedArticle = articleRepository.findByUrl(article.getUrl())
                .orElseGet(() -> articleRepository.save(article));

        // 2. Prevent creating duplicate bookmark registrations
        if (bookmarkRepository.existsByUser_UserIdAndArticle_ArticleId(user.getUserId(), savedArticle.getArticleId())) {
            return bookmarkRepository.findByUser_UserIdAndArticle_ArticleId(user.getUserId(), savedArticle.getArticleId())
                    .orElseThrow(() -> new IllegalArgumentException("Conflict reading existing bookmark"));
        }

        // 3. Bind the user to the saved article
        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .article(savedArticle)
                .build();

        return bookmarkRepository.save(bookmark);
    }

    /**
     * Loads the complete set of saved articles for a given user.
     */
    @Transactional(readOnly = true)
    public List<Bookmark> getUserBookmarks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return bookmarkRepository.findByUser_UserId(user.getUserId());
    }

    /**
     * Removes a saved article from a user's portfolio.
     */
    @Transactional
    public void removeBookmark(String username, UUID articleId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!bookmarkRepository.existsByUser_UserIdAndArticle_ArticleId(user.getUserId(), articleId)) {
            throw new IllegalArgumentException("Bookmark does not exist");
        }

        bookmarkRepository.deleteByUser_UserIdAndArticle_ArticleId(user.getUserId(), articleId);
    }
}
