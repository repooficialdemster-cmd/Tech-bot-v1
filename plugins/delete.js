var handler = async (m, { conn, quoted }) => {
  if (m.text !== '.delete') return
  
  // Verificar que hay un mensaje respondido
  if (!quoted) return
  
  // Verificar que el mensaje NO es del bot ni tuyo
  // (solo borrar mensajes de otras personas)
  const isNotMyMessage = !quoted.fromMe && quoted.sender !== m.sender
  
  if (isNotMyMessage) {
    try {
      // Borrar el mensaje de la otra persona
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: quoted.id,
          participant: quoted.participant || quoted.sender
        }
      })
    } catch (e) {
      // Error silenciado
    }
  }
  
  // Fin - no hacer nada más
}

handler.command = ['delete']
export default handler