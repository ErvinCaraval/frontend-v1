# 🤖 Ejemplo Práctico: Generador de Preguntas con IA

## 🎯 **Demo en Vivo**

### **Paso 1: Abrir la Aplicación**
1. Ve a: http://localhost:3000
2. Inicia sesión o regístrate
3. Ve al Dashboard

### **Paso 2: Usar el Generador de Preguntas**
1. Haz clic en **"🤖 Generate Questions with AI"**
2. Se abrirá el modal del generador

### **Paso 3: Configurar las Preguntas**
- **Tema**: Selecciona "Tecnología"
- **Dificultad**: "Medio"
- **Cantidad**: 5 preguntas
- **IA**: Desactivada (modo local)

### **Paso 4: Generar**
Haz clic en "Generar Preguntas" y verás algo como:

```json
{
  "success": true,
  "topic": "Tecnología",
  "difficulty": "medium",
  "count": 5,
  "questions": [
    {
      "id": "ai_1758077184308_jdmcrnm9g",
      "text": "¿Qué significa la sigla HTML?",
      "options": [
        "HyperText Markup Language",
        "High Tech Modern Language", 
        "Home Tool Markup Language",
        "Hyperlink Text Management Language"
      ],
      "correctAnswerIndex": 0,
      "category": "Tecnología",
      "difficulty": "medium",
      "explanation": "HTML significa HyperText Markup Language, el lenguaje estándar para crear páginas web.",
      "source": "AI Generated"
    }
  ]
}
```

## 🎮 **Ejemplos de Preguntas Generadas**

### **Tema: Ciencia**
```json
{
  "text": "¿Cuál es el elemento químico más abundante en el universo?",
  "options": ["Hidrógeno", "Helio", "Oxígeno", "Carbono"],
  "correctAnswerIndex": 0,
  "explanation": "El hidrógeno es el elemento más abundante en el universo, representando aproximadamente el 75% de toda la materia."
}
```

### **Tema: Historia**
```json
{
  "text": "¿En qué año cayó el Muro de Berlín?",
  "options": ["1987", "1989", "1991", "1993"],
  "correctAnswerIndex": 1,
  "explanation": "El Muro de Berlín cayó el 9 de noviembre de 1989, marcando el fin de la Guerra Fría."
}
```

### **Tema: Geografía**
```json
{
  "text": "¿Cuál es la capital de Australia?",
  "options": ["Sydney", "Melbourne", "Canberra", "Perth"],
  "correctAnswerIndex": 2,
  "explanation": "Canberra es la capital de Australia, ubicada en el Territorio de la Capital Australiana."
}
```

### **Tema: Deportes**
```json
{
  "text": "¿Cuántos jugadores hay en un equipo de fútbol?",
  "options": ["10", "11", "12", "9"],
  "correctAnswerIndex": 1,
  "explanation": "Un equipo de fútbol tiene 11 jugadores en el campo, incluyendo el portero."
}
```

## 🚀 **Comandos de Prueba**

### **Obtener Temas**
```bash
curl http://localhost:5000/api/ai/topics
```

### **Generar Preguntas de Ciencia**
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic":"Ciencia","difficulty":"medium","count":3}'
```

### **Generar Preguntas de Historia**
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic":"Historia","difficulty":"hard","count":5}'
```

### **Generar Preguntas de Tecnología**
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic":"Tecnología","difficulty":"easy","count":2}'
```

## 🎯 **Casos de Uso Reales**

### **1. Para Profesores**
- **Tema**: Matemáticas
- **Dificultad**: Medio
- **Cantidad**: 10 preguntas
- **Uso**: Examen de álgebra

### **2. Para Empresas**
- **Tema**: Tecnología
- **Dificultad**: Fácil
- **Cantidad**: 5 preguntas
- **Uso**: Entrenamiento de personal

### **3. Para Eventos**
- **Tema**: Cine
- **Dificultad**: Medio
- **Cantidad**: 15 preguntas
- **Uso**: Trivia night

### **4. Para Estudiantes**
- **Tema**: Biología
- **Dificultad**: Difícil
- **Cantidad**: 8 preguntas
- **Uso**: Repaso para examen

## 🔧 **Configuración Avanzada**

### **Usar IA Avanzada (OpenAI)**
1. Obtén una API key de OpenAI
2. Configura la variable de entorno:
   ```bash
   export OPENAI_API_KEY="tu-api-key"
   ```
3. Activa "Usar IA avanzada" en el generador

### **Personalizar Temas**
Puedes agregar nuevos temas editando:
```javascript
// En server/services/aiQuestionGenerator.js
getAvailableTopics() {
  return [
    'Ciencia',
    'Historia',
    'Geografía',
    'Tecnología',
    'Deportes',
    'Arte',
    'Literatura',
    'Matemáticas',
    'Biología',
    'Química',
    'Física',
    'Astronomía',
    'Música',
    'Cine',
    'Videojuegos',
    'Tu Nuevo Tema' // ← Agregar aquí
  ];
}
```

## 🎉 **¡Listo para Usar!**

El sistema está completamente funcional y listo para generar preguntas sobre cualquier tema. ¡Disfruta creando contenido educativo y entretenido!

### **URLs Importantes:**
- **Aplicación**: http://localhost:3000
- **API de Temas**: http://localhost:5000/api/ai/topics
- **API de Generación**: http://localhost:5000/api/ai/generate-questions
- **Documentación**: `AI_QUESTIONS_GUIDE.md`

