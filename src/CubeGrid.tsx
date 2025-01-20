import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useSelection } from "./SelectionContext";

const CubeGrid = ({ rows = 60, cols = 60 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const isMouseDownRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [viewMode, setViewMode] = useState("front");
  // const [viewMode, setViewMode] = useState("isometric");
  const { selections, cellColors, cellMetadata } = useSelection();

  // TODO: write a function that takes in a selections and returns an expanded selection
  const expandSelection = (selections: { row: number; col: number }[]) => {
    const expandedSelections: { row: number; col: number }[] = [];

    selections.forEach((selection) => {
      // Multiply the original coordinates by 3 to create proper spacing
      const baseRow = selection.row * 3;
      const baseCol = selection.col * 3;

      // Generate the 3x3 grid from this new base position
      for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
        for (let colOffset = 0; colOffset < 3; colOffset++) {
          expandedSelections.push({
            row: baseRow + rowOffset,
            col: baseCol + colOffset,
          });
        }
      }
    });

    return expandedSelections;
  };

  const expandcellColors = (cellColors: { [key: string]: string }) => {
    const expandedCellColors: { [key: string]: string } = {};

    Object.entries(cellColors).forEach(([key, value]) => {
      const [row, col] = key.split(",").map(Number);

      // Multiply the original coordinates by 3 to create proper spacing
      const baseRow = row * 3;
      const baseCol = col * 3;

      // Generate the 3x3 grid from this new base position
      for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
        for (let colOffset = 0; colOffset < 3; colOffset++) {
          expandedCellColors[`${baseRow + rowOffset},${baseCol + colOffset}`] =
            value;
        }
      }
    });

    return expandedCellColors;
  };

  const expandCellMetadata = (cellMetadata: { [key: string]: any }) => {
    const expandedCellMetadata: { [key: string]: any } = {};

    Object.entries(cellMetadata).forEach(([key, value]) => {
      const [row, col] = key.split(",").map(Number);

      // Multiply the original coordinates by 3 to create proper spacing
      const baseRow = row * 3;
      const baseCol = col * 3;

      // Generate the 3x3 grid from this new base position
      for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
        for (let colOffset = 0; colOffset < 3; colOffset++) {
          expandedCellMetadata[
            `${baseRow + rowOffset},${baseCol + colOffset}`
          ] = value;
        }
      }
    });

    return expandedCellMetadata;
  };

  const initScene = () => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x222222);

    // read ccs var var(--bg) in to sjs
    let bg = getComputedStyle(document.documentElement).getPropertyValue(
      "--bg"
    );
    // set the background color of the scene
    scene.background = new THREE.Color(bg);

    sceneRef.current = scene;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 10, 10);
    directionalLight1.castShadow = true;

    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, -10, -10);
    directionalLight2.castShadow = true;
    scene.add(directionalLight2);

    const b = 4;
    const c = 30;

    // Create base geometry
    const geometry = new THREE.BoxGeometry(b, b, b);

    // Create cubes for all possible positions
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const material = new THREE.MeshPhongMaterial({
          // color: 0x444444,
          color: new THREE.Color(`hsl(${(row + col) * 10}, 50%, 50%)`), // Dynamic coloring based on position

          transparent: true,
          opacity: 0.8,
          shininess: 50,
        });

        const cube = new THREE.Mesh(geometry, material);
        const x = (col - c) * b;
        const y = (c - row) * b;
        const z = 0;

        cube.position.set(x, y, z);
        const isCenter = row % 3 === 1 && col % 3 === 1;

        if (isCenter) {
          // TODO: revisit if we want to cut or widen the hole differently
          // for now simply avoid rendering the center cube
        } else {
          scene.add(cube);
        }

        cubesRef.current[`${row},${col}`] = cube;
      }
    }
  };

  const updateCubes = () => {
    // Reset all cubes
    Object.values(cubesRef.current).forEach((cube) => {
      cube.material.opacity = 0.1;
      cube.material.color.setHex(0x444444);
    });

    let expandedSelections = expandSelection(selections);
    let expanedcellColors = expandcellColors(cellColors);
    let expandedCellMetadata = expandCellMetadata(cellMetadata);

    for (let i = 0; i < expandedSelections.length; i++) {
      const { row, col } = expandedSelections[i];
      const cube = cubesRef.current[`${row},${col}`];
      if (cube) {
        const color = expanedcellColors[`${row},${col}`] || "#ffffff";
        const metadata = expandedCellMetadata[`${row},${col}`] || {};
        cube.material.opacity = 1;

        // TODO: revisit the default color
        // const r = Math.floor((row % 3) * 100);
        // const g = Math.floor((col % 3) * 100);
        // const b = 255;
        // cube.material.color.setRGB(r / 255, g / 255, b / 255);
        cube.material.color = new THREE.Color("#FFFFFF");

        // get index within the 9 cube grid
        let localRow = row % 3;
        let localCol = col % 3;

        // I 0
        var bar0 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 2 && localCol === 1) ||
          (localRow === 0 && localCol === 1);

        // I 90
        var bar90 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 1 && localCol === 0);

        // L 0
        var l0 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 0 && localCol === 1);

        // L 90
        var l90 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 2 && localCol === 1) ||
          (localRow === 1 && localCol === 2);

        // L 180
        var l180 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 0) ||
          (localRow === 2 && localCol === 1);

        // L 270
        var l270 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 0 && localCol === 1) ||
          (localRow === 1 && localCol === 0);

        // T 0
        var t180 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 1 && localCol === 0) ||
          (localRow === 0 && localCol === 1);

        // T 270
        var t270 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 2 && localCol === 1) ||
          (localRow === 0 && localCol === 1) ||
          (localRow === 1 && localCol === 2);

        // T 180
        var t0 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 0) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 2 && localCol === 1);

        // T 90
        var t90 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 0 && localCol === 1) ||
          (localRow === 2 && localCol === 1) ||
          (localRow === 1 && localCol === 0);

        // i 0
        var i0 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 2 && localCol === 1) ||
          (localRow === 3 && localCol === 1);

        // i 270
        var i270 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 1 && localCol === 3);

        // i 180
        var i180 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 0 && localCol === 1) ||
          (localRow === 3 && localCol === 1);

        // i 90
        var i90 =
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 0) ||
          (localRow === 1 && localCol === 3);

        // X 0
        var x0 =
          (localRow === 0 && localCol === 1) ||
          (localRow === 1 && localCol === 0) ||
          (localRow === 1 && localCol === 1) ||
          (localRow === 1 && localCol === 2) ||
          (localRow === 2 && localCol === 1);

        const cellLookup = {
          i: {
            0: i0,
            90: i90,
            180: i180,
            270: i270,
          },
          L: {
            0: l0,
            90: l90,
            180: l180,
            270: l270,
          },
          T: {
            0: t0,
            90: t90,
            180: t180,
            270: t270,
          },
          I: {
            0: bar0,
            90: bar90,
            270: bar90,
          },
          X: {
            0: x0,
          },
          o: {},
        };

        let makeShort = false;
        let drawType = null;

        const typeData = cellLookup[metadata.type];
        if (typeData && metadata.type != "o") {
          let keyDoesExist = metadata.rotation in typeData;
          let resp = null;
          if (!keyDoesExist) {
            resp = typeData[0];
            drawType = resp;
            makeShort = resp;
          } else {
            resp = typeData[metadata.rotation];
            drawType = resp;
            makeShort = resp;
          }
        }

        if (makeShort) {
          cube.scale.z = 0.5;
          cube.position.z = 2;
          cube.material.color.setStyle(color);
        } else {
          cube.position.z = 4;
          cube.scale.z = 1;
        }
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    initScene();

    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;
      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    updateSize();
    animate();

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    updateCubes();
  }, [selections, cellColors]);

  useEffect(() => {
    if (!cameraRef.current) return;

    const distance = 200;
    switch (viewMode) {
      case "front":
        cameraRef.current.position.set(0, 0, distance);
        break;
      case "top":
        cameraRef.current.position.set(0, distance, 0);
        break;
      case "side":
        cameraRef.current.position.set(distance, 0, 0);
        break;
      case "isometric":
        cameraRef.current.position.set(
          distance * 0.577,
          distance * 0.577,
          distance * 0.577
        );
        break;
    }
    cameraRef.current.lookAt(0, 0, 0);
  }, [viewMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseDown = (e) => {
      isMouseDownRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current) return;
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;

      if (cameraRef.current) {
        const rotationSpeed = 0.005;
        const radius = cameraRef.current.position.length();
        let theta = Math.atan2(
          cameraRef.current.position.x,
          cameraRef.current.position.z
        );
        let phi = Math.acos(cameraRef.current.position.y / radius);

        theta -= deltaX * rotationSpeed;
        phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, phi + deltaY * rotationSpeed)
        );

        cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cameraRef.current.position.y = radius * Math.cos(phi);
        cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);

        cameraRef.current.lookAt(0, 0, 0);
      }

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      // smooth zoom
      const zoomFactor = Math.exp(e.deltaY * 0.001);
      // const distance = cameraRef.current.position.length();
      // const newDistance = distance * zoomFactor;
      cameraRef.current.position.multiplyScalar(zoomFactor);
      cameraRef.current.lookAt(0, 0, 0);
    };

    const element = containerRef.current;
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("wheel", handleWheel);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="w-full h-[800px] flex flex-col">
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)] backdrop-blur-sm z-50">
        {["front", "top", "side", "isometric"].map((view) => (
          <button
            key={view}
            onClick={() => setViewMode(view)}
            className={`px-4 py-2 rounded ${
              viewMode === view
                ? "bg-white/30 border border-white/40"
                : "bg-white/20 border border-white/40 hover:bg-white/30"
            } text-white transition-colors`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        className="flex-1 bg-[var(--bg)] cursor-move"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};

export default CubeGrid;
