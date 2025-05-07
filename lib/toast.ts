import { toast, ToastOptions } from 'react-toastify';

// Default options that can be customized
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast utility functions
export const toastSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, { ...defaultOptions, ...options });
};

export const toastError = (message: string, options?: ToastOptions) => {
  return toast.error(message, { ...defaultOptions, ...options });
};

export const toastInfo = (message: string, options?: ToastOptions) => {
  return toast.info(message, { ...defaultOptions, ...options });
};

export const toastWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, { ...defaultOptions, ...options });
}; 