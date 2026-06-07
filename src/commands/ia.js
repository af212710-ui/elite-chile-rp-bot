const { OpenAI } = require('openai');
const redis = require('../utils/redis');

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1'
});

const MODEL = process.env.AI_MODEL || 'grok-3';
const RATE_LIMIT_TTL = 60;
const MAX_HISTORY = 12; // Máximo de mensajes en memoria (6 rondas de conversación)

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

// Obtener historial de chat del usuario desde Redis
async function getChatHistory(userId) {
  const key = `chat_history:${userId}`;
  const history = await redis.get(key);
  return history ? JSON.parse(history) : [];
}

// Guardar historial actualizado
async function saveChatHistory(userId, history) {
  const key = `chat_history:${userId}`;
  // Mantener solo los últimos mensajes
  const trimmed = history.slice(-MAX_HISTORY);
  await redis.set(key, JSON.stringify(trimmed));
}

// Limpiar historial
async function clearChatHistory(userId) {
  const key = `chat_history:${userId}`;
  await redis.del(key);
}

module.exports = {
  name: 'ia',
  description: 'Habla con la IA del servidor (con memoria de conversación)',
  execute: async (message, args, client) => {
    if (args.length === 0) {
      return message.reply('Uso: `ch!ia Tu mensaje aquí`\nO usa `ch!ia limpiar` para borrar la memoria de la conversación.');
    }

    const subCommand = args[0].toLowerCase();

    // Comando para limpiar memoria
    if (subCommand === 'limpiar' || subCommand === 'clear') {
      await clearChatHistory(message.author.id);
      return message.reply('✅ Memoria de conversación borrada. La próxima vez empezarás de nuevo.');
    }

    const userMessage = args.join(' ');

    // Rate limiting
    const rateKey = `ia_rate:${message.author.id}`;
    const lastUse = await redis.get(rateKey);

    if (lastUse && !hasStaffRole(message.member)) {
      return message.reply('Espera un momento antes de usar la IA otra vez (1 minuto).');
    }

    await redis.setex(rateKey, RATE_LIMIT_TTL, '1');

    try {
      // Obtener historial anterior
      let history = await getChatHistory(message.author.id);

      // Agregar mensaje del usuario
      history.push({ role: 'user', content: userMessage });

      // Preparar mensajes para la IA (system + historial)
      const messages = [
        {
          role: 'system',
          content: 'Eres un asistente útil y amigable del servidor Elite Chile RP. Responde en español de forma clara y natural. Mantén el contexto de la conversación anterior.'
        },
        ...history
      ];

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        max_tokens: 600,
        temperature: 0.7
      });

      const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      // Agregar respuesta de la IA al historial
      history.push({ role: 'assistant', content: reply });

      // Guardar historial actualizado
      await saveChatHistory(message.author.id, history);

      // Enviar respuesta
      if (reply.length > 1900) {
        await message.reply(reply.substring(0, 1900) + '... (respuesta recortada)');
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error('Error con la IA:', error);
      message.reply('Ocurrió un error al consultar la IA. Intenta más tarde.');
    }
  }
};