const { OpenAI } = require('openai');
const redis = require('../utils/redis');

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1'
});

const MODEL = process.env.AI_MODEL || 'llama-3.1-70b-versatile';
const RATE_LIMIT_TTL = 60;
const MAX_HISTORY = 10;

// Memoria vectorial (opcional - solo si tienes embeddings)
const ENABLE_VECTOR_MEMORY = false; // Cambia a true si consigues embeddings gratis después

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

// ==================== HISTORIAL DE CONVERSACIÓN ====================
async function getChatHistory(userId) {
  const key = `chat_history:${userId}`;
  const history = await redis.get(key);
  return history ? JSON.parse(history) : [];
}

async function saveChatHistory(userId, history) {
  const key = `chat_history:${userId}`;
  const trimmed = history.slice(-MAX_HISTORY);
  await redis.set(key, JSON.stringify(trimmed));
}

async function clearChatHistory(userId) {
  await redis.del(`chat_history:${userId}`);
  if (ENABLE_VECTOR_MEMORY) {
    await redis.del(`memories:${userId}`);
  }
}

// ==================== MEMORIA VECTORIAL (OPCIONAL) ====================
async function getRelevantMemories(userId, query) {
  if (!ENABLE_VECTOR_MEMORY) return [];
  // Por ahora deshabilitado porque no tienes embeddings gratis
  return [];
}

async function saveMemory(userId, memoryText) {
  if (!ENABLE_VECTOR_MEMORY) return;
  // Deshabilitado por ahora
}

// ==================== COMANDO PRINCIPAL ====================
module.exports = {
  name: 'ia',
  description: 'Habla con la IA del servidor (Gratis con Groq)',
  execute: async (message, args, client) => {
    if (args.length === 0) {
      return message.reply('Uso: `ch!ia Tu mensaje aquí`\n`ch!ia limpiar` - Borrar memoria de conversación');
    }

    const subCommand = args[0].toLowerCase();

    if (subCommand === 'limpiar' || subCommand === 'clear') {
      await clearChatHistory(message.author.id);
      return message.reply('✅ Memoria de conversación borrada.');
    }

    const userMessage = args.join(' ');

    // Rate limiting
    const rateKey = `ia_rate:${message.author.id}`;
    const lastUse = await redis.get(rateKey);
    if (lastUse && !hasStaffRole(message.member)) {
      return message.reply('Espera un momento antes de usar la IA otra vez.');
    }
    await redis.setex(rateKey, RATE_LIMIT_TTL, '1');

    try {
      let history = await getChatHistory(message.author.id);
      history.push({ role: 'user', content: userMessage });

      const messages = [
        {
          role: 'system',
          content: 'Eres un asistente útil y amigable del servidor Elite Chile RP. Responde en español de forma clara y natural. Mantén el contexto de la conversación.'
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

      history.push({ role: 'assistant', content: reply });
      await saveChatHistory(message.author.id, history);

      if (reply.length > 1900) {
        await message.reply(reply.substring(0, 1900) + '...');
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error('Error con la IA (Groq):', error);
      message.reply('Ocurrió un error al consultar la IA. Revisa tu API key de Groq.');
    }
  }
};