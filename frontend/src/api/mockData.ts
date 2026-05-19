import { NewsArticle } from '../hooks/useNews';
import { BookmarkData } from '../hooks/useBookmarks';
import { UserPreferences } from '../store/authContext';

/**
 * Utility helper resolving a promise after custom durations to simulate active server delays
 */
export const simulateNetworkDelay = (ms: number = 1000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// 1. Mock Custom Customizations Choice Mappings
export const MOCK_PREFERENCES: UserPreferences = {
    theme: 'dark',
    favoriteCategories: ['general', 'technology'],
    notificationsEnabled: true
};

// 2. High-quality Offline mock news feed sets
export const MOCK_ARTICLES: NewsArticle[] = [
    {
        title: "Quantum Computer Reaches Unprecedented Coherence Threshold",
        description: "Silicon Valley research labs announce a groundbreaking coherent phase duration exceeding 45 minutes using light-coupled topological crystals.",
        content: "Researchers have achieved a massive milestone in quantum computing. By utilizing light-coupled topological crystals inside a room-temperature vacuum, the modular processors sustained stable calculations without conventional liquid helium cooling. This leaps quantum scaling forward by a decade.",
        author: "Dr. Elena Rostova",
        source: "Tech Journal Daily",
        url: "https://example.com/quantum-coherence-breakthrough",
        imageUrl: null, // Triggers gorgeous HSL gradient backgrounds!
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "technology"
    },
    {
        title: "Decoupled Architectures Boost Enterprise Portal Conversions",
        description: "A comprehensive market study indicates a 280% increase in checkout speeds and visitor retention for platforms using isolated caching layers.",
        content: "The transition from conventional monolith servers to modular, decoupled microservice proxies is accelerating. Startups and enterprise platforms alike report monumental savings in database read times by integrating Redis memory clusters at proxy boundaries, maintaining extreme structural availability.",
        author: "Marcus Vance",
        source: "Business Insights",
        url: "https://example.com/decoupled-conversion-spikes",
        imageUrl: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "business"
    },
    {
        title: "Global Eco-Summit Signs Zero-Emissions Transit Mandate",
        description: "World delegates finalize a binding package setting 2035 as the absolute transition target for public grid hydrogen electrifications.",
        content: "Under immense environmental pressure, international summit representatives signed a landmark treaty. The mandate requires municipal regions with populations over 500,000 to completely transition bus fleets, light rail networks, and waste management grids to pure hydrogen or solid-state batteries.",
        author: "Sarah Sterling",
        source: "Global Green Gazette",
        url: "https://example.com/summit-zero-emissions-mandate",
        imageUrl: null,
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: "general"
    },
    {
        title: "Underdog Victory Decided by Final-Second Baseline Shot",
        description: "A historic, double-overtime match culminates in a miraculous buzzer-beater shot, clinching the championship cup.",
        content: "In what sports analysts are calling the match of the century, the visiting underdogs overcame an 18-point deficit. With only 0.4 seconds remaining on the shot clock during double overtime, a baseline fadeaway shot rattled the rim and dropped, securing the league championship trophy.",
        author: "Coach Randy Miller",
        source: "Sports Network Weekly",
        url: "https://example.com/ buzzer-beater-championship-victory",
        imageUrl: null,
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        category: "sports"
    }
];

// 3. Mock saved bookmarks sets mapping user links
export const MOCK_BOOKMARKS: BookmarkData[] = [
    {
        bookmarkId: "b7e456a2-cf29-4a92-9b21-456bf890c23a",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        article: {
            articleId: "a123bc45-e678-490a-b21c-345def67890a",
            title: "Quantum Computer Reaches Unprecedented Coherence Threshold",
            description: "Silicon Valley research labs announce a groundbreaking coherent phase duration exceeding 45 minutes using light-coupled topological crystals.",
            content: "Researchers have achieved a massive milestone...",
            author: "Dr. Elena Rostova",
            source: "Tech Journal Daily",
            url: "https://example.com/quantum-coherence-breakthrough",
            imageUrl: null,
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            category: "technology"
        }
    }
];
