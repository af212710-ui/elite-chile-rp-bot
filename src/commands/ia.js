const { OpenAI } = require('openai');
const redis = require('../utils/redis');

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1'
});

const MODEL = process.env.AI_MODEL || 'grok-3';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const RATE_LIMIT_TTL = 60;
const MAX_HISTORY = 10;
const MAX_MEMORIES = 8;           // Máximo de recuerdos vectoriales a recuperar

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

// ==================== FUNCIONES DE MEMORIA CORTA (Historial) ====================
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

// ==================== FUNCIONES DE MEMORIA VECTORIAL ====================

// Generar embedding de un texto
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generando embedding:', error);
    return null;
  }
}

// Guardar un recuerdo (memoria vectorial)
async function saveMemory(userId, memoryText) {
  const embedding = await getEmbedding(memoryText);
  if (!embedding) return;

  const key = `memories:${userId}`;
  const memories = await redis.get(key);
  let memoryList = memories ? JSON.parse(memories) : [];

  memoryList.push({
    text: memoryText,
    embedding: embedding,
    timestamp: Date.now()
  });

  // Limitar número de memorias
  if (memoryList.length > 50) {
    memoryList = memoryList.slice(-50);
  }

  await redis.set(key, JSON.stringify(memoryList));
}

// Recuperar recuerdos relevantes usando similitud coseno
async function getRelevantMemories(userId, query, topK = MAX_MEMORIES) {
  const key = `memories:${userId}`;
  const memories = await redis.get(key);
  if (!memories) return [];

  const memoryList = JSON.parse(memories);
  if (memoryList.length === 0) return [];

  const queryEmbedding = await getEmbedding(query);
  if (!queryEmbedding) return [];

  // Calcular similitud
  const scored = memoryList.map(mem => ({
    ...mem,
    score: cosineSimilarity(queryEmbedding, mem.embedding)
  }));

  // Ordenar por relevancia y tomar los mejores
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(m => m.text);
}

// ==================== COMANDO PRINCIPAL ====================
module.exports = {
  name: 'ia',
  description: 'Habla con la IA del servidor (con memoria de conversación + memoria vectorial)',
  execute: async (message, args, client) => {
    if (args.length === 0) {
      return message.reply('Uso: `ch!ia Tu mensaje aquí`\n`ch!ia limpiar` - Borrar memoria de conversación y recuerdos');
    }

    const subCommand = args[0].toLowerCase();

    if (subCommand === 'limpiar' || subCommand === 'clear') {
      await redis.del(`chat_history:${message.author.id}`);
      await redis.del(`memories:${message.author.id}`);
      return message.reply('✅ Toda la memoria (corta y vectorial) ha sido borrada.');
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
      // 1. Obtener historial corto
      let history = await getChatHistory(message.author.id);

      // 2. Recuperar recuerdos vectoriales relevantes
      const relevantMemories = await getRelevantMemories(message.author.id, userMessage);

      // 3. Construir contexto de recuerdos
      let memoryContext = '';
      if (relevantMemories.length > 0) {
        memoryContext = 'Recuerdos relevantes de conversaciones anteriores:\n' + 
          relevantMemories.map((m, i) => `${i+1}. ${m}`).join('\n') + '\n\n';
      }

      // 4. Agregar mensaje actual al historial
      history.push({ role: 'user', content: userMessage });

      // 5. Preparar mensajes para la IA
      const messages = [
        {
          role: 'system',
          content: `Eres un asistente útil del servidor Elite Chile RP. Responde en español de forma natural.\n${memoryContext}Usa los recuerdos anteriores cuando sean relevantes para dar mejores respuestas.`
        },
        ...history
      ];

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        max_tokens: 700,
        temperature: 0.7
      });

      const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      // 6. Guardar en historial corto
      history.push({ role: 'assistant', content: reply });
      await saveChatHistory(message.author.id, history);

      // 7. Guardar como memoria vectorial (hecho importante)
      const memoryText = `Usuario dijo: "${userMessage}". IA respondió: "${reply.substring(0, 300)}"`;
      await saveMemory(message.author.id, memoryText);

      // Enviar respuesta
      if (reply.length > 1900) {
        await message.reply(reply.substring(0, 1900) + '...');
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error('Error con la IA:', error);
      message.reply('Ocurrió un error al consultar la IA.');
    }
  }
};