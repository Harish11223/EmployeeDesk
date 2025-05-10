import { createContext, useContext, useState } from 'react';

export const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <LayoutContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);