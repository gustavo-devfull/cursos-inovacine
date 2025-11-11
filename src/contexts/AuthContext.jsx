import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

// Email do administrador
const ADMIN_EMAIL = 'gutopc@gmail.com'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Verificar se é administrador
    const adminStatus = email === ADMIN_EMAIL
    
    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      enrolledCourses: [],
      isAdmin: adminStatus,
      createdAt: new Date().toISOString()
    })
    
    return userCredential
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  async function refreshUserData() {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          const adminStatus = currentUser.email === ADMIN_EMAIL
          setIsAdmin(data.isAdmin !== undefined ? data.isAdmin : adminStatus)
        }
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error)
      }
    }
  }

  useEffect(() => {
    let unsubscribeUserData = null
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      
      // Limpar listener anterior se existir
      if (unsubscribeUserData) {
        unsubscribeUserData()
        unsubscribeUserData = null
      }
      
      if (user) {
        // Verificar se é administrador pelo email
        const adminStatus = user.email === ADMIN_EMAIL
        
        // Usar onSnapshot para escutar mudanças em tempo real
        unsubscribeUserData = onSnapshot(
          doc(db, 'users', user.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data()
              setUserData(data)
              // Usar isAdmin do Firestore se existir, senão usar verificação por email
              setIsAdmin(data.isAdmin !== undefined ? data.isAdmin : adminStatus)
            } else {
              // Se não existe documento, verificar apenas por email
              setIsAdmin(adminStatus)
            }
            setLoading(false)
          },
          (error) => {
            console.error('Erro ao escutar dados do usuário:', error)
            setLoading(false)
          }
        )
      } else {
        setUserData(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeUserData) {
        unsubscribeUserData()
      }
    }
  }, [])

  const value = {
    currentUser,
    userData,
    isAdmin,
    signup,
    login,
    logout,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

