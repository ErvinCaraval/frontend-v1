# 🚀 Deploy Gratuito de BrainBlitz

## Opción 1: Deploy Automático (Recomendado)

### Frontend en Vercel (Gratuito)
1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/brainblitz.git
   git push -u origin main
   ```

2. **Deploy en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio
   - Configura:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Variables de entorno en Vercel**
   - En tu proyecto Vercel → Settings → Environment Variables
   - Añade:
     ```
     REACT_APP_API_URL=https://tu-backend.railway.app
     REACT_APP_SOCKET_URL=https://tu-backend.railway.app
     ```

### Backend en Railway (Gratuito)
1. **Deploy en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu cuenta de GitHub
   - New Project → Deploy from GitHub repo
   - Selecciona tu repo y carpeta `backend`

2. **Variables de entorno en Railway**
   - En tu proyecto Railway → Variables
   - Añade:
     ```
     GROQ_API_KEY=gsk_tu_api_key_aqui
     GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
     PORT=5000
     ```

3. **Actualizar URLs del frontend**
   - Copia la URL de Railway (ej: `https://brainblitz-backend-production.up.railway.app`)
   - Actualiza las variables de entorno en Vercel con esta URL

## Opción 2: Deploy Manual

### Frontend (Vercel CLI)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Backend (Railway CLI)
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

## Verificación

1. **Frontend**: Debería estar en `https://tu-app.vercel.app`
2. **Backend**: Debería estar en `https://tu-backend.railway.app`
3. **Test**: Ve al frontend y prueba crear una partida

## Costos
- ✅ **Vercel**: Completamente gratis
- ✅ **Railway**: $5/mes gratis (suficiente para desarrollo)
- ✅ **Groq**: Completamente gratis con cuota generosa
- ✅ **Firebase**: Plan gratuito (opcional)

## Troubleshooting

### Error de CORS
Si hay errores de CORS, verifica que las URLs en Vercel apunten correctamente al backend de Railway.

### Error de Socket.IO
Asegúrate de que tanto el frontend como el backend usen HTTPS en producción.

### Error de Firebase
El backend usará automáticamente memoria si Firebase no está disponible.

## URLs Finales
- Frontend: `https://brainblitz.vercel.app`
- Backend: `https://brainblitz-backend.railway.app`
- API: `https://brainblitz-backend.railway.app/api/ai/topics`

