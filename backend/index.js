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
      // Log del token recibido
      console.log('Token recibido en createGame:', options.token);
      // Validar el token de autenticación
      if (!options.token) {
        socket.emit('error', { error: 'Missing authentication token' });
        return;
      }
      let decodedToken;
      try {
        decodedToken = await require('./firebase').auth.verifyIdToken(options.token);
      } catch (err) {
        console.error('Error verificando token:', err);
        socket.emit('error', { error: 'Invalid authentication token: ' + err.message });
        return;
      }
      // Validar que el uid del token coincida con el hostId
      if (decodedToken.uid !== options.hostId) {
        socket.emit('error', { error: 'Token UID does not match hostId' });
        return;
      }
      // Generate a 6-digit game code
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Buscar preguntas solo por tema y dificultad, sin filtrar por usuario ni tiempo
      let questionsQuery = db.collection('questions')
        .where('category', '==', options.topic || '')
        .where('difficulty', '==', options.difficulty || 'medium');
      questionsQuery = questionsQuery.orderBy('createdAt', 'desc');
      const questionsSnap = await questionsQuery.get();
      let questions = questionsSnap.docs.map(doc => doc.data());
      // Tomar solo la cantidad pedida
      if (options.count && questions.length > options.count) {
        questions = questions.slice(0, options.count);
      }
      // Validar que haya suficientes preguntas
      if (!questions.length || (options.count && questions.length < options.count)) {
        socket.emit('error', { error: `No se encontraron suficientes preguntas para este tema y dificultad. Genera preguntas nuevas antes de crear la partida. (${questions.length || 0}/${options.count || '?'} disponibles)` });
        return;
      }
      // Mapear 'text' a 'question' para compatibilidad frontend
      const mappedQuestions = questions.map(q => {
        const { text, ...rest } = q;
        return {
          ...rest,
          question: text
        };
      });
      const gameData = {
        hostId: options.hostId,
        isPublic: options.isPublic,
        status: 'waiting',
        players: [{ uid: options.hostId, displayName: options.displayName, score: 0 }],
        questions: mappedQuestions,
        currentQuestion: 0,
        topic: options.topic || '',
        difficulty: options.difficulty || 'medium'
      };
      await db.collection('games').doc(gameCode).set(gameData);
      socket.join(gameCode);
      socket.emit('gameCreated', { gameId: gameCode, ...gameData });
    } catch (error) {
      console.error('Error general en createGame:', error);
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
      const game = gameDoc.data();
      // Fetch questions (optionally filter by category)
      let questionsQuery = db.collection('questions');
      // Filtrar solo preguntas creadas por el usuario actual y las más recientes
      if (category) questionsQuery = questionsQuery.where('category', '==', category);
      if (game && game.hostId) {
        questionsQuery = questionsQuery.where('createdBy', '==', game.hostId);
      }
      questionsQuery = questionsQuery.orderBy('createdAt', 'desc').limit(10);
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
  let question = game.questions[questionIndex];
  // Si por error viene 'text' pero no 'question', mapearlo
  if (question && !question.question && question.text) {
    const { text, ...rest } = question;
    question = { ...rest, question: text };
  }
  io.to(gameId).emit('newQuestion', { question, index: questionIndex });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
