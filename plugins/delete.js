var handler = async (m, { conn, quoted, isAdmin, isOwner, isROwner }) => {
  
  if (m.text === '.delete') {
    const chatId = m.chat
    const senderId = m.sender
    const isGroup = chatId.endsWith('@g.us')
    
    // Verificar que es grupo
    if (!isGroup) {
      return await conn.reply(m.chat,
        '❌ Este comando solo puede usarse en grupos.',
        m
      )
    }
    
    // Verificar permisos
    const isFromMe = m.fromMe || false
    const userIsAdmin = isAdmin || false
    const userIsOwner = isOwner || isROwner || false
    
    if (!userIsAdmin && !userIsOwner && !isFromMe) {
      return await conn.reply(m.chat,
        '🚫 Solo los administradores del grupo o el owner pueden usar este comando.',
        m
      )
    }
    
    // Verificar que hay mensaje respondido
    if (!quoted) {
      return await conn.reply(m.chat,
        '⚠️ Responde a un mensaje para eliminarlo usando .delete',
        m
      )
    }
    
    try {
      // Borrar el mensaje respondido
      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: quoted.fromMe || false,
          id: quoted.id,
          participant: quoted.participant || quoted.sender
        }
      })
      
      // Reacción ✅
      await conn.sendMessage(chatId, {
        react: {
          text: '✅',
          key: m.key
        }
      })
      
    } catch (error) {
      console.error('❌ Error eliminando mensaje:', error)
      await conn.reply(m.chat,
        '❌ Error al intentar eliminar el mensaje.',
        m
      )
    }
    
    return
  }
}

handler.help = ['delete (responder)']
handler.tags = ['group']
handler.command = ['delete', 'del']
handler.group = true
handler.admin = true

export default handler