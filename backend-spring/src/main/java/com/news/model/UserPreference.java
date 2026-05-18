package com.news.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "preference_id", updatable = false, nullable = false)
    private UUID preferenceId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "favorite_categories", columnDefinition = "varchar(50)[]")
    @Builder.Default
    private List<String> favoriteCategories = new ArrayList<>();

    @Column(name = "theme", length = 20)
    @Builder.Default
    private String theme = "light";

    @Column(name = "notifications_enabled")
    @Builder.Default
    private boolean notificationsEnabled = true;
}
