// Mock server for testing without Firebase
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mockQuestions = require('./mockQuestions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for games
const games = new Map();
const players = new Map();

// API routes
app.get('/api/questions', (req, res) => {
  res.json(mockQuestions);
});

app.get('/api/games', (req, res) => {
  const publicGames = Array.from(games.values())
    .filter(game => game.isPublic && game.status === 'waiting')
    .map(game => ({ id: game.id, ...game }));
  res.json(publicGames);
});

// Socket.io Real-time Game Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create Game
  socket.on('createGame', async (options) => {
    try {
      // Generate a 6-digit game code
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      const gameData = {
        id: gameCode,
        hostId: options.hostId,
        isPublic: options.isPublic,
        status: 'waiting',
        players: [{ uid: options.hostId, displayName: options.displayName, score: 0 }],
        questions: [],
        currentQuestion: 0
      };
      games.set(gameCode, gameData);
      socket.join(gameCode);
      socket.emit('gameCreated', { gameId: gameCode, ...gameData });
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Join Game
  socket.on('joinGame', async ({ gameId, uid, displayName }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      if (game.status !== 'waiting') {
        socket.emit('error', { error: 'Game already started' });
        return;
      }
      // Add player if not already in
      const alreadyJoined = game.players.some(p => p.uid === uid);
      if (!alreadyJoined) {
        game.players.push({ uid, displayName, score: 0 });
        games.set(gameId, game);
      }
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', { players: game.players });
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Start Game
  socket.on('startGame', async ({ gameId, category }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      // Use mock questions
      let questions = [...mockQuestions];
      if (category) {
        questions = questions.filter(q => q.category === category);
      }
      // Shuffle and take first 10 questions
      questions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
      
      game.status = 'in-progress';
      game.questions = questions;
      games.set(gameId, game);
      
      io.to(gameId).emit('gameStarted', { questionsCount: questions.length });
      // Send first question
      sendQuestion(io, gameId, 0);
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Submit Answer
  socket.on('submitAnswer', async ({ gameId, uid, answerIndex }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const currentQ = game.questions[game.currentQuestion];
      if (!currentQ) {
        socket.emit('error', { error: 'No current question' });
        return;
      }
      
      // Track answers in memory
      if (!socket.data.answers) socket.data.answers = {};
      socket.data.answers[game.currentQuestion] = answerIndex;
      socket.data.uid = uid;

      // Collect all answers from players
      const sockets = await io.in(gameId).fetchSockets();
      const answers = {};
      sockets.forEach(s => {
        if (s.data.answers && s.data.answers[game.currentQuestion] !== undefined) {
          answers[s.data.uid] = s.data.answers[game.currentQuestion];
        }
      });

      // If all players have answered, score and send result
      if (Object.keys(answers).length === game.players.length) {
        // Score
        const updatedPlayers = game.players.map(player => {
          const ans = answers[player.uid];
          let score = player.score;
          if (ans === currentQ.correctAnswerIndex) score += 1;
          return { ...player, score };
        });
        game.players = updatedPlayers;
        games.set(gameId, game);
        
        // Send answer result
        io.to(gameId).emit('answerResult', {
          correctAnswerIndex: currentQ.correctAnswerIndex,
          explanation: currentQ.explanation,
          players: updatedPlayers
        });
        
        // Next question or finish
        const nextIndex = game.currentQuestion + 1;
        setTimeout(async () => {
          if (nextIndex < game.questions.length) {
            game.currentQuestion = nextIndex;
            games.set(gameId, game);
            sendQuestion(io, gameId, nextIndex);
          } else {
            game.status = 'finished';
            games.set(gameId, game);
            io.to(gameId).emit('gameFinished', { players: updatedPlayers });
          }
        }, 3000); // 3s delay for feedback
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });
});

// Helper: Send question to room
async function sendQuestion(io, gameId, questionIndex) {
  const game = games.get(gameId);
  if (!game) return;
  
  if (questionIndex >= game.questions.length) {
    io.to(gameId).emit('gameFinished', { players: game.players });
    game.status = 'finished';
    games.set(gameId, game);
    return;
  }
  
  const question = game.questions[questionIndex];
  io.to(gameId).emit('newQuestion', { question, index: questionIndex });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log('Using mock data - Firebase not required');
});

