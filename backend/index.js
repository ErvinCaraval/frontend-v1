// --- Socket.io Real-time Game Logic ---
const { db } = require('./firebase');

// Place io.on('connection', ...) after io is initialized

// ...existing code...
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

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


// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/ai', require('./routes/ai'));


// --- Socket.io Real-time Game Logic ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create Game
  socket.on('createGame', async (options) => {
    try {
      // Generate a 6-digit game code
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      const gameData = {
        hostId: options.hostId,
        isPublic: options.isPublic,
        status: 'waiting',
        players: [{ uid: options.hostId, displayName: options.displayName, score: 0 }],
        questions: [],
        currentQuestion: 0
      };
      await db.collection('games').doc(gameCode).set(gameData);
      socket.join(gameCode);
      socket.emit('gameCreated', { gameId: gameCode, ...gameData });
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Join Game
  socket.on('joinGame', async ({ gameId, uid, displayName }) => {
    try {
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const game = gameDoc.data();
      if (game.status !== 'waiting') {
        socket.emit('error', { error: 'Game already started' });
        return;
      }
      // Add player if not already in
      const alreadyJoined = game.players.some(p => p.uid === uid);
      if (!alreadyJoined) {
        game.players.push({ uid, displayName, score: 0 });
        await gameRef.update({ players: game.players });
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
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      // Fetch questions (optionally filter by category)
      let questionsQuery = db.collection('questions');
      if (category) questionsQuery = questionsQuery.where('category', '==', category);
      const questionsSnap = await questionsQuery.get();
      const questions = questionsSnap.docs.map(doc => doc.data());
      await gameRef.update({ status: 'in-progress', questions });
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
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const game = gameDoc.data();
      const currentQ = game.questions[game.currentQuestion];
      if (!currentQ) {
        socket.emit('error', { error: 'No current question' });
        return;
      }
      // Track answers in memory (for MVP, not persistent)
      if (!socket.data.answers) socket.data.answers = {};
      socket.data.answers[game.currentQuestion] = answerIndex;

      // Collect all answers from players
      const sockets = await io.in(gameId).fetchSockets();
      const answers = {};
      sockets.forEach(s => {
        if (s.data.answers && s.data.answers[game.currentQuestion] !== undefined) {
          answers[s.data.uid] = s.data.answers[game.currentQuestion];
        }
      });

      // Mark this socket's uid for answer tracking
      socket.data.uid = uid;

      // If all players have answered, or after a timeout (not implemented here), score and send result
      if (Object.keys(answers).length === game.players.length) {
        // Score
        const updatedPlayers = game.players.map(player => {
          const ans = answers[player.uid];
          let score = player.score;
          if (ans === currentQ.correctAnswerIndex) score += 1;
          return { ...player, score };
        });
        await gameRef.update({ players: updatedPlayers });
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
            await gameRef.update({ currentQuestion: nextIndex });
            sendQuestion(io, gameId, nextIndex);
          } else {
            await gameRef.update({ status: 'finished' });
            io.to(gameId).emit('gameFinished', { players: updatedPlayers });
            // Optionally update user stats here
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
  const gameRef = db.collection('games').doc(gameId);
  const gameDoc = await gameRef.get();
  if (!gameDoc.exists) return;
  const game = gameDoc.data();
  if (questionIndex >= game.questions.length) {
    io.to(gameId).emit('gameFinished', { players: game.players });
    await gameRef.update({ status: 'finished' });
    return;
  }
  const question = game.questions[questionIndex];
  io.to(gameId).emit('newQuestion', { question, index: questionIndex });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
