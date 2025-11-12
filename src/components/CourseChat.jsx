import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, getDoc, doc, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { createNotification, createUserNotification } from '../services/notificationService'

const ADMIN_EMAIL = 'gutopc@gmail.com'

export default function CourseChat({ courseId }) {
  const { currentUser, userData, isAdmin } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const isInstructor = isAdmin || currentUser?.email === ADMIN_EMAIL

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carregar mensagens em tempo real
  useEffect(() => {
    if (!courseId || !currentUser) return

    const messagesRef = collection(db, 'courses', courseId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = []
      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() }
        
        // Se for instrutor, mostrar todas as mensagens
        if (isInstructor) {
          messagesData.push(messageData)
        } else {
          // Se for aluno, mostrar apenas:
          // 1. Suas próprias mensagens
          // 2. Mensagens do instrutor que são especificamente para ele (targetUserId === currentUser.uid)
          // 3. Mensagens do instrutor sem targetUserId (mensagens gerais, se houver)
          if (messageData.senderId === currentUser.uid) {
            messagesData.push(messageData)
          } else if (messageData.isInstructor) {
            // Mostrar apenas se for para este aluno ou se não tiver destinatário específico
            if (!messageData.targetUserId || messageData.targetUserId === currentUser.uid) {
              messagesData.push(messageData)
            }
          }
        }
      })
      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [courseId, currentUser, isInstructor])

  // Enviar mensagem
  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    try {
      setSending(true)
      const messagesRef = collection(db, 'courses', courseId, 'messages')
      
      // Se for instrutor, identificar para qual aluno é a resposta
      let targetUserId = null
      if (isInstructor) {
        // Buscar a última mensagem de aluno antes de enviar a resposta
        try {
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(20))
          const messagesSnapshot = await getDocs(messagesQuery)
          
          for (const msgDoc of messagesSnapshot.docs) {
            const msgData = msgDoc.data()
            // Encontrar a primeira mensagem de aluno (não instrutor)
            if (!msgData.isInstructor && msgData.senderId !== currentUser.uid) {
              targetUserId = msgData.senderId
              break
            }
          }
        } catch (error) {
          // Error finding target user
        }
      }

      const messageDoc = await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: userData?.fullName || userData?.name || 'Usuário',
        senderEmail: currentUser.email,
        isInstructor: isInstructor,
        timestamp: Timestamp.now(),
        courseId: courseId,
        targetUserId: targetUserId // null para mensagens gerais ou quando aluno envia
      })

      // Criar notificação apenas se não for instrutor (para admin)
      if (!isInstructor) {
        try {
          const courseDoc = await getDoc(doc(db, 'courses', courseId))
          const courseName = courseDoc.exists() ? courseDoc.data().title : 'Curso'
          await createNotification(
            courseId,
            courseName,
            currentUser.uid,
            userData?.fullName || userData?.name || 'Usuário',
            messageDoc.id,
            newMessage.trim()
          )
        } catch (error) {
          // Error creating notification
        }
      } else {
        // Se for instrutor, criar notificação apenas para o último aluno que enviou mensagem
        // (antes da resposta do instrutor)
        try {
          const messagesRef = collection(db, 'courses', courseId, 'messages')
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(20))
          const messagesSnapshot = await getDocs(messagesQuery)
          
          // Encontrar a última mensagem de um aluno (não instrutor) antes da resposta do instrutor
          let lastStudentMessage = null
          
          for (const msgDoc of messagesSnapshot.docs) {
            const msgData = msgDoc.data()
            
            // Se a mensagem for do próprio instrutor (pode ser a que acabamos de enviar ou outra anterior)
            // continuar procurando
            if (msgData.isInstructor || msgData.senderId === currentUser.uid) {
              continue
            }
            
            // Encontrar a primeira mensagem de aluno (não instrutor) que não seja do instrutor
            // Esta será a última mensagem de aluno antes da resposta do instrutor
            lastStudentMessage = {
              userId: msgData.senderId,
              userName: msgData.senderName || 'Aluno'
            }
            break // Encontrou o último aluno que enviou mensagem, parar
          }
          
          // Criar notificação apenas para esse aluno específico
          if (lastStudentMessage) {
            const courseDoc = await getDoc(doc(db, 'courses', courseId))
            const courseName = courseDoc.exists() ? courseDoc.data().title : 'Curso'
            const instructorName = userData?.fullName || userData?.name || 'Instrutor'
            
            await createUserNotification(
              courseId,
              courseName,
              lastStudentMessage.userId,
              instructorName,
              messageDoc.id,
              newMessage.trim()
            )
          }
        } catch (error) {
          // Error creating notification
        }
      }

      setNewMessage('')
    } catch (error) {
      // Error handling
    } finally {
      setSending(false)
    }
  }

  // Formatar data/hora
  function formatTimestamp(timestamp) {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        {isInstructor ? 'Conversa com Alunos' : 'Conversa com Instrutor'}
      </h2>
      
      {/* Área de mensagens */}
      <div 
        ref={chatContainerRef}
        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 h-96 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.uid
              const isInstructorMessage = message.isInstructor

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  {/* Nome do remetente acima do box */}
                  <p 
                    className={`text-sm mb-1 px-2 ${
                      isOwnMessage 
                        ? 'text-gray-600 dark:text-gray-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    style={{ fontSize: '14px' }}
                  >
                    {isOwnMessage 
                      ? (isInstructorMessage ? '👨‍🏫 Instrutor' : 'Você')
                      : (isInstructorMessage ? '👨‍🏫 Instrutor' : message.senderName)
                    }
                  </p>
                  
                  {/* Box da mensagem */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? isInstructorMessage
                          ? 'bg-gradient-to-r from-[#123F6D] to-[#0d2f4f] text-white'
                          : 'bg-gradient-to-r from-[#ED145B] to-[#b71646] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Formulário de envio */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isInstructor ? "Digite sua mensagem para os alunos..." : "Digite sua mensagem para o instrutor..."}
          className="flex-1 input-field"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-gradient-to-r from-[#ED145B] to-[#b71646] hover:from-[#f2437a] hover:to-[#ED145B] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}

