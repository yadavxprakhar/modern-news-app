import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/authContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { ArticleCard } from './components/ArticleCard';
import { PreferencesDrawer } from './components/PreferencesDrawer';
import { useNews } from './hooks/useNews';
import { useBookmarks } from './hooks/useBookmarks';
import { DevModeToggle } from './components/DevModeToggle';

const MainAppContent: React.FC = () => {
    const { user, loading: authLoading, logout, toggleTheme, preferences } = useAuth();
    const [activeView, setActiveView] = useState<'news' | 'bookmarks' | 'login' | 'register' | 'more_news'>('news');
    const [isPrefsOpen, setIsPrefsOpen] = useState<boolean>(false);
    const [moreNewsPage, setMoreNewsPage] = useState<number>(0);
    const [shuffledArticles, setShuffledArticles] = useState<any[]>([]);

    React.useEffect(() => {
        if (user && (activeView === 'login' || activeView === 'register')) {
            setActiveView('news');
        }
    }, [user, activeView]);

    // 1. Initialize our caching news loader and persistent bookmarks sync hooks
    const { 
        articles, 
        category, 
        loading: newsLoading, 
        setCategory, 
        setSearchQuery,
        refresh
    } = useNews('general');

    const { 
        bookmarks, 
        loading: bookmarksLoading, 
        addBookmark, 
        removeBookmark, 
        isBookmarked, 
        getBookmarkedId 
    } = useBookmarks();

    // Randomize articles whenever they are newly fetched from the API
    React.useEffect(() => {
        if (articles.length > 0) {
            setShuffledArticles([...articles].sort(() => Math.random() - 0.5));
        } else {
            setShuffledArticles([]);
        }
    }, [articles]);

    // 2. Display spinner during initial user auth load
    if (authLoading) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Removed global unauthenticated block

    /**
     * Intercepts bookmark star clicks to dynamically add or delete persistent records in PostgreSQL
     */
    const handleBookmarkToggle = async (article: any) => {
        if (!user) {
            setActiveView('login');
            return;
        }
        const bookmarkedId = getBookmarkedId(article.url);
        if (bookmarkedId) {
            await removeBookmark(bookmarkedId);
        } else {
            await addBookmark(article);
        }
    };

    const isLoading = newsLoading || bookmarksLoading;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header Navigation Bar */}
            <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} 
                    onClick={() => {
                        setActiveView('news');
                        setCategory('general');
                        setSearchQuery('');
                    }}
                >
                    <span style={{ fontSize: '1.6rem' }}>📰</span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>NewsPortal</h2>
                </div>

                {/* Navigation Items */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={refresh} title="Refresh Feed">
                        🔄 Refresh
                    </button>
                    <button className={`btn ${activeView === 'news' || activeView === 'more_news' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setActiveView('news')}>
                        Discover
                    </button>
                    <button className={`btn ${activeView === 'bookmarks' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => {
                        if (!user) setActiveView('login');
                        else setActiveView('bookmarks');
                    }}>
                        Bookmarks
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => {
                        if (!user) setActiveView('login');
                        else setIsPrefsOpen(true);
                    }}>
                        ⚙️ Settings
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={toggleTheme}>
                        {preferences?.theme === 'light' ? '🌙 Mode' : '☀️ Mode'}
                    </button>
                    {user ? (
                        <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'hsl(var(--danger) / 0.4)', color: 'hsl(var(--danger))' }} onClick={logout}>
                            Logout
                        </button>
                    ) : (
                        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setActiveView('login')}>
                            Login
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content Dashboard */}
            <main style={{ flex: 1, width: '100%', maxWidth: (activeView === 'login' || activeView === 'register') ? '100%' : '1200px', margin: '0 auto', padding: '40px 24px' }}>
                
                {/* Visual Section Greeting Banner */}
                {activeView !== 'login' && activeView !== 'register' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>
                                {activeView === 'news' ? 'Custom News Feed' : activeView === 'more_news' ? 'All Live Articles' : activeView === 'bookmarks' ? 'Your Bookmarks' : ''}
                            </h1>
                            <p style={{ color: 'hsl(var(--muted))' }}>
                                {activeView === 'news' || activeView === 'more_news'
                                    ? (user ? `Welcome, ${user.username}! Explore breaking stories or customize interests in settings.` : 'Explore breaking stories and the latest updates.') 
                                    : activeView === 'bookmarks' ? 'Persistently cached summaries saved on your profile.'
                                    : ''
                                }
                            </p>
                        </div>

                        {/* Show Search bar only in the active discovery news feed */}
                        {(activeView === 'news' || activeView === 'more_news') && <SearchBar onSearch={setSearchQuery} />}
                    </div>
                )}

                {/* Sub-Filters Badge Grid */}
                {(activeView === 'news' || activeView === 'more_news') && (
                    <CategoryFilter 
                        currentCategory={category} 
                        onSelectCategory={(newCat: string) => {
                            setCategory(newCat);
                            setActiveView('news');
                            setMoreNewsPage(0);
                        }} 
                    />
                )}

                {/* Active grid display */}
                {activeView === 'login' ? (
                    <div style={{ margin: '-40px -24px' }}>
                        <LoginPage onSwitchToRegister={() => setActiveView('register')} />
                    </div>
                ) : activeView === 'register' ? (
                    <div style={{ margin: '-40px -24px' }}>
                        <RegisterPage onSwitchToLogin={() => setActiveView('login')} />
                    </div>
                ) : isLoading ? (
                    // Beautiful loading skeleton loader grid
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="glass-panel" style={{ height: '380px', display: 'flex', flexDirection: 'column', padding: '24px', gap: '16px', animation: 'pulse 1.5s infinite ease-in-out' }}>
                                <div style={{ height: '180px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--border) / 0.4)' }}></div>
                                <div style={{ height: '24px', width: '60%', borderRadius: '4px', backgroundColor: 'hsl(var(--border) / 0.4)' }}></div>
                                <div style={{ height: '40px', width: '100%', borderRadius: '4px', backgroundColor: 'hsl(var(--border) / 0.4)' }}></div>
                            </div>
                        ))}
                        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
                    </div>
                ) : activeView === 'news' ? (
                    // Discover Feeds Grid
                    shuffledArticles.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                                {shuffledArticles.slice(0, 12).map((art) => (
                                    <ArticleCard
                                        key={art.url}
                                        article={art}
                                        isBookmarked={isBookmarked(art.url)}
                                        onToggleBookmark={() => handleBookmarkToggle(art)}
                                    />
                                ))}
                            </div>
                            {shuffledArticles.length > 12 && (
                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                    <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem', borderRadius: '30px' }} onClick={() => setActiveView('more_news')}>
                                        See More Articles ↓
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📭</div>
                            <h3>No articles matched your criteria</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try switching categories or clearing search keywords.</p>
                        </div>
                    )
                ) : activeView === 'more_news' ? (
                    // All articles grid
                    <>
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => {
                                setActiveView('news');
                                setMoreNewsPage(0);
                            }}>
                                ← Back to Top Headlines
                            </button>
                            {shuffledArticles.length > 50 && (
                                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => {
                                    if (moreNewsPage === 0) {
                                        setMoreNewsPage(1);
                                    } else {
                                        // Once they have seen all 100, reshuffle and start over at page 0
                                        setShuffledArticles(prev => [...prev].sort(() => Math.random() - 0.5));
                                        setMoreNewsPage(0);
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}>
                                    🔄 Refresh Feed
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                            {shuffledArticles.slice(moreNewsPage * 50, (moreNewsPage + 1) * 50).map((art) => (
                                <ArticleCard
                                    key={art.url}
                                    article={art}
                                    isBookmarked={isBookmarked(art.url)}
                                    onToggleBookmark={() => handleBookmarkToggle(art)}
                                />
                            ))}
                        </div>

                    </>
                ) : (
                    // Bookmarks Saved Feed Grid
                    bookmarks.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                            {bookmarks.map((b) => (
                                <ArticleCard
                                    key={b.bookmarkId}
                                    article={b.article}
                                    isBookmarked={true}
                                    onToggleBookmark={() => removeBookmark(b.article.articleId!)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', color: 'hsl(var(--muted))' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⭐️</div>
                            <h3>No saved articles yet</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Explore live feeds and click the star ribbons to save articles.</p>
                        </div>
                    )
                )}
            </main>

            {/* Custom Account Settings Slider Drawer */}
            <PreferencesDrawer isOpen={isPrefsOpen} onClose={() => setIsPrefsOpen(false)} />

            {/* Footer */}
            <footer style={{ padding: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'hsl(var(--muted))', borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
                &copy; {new Date().getFullYear()} Modern News Portal. All rights reserved.
            </footer>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <MainAppContent />
            <DevModeToggle />
        </AuthProvider>
    );
};

export default App;

