import React from 'react';
import { NewsArticle } from '../hooks/useNews';

interface ArticleCardProps {
    article: NewsArticle;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, isBookmarked, onToggleBookmark }) => {
    
    // Generates a stunning unique HSL placeholder gradient if no live image is available
    const generatePlaceholderGradient = (title: string) => {
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue1 = Math.abs(hash % 360);
        const hue2 = (hue1 + 40) % 360;
        return `linear-gradient(135deg, hsl(${hue1}, 80%, 40%) 0%, hsl(${hue2}, 80%, 25%) 100%)`;
    };

    const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <article className="glass-panel hover-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', border: '1px solid hsl(var(--border) / 0.5)' }}>
            
            {/* Visual Header Image / Placeholder Gradient */}
            <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                {article.imageUrl ? (
                    <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: generatePlaceholderGradient(article.title), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '2.5rem' }}>
                        📰
                    </div>
                )}

                {/* Source Label Badge */}
                <span style={{ position: 'absolute', left: '12px', top: '12px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: '0.75rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {article.source}
                </span>

                {/* Bookmark Toggle Ribbon */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark();
                    }}
                    style={{ position: 'absolute', right: '12px', top: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.2s ease', color: isBookmarked ? '#fbbf24' : '#fff' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isBookmarked ? '★' : '☆'}
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    {/* Date and Author details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--muted))', marginBottom: '8px' }}>
                        <span>{formattedDate}</span>
                        {article.author && <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>By {article.author}</span>}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4, color: 'hsl(var(--foreground))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.title}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: 'hsl(var(--muted))', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                        {article.description || 'No description available for this cached article feed.'}
                    </p>
                </div>

                <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', textAlign: 'center', display: 'block' }}
                >
                    Read Full Coverage ↗
                </a>
            </div>
        </article>
    );
};
