const axios = require('axios');

class AIQuestionGenerator {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.openAiApiKey = process.env.OPENAI_API_KEY || '';
    this.groqURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.openAiURL = 'https://api.openai.com/v1/chat/completions';
    // Model por defecto en Groq (rápido y gratuito con cuota)
    this.groqModel = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
    // Respaldo OpenAI si existiese
    this.openAiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  // Extrae JSON de respuestas que puedan venir con ``` o texto adicional
  extractJson(content) {
    if (!content) return null;
    // Elimina fences tipo ```json ... ```
    let cleaned = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    // Si aún no es JSON puro, intenta localizar el primer objeto
    if (!(cleaned.startsWith('{') && cleaned.endsWith('}'))) {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }
    }
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  // Generar preguntas usando IA (Groq por defecto)
  async generateQuestions(topic, difficulty = 'medium', count = 5) {
    try {
      const prompt = this.buildPrompt(topic, difficulty, count);
      let questions = [];

      // Preferir Groq si hay API key
      if (this.groqApiKey) {
        const response = await axios.post(this.groqURL, {
          model: this.groqModel,
          messages: [
            { role: 'system', content: 'Eres un experto en crear preguntas de trivia educativas y entretenidas. Responde siempre en formato JSON válido.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        const content = response.data.choices?.[0]?.message?.content || '';
        const parsed = this.extractJson(content);
        if (parsed && parsed.questions) {
          questions = parsed.questions;
        }
      } else if (this.openAiApiKey) {
        // Respaldo: OpenAI si está disponible
        const response = await axios.post(this.openAiURL, {
          model: this.openAiModel,
          messages: [
            { role: 'system', content: 'Eres un experto en crear preguntas de trivia educativas y entretenidas. Responde siempre en formato JSON válido.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${this.openAiApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        const content = response.data.choices?.[0]?.message?.content || '';
        const parsed = this.extractJson(content);
        if (parsed && parsed.questions) {
          questions = parsed.questions;
        }
      }

      // Si no hay preguntas IA, devolver error (nunca usar plantillas locales)
      if (!questions || questions.length === 0) {
        throw new Error('No se pudieron generar preguntas con IA.');
      }

      // Filtrar preguntas repetidas (por texto)
      const uniqueQuestions = [];
      const seen = new Set();
      for (const q of questions) {
        const key = q.text && q.text.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueQuestions.push(q);
        }
      }

      // Si aún faltan preguntas, devolver error
      if (uniqueQuestions.length < count) {
        throw new Error('La IA no generó suficientes preguntas únicas.');
      }

      return { questions: uniqueQuestions.slice(0, count) };
    } catch (error) {
      console.error('Error generando preguntas con IA:', error.message);
      throw error;
    }
  }

  // Generar preguntas usando una API gratuita alternativa
  async generateQuestionsFree(topic, difficulty = 'medium', count = 5) {
    try {
      throw new Error('No se pueden generar preguntas locales.');
    } catch (error) {
      console.error('Error generando preguntas gratuitas:', error.message);
        throw new Error('No se pueden generar preguntas con IA.');
    }
  }

  // Generar preguntas locales usando templates
  generateLocalQuestions(topic, difficulty, count) {
    throw new Error('No se pueden generar preguntas locales.');
  }

  // Templates de preguntas por tema
  getQuestionTemplates(topic) {
    const templates = {
      'ciencia': [
        {
          text: `¿Cuál es el elemento químico más abundante en el universo?`,
          options: ['Hidrógeno', 'Helio', 'Oxígeno', 'Carbono'],
          correctAnswerIndex: 0,
          explanation: 'El hidrógeno es el elemento más abundante en el universo, representando aproximadamente el 75% de toda la materia.'
        },
        {
          text: `¿A qué velocidad viaja la luz en el vacío?`,
          options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
          correctAnswerIndex: 0,
          explanation: 'La velocidad de la luz en el vacío es aproximadamente 299,792,458 metros por segundo.'
        }
      ],
      'historia': [
        {
          text: `¿En qué año cayó el Muro de Berlín?`,
          options: ['1987', '1989', '1991', '1993'],
          correctAnswerIndex: 1,
          explanation: 'El Muro de Berlín cayó el 9 de noviembre de 1989, marcando el fin de la Guerra Fría.'
        },
        {
          text: `¿Quién fue el primer presidente de Estados Unidos?`,
          options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
          correctAnswerIndex: 1,
          explanation: 'George Washington fue el primer presidente de Estados Unidos, sirviendo de 1789 a 1797.'
        }
      ],
      'geografia': [
        {
          text: `¿Cuál es el río más largo del mundo?`,
          options: ['Nilo', 'Amazonas', 'Mississippi', 'Yangtsé'],
          correctAnswerIndex: 0,
          explanation: 'El río Nilo es considerado el más largo del mundo con aproximadamente 6,650 km.'
        },
        {
          text: `¿Cuál es la capital de Australia?`,
          options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
          correctAnswerIndex: 2,
          explanation: 'Canberra es la capital de Australia, ubicada en el Territorio de la Capital Australiana.'
        }
      ],
      'tecnologia': [
        {
          text: `¿Qué significa la sigla "HTML"?`,
          options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'],
          correctAnswerIndex: 0,
          explanation: 'HTML significa HyperText Markup Language, el lenguaje estándar para crear páginas web.'
        },
        {
          text: `¿Cuál fue el primer navegador web?`,
          options: ['Internet Explorer', 'Netscape Navigator', 'Mosaic', 'Chrome'],
          correctAnswerIndex: 2,
          explanation: 'Mosaic fue uno de los primeros navegadores web gráficos, desarrollado en 1993.'
        }
      ],
      'deportes': [
        {
          text: `¿En qué deporte se juega con una pelota de fútbol?`,
          options: ['Basketball', 'Fútbol', 'Tenis', 'Voleibol'],
          correctAnswerIndex: 1,
          explanation: 'El fútbol se juega con una pelota esférica, también conocida como balón de fútbol.'
        },
        {
          text: `¿Cuántos jugadores hay en un equipo de fútbol?`,
          options: ['10', '11', '12', '9'],
          correctAnswerIndex: 1,
          explanation: 'Un equipo de fútbol tiene 11 jugadores en el campo, incluyendo el portero.'
        }
      ]
    };

    return templates[topic.toLowerCase()] || templates['ciencia'];
  }

  // Llenar template con datos dinámicos
  fillTemplate(template, topic, difficulty) {
    return {
      ...template,
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: topic,
      difficulty: difficulty,
      source: 'AI Generated'
    };
  }

  // Construir prompt para OpenAI
  buildPrompt(topic, difficulty, count) {
    return `Genera ${count} preguntas de trivia sobre el tema "${topic}" con dificultad ${difficulty}.

Formato requerido (JSON válido):
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Pregunta aquí",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswerIndex": 0,
      "category": "${topic}",
      "difficulty": "${difficulty}",
      "explanation": "Explicación de la respuesta correcta"
    }
  ]
}

Requisitos:
- Preguntas interesantes y educativas
- 4 opciones de respuesta
- Explicación clara de la respuesta correcta
- Dificultad apropiada para el nivel ${difficulty}
- Tema: ${topic}

Responde solo con el JSON, sin texto adicional.`;
  }

  // Preguntas de respaldo si falla la IA
  getFallbackQuestions(topic, difficulty, count) {
    throw new Error('No se pueden generar preguntas de respaldo.');
  }

  // Obtener temas disponibles
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
      'Videojuegos'
    ];
  }

  // Obtener niveles de dificultad
  getDifficultyLevels() {
    return [
      { value: 'easy', label: 'Fácil' },
      { value: 'medium', label: 'Medio' },
      { value: 'hard', label: 'Difícil' }
    ];
  }
}

module.exports = AIQuestionGenerator;

