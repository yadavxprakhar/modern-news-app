import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, clearSession } from '../api/client';

export interface UserPreferences {
    theme: string;
    favoriteCategories: string[];
    notificationsEnabled: boolean;
}

export interface UserProfile {
    username: string;
    email: string;
}

interface AuthContextType {
    user: UserProfile | null;
    preferences: UserPreferences | null;
    loading: boolean;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    logout: () => void;
    updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // 1. Initial authentication session validation and preferences loading
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUsername = localStorage.getItem('username');
            const storedEmail = localStorage.getItem('email');

            if (token && storedUsername && storedEmail) {
                setUser({ username: storedUsername, email: storedEmail });
                try {
                    // Fetch user customization choices from Spring Boot via Node Gateway proxy
                    const prefResponse = await api.get('/users/preferences');
                    setPreferences(prefResponse.data);
                    applyTheme(prefResponse.data.theme);
                } catch (error) {
                    console.error('Failed to load user preferences on mount:', error);
                    // If preference loading fails with a 401, client.ts interceptor will trigger refresh automatically
                }
            }
            setLoading(false);
        };

        initializeAuth();

        // 2. Listen to auto-logout events triggered by client.ts interceptors
        const handleAutoLogout = () => {
            setUser(null);
            setPreferences(null);
            applyTheme('dark'); // Fallback to premium dark default
        };

        window.addEventListener('auth-logout', handleAutoLogout);
        return () => window.removeEventListener('auth-logout', handleAutoLogout);
    }, []);

    /**
     * Helper to apply theme classes to HTML document root
     */
    const applyTheme = (theme: string) => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }
    };

    /**
     * Authenticates existing user credentials
     */
    const login = async (usernameOrEmail: string, password: string) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { usernameOrEmail, password });
            const { accessToken, refreshToken, username, email } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);

            setUser({ username, email });

            // Fetch and apply preferences immediately
            const prefResponse = await api.get('/users/preferences');
            setPreferences(prefResponse.data);
            applyTheme(prefResponse.data.theme);
        } catch (error) {
            clearSession();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initiates a new user account registration by triggering a secure OTP email dispatch
     */
    const register = async (username: string, email: string, password: string) => {
        setLoading(true);
        try {
            await api.post('/auth/register/initiate', { username, email, password });
        } catch (error) {
            clearSession();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Validates the registration OTP and activates the account, storing session tokens
     */
    const verifyOtp = async (email: string, otp: string) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register/verify', { email, otp });
            const { accessToken, refreshToken, username, email: savedEmail } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', username);
            localStorage.setItem('email', savedEmail);

            setUser({ username, email: savedEmail });

            // Fetch and apply preferences immediately
            const prefResponse = await api.get('/users/preferences');
            setPreferences(prefResponse.data);
            applyTheme(prefResponse.data.theme);
        } catch (error) {
            clearSession();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clears user session storage logs
     */
    const logout = () => {
        clearSession();
        setUser(null);
        setPreferences(null);
        applyTheme('dark');
    };

    /**
     * Updates favorite categories or notification choices inside PostgreSQL
     */
    const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
        if (!preferences) return;
        try {
            const mergedPrefs = { ...preferences, ...newPrefs };
            const response = await api.put('/users/preferences', mergedPrefs);
            setPreferences(response.data);
            applyTheme(response.data.theme);
        } catch (error) {
            console.error('Failed to save updated preferences:', error);
            throw error;
        }
    };

    /**
     * Toggles between light and dark modes
     */
    const toggleTheme = async () => {
        if (!preferences) return;
        const targetTheme = preferences.theme === 'light' ? 'dark' : 'light';
        await updatePreferences({ theme: targetTheme });
    };

    return (
        <AuthContext.Provider value={{ user, preferences, loading, login, register, verifyOtp, logout, updatePreferences, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be executed within an active AuthProvider container');
    }
    return context;
};
