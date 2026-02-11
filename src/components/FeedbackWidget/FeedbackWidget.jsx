import { useState } from 'react';
import { MessageSquare, Star, X, Send } from 'lucide-react';
import './FeedbackWidget.css';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            // Optional: Alert user to select a rating
            return;
        }

        setStatus('submitting');

        try {
            const response = await fetch("https://formspree.io/f/mlglvjkv", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rating: rating,
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                    setRating(0);
                    setMessage('');
                }, 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className={`feedback-widget ${isOpen ? 'open' : ''}`}>
            <button
                className="feedback-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Feedback"
            >
                <MessageSquare size={20} />
                <span>Feedback</span>
            </button>

            <div className="feedback-panel">
                <div className="feedback-header-widget">
                    <h3>Rate Us</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="feedback-success">
                        <p>🎉 Thank you for your feedback!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <p className="feedback-prompt">How would you rate your experience?</p>

                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star size={24} fill={star <= (hoverRating || rating) ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label htmlFor="feedback-message">Ideas, bugs, or issues?</label>
                            <textarea
                                id="feedback-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us what you think..."
                                rows={4}
                            />
                        </div>

                        {status === 'error' && <p className="error-msg">Failed to send. Please try again.</p>}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={status === 'submitting' || rating === 0}
                        >
                            {status === 'submitting' ? 'Sending...' : (
                                <>
                                    <span>Send Feedback</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackWidget;
