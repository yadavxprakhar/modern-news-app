import React, { useState } from 'react';
import { useAuth } from '../store/authContext';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    
    const [error, setError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        // Basic client-side validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password);
        } catch (err: any) {
            console.error('Registration failed:', err);
            
            // Intercept complex REST validation payloads from GlobalExceptionHandler
            if (err.response?.data?.details) {
                // Mapped validation maps (e.g. { username: "too short", email: "invalid format" })
                setFieldErrors(err.response.data.details);
                setError('Please fix the highlighted validation errors below');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Check your gateway service channels.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'hsl(var(--background))' }}>
            <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
                {/* Header Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3.2rem', marginBottom: '12px', display: 'inline-block', filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.35))' }}>📰</div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px' }}>Create Account</h1>
                    <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem' }}>Join to unlock interest-based news hubs</p>
                </div>

                {/* Primary Error Dashboard */}
                {error && (
                    <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--danger) / 0.15)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            USERNAME
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter a unique username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {fieldErrors.username && (
                            <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                * {fieldErrors.username}
                            </span>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {fieldErrors.email && (
                            <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                * {fieldErrors.email}
                            </span>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Minimium 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {fieldErrors.password && (
                            <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                * {fieldErrors.password}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '12px 20px', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Your Account...' : 'Sign Up Free'}
                    </button>
                </form>

                {/* Switching */}
                <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'hsl(var(--muted))' }}>
                    Already have an active profile?{' '}
                    <span 
                        onClick={onSwitchToLogin} 
                        style={{ color: 'hsl(var(--primary))', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Sign In Instead
                    </span>
                </div>
            </div>
        </div>
    );
};
