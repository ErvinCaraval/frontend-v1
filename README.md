# ⚡ BrainBlitz - Multiplayer Quiz Game

BrainBlitz es un juego de trivia multijugador en tiempo real con frontend en React y backend en Node.js/Express + Socket.IO. Incluye generador de preguntas por IA gratuito por defecto.

## ✨ Features

- **Real-time Multiplayer Gaming**: Play with friends in real-time with instant scoring
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Easy Game Creation**: Create games with 6-digit codes for friends to join
- **Live Leaderboards**: See rankings update in real-time during gameplay
- **Question Categories**: Questions from various categories (Geography, Science, Art, etc.)
- **Timer-based Questions**: 10-second timer for each question with visual countdown
- **User Authentication**: Secure login/register system
- **Game History**: Track your performance and statistics

## 🏗️ Arquitectura

```
/multiplayer-quiz-game
|-- /frontend (React App)
|   |-- /src
|   |   |-- /components (Reusable UI components)
|   |   |-- /pages (Main application pages)
|   |   |-- /services (Firebase & Socket.io services)
|   |   |-- App.js
|   |   |-- index.js
|-- /backend (Node.js/Express App)
|   |-- /routes (API endpoints)
|   |-- /controllers (Business logic)
|   |-- mockServer.js (Mock server for testing)
|   |-- mockQuestions.js (Sample questions)
|   |-- index.js (Main server with Firebase)
|-- package.json
```

## 🚀 Inicio Rápido

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Instalación

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multiplayer-quiz-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Ejecutar la aplicación

#### Opción 1: Mock Server (recomendada para pruebas)

The mock server doesn't require Firebase setup and includes sample questions.

1. **Start the mock server**
   ```bash
   npm run start:mock
   ```

2. **Start el frontend** (en una nueva terminal)
   ```bash
   npm run start:frontend
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

#### Opción 2: Setup completo con Firebase

For production use with Firebase:

1. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update Firebase configuration in `client/src/services/firebase.js`
   - Add service account key to `server/serviceAccountKey.json`

2. **Start el backend**
   ```bash
   npm run start:backend
   ```

3. **Start el frontend**
   ```bash
   npm run start:frontend
   ```

## 🎮 Cómo jugar

1. **Register/Login**: Create an account or sign in
2. **Create a Game**: Click "Create Game" on the dashboard
3. **Share Game Code**: Share the 6-digit code with friends
4. **Join Games**: Enter game codes or browse public games
5. **Start Playing**: Host starts the game, questions appear with timer
6. **Answer Questions**: Click on your answer choice
7. **See Results**: View correct answers and explanations
8. **Check Rankings**: See live leaderboard updates

## 🛠️ Desarrollo

### Scripts disponibles

- `npm run start:frontend` - Inicia el servidor de desarrollo de React
- `npm run start:backend` - Inicia el backend Node.js con Firebase
- `npm run start:mock` - Inicia el mock server (sin Firebase)
- `npm run dev:mock` - Mock server con nodemon
- `npm run dev` - Inicia frontend y backend en paralelo

### Estructura del proyecto

- **Frontend**: React with modern hooks, CSS modules, responsive design
- **Backend**: Express.js with Socket.io for real-time communication
- **Database**: Firebase Firestore (or in-memory for mock server)
- **Authentication**: Firebase Auth (or mock for testing)

## 🎨 UI/UX Features

- **Gradient Backgrounds**: Beautiful color gradients throughout
- **Glassmorphism**: Modern glass-like effects with backdrop blur
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Color-coded Answers**: Green for correct, red for incorrect
- **Visual Timer**: Circular countdown with color changes
- **Live Rankings**: Real-time leaderboard updates

## 🔧 Customization

### Adding Questions

For the mock server, edit `server/mockQuestions.js`:

```javascript
{
  id: 'unique-id',
  text: 'Your question here?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswerIndex: 0, // 0-3
  category: 'Category Name',
  explanation: 'Why this answer is correct'
}
```

### Styling

- CSS files are co-located with components
- Uses CSS custom properties for consistent theming
- Responsive breakpoints: 768px, 1024px

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 in use**: Kill existing processes or change port
2. **Firebase errors**: Use mock server for testing
3. **Socket connection issues**: Check server is running on port 5000

### Debug Mode

Enable debug logging by setting `NODE_ENV=development`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Disfruta BrainBlitz! ⚡**

## Variables de entorno

Frontend (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

Backend (`backend/.env`):
```
PORT=5000
GROQ_API_KEY=tu_api_key_de_groq
# OPENAI_API_KEY= (opcional)
GROQ_MODEL=llama3-8b-instruct
```
