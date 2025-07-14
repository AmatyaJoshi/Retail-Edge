interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-gray-200 dark:border-gray-600"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-4 text-lg font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 