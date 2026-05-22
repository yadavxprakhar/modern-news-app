import React, { useState } from 'react';
import { useAuth } from '../store/authContext';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

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
        <div className="auth-container">
            <img src="/auth-illustration.png" alt="3D illustration" className="auth-illustration" />
            <div className="auth-overlay"></div>
            {/* Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Create Account</h1>
                        <p style={{ color: 'hsl(var(--muted))', fontSize: '1rem' }}>Join to unlock interest-based news hubs.</p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--danger) / 0.15)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500, marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                                USERNAME
                            </label>
                            <div className="input-group">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-input with-icon"
                                    placeholder="Enter a unique username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {fieldErrors.username && (
                                <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                    * {fieldErrors.username}
                                </span>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                                EMAIL ADDRESS
                            </label>
                            <div className="input-group">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className="form-input with-icon"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {fieldErrors.email && (
                                <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                    * {fieldErrors.email}
                                </span>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                                PASSWORD
                            </label>
                            <div className="input-group">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    className="form-input with-icon"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {fieldErrors.password && (
                                <span style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                                    * {fieldErrors.password}
                                </span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '14px 20px', marginTop: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                            ) : (
                                <>
                                    Sign Up Free <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'hsl(var(--muted))' }}>
                        Already have an active profile?{' '}
                        <span 
                            onClick={onSwitchToLogin} 
                            style={{ color: 'hsl(var(--primary))', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary-hover))'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'}
                        >
                            Sign In Instead
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};
