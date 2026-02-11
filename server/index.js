import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Load quiz data
const quizzesPath = new URL('../src/data/quizzes.json', import.meta.url);
let quizzesData = [];
try {
    const data = fs.readFileSync(quizzesPath, 'utf8');
    quizzesData = JSON.parse(data);
} catch (err) {
    console.error('Error loading quizzes:', err);
}

// In-memory storage for game rooms
const rooms = new Map();

// Helper to generate 6-digit PIN
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('create_room', (quizData) => {
        const pin = generatePin();
        let quiz;

        if (typeof quizData === 'object' && quizData !== null && quizData.questions) {
            // Custom quiz passed directly
            quiz = quizData;
            // Ensure ID is unique or handle it
            if (!quiz.id) quiz.id = 'custom_' + Date.now();
        } else {
            // ID passed, look up in static data
            quiz = quizzesData.find(q => q.id === quizData);
        }

        if (!quiz) {
            socket.emit('error', 'Quiz not found');
            return;
        }

        rooms.set(pin, {
            pin,
            host: socket.id,
            quiz,
            players: [],
            currentQuestionIndex: 0,
            answers: new Map(), // Map of socketId -> {answerIndex, timestamp}
            scores: new Map()   // Map of socketId -> totalScore
        });

        socket.join(pin);
        socket.emit('room_created', { pin });
        console.log(`Room created: ${pin} with quiz ${quiz.id}`);
    });

    socket.on('join_room', ({ pin, username, avatar }) => {
        const room = rooms.get(pin);

        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        const player = {
            id: socket.id,
            username,
            avatar,
            score: 0
        };

        room.players.push(player);
        room.scores.set(socket.id, 0);
        socket.join(pin);

        socket.emit('joined_success', { pin });

        // Notify host of new player
        io.to(room.host).emit('player_joined', player);

        console.log(`${username} joined room ${pin}`);
    });

    socket.on('start_game', (pin) => {
        const room = rooms.get(pin);

        if (!room || room.host !== socket.id) {
            socket.emit('error', 'Not authorized');
            return;
        }

        sendQuestion(room);
    });

    socket.on('submit_answer', ({ pin, answerIndex }) => {
        const room = rooms.get(pin);

        if (!room) return;

        const timestamp = Date.now();
        room.answers.set(socket.id, { answerIndex, timestamp });

        // Notify host of answer count
        const answerCount = room.answers.size;
        io.to(room.host).emit('player_answered', { count: answerCount });

        console.log(`Answer received from ${socket.id} in room ${pin}`);
    });

    socket.on('next_state', (pin) => {
        const room = rooms.get(pin);

        if (!room || room.host !== socket.id) {
            socket.emit('error', 'Not authorized');
            return;
        }

        // Calculate scores for current question
        calculateScores(room);

        // Show leaderboard
        const leaderboard = getLeaderboard(room);
        io.to(pin).emit('show_results', { leaderboard });

        // Clear answers for next question
        room.answers.clear();
        room.currentQuestionIndex++;

        console.log(`Room ${pin} moving to question ${room.currentQuestionIndex + 1}`);
    });

    socket.on('continue_game', (pin) => {
        const room = rooms.get(pin);

        if (!room || room.host !== socket.id) return;

        if (room.currentQuestionIndex < room.quiz.questions.length) {
            sendQuestion(room);
        } else {
            // Game over
            const leaderboard = getLeaderboard(room);
            io.to(pin).emit('game_over', { leaderboard });
            console.log(`Game over in room ${pin}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Clean up rooms if host disconnects or remove player if player disconnects
        for (const [pin, room] of rooms.entries()) {
            if (room.host === socket.id) {
                rooms.delete(pin);
                io.to(pin).emit('error', 'Host disconnected');
                console.log(`Room ${pin} closed - host disconnected`);
                return; // Stop checking other rooms
            }

            // check if it was a player
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const player = room.players[playerIndex];
                room.players.splice(playerIndex, 1);
                room.scores.delete(socket.id);
                room.answers.delete(socket.id); // Remove their answer if they disconnect mid-question

                // Notify host
                io.to(room.host).emit('player_left', {
                    id: socket.id,
                    username: player.username
                });

                // If in question state, update answer count
                if (room.answers.size > 0) {
                    io.to(room.host).emit('player_answered', { count: room.answers.size });
                }

                console.log(`Player ${player.username} left room ${pin}`);
            }
        }
    });
});

function sendQuestion(room) {
    const question = room.quiz.questions[room.currentQuestionIndex];

    if (!question) {
        const leaderboard = getLeaderboard(room);
        io.to(room.pin).emit('game_over', { leaderboard });
        return;
    }

    // Send to host (includes question text and correct answer)
    io.to(room.host).emit('new_question_host', {
        question: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        questionNumber: room.currentQuestionIndex + 1,
        totalQuestions: room.quiz.questions.length
    });

    // Send to players (no correct answer revealed)
    room.players.forEach(player => {
        io.to(player.id).emit('new_question_player', {
            question: question.text, // Send question text to players!
            optionsCount: question.options.length,
            questionNumber: room.currentQuestionIndex + 1,
            totalQuestions: room.quiz.questions.length
        });
    });

    console.log(`Sent question ${room.currentQuestionIndex + 1} to room ${room.pin}`);
}

function calculateScores(room) {
    const question = room.quiz.questions[room.currentQuestionIndex];
    const correctAnswer = question.correctAnswer;

    room.answers.forEach((answer, playerId) => {
        if (answer.answerIndex === correctAnswer) {
            const currentScore = room.scores.get(playerId) || 0;
            room.scores.set(playerId, currentScore + 100); // 100 points per correct answer
        }
    });
}

function getLeaderboard(room) {
    const leaderboard = room.players.map(player => ({
        username: player.username,
        avatar: player.avatar,
        score: room.scores.get(player.id) || 0
    }));

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    return leaderboard;
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🎮 Multiplayer server running on port ${PORT}`);
});
