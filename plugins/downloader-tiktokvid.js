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
    // Primero buscamos los videos
    let searchRes = await fetch(`https://apizell.web.id/download/tiktokplay?q=${encodeURIComponent(text)}`)
    let searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.data || !searchJson.data.length) {
      return m.reply('❌ No se encontró ningún video.')
    }

    let vid = searchJson.data[0]
    
    // Ahora obtenemos la URL de descarga usando la nueva API
    let downloadUrl = `https://api.neoxr.eu/api/tiktok?url=${encodeURIComponent(vid.url)}&apikey=srohX8`
    let downloadRes = await fetch(downloadUrl)
    let downloadJson = await downloadRes.json()
    
    if (!downloadJson.status || !downloadJson.data || !downloadJson.data.nowm) {
      // Si falla la nueva API, intentamos con la URL original
      downloadUrl = vid.url
    } else {
      downloadUrl = downloadJson.data.nowm // URL sin marca de agua
    }

    let caption = `📎 *Título:* ${vid.title || 'Sin título'}\n\n` +
                  `👤 *Autor:* ${vid.author || 'Desconocido'}\n` +
                  `👀 *Vistas:* ${vid.views ? vid.views.toLocaleString() : 'N/A'}\n` +
                  `🔗 *URL:* ${vid.url}`

    // Enviamos el video
    await conn.sendMessage(m.chat, {
      video: { url: downloadUrl },
      caption: caption,
      fileName: `tiktok_${Date.now()}.mp4`,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (error) {
    console.error('Error en TikTok downloader:', error)
    return m.reply('❌ Error al descargar el video de TikTok. Intenta de nuevo.')
  }
}

handler.help = ['tiktokvid']
handler.tags = ['downloader']
handler.command = ['tiktokvid', 'playtiktok']
handler.register = true
export default handler