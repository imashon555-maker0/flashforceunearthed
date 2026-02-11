import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const MultiplayerContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3001`;

export const MultiplayerProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState('menu'); // menu, lobby, question, leaderboard, ended
    const [roomPin, setRoomPin] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState(null);
    const [answerCount, setAnswerCount] = useState(0);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        // eslint-disable-next-line
        setSocket(newSocket);

        newSocket.on('connect', () => {
            // Connected to multiplayer server
        });

        newSocket.on('room_created', ({ pin }) => {
            setRoomPin(pin);
            setIsHost(true);
            setGameState('lobby');
            setPlayers([]); // Use state to track players
        });

        newSocket.on('joined_success', ({ pin }) => {
            setRoomPin(pin);
            setIsHost(false);
            setGameState('lobby');
        });

        newSocket.on('player_joined', (player) => {
            setPlayers(prev => [...prev, player]);
        });

        newSocket.on('player_left', ({ id }) => {
            setPlayers(prev => prev.filter(p => p.id !== id));
        });

        // Host-specific events
        newSocket.on('new_question_host', (data) => {
            setGameState('question');
            setCurrentQuestion(data);
            setAnswerCount(0);
        });

        newSocket.on('player_answered', ({ count }) => {
            setAnswerCount(count);
        });

        // Player-specific events
        newSocket.on('new_question_player', (data) => {
            setGameState('question');
            setCurrentQuestion(data); // Now includes 'question' text!
        });

        newSocket.on('show_results', ({ leaderboard }) => {
            setGameState('leaderboard');
            setLeaderboard(leaderboard);
        });

        newSocket.on('game_over', ({ leaderboard }) => {
            setGameState('ended');
            setLeaderboard(leaderboard);
        });

        newSocket.on('error', (msg) => {
            setError(msg);
            setTimeout(() => setError(null), 3000);
        });

        return () => newSocket.disconnect();
    }, []);

    const createRoom = (quizData = 1) => {
        if (!socket) return;
        if (!socket.connected) {
            setError("Cannot connect to server. Please check if server is running.");
            return;
        }
        socket.emit('create_room', quizData);
    };

    const joinRoom = (pin) => {
        if (!socket || !user) return;

        // Pass minimal avatar data to save bandwidth
        const avatarData = {
            hairType: user.hairType,
            hairColor: user.hairColor,
            skinTone: user.skinTone, // Assuming we add this later
            equipped: user.equipped,
            sex: user.sex || 'male'
        };

        socket.emit('join_room', {
            pin,
            username: user.username,
            avatar: avatarData
        });
    };

    const startGame = () => {
        if (!socket || !roomPin) return;
        socket.emit('start_game', roomPin);
    };

    const submitAnswer = (answerIndex) => {
        if (!socket || !roomPin) return;
        socket.emit('submit_answer', { pin: roomPin, answerIndex });
    };

    const nextState = () => {
        if (!socket || !roomPin) return;
        socket.emit('next_state', roomPin);
    };

    const continueGame = () => {
        if (!socket || !roomPin) return;
        socket.emit('continue_game', roomPin);
    };

    return (
        <MultiplayerContext.Provider value={{
            socket,
            gameState,
            roomPin,
            isHost,
            players,
            currentQuestion,
            leaderboard,
            error,
            answerCount,
            createRoom,
            joinRoom,
            startGame,
            submitAnswer,
            nextState,
            continueGame,
            setGameState // Allow manual reset if needed
        }}>
            {children}
        </MultiplayerContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMultiplayer = () => {
    const context = useContext(MultiplayerContext);
    if (!context) {
        throw new Error('useMultiplayer must be used within MultiplayerProvider');
    }
    return context;
};
