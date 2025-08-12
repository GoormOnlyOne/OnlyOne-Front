import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import Toast from './Toast';

interface ToastContextType {
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'warning' | 'info'>(
    'success',
  );
  const [duration, setDuration] = useState(3000);

  const showToast = (
    msg: string,
    toastType: 'success' | 'error' | 'warning' | 'info' = 'success',
    toastDuration: number = 3000,
  ) => {
    setMessage(msg);
    setType(toastType);
    setDuration(toastDuration);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        isOpen={isOpen}
        onClose={handleClose}
        message={message}
        type={type}
        duration={duration}
        position="top"
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
