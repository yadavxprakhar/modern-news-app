package com.news.controller;

import com.news.model.Article;
import com.news.model.Bookmark;
import com.news.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    /**
     * Creates a bookmark linking a user to a persistently cached news article
     */
    @PostMapping
    public ResponseEntity<Bookmark> addBookmark(Principal principal, @RequestBody Article article) {
        Bookmark bookmark = bookmarkService.addBookmark(principal.getName(), article);
        return ResponseEntity.ok(bookmark);
    }

    /**
     * Lists all current bookmarks for the active user session
     */
    @GetMapping
    public ResponseEntity<List<Bookmark>> getUserBookmarks(Principal principal) {
        List<Bookmark> bookmarks = bookmarkService.getUserBookmarks(principal.getName());
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * Removes an article from the active user's bookmark list
     */
    @DeleteMapping("/{articleId}")
    public ResponseEntity<Map<String, String>> removeBookmark(Principal principal, @PathVariable UUID articleId) {
        bookmarkService.removeBookmark(principal.getName(), articleId);
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Bookmark removed successfully");
        response.put("articleId", articleId.toString());
        
        return ResponseEntity.ok(response);
    }
}
