import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../../contexts/MultiplayerContext';
import CharacterAvatar from '../../components/CharacterAvatar/CharacterAvatar';
import styles from './Multiplayer.module.css';
import { Play, Users, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import quizzesData from '../../data/quizzes.json';
import { useTranslation } from 'react-i18next';
import { getQuizTranslation } from '../../data/quizTranslations';

// --- Sub Components ---

const MultiplayerMenu = () => {
    const { t, i18n } = useTranslation();
    const { createRoom, joinRoom } = useMultiplayer();
    const [pinInput, setPinInput] = useState('');
    const [isSelecting, setIsSelecting] = useState(false);

    if (isSelecting) {
        return (
            <div className={styles.menuContainer}>
                <h2 className={styles.title}>{t('multiplayer.selectQuiz')}</h2>
                <div className={styles.quizList}>
                    {quizzesData.map(quiz => (
                        <div key={quiz.id} className={styles.quizItem} onClick={() => createRoom(quiz.id)}>
                            <h3>{getQuizTranslation(quiz.id, 'title', i18n.language) || quiz.title}</h3>
                            <p>{quiz.questions.length} {t('multiplayer.questions')}</p>
                        </div>
                    ))}
                </div>
                <button className={styles.backButton} onClick={() => setIsSelecting(false)}>
                    {t('multiplayer.back')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.menuContainer}>
            <h1 className={styles.title}>{t('multiplayer.title')}</h1>

            <div className={styles.menuGrid}>
                {/* Host Card */}
                <div className={styles.card} onClick={() => setIsSelecting(true)}>
                    <Play size={48} className={styles.icon} />
                    <h2>{t('multiplayer.hostGame')}</h2>
                    <p>{t('multiplayer.createRoom')}</p>
                </div>

                {/* Join Card */}
                <div className={styles.card}>
                    <Users size={48} className={styles.icon} />
                    <h2>{t('multiplayer.joinGame')}</h2>
                    <input
                        type="text"
                        placeholder={t('multiplayer.enterPin')}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className={styles.pinInput}
                        maxLength={6}
                    />
                    <button
                        className={styles.joinButton}
                        onClick={() => joinRoom(pinInput)}
                        disabled={pinInput.length < 6}
                    >
                        {t('multiplayer.joinRoom')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HostLobby = () => {
    const { t } = useTranslation();
    const { roomPin, players, startGame } = useMultiplayer();

    return (
        <div className={styles.lobbyContainer}>
            <div className={styles.pinDisplay}>
                <span>{t('multiplayer.gamePin')}:</span>
                <span className={styles.pinCode}>{roomPin}</span>
            </div>

            <div className={styles.playerGrid}>
                {players.map((p, i) => (
                    <div key={p.id || i} className={styles.playerCard}>
                        {/* We need to reconstruct the user object for CharacterAvatar */}
                        <div className="avatar-wrapper">
                            <CharacterAvatar
                                user={{
                                    ...p.avatar,
                                    sex: p.avatar.sex || 'male'
                                }}
                                isProfile={false}
                            />
                        </div>
                        <span className={styles.playerName}>{p.username}</span>
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <p>{players.length} {t('multiplayer.waitingForPlayers')}</p>
                <button className={styles.startButton} onClick={startGame}>
                    {t('multiplayer.startGame')}
                </button>
            </div>
        </div>
    );
};

const PlayerLobby = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    return (
        <div className={styles.lobbyContainer}>
            <h2 className={styles.waitingText}>{t('multiplayer.youreIn')}</h2>
            <p>{t('multiplayer.seeNickname')}</p>

            <div className={styles.myAvatar}>
                <CharacterAvatar user={user} isProfile={true} />
            </div>
            <p className={styles.advice}>{t('multiplayer.waitingForHost')}</p>
        </div>
    );
};

const HostGameScreen = () => {
    const { t } = useTranslation();
    const { currentQuestion, answerCount, players, nextState } = useMultiplayer();
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (!currentQuestion) return;
        setTimer(currentQuestion.timeLeft || 30);
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion?.id]);

    if (!currentQuestion) return <div>Loading...</div>;

    return (
        <div className={styles.gameContainer}>
            <div className={styles.statsBar}>
                <div className={`${styles.timer} ${timer === 0 ? styles.timeUp : ''}`}>
                    {timer === 0 ? t('multiplayer.timesUp') : `${timer}s`}
                </div>
                <div className={styles.answers}>
                    {answerCount} / {players.length} {t('multiplayer.answered')}
                </div>
            </div>

            <div className={styles.questionDisplay}>
                <h2>{currentQuestion.question}</h2>
            </div>

            {/* Options display for Host (so audience can see options) */}
            <div className={styles.optionsGrid}>
                {currentQuestion.options.map((opt, i) => (
                    <div key={i} className={`${styles.optionCard} ${styles[`opt${i}`]}`}>
                        {opt}
                    </div>
                ))}
            </div>

            <div className={styles.controls}>
                <button className={styles.nextButton} onClick={nextState}>
                    {t('multiplayer.next')}
                </button>
            </div>
        </div>
    );
};

const PlayerGameScreen = () => {
    const { t } = useTranslation();
    const { currentQuestion, submitAnswer } = useMultiplayer();
    const [submitted, setSubmitted] = useState(false);

    // Reset submitted state when question changes
    useEffect(() => {
        setSubmitted(false);
    }, [currentQuestion?.questionNumber]);

    if (!currentQuestion) {
        return <div className={styles.loading}>{t('multiplayer.getReady')}</div>;
    }

    if (submitted) {
        return (
            <div className={styles.centerMsg}>
                <h2>{t('multiplayer.answerSubmitted')}</h2>
                <p>{t('multiplayer.waitingForOthers')}</p>
            </div>
        );
    }

    const colors = ['var(--color-red)', 'var(--color-blue)', 'var(--color-yellow)', 'var(--color-green)']; // Red, Blue, Yellow, Green

    return (
        <div className={styles.playerGameContainer}>
            <div className={styles.playerQuestionText}>
                <h3>{currentQuestion.question}</h3>
            </div>

            <div className={styles.playerGridButtons}>
                {Array.from({ length: currentQuestion.optionsCount }).map((_, i) => (
                    <button
                        key={i}
                        className={styles.colorButton}
                        style={{ backgroundColor: colors[i] }}
                        onClick={() => {
                            submitAnswer(i);
                            setSubmitted(true);
                        }}
                    >
                        {/* Shapes could go here: Triangle, Diamond, Circle, Square */}
                    </button>
                ))}
            </div>
        </div>
    );
};

const LeaderboardScreen = () => {
    const { t } = useTranslation();
    const { leaderboard, continueGame, isHost } = useMultiplayer();

    return (
        <div className={styles.leaderboardContainer}>
            <h1>{t('multiplayer.scoreboard')}</h1>
            <div className={styles.rankings}>
                {leaderboard.map((p, i) => (
                    <div key={p.id} className={styles.rankRow} style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className={styles.rank}>#{i + 1}</span>
                        <span className={styles.name}>{p.username}</span>
                        <span className={styles.score}>{p.score} XP</span>
                        <div className={styles.streak}>🔥 {p.streak}</div>
                    </div>
                ))}
            </div>

            {isHost && (
                <button className={styles.nextButton} onClick={continueGame}>
                    {t('multiplayer.nextQuestion')}
                </button>
            )}

            <button
                className={styles.backButton}
                onClick={() => window.location.reload()}
                style={{ marginTop: '1rem', background: '#666' }}
            >
                {t('multiplayer.backToMenu')}
            </button>
        </div>
    );
};

// --- Main Page ---

const MultiplayerPage = () => {
    const { gameState, isHost, error, createRoom } = useMultiplayer();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.customQuiz && gameState === 'menu') {
            createRoom(location.state.customQuiz);
            // Clear state so it doesn't re-trigger
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, gameState, createRoom, navigate, location.pathname]);

    return (
        <div className={styles.pageWrapper}>
            {error && <div className={styles.errorToast}>{error}</div>}

            {gameState === 'menu' && <MultiplayerMenu />}

            {gameState === 'lobby' && (
                isHost ? <HostLobby /> : <PlayerLobby />
            )}

            {gameState === 'question' && (
                isHost ? <HostGameScreen /> : <PlayerGameScreen />
            )}

            {(gameState === 'leaderboard' || gameState === 'ended') && (
                <LeaderboardScreen />
            )}
        </div>
    );
};

export default MultiplayerPage;
