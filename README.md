# Elite Chile RP Bot

## Integración con IA (con Memoria de Conversación)

El bot tiene un comando de **Inteligencia Artificial** con **memoria de conversación**.

### Características
- `ch!ia Tu mensaje` - Habla con la IA
- La IA recuerda los últimos mensajes de la conversación
- `ch!ia limpiar` - Borra la memoria de la conversación
- Rate limiting (1 minuto entre usos para civiles)

### Configuración
Agrega en tu `.env`:

```env
XAI_API_KEY=tu_clave
AI_MODEL=grok-3
AI_BASE_URL=https://api.x.ai/v1
```

La IA está optimizada para español y contexto de Roleplay.