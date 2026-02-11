import React from 'react';
import './CharacterAvatar.css';
import './HairStyles.css';
import shopItems from '../../data/shopItems.json';

function CharacterAvatar({ equipped, inventory, user: propUser }) {
    const allItems = shopItems;

    // Get user from props OR localStorage
    // If propUser is provided, use it. Otherwise, fall back to local storage.
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = propUser || localUser;

    // Resolve equipped items from props OR user object
    // If 'equipped' prop is passed explicitly, use it (e.g. ProfilePage)
    // Otherwise, use user.equipped (e.g. MultiplayerPage)
    const activeEquipped = equipped || user.equipped || {};

    // Resolve inventory from props OR user object
    const activeInventory = inventory || user.inventory || [];

    // Get equipped item styles
    const hatItem = activeEquipped.hat ? allItems.find(item => item.id === activeEquipped.hat) : null;
    const clothingItem = activeEquipped.clothing ? allItems.find(item => item.id === activeEquipped.clothing) : null;
    const footwearItem = activeEquipped.footwear ? allItems.find(item => item.id === activeEquipped.footwear) : null;
    const accessoryItem = activeEquipped.accessory ? allItems.find(item => item.id === activeEquipped.accessory) : null;

    // Get all equipped artifacts from inventory
    const equippedArtifacts = activeInventory
        ? activeInventory
            .map(itemId => allItems.find(item => item.id === itemId))
            .filter(item => item && item.category === 'artifact')
        : [];

    const hairType = user.hairType || 'short';
    const hairColor = user.hairColor || '#654321';
    const skinTone = user.skinTone || '#ffdbac';
    const clothingColor = user.clothingColor || '#87ceeb';

    return (
        <div className="character-container">
            {/* Artifact Auras */}
            {equippedArtifacts.map((artifact, index) => (
                artifact.style?.aura && (
                    <div
                        key={artifact.id}
                        className={`artifact-aura artifact-aura-${index}`}
                        style={{
                            boxShadow: `0 0 ${30 + index * 10}px ${artifact.style.glowColor}`,
                            border: `2px solid ${artifact.style.glowColor}`
                        }}
                    />
                )
            ))}

            <div className="character">
                {/* Hair - rendered before head */}
                {hairType !== 'bald' && (
                    <div className={`hair hair-${hairType}`} style={{ background: hairColor }}>
                        {/* Detail Elements for specific styles */}

                        {hairType === 'short' && (
                            <>
                                <div className="hair-texture"></div>
                                <div className="hair-bangs short-bangs"></div>
                                <div className="sideburn left" style={{ background: hairColor }}></div>
                                <div className="sideburn right" style={{ background: hairColor }}></div>
                            </>
                        )}

                        {hairType === 'long' && (
                            <>
                                <div className="long-hair-back" style={{ background: hairColor }}></div>
                                <div className="long-hair-bangs" style={{ background: hairColor }}></div>
                                <div className="long-hair-strand left" style={{ background: hairColor }}></div>
                                <div className="long-hair-strand right" style={{ background: hairColor }}></div>
                            </>
                        )}

                        {hairType === 'curly' && (
                            <div className="curls-container">
                                <div className="curl c1" style={{ background: hairColor }}></div>
                                <div className="curl c2" style={{ background: hairColor }}></div>
                                <div className="curl c3" style={{ background: hairColor }}></div>
                                <div className="curl c4" style={{ background: hairColor }}></div>
                                <div className="curl c5" style={{ background: hairColor }}></div>
                                <div className="curl c6" style={{ background: hairColor }}></div>
                            </div>
                        )}

                        {hairType === 'ponytail' && (
                            <>
                                <div className="ponytail-base" style={{ background: hairColor }}></div>
                                <div className="ponytail-tie"></div>
                                <div className="ponytail-tail" style={{ background: hairColor }}></div>
                                <div className="ponytail-fringe" style={{ background: hairColor }}></div>
                            </>
                        )}

                        {hairType === 'spiky' && (
                            <>
                                <div className="spike s1" style={{ borderBottomColor: hairColor }}></div>
                                <div className="spike s2" style={{ borderBottomColor: hairColor }}></div>
                                <div className="spike s3" style={{ borderBottomColor: hairColor }}></div>
                                <div className="spike s4" style={{ borderBottomColor: hairColor }}></div>
                                <div className="spike s5" style={{ borderBottomColor: hairColor }}></div>
                            </>
                        )}
                    </div>
                )}

                {/* Hat */}
                {hatItem?.style && (
                    <>
                        {hatItem.style.type === 'tophat' && (
                            <div className="hat-tophat" style={{ background: hatItem.style.color }}>
                                <div className="tophat-brim"></div>
                            </div>
                        )}
                        {hatItem.style.type === 'crown' && (
                            <div className="hat-crown" style={{ background: hatItem.style.color }}>
                                <div className="crown-point"></div>
                                <div className="crown-point"></div>
                                <div className="crown-point"></div>
                            </div>
                        )}
                        {hatItem.style.type === 'furcap' && (
                            <div className="hat-furcap" style={{ background: hatItem.style.color }}></div>
                        )}
                        {hatItem.style.type === 'headdress' && (
                            <div className="hat-headdress" style={{ background: hatItem.style.color }}>
                                <div className="headdress-feather"></div>
                            </div>
                        )}
                    </>
                )}

                <div className="head" style={{ background: skinTone }}>
                    <div className="eyes">
                        <div className="eye"></div>
                        <div className="eye"></div>
                    </div>
                    <div className="smile"></div>
                </div>

                {/* Body with clothing patterns */}
                <div
                    className={`body ${clothingItem?.style?.pattern ? `pattern-${clothingItem.style.pattern}` : ''}`}
                    style={{
                        background: clothingItem?.style?.bodyColor || clothingColor
                    }}
                >
                    {clothingItem?.style?.pattern === 'warrior' && <div className="warrior-belt"></div>}
                    {clothingItem?.style?.pattern === 'silk' && <div className="silk-shimmer"></div>}
                    {clothingItem?.style?.pattern === 'royal' && <div className="royal-emblem"></div>}
                </div>

                {/* Arms */}
                <div className="arms">
                    <div
                        className="arm left"
                        style={{ background: clothingItem?.style?.armColor || skinTone }}
                    ></div>
                    <div
                        className="arm right"
                        style={{ background: clothingItem?.style?.armColor || skinTone }}
                    ></div>
                </div>

                {/* Accessories */}
                {accessoryItem?.style && (
                    <div className="accessories">
                        {/* Sword - Silver blade */}
                        {accessoryItem.style.accessory === 'sword' && (
                            <div className="accessory-sword">
                                <div className="sword-blade" style={{ background: accessoryItem.style.glowColor }}></div>
                                <div className="sword-handle"></div>
                            </div>
                        )}

                        {/* Shield */}
                        {accessoryItem.style.accessory === 'shield' && (
                            <div className="accessory-shield" style={{ background: accessoryItem.style.glowColor }}>
                                <div className="shield-emblem"></div>
                            </div>
                        )}

                        {/* Bow - Brown wood */}
                        {accessoryItem.style.accessory === 'bow' && (
                            <div className="accessory-bow">
                                <div className="bow-arc"></div>
                                <div className="bow-string"></div>
                            </div>
                        )}

                        {/* Magic Staff */}
                        {accessoryItem.style.accessory === 'staff' && (
                            <div className="accessory-staff">
                                <div className="staff-rod"></div>
                                <div className="staff-orb" style={{ background: accessoryItem.style.glowColor }}></div>
                            </div>
                        )}

                        {/* Bracelet */}
                        {accessoryItem.style.accessory === 'bracelet' && (
                            <div className="accessory-bracelet" style={{ background: accessoryItem.style.glowColor }}>
                                <div className="bracelet-gem"></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Legs */}
                <div className="legs">
                    <div
                        className="leg"
                        style={{ background: footwearItem?.style?.legColor || clothingColor }}
                    ></div>
                    <div
                        className="leg"
                        style={{ background: footwearItem?.style?.legColor || clothingColor }}
                    ></div>
                </div>

                {/* Feet */}
                <div className="feet">
                    <div
                        className="foot"
                        style={{ background: footwearItem?.style?.footColor || '#333' }}
                    ></div>
                    <div
                        className="foot"
                        style={{ background: footwearItem?.style?.footColor || '#333' }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default CharacterAvatar;
