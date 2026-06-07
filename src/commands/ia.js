const { OpenAI } = require('openai');
const redis = require('../utils/redis');

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1'
});

const MODEL = process.env.AI_MODEL || 'grok-3';
const RATE_LIMIT_TTL = 60; // 1 minuto entre usos por usuario

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = {
  name: 'ia',
  description: 'Habla con la IA del servidor',
  execute: async (message, args, client) => {
    if (args.length === 0) {
      return message.reply('Uso: `ch!ia Tu mensaje aquí`');
    }

    const userMessage = args.join(' ');

    // Rate limiting simple con Redis
    const rateKey = `ia_rate:${message.author.id}`;
    const lastUse = await redis.get(rateKey);

    if (lastUse && !hasStaffRole(message.member)) {
      return message.reply('Espera un momento antes de usar la IA otra vez.');
    }

    await redis.setex(rateKey, RATE_LIMIT_TTL, '1');

    try {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente útil y amigable del servidor Elite Chile RP. Responde en español de forma clara y concisa. Si te preguntan algo sobre roleplay, sé útil pero no rompas la inmersión innecesariamente.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      // Enviar respuesta (puede ser larga, así que la dividimos si es necesario)
      if (reply.length > 1900) {
        await message.reply(reply.substring(0, 1900) + '...');
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error('Error con la IA:', error);
      message.reply('Ocurrió un error al consultar la IA. Intenta más tarde.');
    }
  }
};