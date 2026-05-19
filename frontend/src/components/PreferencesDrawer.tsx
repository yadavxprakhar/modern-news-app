import React, { useState } from 'react';
import { useAuth } from '../store/authContext';

interface PreferencesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORY_OPTIONS = [
    { id: 'general', label: '📰 General' },
    { id: 'technology', label: '💻 Technology' },
    { id: 'business', label: '💼 Business' },
    { id: 'sports', label: '⚽ Sports' }
];

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ isOpen, onClose }) => {
    const { preferences, updatePreferences } = useAuth();
    
    // Local state to keep updates draft before committing to database
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        preferences?.favoriteCategories || []
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
        preferences?.notificationsEnabled || false
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    if (!isOpen || !preferences) return null;

    const handleCategoryToggle = (catId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            await updatePreferences({
                favoriteCategories: selectedCategories,
                notificationsEnabled: notificationsEnabled
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Failed to update user dashboard preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            
            {/* Drawer Container Panel */}
            <div 
                className="glass-panel" 
                style={{ width: '100%', maxWidth: '380px', height: '100%', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderRadius: 0, padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onClick={(e) => e.stopPropagation()} // Prevent closing drawer on inner click
            >
                <style>{`
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>

                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Custom Options</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'hsl(var(--muted))', cursor: 'pointer' }}>
                            ✕
                        </button>
                    </div>

                    {/* Category Multiselect */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
                            FAVORITE INTERESTS
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {CATEGORY_OPTIONS.map((opt) => {
                                const isChecked = selectedCategories.includes(opt.id);
                                return (
                                    <div 
                                        key={opt.id}
                                        onClick={() => handleCategoryToggle(opt.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: isChecked ? 'hsl(var(--accent))' : 'hsl(var(--input))', border: `1px solid ${isChecked ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))'}`, cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}} // Controlled via container click
                                            style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                                        />
                                        <span style={{ fontSize: '0.92rem', fontWeight: 500, color: isChecked ? 'hsl(var(--foreground))' : 'hsl(var(--muted))' }}>
                                            {opt.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid hsl(var(--border) / 0.4)', borderBottom: '1px solid hsl(var(--border) / 0.4)' }}>
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Push Notifications</h4>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted))' }}>Receive alert indicators on category updates</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Visual Save Feedback */}
                    {success && (
                        <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--success) / 0.15)', border: '1px solid hsl(var(--success) / 0.3)', color: 'hsl(var(--foreground))', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>
                            ✓ Preferences Updated Securely
                        </div>
                    )}

                    <button 
                        onClick={handleSave} 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? 'Saving Preferences...' : 'Save Settings'}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', padding: '12px' }}
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
