import React, { useState, useEffect } from 'react';

export const DevModeToggle: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(
        localStorage.getItem('dev-mode-offline') === 'true'
    );
    const [hasDelay, setHasDelay] = useState<boolean>(
        localStorage.getItem('dev-mode-delay') === 'true'
    );
    const [hasError, setHasError] = useState<boolean>(
        localStorage.getItem('dev-mode-error') === 'true'
    );

    const toggleSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
        localStorage.setItem(key, String(value));
        setter(value);
        // Dispatch event to notify hooks instantly
        window.dispatchEvent(new Event('dev-mode-change'));
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            
            {/* Expandable Menu Panel */}
            {isOpen && (
                <div 
                    className="glass-panel" 
                    style={{ width: '260px', padding: '20px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid hsl(var(--primary) / 0.3)', boxShadow: 'var(--shadow-premium)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--primary))', letterSpacing: '0.05em' }}>🛠️ DEV CONTROLS</h4>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'hsl(var(--muted))', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted))', lineHeight: 1.4 }}>
                        Simulate full-stack microservice behaviors offline to test edge-cases.
                    </p>

                    {/* Toggle Offline/Mock feeds */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Offline Mock Feeds</span>
                        <input
                            type="checkbox"
                            checked={isOffline}
                            onChange={(e) => toggleSetting('dev-mode-offline', e.target.checked, setIsOffline)}
                            style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                        />
                    </div>

                    {/* Toggle Simulated Latency */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Simulate 3G Latency</span>
                        <input
                            type="checkbox"
                            checked={hasDelay}
                            onChange={(e) => toggleSetting('dev-mode-delay', e.target.checked, setHasDelay)}
                            style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                        />
                    </div>

                    {/* Toggle REST Exceptions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Simulate Server Error</span>
                        <input
                            type="checkbox"
                            checked={hasError}
                            onChange={(e) => toggleSetting('dev-mode-error', e.target.checked, setHasError)}
                            style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                        />
                    </div>
                </div>
            )}

            {/* Floating Anchor Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--gradient-main)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.6)',
                    transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                🛠️
            </button>
        </div>
    );
};
