import React, { createContext, useState } from 'react';

export const SelectedNurseryContext = createContext();

const SelectedNurseryProvider = ({ children }) => {
  const [selectedNurseryUuid, setSelectedNurseryUuid] = useState(null);

  return (
    <SelectedNurseryContext.Provider
      value={{ selectedNurseryUuid, setSelectedNurseryUuid }}
    >
      {children}
    </SelectedNurseryContext.Provider>
  );
};

export default SelectedNurseryProvider;
