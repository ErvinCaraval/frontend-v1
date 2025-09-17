# 🔥 Configuración de Firebase - Paso a Paso

## ❌ Error Actual
```
Firebase: Error (auth/configuration-not-found)
```

## ✅ Solución: Habilitar Firebase Authentication

### **Paso 1: Ir a Firebase Console**
1. Abre tu navegador y ve a: https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona tu proyecto: **`preguntas-ac738`**

### **Paso 2: Habilitar Authentication**
1. En el menú lateral izquierdo, haz clic en **"Authentication"**
2. Si es la primera vez, verás un botón **"Get started"** - haz clic en él
3. Ve a la pestaña **"Sign-in method"**
4. Haz clic en **"Email/Password"**
5. Activa **"Enable"** para el primer método (Email/Password)
6. Haz clic en **"Save"**

### **Paso 3: Habilitar Firestore Database**
1. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
2. Haz clic en **"Create database"**
3. Selecciona **"Start in test mode"** (para desarrollo)
4. Elige una ubicación (ej: `us-central1`)
5. Haz clic en **"Done"**

### **Paso 4: Verificar Configuración**
Después de completar los pasos anteriores:

1. **Abre la aplicación**: http://localhost:3000
2. **Intenta registrarte**: Haz clic en "Registrarse"
3. **Crea una cuenta**: Usa cualquier email y contraseña
4. **¡Debería funcionar!** 🎉

## 🔧 Estado Actual de la Aplicación

- ✅ **Servidor**: http://localhost:5000 (Funcionando)
- ✅ **Cliente**: http://localhost:3000 (Funcionando)
- ✅ **Firebase Config**: Configurado correctamente
- ❌ **Authentication**: Necesita habilitarse en Firebase Console
- ❌ **Firestore**: Necesita habilitarse en Firebase Console

## 📱 URLs Importantes

- **Firebase Console**: https://console.firebase.google.com/project/preguntas-ac738
- **Authentication**: https://console.firebase.google.com/project/preguntas-ac738/authentication
- **Firestore**: https://console.firebase.google.com/project/preguntas-ac738/firestore

## 🚀 Una vez configurado

La aplicación tendrá:
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Creación de juegos
- ✅ Unirse a juegos
- ✅ Preguntas en tiempo real
- ✅ Ranking en vivo
- ✅ Estadísticas de usuario

¡Todo funcionará como Kahoot! 🎯

