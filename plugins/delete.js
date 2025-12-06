var handler = async (m, { conn, quoted }) => {
  
  if (m.text === '.delete') {
    try {
      // Verificar si hay un mensaje respondido
      if (!quoted) {
        m.react('❓')
        return await conn.reply(m.chat,
          `❓ *Uso correcto:*\n\n` +
          `Responde a un mensaje con .delete para eliminarlo.\n\n` +
          `*Ejemplo:*\n` +
          `1. Responde a un mensaje\n` +
          `2. Escribe .delete\n` +
          `3. El mensaje será eliminado`,
          m
        )
      }
      
      // Verificar permisos (solo admin/owner puede borrar)
      const isGroup = m.chat.endsWith('@g.us')
      let canDelete = false
      
      if (isGroup) {
        // En grupo, verificar si es admin o el que envió el mensaje
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants
        const sender = m.sender
        const quotedSender = quoted.sender || quoted.participant
        
        // Es admin del grupo?
        const isAdmin = participants.find(p => 
          p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        
        // Es el que envió el mensaje?
        const isSender = sender === quotedSender
        
        canDelete = isAdmin || isSender
        
      } else {
        // En chat privado, siempre puede borrar
        canDelete = true
      }
      
      if (!canDelete) {
        m.react('❌')
        return await conn.reply(m.chat,
          `❌ *Permiso denegado*\n\n` +
          `Solo puedes borrar:\n` +
          `• Tus propios mensajes\n` +
          `• Mensajes si eres admin del grupo\n\n` +
          `_No tienes permisos para borrar este mensaje._`,
          m
        )
      }
      
      // Reaccionar al mensaje original del usuario
      m.react('✅')
      
      // Borrar el mensaje respondido
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: quoted.fromMe || false,
          id: quoted.id,
          participant: quoted.participant || quoted.sender
        }
      })
      
      // Opcional: Enviar confirmación (solo al usuario que ejecutó el comando)
      await conn.sendMessage(m.sender, {
        text: `✅ *Mensaje eliminado*\n\n` +
              `El mensaje ha sido borrado correctamente.\n` +
              `Chat: ${m.chat}`
      })
      
      // Borrar el comando .delete también (opcional)
      setTimeout(async () => {
        try {
          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: true,
              id: m.id
            }
          })
        } catch (e) {
          // Ignorar si no se puede borrar
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error borrando mensaje:', error)
      m.react('❌')
      await conn.reply(m.chat,
        `❌ *Error al borrar*\n\n` +
        `No se pudo eliminar el mensaje.\n` +
        `Posibles causas:\n` +
        `• El mensaje es muy antiguo\n` +
        `• No tengo permisos\n` +
        `• Error técnico`,
        m
      )
    }
    
    return
  }
}

handler.help = ['delete (responder)']
handler.tags = ['tools']
handler.command = ['delete', 'del', 'eliminar', 'borrar']

export default handler