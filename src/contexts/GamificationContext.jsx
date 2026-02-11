import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import shopItems from '../data/shopItems.json';
import dailyChallenges from '../data/dailyChallenges.json';
import toast from 'react-hot-toast';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
    const { user, updateUser } = useAuth();

    useEffect(() => {
        if (!user) return;

        const checkStreak = () => {
            const today = new Date().toDateString();
            const lastLogin = new Date(user?.lastLogin || Date.now()).toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            if (lastLogin === today) {
                // Already logged in today
                return;
            } else if (lastLogin === yesterday) {
                // Continue streak
                updateUser({
                    streak: (user?.streak ?? 0) + 1,
                    lastLogin: new Date().toISOString(),
                    exp: (user?.exp ?? 0) + 5, // Bonus for maintaining streak
                    balance: (user?.balance ?? 0) + 5
                });
                toast.success(`\ud83d\udd25 ${(user?.streak ?? 0) + 1} day streak!`);
            } else {
                // Streak broken
                updateUser({
                    streak: 1,
                    lastLogin: new Date().toISOString()
                });
            }
        };

        checkStreak();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const addExp = (amount) => {
        if (!user) return;

        let multiplier = 1;

        // Calculate multiplier from artifacts in inventory
        if (user?.inventory) {
            user.inventory.forEach(itemId => {
                const item = shopItems.find(i => i.id === itemId);
                if (item && item.category === 'artifact' && item.xpBoost) {
                    multiplier += item.xpBoost;
                }
            });
        }

        const finalExp = Math.floor(amount * multiplier);
        const finalBalance = amount; // Balance is not boosted, only raw amount

        const newExp = (user?.exp ?? 0) + finalExp;
        const oldLevel = Math.floor(Math.sqrt((user?.exp ?? 0) / 100)) + 1;
        const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;

        updateUser({
            exp: newExp,
            balance: (user?.balance ?? 0) + finalBalance
        });

        // Toast notification for XP gain
        if (multiplier > 1) {
            toast.success(`+${finalExp} XP earned! (\u00d7${multiplier.toFixed(1)} boost)`, {
                icon: '\u2b50',
            });
        } else {
            toast.success(`+${finalExp} XP earned!`, {
                icon: '\u2b50',
            });
        }

        // Level up notification
        if (newLevel > oldLevel) {
            toast.success(`\ud83c\udf89 Level Up! You're now Level ${newLevel}!`, {
                duration: 5000,
            });
        }
    };

    const purchaseItem = (item) => {
        if (!user) return false;

        if ((user?.balance ?? 0) < item.price) {
            return false; // Insufficient balance
        }

        if (user?.inventory?.includes(item.id)) {
            return false; // Already owned
        }

        updateUser({
            balance: (user?.balance ?? 0) - item.price,
            inventory: [...(user?.inventory ?? []), item.id]
        });

        return true;
    };

    const equipItem = (item) => {
        if (!user) return;

        // Artifacts are passive items - they can't be equipped
        if (item.category === 'artifact') {
            return;
        }

        // Initialize equipped if it doesn't exist
        const currentEquipped = user.equipped || {};

        // If unequipping (clicking same item)
        if (currentEquipped[item.category] === item.id) {
            const newEquipped = { ...currentEquipped };
            delete newEquipped[item.category];
            updateUser({ equipped: newEquipped });
        } else {
            // Equip new item in category
            updateUser({
                equipped: {
                    ...currentEquipped,
                    [item.category]: item.id
                }
            });
        }
    };

    // Daily Challenge functions
    const getTodayChallenge = () => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const challengeIndex = dayOfYear % dailyChallenges.length;
        return dailyChallenges[challengeIndex];
    };

    const getChallengeProgress = (challenge) => {
        if (!user || !challenge) return 0;

        const today = new Date().toDateString();
        const progress = user?.dailyChallengeProgress || {};
        const todayProgress = progress[today] || {};

        switch (challenge.type) {
            case 'quizCount':
                return todayProgress.quizzesCompleted || 0;
            case 'perfectScores':
                return todayProgress.perfectScores || 0;
            case 'categoriesExplored':
                return (todayProgress.categoriesVisited || []).length;
            case 'highScores':
                return todayProgress.highScoreCount || 0;
            case 'categorySpecific':
                return todayProgress[`${challenge.category}Completed`] || 0;
            default:
                return 0;
        }
    };

    const trackChallengeProgress = (type, data = {}) => {
        if (!user) return;

        const today = new Date().toDateString();
        const progress = user?.dailyChallengeProgress || {};
        const todayProgress = progress[today] || {};

        let updated = { ...todayProgress };

        switch (type) {
            case 'quizCompleted':
                updated.quizzesCompleted = (updated.quizzesCompleted || 0) + 1;
                if (data.category) {
                    updated[`${data.category}Completed`] = (updated[`${data.category}Completed`] || 0) + 1;
                }
                // Track unique categories visited
                if (data.category) {
                    const visited = updated.categoriesVisited || [];
                    if (!visited.includes(data.category)) {
                        updated.categoriesVisited = [...visited, data.category];
                    }
                }
                if (data.scorePercent === 100) {
                    updated.perfectScores = (updated.perfectScores || 0) + 1;
                }
                if (data.scorePercent >= 80) {
                    updated.highScoreCount = (updated.highScoreCount || 0) + 1;
                }
                break;
            default:
                break;
        }

        updateUser({
            dailyChallengeProgress: {
                ...progress,
                [today]: updated
            }
        });
    };

    const claimDailyChallenge = (challenge) => {
        if (!user) return;

        const claimed = user?.dailyChallengesClaimed || [];
        if (claimed.includes(challenge.id)) return;

        updateUser({
            dailyChallengesClaimed: [...claimed, challenge.id],
            exp: (user?.exp ?? 0) + challenge.reward,
            balance: (user?.balance ?? 0) + challenge.reward
        });
    };

    return (
        <GamificationContext.Provider value={{
            addExp,
            purchaseItem,
            equipItem,
            getTodayChallenge,
            getChallengeProgress,
            trackChallengeProgress,
            claimDailyChallenge
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
};
