import { X } from "lucide-react";

interface FloatingCloseButtonProps {
  onClick: () => void;
}

const FloatingCloseButton = ({ onClick }: FloatingCloseButtonProps) => (
  <button
    onClick={onClick}
    className="fixed z-50 top-8 right-8 md:top-12 md:right-12 bg-white border border-gray-200 shadow-lg rounded-full p-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    aria-label="Close modal"
  >
    <X className="w-8 h-8" />
  </button>
);

export default FloatingCloseButton; 