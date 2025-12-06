var handler = async (m, { conn, quoted }) => {
  
  // Solo funciona con .delete exacto
  if (m.text === '.delete') {
    // Si no hay mensaje respondido, NO DECIR NADA
    if (!quoted) {
      // Solo retorna, no envía mensaje
      return
    }
    
    try {
      // BORRAR EL MENSAJE RESPONDIDO
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: quoted.fromMe || false,
          id: quoted.id,
          participant: quoted.participant || quoted.sender
        }
      })
      
      // Reacción opcional (solo si quieres)
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '✅',
            key: m.key
          }
        })
      } catch (e) {
        // Si no puede reaccionar, no importa
      }
      
    } catch (error) {
      // Si falla, NO DECIR NADA
      console.log('Error borrando:', error.message)
    }
    
    // FIN - NO ENVIAR MENSAJES
    return
  }
}

handler.command = ['delete']
export default handler