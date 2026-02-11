import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Home, BookOpen, ShoppingBag, User, Sun, Moon, Globe, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

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

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <h1>Archelearn</h1>
                </div>

                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link" onClick={closeMenu}>
                        <Home size={20} />
                        <span>{t('nav.home')}</span>
                    </Link>
                    <Link to="/learn" className="nav-link" onClick={closeMenu}>
                        <BookOpen size={20} />
                        <span>{t('nav.learn')}</span>
                    </Link>
                    <Link to="/shop" className="nav-link" onClick={closeMenu}>
                        <ShoppingBag size={20} />
                        <span>{t('nav.shop')}</span>
                    </Link>
                    <Link to="/profile" className="nav-link" onClick={closeMenu}>
                        <User size={20} />
                        <span>{t('nav.profile')}</span>
                    </Link>
                    <Link to="/ai-helper" className="nav-link ai-helper-link" onClick={closeMenu}>
                        <Sparkles size={20} />
                        <span>{t('nav.aiHelper')}</span>
                    </Link>
                </div>

                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="navbar-controls">
                    <button onClick={changeLanguage} className="control-btn" title="Change Language" aria-label={t('nav.changeLanguage')}>
                        <Globe size={20} />
                        <span className="lang-label">{getLangLabel()}</span>
                    </button>
                    <button onClick={toggleTheme} className="control-btn" title="Toggle Theme" aria-label={t('nav.toggleTheme')}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {user && (
                        <div className="user-exp">
                            <span className="exp-value">{user.exp}</span>
                            <span className="exp-label">EXP</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
