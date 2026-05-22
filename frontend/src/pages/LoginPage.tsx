import React, { useState } from 'react';
import { useAuth } from '../store/authContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

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
        <div className="auth-container">
            <img src="/auth-illustration.png" alt="3D illustration" className="auth-illustration" />
            <div className="auth-overlay"></div>
            {/* Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Welcome back</h1>
                        <p style={{ color: 'hsl(var(--muted))', fontSize: '1rem' }}>Enter your details to access your dashboard.</p>
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
                                EMAIL OR USERNAME
                            </label>
                            <div className="input-group">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-input with-icon"
                                    placeholder="Enter your email"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
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
                                    Sign In <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'hsl(var(--muted))' }}>
                        Don't have an account?{' '}
                        <span 
                            onClick={onSwitchToRegister} 
                            style={{ color: 'hsl(var(--primary))', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary-hover))'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'}
                        >
                            Create an account
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
