#!/bin/bash

echo "🎯 QuizMaster - Test Script"
echo "=========================="

# Kill any existing processes on ports 3000 and 5000
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start mock server
echo "🚀 Starting mock server..."
cd /home/ervin-caravali-ibarra/Desktop/ok/multiplayer-quiz-game/server
node mockServer.js &
SERVER_PID=$!
sleep 3

# Test server endpoints
echo "🧪 Testing server endpoints..."
curl -s http://localhost:5000/api/questions > /dev/null && echo "✅ Questions API working" || echo "❌ Questions API failed"
curl -s http://localhost:5000/api/games > /dev/null && echo "✅ Games API working" || echo "❌ Games API failed"

# Start client
echo "🎨 Starting React client..."
cd /home/ervin-caravali-ibarra/Desktop/ok/multiplayer-quiz-game
npm run start:client &
CLIENT_PID=$!
sleep 10

# Test client
echo "🧪 Testing client..."
curl -s http://localhost:3000 > /dev/null && echo "✅ React client working" || echo "❌ React client failed"

echo ""
echo "🎉 Application is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "📋 Test Instructions:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Register a new account"
echo "3. Create a game"
echo "4. Copy the game code"
echo "5. Open another browser tab/window"
echo "6. Register another account"
echo "7. Join the game with the code"
echo "8. Start the game and play!"
echo ""
echo "🛑 To stop the application, press Ctrl+C"

# Wait for user input
read -p "Press Enter to stop the application..."

# Cleanup
echo "🔄 Stopping application..."
kill $SERVER_PID 2>/dev/null || true
kill $CLIENT_PID 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "✅ Application stopped"


