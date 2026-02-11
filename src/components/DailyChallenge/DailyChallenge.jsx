import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './DailyChallenge.css';

function DailyChallenge({ challenge, progress, onClaim }) {
    const { user } = useAuth();

    if (!challenge) return null;

    const progressPercent = Math.min((progress / challenge.target) * 100, 100);
    const isComplete = progress >= challenge.target;
    const isClaimed = user?.dailyChallengesClaimed?.includes(challenge.id);

    const handleClaim = () => {
        if (isComplete && !isClaimed) {
            onClaim(challenge);
            toast.success(`🎉 Challenge complete! +${challenge.reward} XP earned!`, {
                duration: 4000,
            });
        }
    };

    return (
        <motion.div
            className="daily-challenge-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="challenge-header">
                <span className="challenge-icon">{challenge.icon}</span>
                <div className="challenge-info">
                    <h3 className="challenge-title">{challenge.title}</h3>
                    <p className="challenge-description">{challenge.description}</p>
                </div>
            </div>

            <div className="challenge-progress">
                <div className="progress-text">
                    <span>{progress} / {challenge.target}</span>
                    <span className="reward-badge">+{challenge.reward} XP</span>
                </div>
                <div className="progress-bar-container">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
            </div>

            {isComplete && !isClaimed && (
                <motion.button
                    className="claim-button"
                    onClick={handleClaim}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ✨ Claim Reward
                </motion.button>
            )}

            {isClaimed && (
                <div className="claimed-badge">
                    ✅ Completed
                </div>
            )}
        </motion.div>
    );
}

export default DailyChallenge;
