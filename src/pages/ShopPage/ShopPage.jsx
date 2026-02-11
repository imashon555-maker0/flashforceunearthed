import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import shopItems from '../../data/shopItems.json';
import toast from 'react-hot-toast';
import { Crown, Shirt, Footprints, Sword, Shield, Wand, Music, Feather, Gem, CookingPot, CircleDot, PawPrint, Circle, Tent, Snowflake } from 'lucide-react';
import './ShopPage.css';

function ShopPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { purchaseItem } = useGamification();

    const getItemIcon = (item) => {
        // Determine color from style properties
        const color = item.style?.color ||
            item.style?.glowColor ||
            item.style?.bodyColor ||
            item.style?.footColor ||
            'currentColor'; // Default fallback

        const iconProps = { size: 48, color: color };

        // Specific ID overrides by exact ID for unique items
        if (item.id === 'hat_1') return <Tent {...iconProps} />; // Nomadic Hat
        if (item.id === 'hat_3') return <Snowflake {...iconProps} />; // Fur Cap
        if (item.id === 'hat_4') return <Feather {...iconProps} />; // Feathered Headdress

        // Generalized checks
        if (item.id.includes('sword')) return <Sword {...iconProps} />;
        if (item.id.includes('shield')) return <Shield {...iconProps} />;
        if (item.id.includes('bow')) return <Sword {...iconProps} />; // Fallback
        if (item.id.includes('staff')) return <Wand {...iconProps} />;
        if (item.id.includes('dombra')) return <Music {...iconProps} />;
        if (item.id.includes('kazan')) return <CookingPot {...iconProps} />;
        if (item.id.includes('totem')) return <PawPrint {...iconProps} />;
        if (item.id.includes('ring') || item.id.includes('jewelry')) return <CircleDot {...iconProps} />;
        if (item.id.includes('feather') || item.id.includes('headdress')) return <Feather {...iconProps} />;

        // Category fallbacks
        switch (item.category) {
            case 'hat': return <Crown {...iconProps} />;
            case 'clothing': return <Shirt {...iconProps} />;
            case 'footwear': return <Footprints {...iconProps} />;
            case 'artifact': return <Gem {...iconProps} />;
            default: return <Circle {...iconProps} />;
        }
    };

    const handlePurchase = (item) => {
        const success = purchaseItem(item);
        if (success) {
            toast.success(`\u2728 Successfully purchased ${item.name}!`);
        } else if (user?.inventory?.includes(item.id)) {
            toast.error(`You already own ${item.name}`);
        } else {
            toast.error(t('shop.insufficient'));
        }
    };

    return (
        <div className="shop-container">
            <div className="shop-header">
                <h1>{t('shop.title')}</h1>
                <div className="balance-display">
                    <span className="balance-label">{t('profile.balance')}:</span>
                    <span className="balance-value">{user?.balance || 0}</span>
                </div>
            </div>

            <div className="shop-grid">
                {shopItems.map((item) => {
                    const isOwned = user?.inventory?.includes(item.id);
                    return (
                        <div key={item.id} className={`shop-item card ${isOwned ? 'owned' : ''}`}>
                            <div className="item-icon">{getItemIcon(item)}</div>
                            <h3>{item.name}</h3>
                            <div className="item-price">{item.price} EXP</div>
                            <button
                                onClick={() => handlePurchase(item)}
                                disabled={isOwned}
                                className={`btn btn-primary purchase-btn ${isOwned ? 'owned' : ''}`}
                            >
                                {isOwned ? t('shop.owned') : t('shop.purchase')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ShopPage;
