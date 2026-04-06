import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-[#7DD3FC] hover:bg-[#5BC0EB]',
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Title */}
        <h2 className="text-xl font-bold text-black mb-4">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-[#4F4F4F] text-base leading-relaxed mb-8">
          {message}
        </p>
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full border-2 border-[#EEEEEE] hover:bg-[#F8F8F8] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
