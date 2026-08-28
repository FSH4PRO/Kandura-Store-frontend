import { createContext } from 'react';

// Split into its own file so ToastContext.jsx can export only the
// ToastProvider component (react-refresh/only-export-components).
export const ToastContext = createContext(null);
