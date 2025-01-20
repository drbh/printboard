# printboard

Design electronics prototyping boards in text, create them with 3D printing

## Overview

`printboard` is a tool and specification for converting text-based circuit layouts into 3D printable prototyping boards. It bridges the gap between breadboard prototypes and manufactured PCBs by enabling rapid iteration using common through-hole components and wire-stitching techniques.

## Key Features

- Text-based design using Unicode box-drawing characters
- Automatic conversion to 3D-printable board files
- Compatible with standard through-hole components
- Circuit traces created by stitching 30 AWG wire through printed channels
- Version control friendly format editable in any text editor

## Benefits

- Faster prototyping compared to PCB design and manufacturing
- More reliable connections than breadboard setups
- No specialized electronics design software required
- Enables compact, organized circuit layouts
- Simple iteration and modification process

## Implementation

The project consists of two main components:

1. **Specification**: A documented format using Unicode box characters to represent board layouts, component placement, and trace routing. The specification is currently in beta and available at [specification](https://printboard.org/beta/specification.html).

2. **Web Tool**: A conversion utility at [printboard.org](https://printboard.org) that transforms text designs into printable 3D files. The tool focuses on simplicity while maintaining precision for component fit.

## Technical Details

- Uses standard through-hole component spacing
- Supports various board sizes and layouts
- Generates channels sized for reliable 30 AWG wire routing
- Outputs standard 3D printing file formats

## Development Status

- Specification: Beta, accepting feedback
- Web Tool: Basic conversion pipeline implemented
- Planned Features:
  - Extended CAD backend support
  - Additional export formats
  - Enhanced design validation

## Contributing

- Specification feedback via issues
- Tool improvements through pull requests
- Backend implementations welcome
- Feature discussions open to community input

## Resources

- [Full Specification](https://printboard.org/beta/specification.html)
- [Web Tool](https://printboard.org)
<!-- - [Example Designs](https://printboard.org/examples) -->