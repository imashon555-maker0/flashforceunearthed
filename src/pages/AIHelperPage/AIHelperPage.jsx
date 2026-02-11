import React, { useState, useEffect } from 'react';
import { generateContent } from '../../services/aiService';
import { useGamification } from '../../contexts/GamificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Book, Layers, BrainCircuit, RotateCw, CheckCircle, XCircle, Swords, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import './AIHelperPage.css';

import { useAuth } from '../../contexts/AuthContext';

const AIHelperPage = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const { addExp } = useGamification();
    const navigate = useNavigate();
    const location = useLocation();

    // Core State
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    // Interactive State
    const [flippedCards, setFlippedCards] = useState({});

    // Quiz State
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        if (location.state?.savedResource) {
            const { topic, summary, flashcards, quiz } = location.state.savedResource;
            setPrompt(topic);
            setResult({ summary, flashcards, quiz });
            // Clear state so reload doesn't persist weirdly, optional but good UX
            // navigate(location.pathname, { replace: true, state: {} }); 
            // Better to keep it so refresh works? React Router state persists on refresh usually.
        }
    }, [location.state]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizCompleted(false);
        setQuizFeedback(null);
        setSelectedOption(null);
        setFlippedCards({});

        try {
            const currentLanguage = i18n.language || 'en';
            const data = await generateContent(prompt, currentLanguage);
            setResult(data);
            setActiveTab('summary');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlip = (index) => {
        setFlippedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleOptionSelect = (option) => {
        if (!quizFeedback) {
            setSelectedOption(option);
        }
    };

    const handleSubmitAnswer = () => {
        const currentQ = result.quiz[quizIndex];
        const isCorrect = selectedOption === currentQ.answer;

        if (isCorrect) {
            setQuizScore(s => s + 1);
        }

        setQuizFeedback({
            correct: isCorrect,
            explanation: currentQ.explanation
        });
    };

    const handleNextQuestion = () => {
        if (quizIndex < result.quiz.length - 1) {
            setQuizIndex(i => i + 1);
            setSelectedOption(null);
            setQuizFeedback(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setQuizCompleted(true);
        addExp(quizScore * 10);
    };

    const handleStartBattle = () => {
        if (!result || !result.quiz) return;

        // Convert AI Quiz Format (answer string) to App Quiz Format (correctAnswer index)
        const formattedQuestions = result.quiz.map((q, index) => {
            const correctIndex = q.options.indexOf(q.answer);
            return {
                id: `q-${index}`,
                type: 'multiple-choice',
                text: q.question,
                options: q.options,
                correctAnswer: correctIndex !== -1 ? correctIndex : 0, // Fallback
                explanation: q.explanation
            };
        });

        const customQuiz = {
            id: 'custom-ai',
            title: `Battle: ${prompt}`,
            questions: formattedQuestions,
            reward: 50
        };

        navigate('/multiplayer', { state: { customQuiz } });
    };

    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        if (!result) return;

        const newResource = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            topic: prompt,
            summary: result.summary,
            flashcards: result.flashcards,
            quiz: result.quiz
        };

        const currentResources = user?.savedResources || [];
        updateUser({ savedResources: [newResource, ...currentResources] });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="ai-helper-page">
            <header className="ai-header">
                <Sparkles className="header-icon" />
                <h1>{t('aiHelper.title')}</h1>
                <p>{t('aiHelper.subtitle')}</p>
            </header>

            <div className="input-section">
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('aiHelper.placeholder')}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                        {loading ? <RotateCw className="spin" /> : <Sparkles />}
                        {t('aiHelper.generate')}
                    </button>
                </div>
            </div>

            {result && (
                <div className="results-section pop-in">
                    <div className="tabs">
                        {['summary', 'flashcards', 'quiz'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'summary' && <Book size={18} />}
                                {tab === 'flashcards' && <Layers size={18} />}
                                {tab === 'quiz' && <BrainCircuit size={18} />}
                                {t(`aiHelper.${tab}`)}
                            </button>
                        ))}
                    </div>

                    <div className="content-area">
                        {activeTab === 'summary' && (
                            <div className="summary-content">
                                <h3>{t('aiHelper.overviewOf')} {prompt}</h3>
                                <p>{result.summary}</p>
                                <div className="quiz-header-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={handleStartBattle}
                                        className="action-btn battle-btn"
                                        style={{ background: 'var(--color-terracotta)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                    >
                                        <Swords size={18} />
                                        {t('aiHelper.startBattle')}
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={handleSave}
                                        disabled={isSaved}
                                        style={{
                                            marginLeft: '1rem',
                                            backgroundColor: isSaved ? 'var(--color-green)' : 'var(--color-blue)',
                                            border: 'none',
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: isSaved ? 'default' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isSaved ? <CheckCircle size={20} /> : <Bookmark size={20} />}
                                        {isSaved ? t('aiHelper.saved') : t('aiHelper.saveToProfile')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'flashcards' && (
                            <div className="flashcards-grid">
                                {result.flashcards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className={`flashcard-container ${flippedCards[idx] ? 'flipped' : ''}`}
                                        onClick={() => toggleFlip(idx)}
                                    >
                                        <div className="flashcard-inner">
                                            <div className="flashcard-front">
                                                <span className="card-label">{t('aiHelper.front')}</span>
                                                <p>{card.front}</p>
                                            </div>
                                            <div className="flashcard-back">
                                                <span className="card-label">{t('aiHelper.back')}</span>
                                                <p>{card.back}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="quiz-header-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={handleStartBattle}
                                        className="action-btn battle-btn"
                                        style={{ background: 'var(--color-terracotta)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                    >
                                        <Swords size={18} />
                                        {t('aiHelper.startBattle')}
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={handleSave}
                                        disabled={isSaved}
                                        style={{
                                            marginLeft: '1rem',
                                            backgroundColor: isSaved ? 'var(--color-green)' : 'var(--color-blue)',
                                            border: 'none',
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: isSaved ? 'default' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isSaved ? <CheckCircle size={20} /> : <Bookmark size={20} />}
                                        {isSaved ? t('aiHelper.saved') : t('aiHelper.saveToProfile')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'quiz' && (
                            <div className="interactive-quiz">
                                <div className="quiz-header-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                    <button
                                        onClick={handleStartBattle}
                                        className="action-btn battle-btn"
                                        style={{ background: 'var(--color-terracotta)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                    >
                                        <Swords size={18} />
                                        {t('aiHelper.startBattle')}
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={handleSave}
                                        disabled={isSaved}
                                        style={{
                                            marginLeft: '1rem',
                                            backgroundColor: isSaved ? 'var(--color-green)' : 'var(--color-blue)',
                                            border: 'none',
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: isSaved ? 'default' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isSaved ? <CheckCircle size={20} /> : <Bookmark size={20} />}
                                        {isSaved ? t('aiHelper.saved') : t('aiHelper.saveToProfile')}
                                    </button>
                                </div>
                                {!quizCompleted ? (
                                    <>
                                        <div className="quiz-progress">
                                            {t('aiHelper.questionProgress')} {quizIndex + 1} / {result.quiz.length}
                                        </div>

                                        <h3 className="quiz-question">{result.quiz[quizIndex].question}</h3>

                                        <div className="quiz-options">
                                            {result.quiz[quizIndex].options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    className={`quiz-option 
                                                            ${selectedOption === opt ? 'selected' : ''}
                                                            ${quizFeedback && opt === result.quiz[quizIndex].answer ? 'correct' : ''}
                                                            ${quizFeedback && selectedOption === opt && !quizFeedback.correct ? 'incorrect' : ''}
                                                        `}
                                                    onClick={() => handleOptionSelect(opt)}
                                                    disabled={!!quizFeedback}
                                                >
                                                    {opt}
                                                    {quizFeedback && opt === result.quiz[quizIndex].answer && <CheckCircle size={16} />}
                                                    {quizFeedback && selectedOption === opt && !quizFeedback.correct && <XCircle size={16} />}
                                                </button>
                                            ))}
                                        </div>

                                        {quizFeedback && (
                                            <div className={`quiz-feedback ${quizFeedback.correct ? 'success' : 'error'}`}>
                                                <strong>{quizFeedback.correct ? t('aiHelper.correctAnswer') : t('aiHelper.incorrectAnswer')}</strong>
                                                <p>{quizFeedback.explanation}</p>
                                            </div>
                                        )}

                                        <div className="quiz-actions">
                                            {!quizFeedback ? (
                                                <button
                                                    className="action-btn submit-btn"
                                                    onClick={handleSubmitAnswer}
                                                    disabled={!selectedOption}
                                                >
                                                    {t('aiHelper.submitAnswer')}
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn next-btn"
                                                    onClick={handleNextQuestion}
                                                >
                                                    {quizIndex < result.quiz.length - 1 ? t('aiHelper.nextQuestion') : t('aiHelper.finishQuiz')}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="quiz-results">
                                        <h3>{t('aiHelper.quizCompleted')}</h3>
                                        <div className="score-circle">
                                            <span>{quizScore}</span>
                                            <small>/ {result.quiz.length}</small>
                                        </div>
                                        <p>{t('aiHelper.mastered')} {Math.round((quizScore / result.quiz.length) * 100)}%!</p>
                                        <p className="exp-reward">+{quizScore * 10} {t('aiHelper.expEarned')}</p>

                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                            <button className="action-btn restart-btn" onClick={handleGenerate}>{t('aiHelper.tryAnother')}</button>
                                            <button
                                                className="action-btn battle-btn"
                                                onClick={handleStartBattle}
                                                style={{ background: 'var(--color-terracotta)' }}
                                            >
                                                {t('aiHelper.startMultiplayer')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIHelperPage;
