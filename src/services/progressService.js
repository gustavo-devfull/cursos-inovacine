import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Marca uma aula como assistida
 */
export async function markLessonAsWatched(userId, courseId, lessonIndex) {
  try {
    const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`)
    const progressDoc = await getDoc(progressRef)
    
    if (progressDoc.exists()) {
      // Atualizar documento existente
      const data = progressDoc.data()
      const watchedLessons = data.watchedLessons || []
      
      if (!watchedLessons.includes(lessonIndex)) {
        await updateDoc(progressRef, {
          watchedLessons: arrayUnion(lessonIndex),
          lastWatched: lessonIndex,
          updatedAt: new Date().toISOString()
        })
      }
    } else {
      // Criar novo documento
      await setDoc(progressRef, {
        userId,
        courseId,
        watchedLessons: [lessonIndex],
        lastWatched: lessonIndex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    return true
  } catch (error) {
    throw error
  }
}

/**
 * Verifica se uma aula foi assistida
 */
export async function isLessonWatched(userId, courseId, lessonIndex) {
  try {
    const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`)
    const progressDoc = await getDoc(progressRef)
    
    if (progressDoc.exists()) {
      const watchedLessons = progressDoc.data().watchedLessons || []
      return watchedLessons.includes(lessonIndex)
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Obtém todas as aulas assistidas de um curso
 */
export async function getWatchedLessons(userId, courseId) {
  try {
    const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`)
    const progressDoc = await getDoc(progressRef)
    
    if (progressDoc.exists()) {
      return progressDoc.data().watchedLessons || []
    }
    
    return []
  } catch (error) {
    return []
  }
}

/**
 * Obtém o progresso completo do usuário em um curso
 */
export async function getCourseProgress(userId, courseId) {
  try {
    const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`)
    const progressDoc = await getDoc(progressRef)
    
    if (progressDoc.exists()) {
      return progressDoc.data()
    }
    
    return {
      watchedLessons: [],
      lastWatched: null
    }
  } catch (error) {
    return {
      watchedLessons: [],
      lastWatched: null
    }
  }
}

