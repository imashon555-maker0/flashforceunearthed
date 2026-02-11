import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { BookOpen, Award, TrendingUp, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

import DailyChallenge from '../../components/DailyChallenge/DailyChallenge';
import './HomePage.css';

function HomePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { getTodayChallenge, getChallengeProgress, claimDailyChallenge } = useGamification();
    const navigate = useNavigate();

    const todayChallenge = getTodayChallenge();
    const challengeProgress = getChallengeProgress(todayChallenge);

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">{t('home.title')}</h1>
                <p className="hero-subtitle">
                    {t('home.subtitle')}
                </p>
                <div className="hero-stats">
                    <div className="stat-card">
                        <Award size={32} />
                        <div>
                            <div className="stat-value">{user?.exp || 0}</div>
                            <div className="stat-label">{t('profile.exp')}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <TrendingUp size={32} />
                        <div>
                            <div className="stat-value">{user?.streak || 0}</div>
                            <div className="stat-label">{t('profile.streak')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Challenge Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <DailyChallenge
                    challenge={todayChallenge}
                    progress={challengeProgress}
                    onClaim={claimDailyChallenge}
                />
            </motion.div>

            <div className="features-section">
                <motion.div
                    className="feature-card"
                    onClick={() => navigate('/learn')}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <BookOpen size={48} />
                    <h3>{t('home.learnQuiz')}</h3>
                    <p>{t('home.learnDesc')}</p>
                    <button className="feature-btn">{t('quiz.start')}</button>
                </motion.div>

                <motion.div
                    className="feature-card"
                    onClick={() => navigate('/shop')}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'%3E%3C/path%3E%3Cline x1='3' y1='6' x2='21' y2='6'%3E%3C/line%3E%3Cpath d='M16 10a4 4 0 0 1-8 0'%3E%3C/path%3E%3C/svg%3E" alt="Shop" />
                    <h3>{t('shop.title')}</h3>
                    <p>{t('home.shopDesc')}</p>
                    <button className="feature-btn">{t('home.browseItems')}</button>
                </motion.div>

                <motion.div
                    className="feature-card"
                    onClick={() => navigate('/multiplayer')}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Swords size={48} />
                    <h3>{t('home.battleMode')}</h3>
                    <p>{t('home.battleDesc')}</p>
                    <button className="feature-btn">{t('home.enterArena')}</button>
                </motion.div>
            </div>

            <div className="about-section">
                <h2>{t('home.aboutTitle')}</h2>
                <p>
                    {t('home.aboutText')}
                </p>
            </div>
        </div>
    );
}

export default HomePage;
