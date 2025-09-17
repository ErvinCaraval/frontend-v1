# BrainBlitz - Arquitectura

## Diagrama (texto)

[Frontend React]
  |
  | REST (HTTPS) /api/*
  v
[Backend Express + Socket.IO]
  |            \
  | Socket.IO   \--(Opcional) OpenAI API
  v                
[Firebase Admin / Firestore]

- Frontend consume endpoints REST: `/api/ai`, `/api/users`, `/api/games`, `/api/questions`.
- Socket.IO maneja salas por `gameId` para sincronizar: `playerJoined`, `newQuestion`, `answerResult`, `gameFinished`.
- Generación IA: por defecto `generateQuestionsFree` (local, gratuito). Si `useAI=true` y API key, usa proveedor externo.

## Flujos clave

1) Crear partida
- Cliente emite `createGame` -> Backend crea doc `games/{code}` -> une sala -> responde `gameCreated`.

2) Unirse a partida
- Cliente emite `joinGame` -> Backend valida, agrega jugador -> emite `playerJoined` a la sala.

3) Iniciar partida
- Cliente emite `startGame` -> Backend carga/genera preguntas -> `gameStarted` -> `newQuestion`.

4) Responder
- Cliente emite `submitAnswer` -> Backend computa respuestas -> actualiza puntajes -> `answerResult` -> siguiente o `gameFinished`.

## Escalabilidad y cuellos de botella

- Socket.IO: escalar con Redis adapter para múltiples instancias.
- Firestore: usar índices y reducir lecturas por pregunta; cache en memoria para preguntas del juego.
- IA: colas/bulk pre-generation para evitar latencia al iniciar.
- Límite de tasa: aplicar rate limiting por IP en `/api/ai`.

## Entornos

- .env frontend: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`.
- .env backend: `PORT`, `OPENAI_API_KEY` (opcional).
