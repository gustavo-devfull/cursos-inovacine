import { collection, addDoc, query, where, getDocs, updateDoc, doc, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const ADMIN_EMAIL = 'gutopc@gmail.com'

/**
 * Criar notificação quando um aluno envia mensagem (para admin)
 */
export async function createNotification(courseId, courseName, userId, userName, messageId, messageText) {
  try {
    const notificationsRef = collection(db, 'notifications')
    await addDoc(notificationsRef, {
      courseId,
      courseName,
      userId,
      userName,
      messageId,
      messageText,
      read: false,
      timestamp: Timestamp.now(),
      type: 'message',
      targetUserId: null, // null = admin
      isAdminNotification: true
    })
  } catch (error) {
    // Error handling
  }
}

/**
 * Criar notificação quando instrutor responde mensagem (para usuário)
 */
export async function createUserNotification(courseId, courseName, targetUserId, instructorName, messageId, messageText) {
  try {
    const notificationsRef = collection(db, 'notifications')
    await addDoc(notificationsRef, {
      courseId,
      courseName,
      userId: targetUserId,
      userName: instructorName,
      messageId,
      messageText,
      read: false,
      timestamp: Timestamp.now(),
      type: 'instructor_reply',
      targetUserId: targetUserId,
      isAdminNotification: false
    })
  } catch (error) {
    // Error handling
  }
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true
    })
  } catch (error) {
    // Error handling
  }
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead() {
  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(notificationsRef, where('read', '==', false))
    const querySnapshot = await getDocs(q)
    
    const promises = querySnapshot.docs.map(docSnapshot => {
      return updateDoc(doc(db, 'notifications', docSnapshot.id), {
        read: true
      })
    })
    
    await Promise.all(promises)
  } catch (error) {
    // Error handling
  }
}

/**
 * Contar notificações não lidas para admin
 */
export async function getUnreadCount() {
  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(notificationsRef, where('read', '==', false), where('isAdminNotification', '==', true))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    return 0
  }
}

/**
 * Contar notificações não lidas para um usuário específico
 */
export async function getUserUnreadCount(userId) {
  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef, 
      where('read', '==', false), 
      where('targetUserId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    return 0
  }
}

