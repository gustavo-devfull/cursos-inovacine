
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
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
            style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`text-white transition-all ${
              confirmColor === 'red' 
                ? 'bg-gradient-to-r from-[#ED145B] to-[#b71646] hover:from-[#f2437a] hover:to-[#ED145B]'
                : 'bg-gradient-to-r from-[#123F6D] to-[#0d2f4f] hover:from-[#255086] hover:to-[#123F6D]'
            }`}
            style={{ borderRadius: '60px', fontSize: '16px', fontWeight: 500, border: 'none', padding: '10px 20px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

