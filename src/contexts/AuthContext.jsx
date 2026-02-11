import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize default test account if no users exist
    const initializeTestAccount = () => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length === 0) {
            const testUser = {
                id: 'test-user',
                username: 'test',
                password: 'test',
                createdAt: new Date().toISOString(),
                exp: 100,
                balance: 500,
                inventory: [],
                equipped: {},
                avatar: 'default',
                lastLogin: new Date().toISOString(),
                streak: 1,
                hairType: 'short',
                hairColor: '#654321',
                sex: 'male'
            };
            localStorage.setItem('users', JSON.stringify([testUser]));
        }
    };

    initializeTestAccount();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading] = useState(false);

    const signup = (username, password) => {
        // Mock signup - in production, this would call an API
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if user exists
        if (users.find(u => u.username === username)) {
            throw new Error('auth.usernameExists');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In production, this would be hashed
            createdAt: new Date().toISOString(),
            exp: 0,
            balance: 0,
            inventory: [],
            avatar: 'default',
            lastLogin: new Date().toISOString(),
            streak: 0,
            hairType: 'short',
            hairColor: '#654321',
            sex: 'male'
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const userSession = { ...newUser };
        delete userSession.password;
        setUser(userSession);
        localStorage.setItem('user', JSON.stringify(userSession));
    };

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Trim inputs to avoid whitespace issues
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        const foundUser = users.find(u => u.username === trimmedUsername && u.password === trimmedPassword);

        if (!foundUser) {
            console.error('Login failed - no matching user found');
            throw new Error('auth.invalidCredentials');
        }

        const userSession = { ...foundUser };
        delete userSession.password;
        setUser(userSession);
        localStorage.setItem('user', JSON.stringify(userSession));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
