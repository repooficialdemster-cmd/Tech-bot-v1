var handler = async (m, { conn, quoted }) => {
  
  if (m.text === '.delete') {
    // Solo borrar el mensaje de la otra persona a la que respondes
    if (quoted && !quoted.fromMe) {
      try {
        // Borrar SOLO el mensaje de la otra persona
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false, // Mensaje NO es del bot
            id: quoted.id,
            participant: quoted.participant || quoted.sender
          }
        })
      } catch (error) {
        // Silencio absoluto si falla
      }
    }
    
    // NO hacer nada más, NO borrar tu .delete, NO decir nada
    return
  }
}

handler.command = ['delete']
export default handler