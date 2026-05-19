import React, { useState } from 'react';
import { useAuth } from '../store/authContext';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!usernameOrEmail.trim() || !password.trim()) {
            setError('Please enter both your credentials to proceed');
            return;
        }

        setLoading(true);
        try {
            await login(usernameOrEmail, password);
        } catch (err: any) {
            console.error('Login request failed:', err);
            // Catch DTO and validation errors cleanly from our GlobalExceptionHandler
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(`${err.response.data.error}: check credentials and try again`);
            } else {
                setError('Authentication failed. Check your gateway connections.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'hsl(var(--background))' }}>
            <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '40px', boxShadow: 'var(--shadow-premium)' }}>
                {/* Visual Header Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3.2rem', marginBottom: '12px', display: 'inline-block', filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.35))' }}>📰</div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px' }}>Portal Sign In</h1>
                    <p style={{ color: 'hsl(var(--muted))', fontSize: '0.9rem' }}>Access your personalized live summaries</p>
                </div>

                {/* Secure error dashboard */}
                {error && (
                    <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--danger) / 0.15)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            USERNAME OR EMAIL
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter username or email address"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '12px 20px', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating Profile...' : 'Sign In To Dashboard'}
                    </button>
                </form>

                {/* Switching Trigger */}
                <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'hsl(var(--muted))' }}>
                    Don't have an active account?{' '}
                    <span 
                        onClick={onSwitchToRegister} 
                        style={{ color: 'hsl(var(--primary))', fontWeight: 600, cursor: 'pointer' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Sign Up Free
                    </span>
                </div>
            </div>
        </div>
    );
};
