import React, { useState, useEffect, useRef } from "react";
import { useSelection } from "./SelectionContext";
import { defaultColorOptions } from "./constants";

const Spreadsheet = ({ rows = 20, cols = 20 }) => {
  const [selections, setSelections] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [colorModal, setColorModal] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [cellColors, setCellColors] = useState({});
  const [cellMetadata, setCellMetadata] = useState({});
  const [color, setColor] = useState("#ffffff");
  const [userMode, setUserMode] = useState("#");

  const { updateSelections } = useSelection();
  const spreadsheetRef = useRef(null);
  const overlayRef = useRef(null);

  const menuButtons = [
    {
      character: "#",
      name: "Border",
      description: "Border of the board",
      short_name: "B",
    },
    {
      character: "━",
      name: "Horizontal",
      description: "Horizontal line",
      short_name: "H",
    },
    {
      character: "┃",
      name: "Vertical",
      description: "Vertical line",
      short_name: "V",
    },
    {
      character: "┏",
      name: "Top Left",
      description: "Top left corner",
      short_name: "TL",
    },
    {
      character: "┓",
      name: "Top Right",
      description: "Top right corner",
      short_name: "TR",
    },
    {
      character: "┛",
      name: "Bottom Right",
      description: "Bottom right corner",
      short_name: "BR",
    },
    {
      character: "┗",
      name: "Bottom Left",
      description: "Bottom left corner",
      short_name: "BL",
    },
    {
      character: "┣",
      name: "T Down",
      description: "T down intersection",
      short_name: "TD",
    },
    {
      character: "┫",
      name: "T Up",
      description: "T up intersection",
      short_name: "TU",
    },
    {
      character: "┳",
      name: "T Left",
      description: "T left intersection",
      short_name: "TL",
    },
    {
      character: "┻",
      name: "T Right",
      description: "T right intersection",
      short_name: "TR",
    },
    {
      character: "╋",
      name: "Cross",
      description: "Cross intersection",
      short_name: "X",
    },
    {
      character: "╸",
      name: "Vertical Left",
      description: "Vertical left intersection",
      short_name: "VL",
    },
    {
      character: "╺",
      name: "Vertical Right",
      description: "Vertical right intersection",
      short_name: "VR",
    },
    {
      character: "╹",
      name: "Horizontal Up",
      description: "Horizontal up intersection",
      short_name: "HU",
    },
    {
      character: "╻",
      name: "Horizontal Down",
      description: "Horizontal down intersection",
      short_name: "HD",
    },
  ];

  const updateAppSelections = () => {
    const newSelections = selections.map((selection) => {
      const bounds = getSelectionBounds(selection);
      if (!bounds) return selection;

      let _newSelections = [];
      let _newColors = {};
      for (let i = bounds.minRow; i <= bounds.maxRow; i++) {
        for (let j = bounds.minCol; j <= bounds.maxCol; j++) {
          _newSelections.push({ row: i, col: j });
          // _newColors[`${i},${j}`] = color;
        }
      }

      return _newSelections;
    });

    // flatten the array
    let finalSelections = [].concat.apply([], newSelections);

    updateSelections(finalSelections, cellColors, cellMetadata);
  };

  const getCell = (row, col) => {
    return spreadsheetRef.current?.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
  };

  const getSelectionBounds = (selection) => {
    if (!selection) return null;
    return {
      minRow: Math.min(selection.start.row, selection.end.row),
      maxRow: Math.max(selection.start.row, selection.end.row),
      minCol: Math.min(selection.start.col, selection.end.col),
      maxCol: Math.max(selection.start.col, selection.end.col),
    };
  };

  const getCellFromEvent = (e) => {
    let element;
    if (e.type.startsWith("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      element = document.elementFromPoint(touch.clientX, touch.clientY);
    } else {
      element = e.target;
    }
    const cell = element.closest("[data-row]");
    if (!cell) return null;

    return {
      row: parseInt(cell.dataset.row),
      col: parseInt(cell.dataset.col),
    };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    setIsSelecting(true);
    setStartCell(cell);
    setCurrentSelection({
      start: cell,
      end: cell,
      color: color,
    });
  };

  const handleMove = (e) => {
    if (!isSelecting) return;
    e.preventDefault();

    const cell = getCellFromEvent(e);
    if (!cell) return;

    setCurrentSelection((prev) => ({
      ...prev,
      end: cell,
    }));
  };

  const handleEnd = (e) => {
    e.preventDefault();
    if (isSelecting && currentSelection) {
      const bounds = getSelectionBounds(currentSelection);

      // if currentSelection is already in selections, remove it
      // console.log("🔴", currentSelection);

      const exists = selections.some((selection) => {
        const _bounds = getSelectionBounds(selection);
        return (
          _bounds.minRow === bounds.minRow &&
          _bounds.maxRow === bounds.maxRow &&
          _bounds.minCol === bounds.minCol &&
          _bounds.maxCol === bounds.maxCol
        );
      });

      // console.log("🟢", exists);

      if (bounds) {
        const newColors = { ...cellColors };
        for (let i = bounds.minRow; i <= bounds.maxRow; i++) {
          for (let j = bounds.minCol; j <= bounds.maxCol; j++) {
            newColors[`${i},${j}`] = color;
          }
        }
        setCellColors(newColors);

        const newMetadata = { ...cellMetadata };
        for (let i = bounds.minRow; i <= bounds.maxRow; i++) {
          for (let j = bounds.minCol; j <= bounds.maxCol; j++) {
            // newMetadata[`${i},${j}`] = {
            //   type: "o",
            //   rotation: 0,
            // };

            // if (exists) {
            //   // cycle through all types and each rotation for each type
            //   const allPossibleTypes = ["X", "I", "L", "T", "i", "o"];
            //   const allPossibleRotations = [0, 90, 180, 270];
            //   const allCombinations = allPossibleTypes.flatMap((type) =>
            //     allPossibleRotations.map((rotation) => ({ type, rotation }))
            //   );
            //   // get current type and rotation index and increment
            //   const current = newMetadata[`${i},${j}`];
            //   const currentIndex = allCombinations.findIndex(
            //     (c) =>
            //       c.type === current.type && c.rotation === current.rotation
            //   );
            //   const nextIndex = (currentIndex + 1) % allCombinations.length;
            //   newMetadata[`${i},${j}`] = allCombinations[nextIndex];
            // } else {
            // check all adjacent cells if there are non then type is 'o'
            let type = "X";

            let checkPos = [
              [0, 1],
              [1, 0],
              [0, -1],
              [-1, 0],
            ];

            // if adjacent in all directions use a X
            // if adjacent above or below use I
            // if adjacent left or right use L
            // if adjacent above and left use T
            // if adjacent above and right use i

            let adjacent = 0;
            let above = false;
            let below = false;
            let left = false;
            let right = false;

            for (let [dx, dy] of checkPos) {
              if (newMetadata[`${i + dx},${j + dy}`]) {
                // type must not be 'o'
                if (newMetadata[`${i + dx},${j + dy}`].type === "o") {
                  continue;
                }

                adjacent++;
                if (dx === 1) {
                  below = true;
                } else if (dx === -1) {
                  above = true;
                } else if (dy === 1) {
                  right = true;
                } else if (dy === -1) {
                  left = true;
                }
              }
            }

            if (adjacent === 4) {
              type = "X";
            } else if (above && below) {
              type = "I";
            } else if (left && right) {
              type = "L";
            } else if (above && left) {
              type = "T";
            } else if (above && right) {
              type = "i";
            } else {
              type = "o";
            }

            let rotation = 0;
            if (userMode === "#") {
              type = "o";
              rotation = 0;
            } else if (userMode === "━") {
              type = "I";
              rotation = 90;
            } else if (userMode === "┃") {
              type = "I";
              rotation = 0;
            } else if (userMode === "┏") {
              type = "L";
              rotation = 90;
            } else if (userMode === "┓") {
              type = "L";
              rotation = 180;
            } else if (userMode === "┛") {
              type = "L";
              rotation = 270;
            } else if (userMode === "┗") {
              type = "L";
              rotation = 0;
            } else if (userMode === "┣") {
              type = "T";
              rotation = 270;
            } else if (userMode === "┫") {
              type = "T";
              rotation = 90;
            } else if (userMode === "┳") {
              type = "T";
              rotation = 0;
            } else if (userMode === "┻") {
              type = "T";
              rotation = 180;
            } else if (userMode === "╸") {
              type = "i";
              rotation = 90;
            } else if (userMode === "╹") {
              type = "i";
              rotation = 180;
            } else if (userMode === "╺") {
              type = "i";
              rotation = 270;
            } else if (userMode === "╻") {
              type = "i";
              rotation = 0;
            }

            console.log("🟢", type);
            // type = "I";
            newMetadata[`${i},${j}`] = {
              type,
              // rotation: 0,
              // type: "X",
              // type,
              rotation,
            };
            // }
          }
        }
        setCellMetadata(newMetadata);
      }
      setSelections((prev) => [...prev, currentSelection]);
    }
    setIsSelecting(false);
    setCurrentSelection(null);
  };

  const clearSelections = () => {
    setSelections([]);
    setCurrentSelection(null);
    setCellColors({});
    setCellMetadata({});
  };

  const renderBorders = () => {
    if (!overlayRef.current) return;
    overlayRef.current.innerHTML = "";

    // Create a 2D array to track occupied cells
    const grid = Array(rows)
      .fill()
      .map(() => Array(cols).fill(false));

    // Mark all selected cells
    const allSelections = [...selections];
    if (currentSelection) {
      allSelections.push(currentSelection);
    }

    allSelections.forEach((selection) => {
      const bounds = getSelectionBounds(selection);
      if (!bounds) return;

      for (let i = bounds.minRow; i <= bounds.maxRow; i++) {
        for (let j = bounds.minCol; j <= bounds.maxCol; j++) {
          grid[i][j] = true;
        }
      }
    });

    // Find and create border segments
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j]) {
          const cell = getCell(i, j);
          if (!cell) continue;

          // Top border
          if (i === 0 || !grid[i - 1][j]) {
            const border = document.createElement("div");
            border.className = "border-segment horizontal";
            border.style.top = `${cell.offsetTop - 1}px`;
            border.style.left = `${cell.offsetLeft - 1}px`;
            border.style.width = `${cell.offsetWidth + 2}px`;
            overlayRef.current.appendChild(border);
          }

          // Bottom border
          if (i === rows - 1 || !grid[i + 1][j]) {
            const border = document.createElement("div");
            border.className = "border-segment horizontal";
            border.style.top = `${cell.offsetTop + cell.offsetHeight - 1}px`;
            border.style.left = `${cell.offsetLeft - 1}px`;
            border.style.width = `${cell.offsetWidth + 2}px`;
            overlayRef.current.appendChild(border);
          }

          // Left border
          if (j === 0 || !grid[i][j - 1]) {
            const border = document.createElement("div");
            border.className = "border-segment vertical";
            border.style.left = `${cell.offsetLeft - 1}px`;
            border.style.top = `${cell.offsetTop - 1}px`;
            border.style.height = `${cell.offsetHeight + 2}px`;
            overlayRef.current.appendChild(border);
          }

          // Right border
          if (j === cols - 1 || !grid[i][j + 1]) {
            const border = document.createElement("div");
            border.className = "border-segment vertical";
            border.style.left = `${cell.offsetLeft + cell.offsetWidth - 1}px`;
            border.style.top = `${cell.offsetTop - 1}px`;
            border.style.height = `${cell.offsetHeight + 2}px`;
            overlayRef.current.appendChild(border);
          }
        }
      }
    }
  };

  // onMouseEnter;
  // onMouseLeave;

  const onMouseEnter = (e) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    // console.log("🔵", cell);

    // // set the color of the cell
    // const newColors = { ...cellColors };
    // const lastColor = newColors[`${cell.row},${cell.col}`];
    // newColors[`${cell.row},${cell.col}`] = `-${lastColor}`
    // setCellColors(newColors);
  };

  const onMouseLeave = (e) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;

    // // remove the - from the color
    // const newColors = { ...cellColors };
    // const lastColor = newColors[`${cell.row},${cell.col}`];
    // newColors[`${cell.row},${cell.col}`] = lastColor.replace(/^-/, "")
  };

  useEffect(() => {
    renderBorders();
  }, [selections, currentSelection]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      renderBorders();
    });

    if (spreadsheetRef.current) {
      resizeObserver.observe(spreadsheetRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    updateAppSelections();
  }, [selections]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/*             
      className="px-4 py-2 rounded bg-white/20 border border-white/40 hover:bg-white/30 text-white transition-colors"
       */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)] backdrop-blur-sm z-50">
        {menuButtons.map((button) => (
          <button
            onClick={() => setUserMode(button.character)}
            key={button.name}
            // className="w-10 h-10 rounded-lg bg-white/20 border border-white/40 hover:bg-white/30 text-white flex items-center justify-center text-xl shadow-lg transition-colors"
            className={`w-10 h-10 rounded ${
              userMode === button.character
                ? "bg-white/30 border border-white/40"
                : "bg-white/10 border border-white/40 hover:bg-white/30"
            } text-white transition-colors cursor-pointer`}
          >
            {button.character}
          </button>
        ))}

        {/* Color picker with popover */}
        <div className="relative group">
          <button
            className="w-10 h-10 rounded-lg bg-white/20 hover:bg-gray-600 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            onClick={() => setColorModal(!colorModal)}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white/40"
              style={{ backgroundColor: color }}
            />
          </button>
          {/* Color popover */}
          {colorModal && (
            <div className="-translate-y-1/2 w-[220px] absolute left-full ml-6 bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-color)] shadow-xl flex-wrap gap-1 w-[120px]">
              {defaultColorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className="w-8 h-8 rounded-lg transition-transform p-2 m-1 cursor-pointer"
                  style={{ backgroundColor: colorOption }}
                >
                  {/* {color === colorOption && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                )} */}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* 
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="mr-2"
        /> */}

        {/* Eraser button */}
        <button
          onClick={() => setUserMode("E")}
          className={`w-10 h-10 rounded ${
            userMode === "E"
              ? "bg-white/30 border border-white/40"
              : "bg-white/10 border border-white/40 hover:bg-white/30"
          } text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 stroke-white/70 group-hover:stroke-white"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 5L5 19" />
            <path d="M19 19L5 5" />
          </svg>
        </button>

        {/* Clear/Delete button */}
        <button
          onClick={clearSelections}
          className="w-10 h-10 rounded-lg bg-white/20 hover:bg-gray-600 flex items-center justify-center shadow-lg transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 stroke-white/70 group-hover:stroke-white"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center ml-[90px]">
        <div className="relative w-fit">
          <div className="relative w-fit">
            <table
              ref={spreadsheetRef}
              className="border-collapse select-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            >
              <tbody>
                {Array(rows)
                  .fill()
                  .map((_, i) => (
                    <tr key={i}>
                      {Array(cols)
                        .fill()
                        .map((_, j) => (
                          <td
                            key={j}
                            data-row={i}
                            data-col={j}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            className="w-10 h-10 border border-[var(--border-color)] text-center relative touch-none"
                            style={{
                              cursor: isSelecting ? "default" : "pointer",
                              // backgroundColor: cellColors[`${i},${j}`] || "",
                            }}
                          >
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full h-full"
                              preserveAspectRatio="none"
                            >
                              <g
                                transform={`rotate(${
                                  (cellMetadata[`${i},${j}`] || {}).rotation ||
                                  0
                                }, 50, 50)`}
                              >
                                <path
                                  d={(() => {
                                    const shapes = {
                                      X: "M 50 0 L 50 100 M 0 50 L 100 50", // X shape (cross)
                                      I: "M 50 0 L 50 100", // vertical line
                                      L: "M 50 0 L 50 50 L 100 50", // L shape
                                      T: "M 0 50 L 100 50 L 50 50 L 50 100", // T shape
                                      i: "M 50 50 L 50 100", // i shape
                                      // o: "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0", // o shape
                                      o: "", // o shape
                                    };
                                    return shapes[
                                      (cellMetadata[`${i},${j}`] || {}).type
                                    ];
                                  })()}
                                  fill="none"
                                  stroke={cellColors[`${i},${j}`] || "#ffffff"}
                                  strokeWidth="30"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                            </svg>
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            <div
              ref={overlayRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        </div>
        <style>{`
        .border-segment {
          position: absolute;
          background-color: #2196F3;
          pointer-events: none;
        }
        .horizontal {
          height: 2px;
        }
        .vertical {
          width: 2px;
        }
      `}</style>
      </div>
    </div>
  );
};

export default Spreadsheet;
