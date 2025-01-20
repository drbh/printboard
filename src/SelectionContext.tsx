import React, { createContext, useContext, useState } from "react";

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [selections, setSelections] = useState([]);
  const [cellColors, setCellColors] = useState({});
  const [cellMetadata, setCellMetadata] = useState({});

  const updateSelections = (newSelections, newColors, newMetadata) => {
    setSelections(newSelections);
    setCellColors(newColors);
    setCellMetadata(newMetadata);
  };

  return (
    <SelectionContext.Provider
      value={{ selections, cellColors, cellMetadata, updateSelections }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};

export default SelectionContext;
