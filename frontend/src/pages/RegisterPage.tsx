import React, { useState } from 'react';
import { useAuth } from '../store/authContext';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const { register, verifyOtp } = useAuth();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    
    // OTP States
    const [otpMode, setOtpMode] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [error, setError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
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
            setSuccessMessage(`A secure verification code has been dispatched to ${email}`);
            setOtpMode(true);
        } catch (err: any) {
            console.error('Registration failed:', err);
            
            // Intercept complex REST validation payloads from GlobalExceptionHandler
            if (err.response?.data?.details) {
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

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (otp.trim().length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(email, otp);
        } catch (err: any) {
            console.error('OTP Verification failed:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Incorrect verification code or expired session. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await register(username, email, password);
            setSuccessMessage(`A fresh verification code has been sent to ${email}`);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to resend code. Please try again.');
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
                    
                    {!otpMode ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Verify Email</h1>
                                <p style={{ color: 'hsl(var(--muted))', fontSize: '1rem', lineHeight: '1.5' }}>
                                    We've sent a 6-digit confirmation code to: <br/>
                                    <strong style={{ color: 'hsl(var(--primary))' }}>{email}</strong>
                                </p>
                            </div>

                            {successMessage && (
                                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--success) / 0.15)', border: '1px solid hsl(var(--success) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500, marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <CheckCircle2 size={18} style={{ color: 'hsl(var(--success))' }} />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {error && (
                                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--danger) / 0.15)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500, marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <ShieldAlert size={18} style={{ color: 'hsl(var(--danger))' }} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '12px', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                                        ENTER 6-DIGIT CODE
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        className="form-input"
                                        placeholder="0 0 0 0 0 0"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        disabled={loading}
                                        style={{
                                            textAlign: 'center',
                                            fontSize: '1.8rem',
                                            fontWeight: 800,
                                            letterSpacing: '12px',
                                            padding: '12px 20px',
                                            fontFamily: 'monospace'
                                        }}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                                    ) : (
                                        <>
                                            Verify & Activate <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', fontSize: '0.9rem' }}>
                                <span 
                                    onClick={handleResendOtp}
                                    style={{ color: 'hsl(var(--primary))', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--primary-hover))'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--primary))'}
                                >
                                    Resend Code
                                </span>

                                <span 
                                    onClick={() => setOtpMode(false)}
                                    style={{ color: 'hsl(var(--muted))', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'hsl(var(--foreground))'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
                                >
                                    Edit details
                                </span>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
