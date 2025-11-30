let handler = async (m, { conn, usedPrefix, command }) => {

    try {
        m.reply('「❀」 Reiniciando El Bot....')
        setTimeout(() => {
            process.exit(0)
        }, 3000) 
    } catch (error) {
        console.log(error)
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.help = ['rest']
handler.tags = ['owner']
handler.command = ['rest', 'rest'] 
handler.rowner = true

export default handler