import React, { createContext, useContext } from 'react';
import { useShellStore } from '@/stores/shellStore';

// We could just use the store directly, but a context is nice for isolating the shell logic
// in case we need to pass down more dependencies.
const DesktopContext = createContext(null);

export const DesktopProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <DesktopContext.Provider value={null}>
      {children}
    </DesktopContext.Provider>
  )
}
