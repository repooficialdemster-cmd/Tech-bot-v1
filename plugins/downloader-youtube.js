import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

// === Archivos JSON para premium/limites ===
const premiumFile = './json/premium.json'
const limitsFile = './json/limits.json'

if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, JSON.stringify([]))
if (!fs.existsSync(limitsFile)) fs.writeFileSync(limitsFile, JSON.stringify({}))

// === PREMIUM CHECK ===
function isBotPremium(conn) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile))
    let botId = conn?.user?.id?.split(':')[0]?.replace(/\D/g, '')
    return data.includes(botId)
  } catch {
    return false
  }
}

// === LIMITES ===
function checkLimit(conn) {
  const botId = conn?.user?.id?.split(':')[0]?.replace(/\D/g, '')
  if (!botId) return { allowed: false, remaining: 0 }

  let limits = JSON.parse(fs.readFileSync(limitsFile, 'utf-8'))
  let now = Date.now()

  if (!limits[botId]) {
    limits[botId] = { count: 0, resetAt: now + 5 * 60 * 60 * 1000 } // 5h
  }

  if (now > limits[botId].resetAt) {
    limits[botId] = { count: 0, resetAt: now + 5 * 60 * 60 * 1000 }
  }

  if (limits[botId].count < 10) {
    limits[botId].count++
    fs.writeFileSync(limitsFile, JSON.stringify(limits, null, 2))
    return { allowed: true, remaining: 10 - limits[botId].count, resetAt: limits[botId].resetAt }
  } else {
    return { allowed: false, remaining: 0, resetAt: limits[botId].resetAt }
  }
}

// === HANDLER PRINCIPAL ===
let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`✳️ *Uso correcto:*\n${usedPrefix + command} <enlace o nombre>`)

  try {
    await m.react('⏳')

    // Premium/Límites
    let premium = isBotPremium(conn)
    if (!premium) {
      let check = checkLimit(conn)
      if (!check.allowed) {
        let mins = Math.ceil((check.resetAt - Date.now()) / 60000)
        return m.reply(`⛔ Este bot no es Premium.\n\nHas alcanzado el límite de *10 descargas*.\n⌛ Intenta de nuevo en *${mins} minutos*.`)
      }
    }

    // Buscamos video
    let url = args[0]
    let videoInfo = null

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      let search = await yts(args.join(' '))
      if (!search.videos || search.videos.length === 0) {
        await conn.sendMessage(m.chat, { text: '⚠️ No se encontraron resultados.' }, { quoted: m })
        return
      }
      videoInfo = search.videos[0]
      url = videoInfo.url
    } else {
      let id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      let search = await yts({ videoId: id })
      if (search && search.title) videoInfo = search
    }

    if (!videoInfo) return m.reply('❌ No se pudo obtener información del video.')
    if (videoInfo.seconds > 600) {
      return m.reply(`❌ El video supera el límite de *10 minutos*.\nDuración: ${videoInfo.timestamp}`)
    }

    let isAudio = (command == 'play' || command == 'ytmp3')

    // 🔑 Usar la API de neoxr en vez de la antigua
    let apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=${isAudio ? 'audio' : 'video'}&quality=${isAudio ? '128kbps' : '360p'}&apikey=russellxz`

    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al conectar con la API.')
    let json = await res.json()
    if (!json.status || !json.data?.url) throw new Error('No se pudo obtener descarga.')

    let { url: download } = json.data

    // Mensaje de preview
    let details = `╭➤ *${videoInfo.title}*
┃
┃ ⏱️ Duración: *${videoInfo.timestamp}*
┃ 👤 Autor: *${videoInfo.author?.name || 'Desconocido'}*
┃ 👁️ Vistas: *${videoInfo.views.toLocaleString()}*
┃
┃ ❇️ Formato: *${isAudio ? 'Audio' : 'Video'}*
┃ 📌 Fuente: *YouTube*
╰━━━━━━━━━━━━━━━━━━`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: videoInfo.thumbnail },
      caption: details
    }, { quoted: m })

if (isAudio) {
  await conn.sendMessage(m.chat, {
    audio: { url: download },
    mimetype: videoInfo.mimetype || 'audio/mp4', // usa el que viene o fallback
    fileName: `${videoInfo.title}.${videoInfo.ext || 'm4a'}`,
    ptt: true
  }, { quoted: m })
} else {
  await conn.sendMessage(m.chat, {
    video: { url: download },
    mimetype: 'video/mp4',
    fileName: `${videoInfo.title}.mp4`
  }, { quoted: m })
}
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: '❌ Se produjo un error al procesar la solicitud.'
    }, { quoted: m })
  }
}

handler.help = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.tags = ['downloader']
handler.command = ['play', 'play2', 'ytmp3', 'ytmp4']

export default handler
