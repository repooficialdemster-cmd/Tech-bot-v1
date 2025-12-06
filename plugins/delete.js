var handler = async (m, { conn, quoted }) => {
  
  // Solo reacciona a .delete exacto
  if (m.text === '.delete') {
    // SOLO BORRAR - SIN MENSAJES, SIN VERIFICACIONES
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
        
        // Reacción silenciosa ✅
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
        // ERROR SILENCIOSO - NO DECIR NADA
        // No envía mensaje de error
      }
    }
    
    // FIN - NO ENVIAR NINGÚN MENSAJE DE TEXTO
    return
  }
}

// Configuración mínima
handler.command = ['delete']
handler.group = true
export default handler