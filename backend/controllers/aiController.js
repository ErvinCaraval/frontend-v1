const AIQuestionGenerator = require('../services/aiQuestionGenerator');

class AIController {
  constructor() {
    this.aiGenerator = new AIQuestionGenerator();
  }

  // Generar preguntas con IA
  async generateQuestions(req, res) {
    try {
      const { topic, difficulty = 'medium', count = 5, useAI = false } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'El tema es requerido' });
      }

      let questions;
      if (useAI) {
        questions = await this.aiGenerator.generateQuestions(topic, difficulty, count);
      } else {
        questions = await this.aiGenerator.generateQuestionsFree(topic, difficulty, count);
      }

      res.json({
        success: true,
        topic,
        difficulty,
        count: questions.questions.length,
        questions: questions.questions
      });
    } catch (error) {
      console.error('Error generando preguntas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener temas disponibles
  getTopics(req, res) {
    try {
      const topics = this.aiGenerator.getAvailableTopics();
      res.json({
        success: true,
        topics
      });
    } catch (error) {
      console.error('Error obteniendo temas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener niveles de dificultad
  getDifficultyLevels(req, res) {
    try {
      const levels = this.aiGenerator.getDifficultyLevels();
      res.json({
        success: true,
        levels
      });
    } catch (error) {
      console.error('Error obteniendo niveles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Generar preguntas para un juego específico
  async generateGameQuestions(req, res) {
    try {
      const { gameId, topic, difficulty = 'medium', count = 10 } = req.body;

      if (!gameId || !topic) {
        return res.status(400).json({ error: 'gameId y topic son requeridos' });
      }

      const questions = await this.aiGenerator.generateQuestionsFree(topic, difficulty, count);
      
      // Aquí podrías guardar las preguntas en la base de datos
      // await this.saveQuestionsToGame(gameId, questions.questions);

      res.json({
        success: true,
        gameId,
        topic,
        difficulty,
        count: questions.questions.length,
        questions: questions.questions
      });
    } catch (error) {
      console.error('Error generando preguntas para juego:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = AIController;

