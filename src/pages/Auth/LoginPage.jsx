import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';
import './AuthPages.css';

function LoginPage() {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const changeLanguage = () => {
        const langs = ['en', 'kk', 'ru'];
        const currentIndex = langs.indexOf(i18n.language);
        const nextLang = langs[(currentIndex + 1) % langs.length];
        i18n.changeLanguage(nextLang);
        localStorage.setItem('language', nextLang);
    };

    const getLangLabel = () => {
        const labels = { en: 'EN', kk: 'ҚҚ', ru: 'РУ' };
        return labels[i18n.language] || 'EN';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        try {
            login(username, password);
            toast.success(t('auth.welcomeBack', { username }), { icon: '👋' });
            navigate('/');
        } catch (err) {
            // Check if errors are translation keys or fallback to message
            const errorMessage = err.message.startsWith('auth.') ? t(err.message) : err.message;
            toast.error(errorMessage);
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <button onClick={changeLanguage} className="auth-lang-switcher" title="Change Language">
                <Globe size={20} />
                <span>{getLangLabel()}</span>
            </button>
            <div className="auth-card">
                <h1 className="auth-title">Archelearn</h1>
                <h2>{t('auth.login')}</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>{t('auth.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button">
                        {t('auth.login')}
                    </button>
                </form>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    {t('auth.clearData')}
                </button>

                <p className="auth-link">
                    {t('auth.noAccount')} <Link to="/signup">{t('auth.signup')}</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
