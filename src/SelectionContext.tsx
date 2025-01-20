import React, { createContext, useContext, useState } from "react";

export interface SelectionContextType {
  selections: number[];
  cellColors: { [key: number]: string };
  cellMetadata: { [key: number]: string };
  updateSelections: (
    newSelections: number[],
    newColors: { [key: number]: string },
    newMetadata: { [key: number]: string }
  ) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

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
