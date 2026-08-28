import { createContext } from 'react';

// Split into its own file so NotificationContext.jsx can export only the
// NotificationProvider component (react-refresh/only-export-components),
// same pattern as authStore.js / toastStore.js.
export const NotificationContext = createContext(null);
