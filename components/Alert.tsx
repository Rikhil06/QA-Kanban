import { useEffect } from 'react';

type YesNoAlertProps = {
  message: string;
  onYes: () => void;
  onNo: () => void;
  isOpen: boolean;
};

export default function YesNoAlert({ message, onYes, onNo, isOpen }: YesNoAlertProps) {
  // Handle keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onYes();
      if (e.key === 'Escape') onNo();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onYes, onNo]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
        <p className="text-md text-gray-800 font-semibold">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="bg-[#6C5CE7] px-3 py-2 rounded-xl text-white font-semibold transition cursor-pointer"
            onClick={onYes}
          >
            Yes
          </button>
          <button
            className="bg-[#22202e] px-3 py-2 rounded-xl text-white font-semibold transition cursor-pointer"
            onClick={onNo}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  return content;
}
