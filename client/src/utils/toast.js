import { toast } from 'react-hot-toast';

// Standard toast durations
const DURATION = {
  SHORT: 2000,
  NORMAL: 3500,
  LONG: 5000
};

// Consistent styling for different toast types
const STYLES = {
  SUCCESS: {
    style: {
      borderRadius: '10px',
      background: '#ECFDF5',
      color: '#065F46',
    },
    icon: '✅',
  },
  ERROR: {
    style: {
      borderRadius: '10px',
      background: '#FEF2F2',
      color: '#991B1B',
    },
    icon: '❌',
  },
  WARNING: {
    style: {
      borderRadius: '10px',
      background: '#FEF3C7',
      color: '#92400E',
    },
    icon: '⚠️',
  },
  INFO: {
    style: {
      borderRadius: '10px',
      background: '#EFF6FF',
      color: '#1E40AF',
    },
    icon: 'ℹ️',
  },
};

// Custom toast functions with consistent styling
export const toastService = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: options.duration || DURATION.NORMAL,
      ...options
    });
  },
  
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: options.duration || DURATION.LONG,
      ...options
    });
  },
  
  warning: (message, options = {}) => {
    return toast(message, {
      duration: options.duration || DURATION.LONG,
      icon: STYLES.WARNING.icon,
      style: STYLES.WARNING.style,
      ...options
    });
  },
  
  info: (message, options = {}) => {
    return toast(message, {
      duration: options.duration || DURATION.NORMAL,
      icon: STYLES.INFO.icon,
      style: STYLES.INFO.style,
      ...options
    });
  },
  
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options
    });
  },
  
  custom: (message, options = {}) => {
    return toast(message, options);
  },
  
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
};

export default toastService; 