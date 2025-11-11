import { createContext, useContext, useState, useCallback } from 'react'
import Alert from '../components/Alert'

const AlertContext = createContext()

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    type: 'success'
  })

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({
      open: true,
      message,
      type
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert(prev => ({
      ...prev,
      open: false
    }))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Alert
        open={alert.open}
        onClose={hideAlert}
        message={alert.message}
        type={alert.type}
      />
    </AlertContext.Provider>
  )
}

