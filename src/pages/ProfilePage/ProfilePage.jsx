import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Swords, Eye, Scroll, Heart } from 'lucide-react';
import './ProfilePage.css';
import './HairCustomization.css';
import CharacterAvatar from '../../components/CharacterAvatar/CharacterAvatar';
import shopItems from '../../data/shopItems.json';
import quizzesData from '../../data/quizzes.json';
import { useGamification } from '../../contexts/GamificationContext';

function ProfilePage() {
    const { t } = useTranslation();
    const { user, logout, updateUser } = useAuth();
    const { equipItem } = useGamification();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="profile-container">
            <div className="profile-header card">
                <div className="avatar-section">
                    <div className="avatar-display">
                        <CharacterAvatar equipped={user?.equipped} inventory={user?.inventory} />
                    </div>
                    <div className="profile-info">
                        <h2>{user?.username}</h2>
                        <p>{t('profile.memberSince')} {new Date(user?.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    {t('auth.logout')}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-box card">
                    <div className="stat-icon exp">
                        <span>⭐</span>
                    </div>
                    <div className="stat-details">
                        <div className="stat-value">{user?.exp || 0}</div>
                        <div className="stat-label">{t('profile.exp')}</div>
                    </div>
                </div>

                <div className="stat-box card">
                    <div className="stat-icon balance">
                        <span>💰</span>
                    </div>
                    <div className="stat-details">
                        <div className="stat-value">{user?.balance || 0}</div>
                        <div className="stat-label">{t('profile.balance')}</div>
                    </div>
                </div>

                <div className="stat-box card">
                    <div className="stat-icon streak">
                        <span>🔥</span>
                    </div>
                    <div className="stat-details">
                        <div className="stat-value">{user?.streak || 0}</div>
                        <div className="stat-label">{t('profile.streak')}</div>
                    </div>
                </div>

                <div className="stat-box card">
                    <div className="stat-icon inventory">
                        <Package size={32} />
                    </div>
                    <div className="stat-details">
                        <div className="stat-value">{user?.inventory?.length || 0}</div>
                        <div className="stat-label">{t('profile.inventory')}</div>
                    </div>
                </div>
            </div>

            {/* Quiz Stats Section */}
            <div className="quiz-stats-section">
                <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-primary)' }}>🏆 {t('profile.quizMilestones') || 'Quiz Milestones'}</h3>
                <div className="stats-grid">
                    <div className="stat-box card">
                        <div className="stat-icon completed" style={{ background: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' }}>
                            <Scroll size={32} />
                        </div>
                        <div className="stat-details">
                            <div className="stat-value">{user?.completedQuizzes?.length || 0}</div>
                            <div className="stat-label">{t('profile.quizzesCompleted') || 'Quizzes Completed'}</div>
                        </div>
                    </div>
                    <div className="stat-box card">
                        <div className="stat-icon favorite" style={{ background: 'rgba(233, 30, 99, 0.2)', color: '#e91e63' }}>
                            <Heart size={32} />
                        </div>
                        <div className="stat-details">
                            <div className="stat-value">
                                {(() => {
                                    if (!user?.completedQuizzes?.length) return 'None';
                                    const counts = user.completedQuizzes.reduce((acc, id) => {
                                        const quiz = quizzesData.find(q => q.id === id);
                                        if (quiz?.category) {
                                            acc[quiz.category] = (acc[quiz.category] || 0) + 1;
                                        }
                                        return acc;
                                    }, {});
                                    const favorite = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'None');
                                    return favorite;
                                })()}
                            </div>
                            <div className="stat-label">{t('profile.favoriteTopic') || 'Favorite Topic'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hair Customization Section */}
            <div className="customization-section">
                <h3>🎨 Customize Hair</h3>
                <div className="hair-customization">
                    <div className="hair-types">
                        <label>Hair Style:</label>
                        <div className="hair-type-grid">
                            {['short', 'long', 'curly', 'bald', 'ponytail', 'spiky'].map((type) => (
                                <button
                                    key={type}
                                    className={`hair-type-btn ${user?.hairType === type ? 'active' : ''}`}
                                    onClick={() => {
                                        const updatedUser = { ...user, hairType: type };
                                        updateUser({ hairType: type });
                                        localStorage.setItem('user', JSON.stringify(updatedUser));
                                    }}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hair-colors">
                        <label>Hair Color:</label>
                        <div className="color-palette">
                            {[
                                { name: 'Black', color: '#1a1a1a' },
                                { name: 'Brown', color: '#654321' },
                                { name: 'Blonde', color: '#f4d03f' },
                                { name: 'Red', color: '#c0392b' },
                                { name: 'Gray', color: '#95a5a6' },
                                { name: 'White', color: '#ecf0f1' },
                                { name: 'Blue', color: '#3498db' },
                                { name: 'Pink', color: '#e91e63' }
                            ].map((colorOption) => (
                                <button
                                    key={colorOption.color}
                                    className={`color-swatch ${user?.hairColor === colorOption.color ? 'active' : ''}`}
                                    style={{ backgroundColor: colorOption.color }}
                                    onClick={() => {
                                        const updatedUser = { ...user, hairColor: colorOption.color };
                                        updateUser({ hairColor: colorOption.color });
                                        localStorage.setItem('user', JSON.stringify(updatedUser));
                                    }}
                                    title={colorOption.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="hair-colors" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <label>Skin Tone:</label>
                        <div className="color-palette">
                            {[
                                { name: 'Pale', color: '#ffdbac' },
                                { name: 'Fair', color: '#f1c27d' },
                                { name: 'Tan', color: '#e0ac69' },
                                { name: 'Medium', color: '#c68642' },
                                { name: 'Dark', color: '#8d5524' },
                                { name: 'Deep', color: '#5a3a1a' }
                            ].map((tone) => (
                                <button
                                    key={tone.color}
                                    className={`color-swatch ${user?.skinTone === tone.color ? 'active' : ''}`}
                                    style={{ backgroundColor: tone.color }}
                                    onClick={() => {
                                        const updatedUser = { ...user, skinTone: tone.color };
                                        updateUser({ skinTone: tone.color });
                                        localStorage.setItem('user', JSON.stringify(updatedUser));
                                    }}
                                    title={tone.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="hair-colors" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <label>Clothing Color:</label>
                        <div className="color-palette">
                            {[
                                { name: 'Sky Blue', color: '#87ceeb' },
                                { name: 'Red', color: '#e74c3c' },
                                { name: 'Green', color: '#2ecc71' },
                                { name: 'Royal Blue', color: '#3498db' },
                                { name: 'Purple', color: '#9b59b6' },
                                { name: 'Black', color: '#2c3e50' },
                                { name: 'White', color: '#ecf0f1' },
                                { name: 'Orange', color: '#e67e22' }
                            ].map((colorOption) => (
                                <button
                                    key={colorOption.color}
                                    className={`color-swatch ${user?.clothingColor === colorOption.color ? 'active' : ''}`}
                                    style={{ backgroundColor: colorOption.color }}
                                    onClick={() => {
                                        const updatedUser = { ...user, clothingColor: colorOption.color };
                                        updateUser({ clothingColor: colorOption.color });
                                        localStorage.setItem('user', JSON.stringify(updatedUser));
                                    }}
                                    title={colorOption.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="inventory-section card">
                <h3>{t('profile.inventory')}</h3>
                {user?.inventory && user.inventory.length > 0 ? (
                    <div className="inventory-grid">
                        {user.inventory.map((itemId) => {
                            const item = shopItems.find(i => i.id === itemId);
                            const isEquipped = item && user?.equipped?.[item.category] === itemId;
                            const isArtifact = item?.category === 'artifact';

                            if (!item) return null;

                            return (
                                <div
                                    key={itemId}
                                    className={`inventory-item ${isEquipped ? 'equipped' : ''} ${isArtifact ? 'artifact' : ''}`}
                                    onClick={() => !isArtifact && equipItem(item)}
                                    style={{ cursor: isArtifact ? 'default' : 'pointer' }}
                                >
                                    <div className="item-preview">{item.icon}</div>
                                    <p>{item.name}</p>
                                    {isArtifact ? (
                                        <span className="artifact-status">
                                            {item.description || 'Passive'}
                                        </span>
                                    ) : (
                                        <span className="equip-status">
                                            {isEquipped ? t('profile.unequip') || 'Unequip' : t('profile.equip') || 'Equip'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="empty-message">{t('profile.noItems')}</p>
                )}
            </div>

            {/* Saved Resources Section */}
            <div className="saved-section card">
                <h3>📚 Saved Learning Resources</h3>
                {user?.savedResources && user.savedResources.length > 0 ? (
                    <div className="saved-grid">
                        {user.savedResources.map((res) => (
                            <div key={res.id} className="saved-card card">
                                <h4>{res.topic}</h4>
                                <span className="saved-date">{new Date(res.createdAt).toLocaleDateString()}</span>
                                <div className="saved-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => navigate('/ai-helper', { state: { savedResource: res } })}
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>
                                    <button
                                        className="battle-launcher-btn"
                                        onClick={() => navigate('/multiplayer', { state: { customQuiz: res.quiz } })}
                                    >
                                        <Swords size={16} />
                                        Launch Battle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">No saved resources yet. Go to AI Helper using the navbar to generate some!</p>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
