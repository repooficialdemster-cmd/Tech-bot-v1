import axios from 'axios'
import fs from 'fs'
const premiumFile = './json/premium.json'

// Aseguramos archivo
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]), 'utf-8')

// Función de verificación
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0] // extraemos el numérico del JID
    return data.includes(botId)
  } catch {
    return false
  }
}

const handler = async (m, { conn, args, usedPrefix, text, command }) => {
  if (!isBotPremium(conn)) {
    return m.reply('⚠️ *Se necesita que el bot sea premium.*\n> Usa *_.buyprem_* para activarlo.')
  }
  
  if (!text) return m.reply(`⏳ Ingresa una búsqueda para TikTok\n> *Ejemplo:* ${usedPrefix + command} haikyuu edit`)

  try {
    // Usar la nueva API Adonix para búsqueda
    let searchUrl = `https://api-adonix.ultraplus.click/search/tiktok?query=${encodeURIComponent(text)}&apikey=DemonKeytechbot`
    
    let searchRes = await fetch(searchUrl)
    let searchJson = await searchRes.json()
    
    console.log('API Response:', JSON.stringify(searchJson, null, 2)) // Para debug

    // Verificar diferentes formatos de respuesta posibles
    if (!searchJson || (!searchJson.data && !searchJson.result && !searchJson.videos)) {
      return m.reply('❌ La API no devolvió resultados válidos.')
    }

    // Extraer datos según la estructura de respuesta
    let videos = [];
    
    if (searchJson.data && Array.isArray(searchJson.data)) {
      videos = searchJson.data
    } else if (searchJson.result && Array.isArray(searchJson.result)) {
      videos = searchJson.result
    } else if (searchJson.videos && Array.isArray(searchJson.videos)) {
      videos = searchJson.videos
    } else if (searchJson.status && searchJson.data && Array.isArray(searchJson.data)) {
      videos = searchJson.data
    } else if (Array.isArray(searchJson)) {
      videos = searchJson
    }
    
    if (!videos.length) {
      return m.reply('❌ No se encontraron videos con esa búsqueda.')
    }

    // Tomar el primer video
    let vid = videos[0]
    
    // Extraer información del video basado en diferentes estructuras posibles
    let videoInfo = {
      title: vid.title || vid.desc || vid.description || 'Video de TikTok',
      author: vid.author || vid.authorName || vid.author?.nickname || vid.nickname || 'Usuario',
      views: vid.playCount || vid.viewCount || vid.views || vid.play || 0,
      url: vid.play || vid.videoUrl || vid.url || vid.video || vid.download,
      thumbnail: vid.cover || vid.thumbnail || vid.thumb
    }
    
    console.log('Video info:', videoInfo) // Para debug

    if (!videoInfo.url) {
      // Si no hay URL directa, intentar construirla
      if (vid.id) {
        videoInfo.url = `https://api-adonix.ultraplus.click/download/tiktok?id=${vid.id}&apikey=DemonKeytechbot`
      } else {
        return m.reply('❌ No se pudo obtener el enlace del video.')
      }
    }

    let caption = `📎 *Título:* ${videoInfo.title}\n\n` +
                  `👤 *Autor:* ${videoInfo.author}\n` +
                  `👀 *Vistas:* ${videoInfo.views.toLocaleString()}\n` +
                  `🔗 *Descargado via:* Adonix API`

    // Enviar video con thumbnail si está disponible
    let messageOptions = {
      video: { url: videoInfo.url },
      caption: caption,
      fileName: `tiktok_${Date.now()}.mp4`,
      mimetype: 'video/mp4'
    }
    
    // Añadir thumbnail si existe
    if (videoInfo.thumbnail) {
      messageOptions.jpegThumbnail = await (await fetch(videoInfo.thumbnail)).buffer()
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('Error en TikTok downloader:', error)
    return m.reply(`❌ Error al procesar la solicitud:\n\`\`\`${error.message}\`\`\``)
  }
}

handler.help = ['tiktokvid']
handler.tags = ['downloader']
handler.command = ['tiktokvid', 'playtiktok', 'ttvid']
handler.register = true
export default handler