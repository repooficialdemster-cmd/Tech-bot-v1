var handler = async (m, { conn, quoted }) => {
  
  if (m.text === '.delete') {
    // SOLO BORRAR EL MENSAJE RESPONDIDO
    if (quoted) {
      try {
        // Borrar el mensaje respondido
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: quoted.fromMe || false,
            id: quoted.id,
            participant: quoted.participant || quoted.sender
          }
        })
      } catch (error) {
        // Silencio total, no hacer nada si falla
      }
    }
    
    // NO BORRAR EL .delete, NO DECIR NADA, SOLO BORRAR EL RESPONDIDO
    return // Fin, sin mensajes, sin reacciones, sin nada
  }
}

handler.command = ['delete']
export default handler