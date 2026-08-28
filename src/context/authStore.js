import { createContext } from 'react';

// Split into its own file so AuthContext.jsx can export only the
// AuthProvider component (react-refresh/only-export-components).
export const AuthContext = createContext(null);
