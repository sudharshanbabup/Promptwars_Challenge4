import React, { createContext, useState, useContext } from 'react';

const RoleContext = createContext(null);

/**
 * Context Provider for current user role within stadium operations.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export function RoleProvider({ children }) {
  const [role, setRole] = useState('fan'); // Default role is 'fan'

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access the RoleContext value.
 * 
 * @returns {{ role: string, setRole: (r: string) => void }}
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
