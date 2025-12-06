var handler = async (m, { conn, quoted }) => {
  
  if (m.text === '.delete') {
    // Borrar inmediatamente el mensaje .delete del usuario
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.id,
          participant: m.sender
        }
      })
    } catch (error) {
      // Si falla al borrar el comando, no importa
    }
    
    // Si hay mensaje respondido, borrarlo también
    if (quoted) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: quoted.fromMe || false,
            id: quoted.id,
            participant: quoted.participant || quoted.sender
          }
        })
      } catch (error) {
        // Si no puede borrar, no hace nada
      }
    }
    
    return // No envía ningún mensaje, solo borra
  }
}

handler.help = ['delete']
handler.tags = ['tools']
handler.command = ['delete', 'borrar', 'del']

export default handler