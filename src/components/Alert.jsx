import { useState, useEffect } from 'react'
import { Alert as MTAlert } from '@material-tailwind/react'

export default function Alert({ open, onClose, message, type = 'success', duration = 5000 }) {
  const [show, setShow] = useState(open)

  useEffect(() => {
    setShow(open)
  }, [open])

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        if (onClose) {
          onClose()
        }
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'amber',
    info: 'blue'
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <MTAlert
        color={colorMap[type] || 'green'}
        open={show}
        onClose={() => {
          setShow(false)
          if (onClose) {
            onClose()
          }
        }}
        animate={{
          mount: { y: 0 },
          unmount: { y: 100 },
        }}
      >
        {message}
      </MTAlert>
    </div>
  )
}

