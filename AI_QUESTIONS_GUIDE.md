# 🤖 Guía del Generador de Preguntas con IA

## 🎯 **¿Qué es el Generador de Preguntas con IA?**

El Generador de Preguntas con IA es una funcionalidad que permite crear preguntas de trivia automáticamente usando inteligencia artificial. Puedes generar preguntas sobre diferentes temas y niveles de dificultad.

## 🚀 **Cómo Usar el Generador**

### **Paso 1: Acceder al Generador**
1. Ve a tu Dashboard: http://localhost:3000/dashboard
2. Haz clic en el botón **"🤖 Generate Questions with AI"**
3. Se abrirá el modal del generador

### **Paso 2: Configurar las Preguntas**
1. **Selecciona un Tema**: Elige de 15 temas disponibles:
   - Ciencia, Historia, Geografía, Tecnología
   - Deportes, Arte, Literatura, Matemáticas
   - Biología, Química, Física, Astronomía
   - Música, Cine, Videojuegos

2. **Elige la Dificultad**:
   - **Fácil**: Preguntas básicas
   - **Medio**: Preguntas intermedias
   - **Difícil**: Preguntas avanzadas

3. **Cantidad de Preguntas**: Entre 1 y 20 preguntas

4. **Modo IA**: 
   - ✅ **Activado**: Usa IA avanzada (requiere API key)
   - ❌ **Desactivado**: Usa generación local (gratis)

### **Paso 3: Generar Preguntas**
1. Haz clic en **"Generar Preguntas"**
2. Las preguntas se generarán automáticamente
3. Recibirás una confirmación con el número de preguntas creadas

## 📚 **Temas Disponibles**

| Tema | Descripción | Ejemplo |
|------|-------------|---------|
| **Ciencia** | Preguntas sobre física, química, biología | "¿Cuál es el elemento más abundante?" |
| **Historia** | Eventos históricos y personajes | "¿En qué año cayó el Muro de Berlín?" |
| **Geografía** | Países, capitales, ríos, montañas | "¿Cuál es la capital de Australia?" |
| **Tecnología** | Programación, computadoras, internet | "¿Qué significa HTML?" |
| **Deportes** | Fútbol, basketball, tenis, etc. | "¿Cuántos jugadores hay en un equipo?" |
| **Arte** | Pintura, escultura, artistas famosos | "¿Quién pintó la Mona Lisa?" |
| **Literatura** | Libros, autores, poemas | "¿Quién escribió Romeo y Julieta?" |
| **Matemáticas** | Álgebra, geometría, cálculo | "¿Cuál es la fórmula del área del círculo?" |
| **Biología** | Células, ADN, evolución | "¿Cuántos cromosomas tiene el ser humano?" |
| **Química** | Elementos, compuestos, reacciones | "¿Cuál es el símbolo del oro?" |
| **Física** | Mecánica, termodinámica, ondas | "¿Cuál es la velocidad de la luz?" |
| **Astronomía** | Planetas, estrellas, galaxias | "¿Cuál es el planeta más grande?" |
| **Música** | Instrumentos, compositores, géneros | "¿Quién compuso la Novena Sinfonía?" |
| **Cine** | Películas, actores, directores | "¿Quién dirigió El Padrino?" |
| **Videojuegos** | Consolas, juegos, personajes | "¿En qué año se lanzó Super Mario?" |

## 🔧 **API Endpoints**

### **Obtener Temas Disponibles**
```bash
GET http://localhost:5000/api/ai/topics
```

### **Obtener Niveles de Dificultad**
```bash
GET http://localhost:5000/api/ai/difficulty-levels
```

### **Generar Preguntas**
```bash
POST http://localhost:5000/api/ai/generate-questions
Content-Type: application/json

{
  "topic": "Ciencia",
  "difficulty": "medium",
  "count": 5,
  "useAI": false
}
```

### **Respuesta de Ejemplo**
```json
{
  "success": true,
  "topic": "Ciencia",
  "difficulty": "medium",
  "count": 3,
  "questions": [
    {
      "id": "ai_1758077140346_27ovqc6k9",
      "text": "¿Cuál es el elemento químico más abundante en el universo?",
      "options": ["Hidrógeno", "Helio", "Oxígeno", "Carbono"],
      "correctAnswerIndex": 0,
      "category": "Ciencia",
      "difficulty": "medium",
      "explanation": "El hidrógeno es el elemento más abundante en el universo, representando aproximadamente el 75% de toda la materia.",
      "source": "AI Generated"
    }
  ]
}
```

## 🎮 **Integración con Juegos**

Las preguntas generadas se pueden usar para:
- ✅ Crear nuevos juegos
- ✅ Agregar preguntas a juegos existentes
- ✅ Personalizar el contenido según el tema
- ✅ Ajustar la dificultad según la audiencia

## 🔑 **Configuración de IA Avanzada**

Para usar IA avanzada (OpenAI):

1. **Obtén una API Key de OpenAI**:
   - Ve a: https://platform.openai.com/api-keys
   - Crea una nueva API key

2. **Configura la variable de entorno**:
   ```bash
   export OPENAI_API_KEY="tu-api-key-aqui"
   ```

3. **Activa el modo IA** en el generador

## 💡 **Características del Sistema**

- ✅ **15 temas diferentes** disponibles
- ✅ **3 niveles de dificultad** (Fácil, Medio, Difícil)
- ✅ **Generación local** (sin costo)
- ✅ **IA avanzada** (con API key)
- ✅ **Preguntas únicas** con IDs únicos
- ✅ **Explicaciones detalladas** para cada respuesta
- ✅ **Interfaz intuitiva** y fácil de usar
- ✅ **API REST** completa
- ✅ **Integración** con el sistema de juegos

## 🎯 **Ejemplos de Uso**

### **Para Profesores**
- Generar preguntas para exámenes
- Crear quizzes de repaso
- Personalizar contenido por materia

### **Para Empresas**
- Crear entrenamientos corporativos
- Evaluar conocimientos del personal
- Hacer presentaciones interactivas

### **Para Eventos**
- Organizar trivia nights
- Crear competencias temáticas
- Entretenimiento en fiestas

## 🚀 **¡Empieza a Generar Preguntas!**

1. **Abre la aplicación**: http://localhost:3000
2. **Ve al Dashboard**: Inicia sesión
3. **Haz clic en**: "🤖 Generate Questions with AI"
4. **Configura**: Tema, dificultad, cantidad
5. **Genera**: ¡Disfruta de tus preguntas!

¡El sistema está listo para crear preguntas increíbles! 🎉

