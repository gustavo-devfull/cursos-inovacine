import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationDropdown() {
  const { currentUser, isAdmin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return

    const notificationsRef = collection(db, 'notifications')
    
    // Query diferente para admin e usuário comum
    let q
    if (isAdmin) {
      // Admin vê notificações de mensagens de alunos
      q = query(
        notificationsRef,
        where('isAdminNotification', '==', true),
        orderBy('timestamp', 'desc')
      )
    } else {
      // Usuário vê notificações de respostas do instrutor
      q = query(
        notificationsRef,
        where('targetUserId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      )
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = []
      let unread = 0
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() }
        notificationsData.push(data)
        if (!data.read) {
          unread++
        }
      })
      setNotifications(notificationsData)
      setUnreadCount(unread)
    }, (error) => {
      // Se houver erro de índice, tentar query mais simples
      if (error.code === 'failed-precondition') {
        const simpleQ = query(notificationsRef, orderBy('timestamp', 'desc'))
        const simpleUnsubscribe = onSnapshot(simpleQ, (snapshot) => {
          const notificationsData = []
          let unread = 0
          snapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() }
            // Filtrar no cliente
            if (isAdmin) {
              if (data.isAdminNotification === true) {
                notificationsData.push(data)
                if (!data.read) unread++
              }
            } else {
              if (data.targetUserId === currentUser.uid) {
                notificationsData.push(data)
                if (!data.read) unread++
              }
            }
          })
          setNotifications(notificationsData)
          setUnreadCount(unread)
        })
        return () => simpleUnsubscribe()
      }
    })

    return () => unsubscribe()
  }, [currentUser, isAdmin])

  async function toggleRead(notificationId, currentReadStatus) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: !currentReadStatus
      })
    } catch (error) {
      // Error handling
    }
  }

  function handleNotificationClick(notification) {
    navigate(`/curso/${notification.courseId}`)
    setIsOpen(false)
  }

  function formatDateTime(timestamp) {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative">
      {/* Botão de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
        title="Notificações"
        type="button"
        aria-label="Notificações"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-gradient-to-r from-[#ED145B] to-[#b71646] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Notificações {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    try {
                      const notificationsRef = collection(db, 'notifications')
                      let q
                      if (isAdmin) {
                        q = query(
                          notificationsRef, 
                          where('read', '==', false),
                          where('isAdminNotification', '==', true)
                        )
                      } else {
                        q = query(
                          notificationsRef, 
                          where('read', '==', false),
                          where('targetUserId', '==', currentUser.uid)
                        )
                      }
                      
                      const snapshot = await getDocs(q)
                      
                      const promises = snapshot.docs.map(docSnapshot => {
                        return updateDoc(doc(db, 'notifications', docSnapshot.id), {
                          read: true
                        })
                      })
                      
                      await Promise.all(promises)
                    } catch (error) {
                      // Error handling
                    }
                  }}
                  className="text-sm text-primary-900 dark:text-primary-400 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {notification.courseName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {isAdmin ? (
                              <>
                                <span className="font-medium">{notification.userName}</span> enviou uma mensagem
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{notification.userName}</span> respondeu sua mensagem
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDateTime(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRead(notification.id, notification.read)
                          }}
                          className={`ml-2 p-1 rounded ${
                            notification.read
                              ? 'text-gray-400 hover:text-gray-600'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                        >
                          {notification.read ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

