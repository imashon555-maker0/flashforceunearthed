import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../../contexts/GamificationContext';
import quizzesData from '../../data/quizzes.json';
import { quizTranslations } from '../../data/quizTranslations';
import { Search, ScrollText } from 'lucide-react';
import { calculateQuizScore } from '../../utils/quizUtils';
import './QuizPage.css';

function QuizPage() {
    const { t, i18n } = useTranslation();
    const { addExp, trackChallengeProgress } = useGamification();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPeriod, setSelectedPeriod] = useState('All');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [matchingAnswers, setMatchingAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Filter toggle state for mobile/cleaner UI


    // Helper function to get translated quiz content
    const getTranslatedQuiz = (quiz) => {
        const currentLang = i18n.language;
        const translations = quizTranslations[currentLang]?.[quiz.id];

        if (!translations) {
            // Fallback to original quiz if no translation available
            return quiz;
        }

        return {
            ...quiz,
            title: translations.title,
            questions: quiz.questions.map((q) => {
                const qTranslation = translations.questions[q.id];
                if (!qTranslation) return q;

                if (q.type === 'multiple-choice') {
                    return {
                        ...q,
                        text: qTranslation.text,
                        options: qTranslation.options,
                        explanation: qTranslation.explanation
                    };
                } else if (q.type === 'connect') {
                    return {
                        ...q,
                        text: qTranslation.text,
                        pairs: q.pairs.map((pair, index) => ({
                            left: qTranslation.pairs.left[index],
                            right: qTranslation.pairs.right[index]
                        })),
                        explanation: qTranslation.explanation
                    };
                }
                return q;
            })
        };
    };

    // extract unique categories and periods
    const categories = ['All', ...new Set(quizzesData.map(q => q.category).filter(Boolean))];
    const periods = ['All', ...new Set(quizzesData.map(q => q.period).filter(Boolean))];

    const filteredQuizzes = quizzesData.map(getTranslatedQuiz).filter((quiz) => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
        const matchesPeriod = selectedPeriod === 'All' || quiz.period === selectedPeriod;
        return matchesSearch && matchesCategory && matchesPeriod;
    });

    const getCategoryClass = (category) => {
        if (!category) return 'tag-default';
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('archaeology')) return 'tag-archaeology';
        if (lowerCat.includes('history')) return 'tag-history';
        if (lowerCat.includes('culture')) return 'tag-culture';
        if (lowerCat.includes('nature')) return 'tag-nature';
        return 'tag-default';
    };

    const startQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setShowResult(false);
        setMatchingAnswers({});
        setShowFeedback(false);
        setIsCorrect(false);
    };

    const handleMultipleChoiceAnswer = (answerIndex) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setUserAnswers(newAnswers);
    };

    const handleMatchingAnswer = (leftItem, rightItem) => {
        setMatchingAnswers((prev) => ({
            ...prev,
            [leftItem]: rightItem
        }));
    };

    const submitCurrentAnswer = () => {
        const question = selectedQuiz.questions[currentQuestionIndex];
        let correct = false;

        // Check if answer is correct
        if (question.type === 'multiple-choice') {
            correct = userAnswers[currentQuestionIndex] === question.correctAnswer;
        } else if (question.type === 'connect') {
            correct = question.pairs.every(
                (pair) => matchingAnswers[pair.left] === pair.right
            );
            // Store the matching answers for final result
            const newAnswers = [...userAnswers];
            newAnswers[currentQuestionIndex] = { ...matchingAnswers };
            setUserAnswers(newAnswers);
        }

        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        setShowFeedback(false);
        setMatchingAnswers({});

        if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        const correctCount = calculateQuizScore(selectedQuiz.questions, userAnswers);
        const totalQuestions = selectedQuiz.questions.length;
        const scorePercent = Math.round((correctCount / totalQuestions) * 100);
        const earnedExp = Math.floor((correctCount / totalQuestions) * selectedQuiz.reward);

        addExp(earnedExp);

        // Track challenge progress
        trackChallengeProgress('quizCompleted', {
            category: selectedQuiz.category,
            scorePercent: scorePercent
        });

        setShowResult(true);
    };

    const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];

    if (showResult) {
        const correctCount = calculateQuizScore(selectedQuiz.questions, userAnswers);
        const earnedExp = Math.floor((correctCount / selectedQuiz.questions.length) * selectedQuiz.reward);

        return (
            <div className="quiz-container">
                <div className="result-card">
                    <h2>{t('quiz.score')}</h2>
                    <div className="score-display">
                        {correctCount} / {selectedQuiz.questions.length}
                    </div>
                    <div className="exp-earned">
                        +{earnedExp} {t('quiz.earned')}
                    </div>
                    <button onClick={() => {
                        setSelectedQuiz(null);
                        setShowResult(false);
                    }} className="quiz-btn">
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    if (selectedQuiz) {
        return (
            <div className="quiz-container">
                <div className="quiz-card card">
                    <div className="quiz-progress">
                        {t('quiz.question')} {currentQuestionIndex + 1} {t('quiz.of')} {selectedQuiz.questions.length}
                    </div>

                    <h2>{currentQuestion.text}</h2>

                    {currentQuestion.type === 'multiple-choice' && (
                        <div className="options-grid">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                                    onClick={() => handleMultipleChoiceAnswer(index)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'connect' && (
                        <div className="matching-container">
                            <div className="matching-grid">
                                <div className="matching-column">
                                    {currentQuestion.pairs.map((pair, index) => (
                                        <div key={index} className="matching-item left">
                                            {pair.left}
                                        </div>
                                    ))}
                                </div>
                                <div className="matching-column">
                                    {currentQuestion.pairs.map((pair, index) => (
                                        <button
                                            key={index}
                                            className={`matching-item right ${Object.values(matchingAnswers).includes(pair.right) ? 'selected' : ''
                                                }`}
                                            onClick={() => {
                                                // Simple matching: click left item in mind, then right
                                                // For simplicity, we'll use first unmatched left item
                                                const unmatchedLeft = currentQuestion.pairs.find(
                                                    (p) => !matchingAnswers[p.left]
                                                );
                                                if (unmatchedLeft) {
                                                    handleMatchingAnswer(unmatchedLeft.left, pair.right);
                                                }
                                            }}
                                        >
                                            {pair.right}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="matches-display">
                                {Object.entries(matchingAnswers).map(([left, right]) => (
                                    <div key={left} className="match-pair">
                                        {left} → {right}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Immediate Feedback Section */}
                    {showFeedback && (
                        <div className={`feedback-section ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="feedback-header">
                                {isCorrect ? <span>✅ {t('quiz.correct')}</span> : <span>❌ {t('quiz.incorrect')}</span>}
                            </div>
                            <div className="feedback-explanation">
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={showFeedback ? handleNextQuestion : submitCurrentAnswer}
                        className="quiz-btn submit-btn"
                        disabled={
                            !showFeedback && (
                                currentQuestion.type === 'multiple-choice'
                                    ? userAnswers[currentQuestionIndex] === undefined
                                    : Object.keys(matchingAnswers).length !== currentQuestion.pairs.length
                            )
                        }
                    >
                        {showFeedback
                            ? (currentQuestionIndex < selectedQuiz.questions.length - 1 ? t('quiz.next') : t('quiz.finish'))
                            : t('quiz.submit')
                        }
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <div className="header-titles">
                    <h1>{t('quiz.title')}</h1>
                </div>

                <div className="search-and-filter">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder={t('quiz.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-container">
                <div className="filter-group">
                    <span className="filter-label">Category:</span>
                    <div className="filter-chips">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Period:</span>
                    <div className="filter-chips">
                        {periods.map(period => (
                            <button
                                key={period}
                                className={`filter-chip ${selectedPeriod === period ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(period)}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="quiz-list">
                {filteredQuizzes.length === 0 ? (
                    <div className="no-quizzes">
                        <h3>No quizzes found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredQuizzes.map((quiz) => (
                        <div key={quiz.id} className="quiz-item card" onClick={() => startQuiz(quiz)}>
                            <div className="quiz-info">
                                <div className="quiz-icon-wrapper">
                                    <ScrollText size={24} />
                                </div>
                                <div className="quiz-details">
                                    <h3>{quiz.title}</h3>
                                    <div className="quiz-meta">
                                        <span className="meta-item">{quiz.questions.length} {t('quiz.questions')}</span>
                                        <span className="meta-dot">•</span>
                                        <span className="meta-item">{quiz.reward} EXP</span>
                                    </div>
                                    <div className="quiz-tags">
                                        {quiz.category && <span className={`tag category-tag ${getCategoryClass(quiz.category)}`}>{quiz.category}</span>}
                                        {quiz.period && <span className="tag period-tag">{quiz.period}</span>}
                                    </div>
                                </div>
                            </div>
                            <button className="quiz-btn start-btn btn btn-primary">
                                {t('quiz.start')}
                            </button>
                        </div>
                    )))}
            </div>
        </div>
    );
}

export default QuizPage;
