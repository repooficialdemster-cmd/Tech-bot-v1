import { existsSync, readFileSync } from 'fs'
import translate from '@vitalets/google-translate-api'

var handler = async (m, { conn, text, quoted }) => {
  
  if (m.text.startsWith('.traslate')) {
    try {
      // Obtener el idioma objetivo y el texto
      const args = text.trim().split(' ')
      
      if (args.length < 2) {
        m.react('❓')
        return await conn.reply(m.chat,
          `🌍 *TRADUCTOR MULTI-IDIOMA* 🌍\n\n` +
          `*Uso:* .traslate [idioma] (responde a un mensaje)\n` +
          `*Uso 2:* .traslate [idioma] [texto]\n\n` +
          `*Idiomas disponibles:*\n` +
          `• esp / es - Español\n` +
          `• ing / en - Inglés\n` +
          `• ch / zh - Chino\n` +
          `• arab / ar - Árabe\n` +
          `• fr - Francés\n` +
          `• pt - Portugués\n` +
          `• ru - Ruso\n` +
          `• ja - Japonés\n` +
          `• de - Alemán\n` +
          `• it - Italiano\n\n` +
          `*Ejemplos:*\n` +
          `• .traslate esp hello (traduce hello a español)\n` +
          `• .traslate ing hola mundo (traduce a inglés)\n` +
          `• Responde a un mensaje con .traslate ch`,
          m
        )
      }
      
      const targetLang = args[0].toLowerCase()
      let textToTranslate = ''
      
      // Mapear códigos de idioma
      const langMap = {
        'esp': 'es', 'es': 'es', 'español': 'es',
        'ing': 'en', 'en': 'en', 'english': 'en', 'ingles': 'en',
        'ch': 'zh-CN', 'zh': 'zh-CN', 'chino': 'zh-CN', 'chinese': 'zh-CN',
        'arab': 'ar', 'ar': 'ar', 'arabe': 'ar', 'arabic': 'ar',
        'fr': 'fr', 'francés': 'fr', 'french': 'fr',
        'pt': 'pt', 'portugués': 'pt', 'portuguese': 'pt',
        'ru': 'ru', 'ruso': 'ru', 'russian': 'ru',
        'ja': 'ja', 'japonés': 'ja', 'japanese': 'ja',
        'de': 'de', 'alemán': 'de', 'german': 'de',
        'it': 'it', 'italiano': 'it', 'italian': 'it'
      }
      
      const langCode = langMap[targetLang]
      if (!langCode) {
        m.react('❌')
        return await conn.reply(m.chat,
          `❌ *Idioma no válido*\n\n` +
          `El idioma "${targetLang}" no está soportado.\n` +
          `Usa .traslate para ver la lista de idiomas disponibles.`,
          m
        )
      }
      
      // Obtener texto a traducir
      if (args.length > 1 && !quoted) {
        // Texto directamente en el comando
        textToTranslate = args.slice(1).join(' ')
      } else if (quoted && quoted.text) {
        // Texto del mensaje respondido
        textToTranslate = quoted.text
      } else {
        m.react('❓')
        return await conn.reply(m.chat,
          `❓ *No hay texto para traducir*\n\n` +
          `Responde a un mensaje o escribe el texto después del idioma.\n` +
          `Ejemplo: .traslate esp hello world`,
          m
        )
      }
      
      if (textToTranslate.length > 3000) {
        m.react('⚠️')
        return await conn.reply(m.chat,
          `⚠️ *Texto demasiado largo*\n\n` +
          `El texto excede el límite de 3000 caracteres.\n` +
          `Divide el texto en partes más pequeñas.`,
          m
        )
      }
      
      // Enviar mensaje inicial
      m.react('🔄')
      const processingMsg = await conn.reply(m.chat,
        `🔄 *Traduciendo...*\n\n` +
        `📝 *Texto:* ${textToTranslate.substring(0, 100)}${textToTranslate.length > 100 ? '...' : ''}\n` +
        `🌍 *Idioma destino:* ${targetLang.toUpperCase()}`,
        m
      )
      
      // Realizar la traducción
      const translation = await translate(textToTranslate, { to: langCode })
      
      // Nombre del idioma destino
      const langNames = {
        'es': 'Español 🇪🇸',
        'en': 'Inglés 🇺🇸',
        'zh-CN': 'Chino 🇨🇳',
        'ar': 'Árabe 🇸🇦',
        'fr': 'Francés 🇫🇷',
        'pt': 'Portugués 🇵🇹',
        'ru': 'Ruso 🇷🇺',
        'ja': 'Japonés 🇯🇵',
        'de': 'Alemán 🇩🇪',
        'it': 'Italiano 🇮🇹'
      }
      
      // Editar el mensaje con la traducción
      const translationMessage = `🌐 *TRADUCCIÓN COMPLETADA* 🌐\n\n` +
        `📝 *Texto original:*\n${textToTranslate}\n\n` +
        `🔤 *Traducción (${langNames[langCode] || targetLang.toUpperCase()}):*\n${translation.text}\n\n` +
        `_✨ Traducido por Tech bot v1_`
      
      // Editar el mensaje en lugar de enviar uno nuevo
      await conn.sendMessage(m.chat, {
        text: translationMessage,
        edit: processingMsg.key
      })
      
      m.react('✅')
      
    } catch (error) {
      console.error('Error en traducción:', error)
      m.react('❌')
      await conn.reply(m.chat,
        `❌ *Error en la traducción*\n\n` +
        `Ocurrió un error al traducir el texto.\n` +
        `Posibles causas:\n` +
        `• Texto muy largo\n` +
        `• Idioma no soportado\n` +
        `• Error de conexión\n\n` +
        `Intenta nuevamente.`,
        m
      )
    }
    return
  }
}

handler.help = ['traslate <idioma> <texto>', 'traslate <idioma> (responder)']
handler.tags = ['premium.json']
handler.command = ['traslate', 'traducir', 'translate', 'trad']

export default handler