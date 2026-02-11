import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Globe } from 'lucide-react';
import './AuthPages.css';

function SignupPage() {
    const { t, i18n } = useTranslation();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        if (password !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        try {
            signup(username, password);
            navigate('/');
        } catch (err) {
            // Check if errors are translation keys or fallback to message
            const errorMessage = err.message.startsWith('auth.') ? t(err.message) : err.message;
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
                <h2>{t('auth.signup')}</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>{t('auth.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('auth.confirmPassword')}</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button">
                        {t('auth.createAccount')}
                    </button>
                </form>

                <p className="auth-link">
                    {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
                </p>
            </div>
        </div>
    );
}

export default SignupPage;
