# Circuit Board Generation Specification v0.0.1

## Purpose

Defines a system for generating 3D-printable circuit boards from text-based designs. This specification outlines the character set, expansion rules, and physical requirements for implementation.

## Terms and Definitions

- Character: A single box-drawing Unicode character representing a circuit element
- Grid Cell: Basic unit of the expanded layout (0.85mm × 0.85mm)
- Expansion: Process of converting characters to 3×3 physical grids
- Connection Point: A hole designed for component pins or wires

## Input Format

### Character Set

Valid input characters are limited to Unicode box-drawing characters:

- Range: U+2500 to U+257F
- Primary characters: ━ ┃ ┏ ┓ ┛ ┗ ┣ ┫ ┳ ┻ ┃ ╋
- Whitespace (U+0020) represents empty cells

### Character Naming Convention

| Character | Name         | Description          | Short Name |
| --------- | ------------ | -------------------- | ---------- |
| ━         | Horizontal   | Horizontal line      | H          |
| ┃         | Vertical     | Vertical line        | V          |
| ┏         | Top Left     | Top left corner      | TL         |
| ┓         | Top Right    | Top right corner     | TR         |
| ┛         | Bottom Right | Bottom right corner  | BR         |
| ┗         | Bottom Left  | Bottom left corner   | BL         |
| ┣         | T Down       | T down intersection  | TD         |
| ┫         | T Up         | T up intersection    | TU         |
| ┳         | T Left       | T left intersection  | TL         |
| ┻         | T Right      | T right intersection | TR         |
| ╋         | Cross        | Cross intersection   | X          |
| ╺         | End right    | End right            | ER         |
| ╻         | End down     | End down             | ED         |
| ╸         | End left     | End left             | EL         |
| ╹         | End up       | End up               | EU         |



### Design Rules

1. Input must form a rectangular grid **(TBD: or can it be any shape?)**
2. All characters must be from the specified Unicode range
3. Connections must be continuous (no floating segments)
4. Maximum grid size: TBD based on printer constraints

## Grid Expansion Algorithm

### Expansion Rules

1. Each input character expands to 3×3 physical grid
2. Box-drawing elements maintain connectivity in expanded form
3. Center cell of expansion contains connection point
4. Corner cells maintain structural integrity

Example:

in the following example grid there is a single `┌` character in the cell `A1`.


| Cell | A   | B   | C   |
| ---- | --- | --- | --- |
| 1    | ┏   |     |     |
| 2    |     |     |     |
| 3    |     |     |     |


each cell above (`A1`, `B1`, `C1`, ...) is expanded into its own 3x3 grid. Therefore if we expand the full grid above, we'll get one that has 3 time more rows and columns, and looks like this:

| Cell | A   | A   | A   | B   | B   | B   | C   | C   | C   |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1    |     |     |     |     |     |     |     |     |     |
| 1    |     | 1   | 1   |     |     |     |     |     |     |
| 1    |     | 1   |     |     |     |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |


this expanded grid ensure that the connection point is in the center of the original cell, and that the expanded grid maintains the connectivity of the original grid.

for example, if we add the `┳` character in the cell `B1` of the original grid


| Cell | A   | B   | C   |
| ---- | --- | --- | --- |
| 1    | ┏   | ┳   |     |
| 2    |     |     |     |
| 3    |     |     |     |


we'll get the following expanded grid:



| Cell | A   | A   | A   | B   | B   | B   | C   | C   | C   |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1    |     |     |     |     |     |     |     |     |     |
| 1    |     | 1   | 1   | 1   | 1   | 1   |     |     |     |
| 1    |     | 1   |     |     | 1   |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 2    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |
| 3    |     |     |     |     |     |     |     |     |     |


## Physical Specifications

### Grid Dimensions

- Base unit (single expanded cell): 0.85mm × 0.85mm
- Character expansion: 2.55mm × 2.55mm (3 × 0.85mm)
- Tolerance: ±0.05mm

### Heights

Two profiles defined:
1. Low Profile
   - Height: 1.0mm ±0.1mm
   - Use: Surface-mount or temporary connections

2. Standard Profile
   - Height: 3.0mm ±0.1mm
   - Use: Through-hole components and wire wrapping

### Connection Points

- Diameter: 1.0mm ±0.05mm
- Position: Center of each expanded grid cell
- Spacing: Maintains 2.54mm pitch compatibility

## Implementation Requirements

### Parser Requirements

1. Must validate input character set
2. Must verify grid continuity
3. Must maintain expansion rules
4. Must generate valid 3D geometry

### Output Requirements

1. Generated models must be manifold
2. Must include all specified tolerances
3. Must maintain pitch compatibility
4. Must generate printable geometry (no overhangs >45°)

## Future Considerations

1. Support for component footprints
2. Multi-layer designs
3. Automated routing
4. Custom grid sizes

## Version History

- v0.0.1: Initial specification

## License

MIT License
