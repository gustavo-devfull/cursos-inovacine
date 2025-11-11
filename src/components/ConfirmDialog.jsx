import { Dialog, Button } from '@material-tailwind/react'

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'red'
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full z-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="text"
            onClick={onClose}
            className="text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onClick={handleConfirm}
            className="bg-primary-900 hover:bg-primary-800"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

