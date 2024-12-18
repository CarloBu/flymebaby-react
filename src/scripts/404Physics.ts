import Matter from "matter-js";

export const initPhysics = (canvas: HTMLCanvasElement) => {
  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Bodies = Matter.Bodies;

  // create engine
  const engine = Engine.create();
  const world = engine.world;

  // Set initial canvas size to window dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // create renderer
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: canvas.width,
      height: canvas.height,
      wireframes: false,
      background: "transparent",
      pixelRatio: window.devicePixelRatio,
    },
  });

  // Create a temporary canvas to generate pill sprites
  const createPillSprite = (width: number): string => {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) {
      return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

    const height = 60; // Fixed height for all pills
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw pill shape
    ctx.fillStyle = "#FF7C1E";
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, height / 2);
    ctx.fill();

    // Scale font size based on pill width, but keep it reasonable
    const fontSize = Math.min(height * 0.6, width * 0.15);

    // Draw text
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("404", width / 2, height / 2);

    return tempCanvas.toDataURL();
  };

  // Create pills with random widths and rotation
  const createPill = (x: number, y: number) => {
    // Random widths between 80-200px, fixed height of 40px
    const width = Math.random() * 200 + 80;
    const height = 67;

    const sprite = createPillSprite(width);

    const pill = Bodies.rectangle(x, y, width, height, {
      chamfer: { radius: height / 2 },
      angle: Math.random() * Math.PI * 2, // Random rotation
      render: {
        sprite: {
          texture: sprite,
          xScale: 1,
          yScale: 1,
        },
      },
      restitution: 0.7, // Make pills bouncy
      friction: 0.01, // Very low friction
      density: 0.01, // Make pills lighter
    });
    return pill;
  };

  // Add walls (invisible boundaries)
  const wallOptions = {
    isStatic: true,
    render: { fillStyle: "transparent" },
  };

  // Extended spawn area above viewport
  const spawnHeight = canvas.height * 2; // Twice the viewport height for spawn area

  const walls = [
    // Top wall (much higher up)
    Bodies.rectangle(
      canvas.width / 2,
      -spawnHeight,
      canvas.width,
      60,
      wallOptions,
    ),
    // Bottom wall
    Bodies.rectangle(
      canvas.width / 2,
      canvas.height + 30,
      canvas.width,
      60,
      wallOptions,
    ),
    // Left wall (at screen edge)
    Bodies.rectangle(0, canvas.height / 2, 10, canvas.height * 2, wallOptions),
    // Right wall (at screen edge)
    Bodies.rectangle(
      canvas.width,
      canvas.height / 2,
      10,
      canvas.height * 2,
      wallOptions,
    ),
  ];

  Composite.add(world, walls);

  // Function to create a new pill at a random position above the viewport
  const spawnPill = () => {
    // Adjust spawn position to account for pill width
    const maxPillWidth = 280; // Maximum possible pill width
    const margin = maxPillWidth / 2; // Safe margin from walls
    const x = Math.random() * (canvas.width - margin * 2) + margin;
    const y = -Math.random() * spawnHeight;
    return createPill(x, y);
  };

  // Initial pills
  const initialPills = Array(50)
    .fill(null)
    .map(() => spawnPill());

  Composite.add(world, initialPills);

  // Continuously spawn new pills
  const spawnInterval = setInterval(() => {
    if (engine.world.bodies.length < 140) {
      // Limit total pills
      Composite.add(world, spawnPill());
    }
  }, 500); // Spawn rate in milliseconds

  // Add mouse control with improved interaction
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });

  // Ensure mouse events work properly
  render.mouse = mouse;

  // Add mouse constraint to world
  Composite.add(world, mouseConstraint);

  // Run the engine
  Runner.run(Runner.create(), engine);
  Render.run(render);

  // Resize handler
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;
    render.canvas.width = width;
    render.canvas.height = height;
    render.options.width = width;
    render.options.height = height;

    // Update wall positions with extended spawn area
    walls[0].position.x = width / 2; // Top wall
    walls[0].position.y = -spawnHeight; // Top wall much higher
    walls[1].position.x = width / 2; // Bottom wall
    walls[1].position.y = height + 30; // Bottom wall
    walls[2].position.x = 0; // Left wall at screen edge
    walls[2].position.y = height / 2; // Center of left wall
    walls[3].position.x = width; // Right wall at screen edge
    walls[3].position.y = height / 2; // Center of right wall

    // Update vertices for walls
    walls.forEach((wall, index) => {
      const isHorizontal = index < 2;
      Matter.Body.setVertices(
        wall,
        Bodies.rectangle(
          wall.position.x,
          wall.position.y,
          isHorizontal ? width : 60,
          isHorizontal ? 60 : canvas.height * 2,
        ).vertices,
      );
    });
  };

  window.addEventListener("resize", handleResize);

  return () => {
    Render.stop(render);
    Engine.clear(engine);
    window.removeEventListener("resize", handleResize);
    clearInterval(spawnInterval);
  };
};
