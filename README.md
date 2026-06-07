# Elite Chile RP Bot

## IA con Groq (Gratis)

El bot usa **Groq** (totalmente gratis) para el comando `ch!ia`.

### Configuración

1. Crea cuenta gratis en: https://console.groq.com
2. Genera tu API Key
3. Agrega en las variables de entorno:

```env
XAI_API_KEY=gsk_tu_clave
AI_MODEL=llama-3.1-70b-versatile
AI_BASE_URL=https://api.groq.com/openai/v1
```

### Comandos de IA
- `ch!ia Tu mensaje`
- `ch!ia limpiar` - Borra la memoria de conversación

La IA recuerda la conversación reciente de forma gratuita.
