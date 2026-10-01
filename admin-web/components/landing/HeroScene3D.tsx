"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function HeroScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGlError, setHasWebGlError] = useState(false);
  const [activeVillaTab, setActiveVillaTab] = useState<"villa" | "resort" | "cabin">("villa");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA (Cinematic 3/4 Isometric Perspective)
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(9.0, 7.5, 9.5);
    camera.lookAt(0, 0.6, 0);

    // RENDERER
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL fallback:", err);
      setHasWebGlError(true);
      return;
    }

    // MAIN WORLD GROUP FOR PARALLAX INTERACTION
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ── LIGHTING (Warm Luxury Golden Hour + Soft Sky Fill) ──
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    sunLight.position.set(10, 15, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -7;
    sunLight.shadow.camera.right = 7;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Rim / Blue sky fill light from opposite side
    const skyFillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    skyFillLight.position.set(-8, 10, -6);
    scene.add(skyFillLight);

    // Warm Interior Master Bedroom Spotlight
    const bedroomLight = new THREE.PointLight(0xfef08a, 4.2, 7.0, 1.6);
    bedroomLight.position.set(0.2, 1.6, -0.2);
    worldGroup.add(bedroomLight);

    // Turquoise Swimming Pool Glow Light
    const poolGlow = new THREE.PointLight(0x06b6d4, 2.8, 5.5, 1.8);
    poolGlow.position.set(-2.0, 0.3, 1.4);
    worldGroup.add(poolGlow);

    // ── REUSABLE MATERIALS & GEOMETRIES ──
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Nature & Grass Plinth
    const matLushGrass = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.65,
      metalness: 0.05,
    });
    materials.push(matLushGrass);

    const matPlinthBase = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2,
    });
    materials.push(matPlinthBase);

    // Luxury Architecture Woods & Walls
    const matWoodParquet = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.45,
      metalness: 0.05,
    });
    materials.push(matWoodParquet);

    const matDarkTeakDeck = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.75,
    });
    materials.push(matDarkTeakDeck);

    const matCleanWhiteWall = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.02,
    });
    materials.push(matCleanWhiteWall);

    const matArchitecturalBlueWall = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.1,
    });
    materials.push(matArchitecturalBlueWall);

    const matHeadboardWood = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.5,
    });
    materials.push(matHeadboardWood);

    const matBedLinen = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    });
    materials.push(matBedLinen);

    const matBedPillow = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.6,
    });
    materials.push(matBedPillow);

    const matBedThrow = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
    });
    materials.push(matBedThrow);

    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.45,
    });
    materials.push(matGlass);

    const matPoolWater = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    materials.push(matPoolWater);

    const matStoneTile = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
    });
    materials.push(matStoneTile);

    const matPalmLeaf = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    materials.push(matPalmLeaf);

    const matPalmTrunk = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
    });
    materials.push(matPalmTrunk);

    // ── 1. CIRCULAR LUXURY DIORAMA PLATFORM (Reference 1 Style) ──
    const plinthTopGeo = new THREE.CylinderGeometry(4.6, 4.4, 0.45, 48);
    geometries.push(plinthTopGeo);
    const plinthTop = new THREE.Mesh(plinthTopGeo, matLushGrass);
    plinthTop.position.y = -0.225;
    plinthTop.receiveShadow = true;
    worldGroup.add(plinthTop);

    const plinthBaseGeo = new THREE.CylinderGeometry(4.4, 4.0, 0.85, 48);
    geometries.push(plinthBaseGeo);
    const plinthBase = new THREE.Mesh(plinthBaseGeo, matPlinthBase);
    plinthBase.position.y = -0.875;
    plinthBase.receiveShadow = true;
    worldGroup.add(plinthBase);

    // ── 2. ISOMETRIC CUTAWAY LUXURY VILLA MODULE ──
    const villaModule = new THREE.Group();
    villaModule.position.set(0.2, 0, 0);

    // Floor Base / Wooden Parquet Interior
    const roomFloorGeo = new THREE.BoxGeometry(3.6, 0.12, 3.2);
    geometries.push(roomFloorGeo);
    const roomFloor = new THREE.Mesh(roomFloorGeo, matWoodParquet);
    roomFloor.position.set(0.2, 0.06, -0.2);
    roomFloor.receiveShadow = true;
    villaModule.add(roomFloor);

    // Outdoor Decking (Teak Wood Deck)
    const outdoorDeckGeo = new THREE.BoxGeometry(1.6, 0.1, 2.6);
    geometries.push(outdoorDeckGeo);
    const outdoorDeck = new THREE.Mesh(outdoorDeckGeo, matDarkTeakDeck);
    outdoorDeck.position.set(1.9, 0.05, 0.8);
    outdoorDeck.receiveShadow = true;
    villaModule.add(outdoorDeck);

    // Back Architectural Wall (Modern Teal/Blue Feature Wall - Ref 1)
    const backWallGeo = new THREE.BoxGeometry(3.6, 2.3, 0.18);
    geometries.push(backWallGeo);
    const backWall = new THREE.Mesh(backWallGeo, matCleanWhiteWall);
    backWall.position.set(0.2, 1.2, -1.75);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    villaModule.add(backWall);

    // Left Feature Wall (Architectural Ocean Blue with TV & Slats)
    const leftWallGeo = new THREE.BoxGeometry(0.18, 2.3, 3.2);
    geometries.push(leftWallGeo);
    const leftWall = new THREE.Mesh(leftWallGeo, matArchitecturalBlueWall);
    leftWall.position.set(-1.55, 1.2, -0.2);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    villaModule.add(leftWall);

    // Decorative Headboard Slats on Back Wall
    const headboardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.08);
    geometries.push(headboardGeo);
    const headboard = new THREE.Mesh(headboardGeo, matHeadboardWood);
    headboard.position.set(0.2, 0.8, -1.62);
    villaModule.add(headboard);

    // ── MASTER SUITE BEDROOM FURNITURE ──
    // King Bed Base
    const bedBaseGeo = new THREE.BoxGeometry(1.8, 0.28, 1.9);
    geometries.push(bedBaseGeo);
    const bedBase = new THREE.Mesh(bedBaseGeo, matCleanWhiteWall);
    bedBase.position.set(0.2, 0.22, -0.85);
    bedBase.castShadow = true;
    villaModule.add(bedBase);

    // Mattress & White Duvet Linen
    const mattressGeo = new THREE.BoxGeometry(1.65, 0.22, 1.75);
    geometries.push(mattressGeo);
    const mattress = new THREE.Mesh(mattressGeo, matBedLinen);
    mattress.position.set(0.2, 0.45, -0.85);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    villaModule.add(mattress);

    // Pillows
    const pillowGeo = new THREE.BoxGeometry(0.55, 0.12, 0.35);
    geometries.push(pillowGeo);

    const pillowLeft = new THREE.Mesh(pillowGeo, matBedPillow);
    pillowLeft.position.set(-0.35, 0.6, -1.45);
    pillowLeft.rotation.x = 0.2;
    villaModule.add(pillowLeft);

    const pillowRight = new THREE.Mesh(pillowGeo, matBedPillow);
    pillowRight.position.set(0.75, 0.6, -1.45);
    pillowRight.rotation.x = 0.2;
    villaModule.add(pillowRight);

    // Bed Runner / Throw Blanket
    const throwGeo = new THREE.BoxGeometry(1.66, 0.04, 0.65);
    geometries.push(throwGeo);
    const bedThrow = new THREE.Mesh(throwGeo, matBedThrow);
    bedThrow.position.set(0.2, 0.58, -0.3);
    villaModule.add(bedThrow);

    // Bedside Nightstands
    const nightstandGeo = new THREE.BoxGeometry(0.45, 0.35, 0.4);
    geometries.push(nightstandGeo);

    const nightstandLeft = new THREE.Mesh(nightstandGeo, matHeadboardWood);
    nightstandLeft.position.set(-0.95, 0.25, -1.4);
    nightstandLeft.castShadow = true;
    villaModule.add(nightstandLeft);

    const nightstandRight = new THREE.Mesh(nightstandGeo, matHeadboardWood);
    nightstandRight.position.set(1.35, 0.25, -1.4);
    nightstandRight.castShadow = true;
    villaModule.add(nightstandRight);

    // Modern Table Lamps
    const lampGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 8);
    geometries.push(lampGeo);
    const matLampGlow = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 1.8 });
    materials.push(matLampGlow);

    const lamp1 = new THREE.Mesh(lampGeo, matLampGlow);
    lamp1.position.set(-0.95, 0.55, -1.4);
    villaModule.add(lamp1);

    const lamp2 = new THREE.Mesh(lampGeo, matLampGlow);
    lamp2.position.set(1.35, 0.55, -1.4);
    villaModule.add(lamp2);

    // Wall TV on Blue Feature Wall
    const tvGeo = new THREE.BoxGeometry(0.06, 0.85, 1.4);
    geometries.push(tvGeo);
    const tvScreen = new THREE.Mesh(tvGeo, matPlinthBase);
    tvScreen.position.set(-1.42, 1.25, -0.2);
    villaModule.add(tvScreen);

    // Soft Room Area Rug / Carpet
    const rugGeo = new THREE.BoxGeometry(2.2, 0.02, 1.6);
    geometries.push(rugGeo);
    const matRug = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    materials.push(matRug);
    const rug = new THREE.Mesh(rugGeo, matRug);
    rug.position.set(0.2, 0.13, 0.35);
    rug.receiveShadow = true;
    villaModule.add(rug);

    // Cozy Lounge Armchair & Coffee Table
    const chairSeatGeo = new THREE.BoxGeometry(0.65, 0.3, 0.65);
    geometries.push(chairSeatGeo);
    const armchair = new THREE.Mesh(chairSeatGeo, matCleanWhiteWall);
    armchair.position.set(0.6, 0.26, 0.7);
    armchair.rotation.y = -0.4;
    armchair.castShadow = true;
    villaModule.add(armchair);

    // Glass Balcony Railing (Ref 1 Style)
    const glassRailingGeo = new THREE.BoxGeometry(0.06, 0.75, 2.4);
    geometries.push(glassRailingGeo);
    const glassRailing = new THREE.Mesh(glassRailingGeo, matGlass);
    glassRailing.position.set(2.65, 0.45, 0.8);
    villaModule.add(glassRailing);

    // Outdoor Lounger Chairs on Patio
    const loungerGeo = new THREE.BoxGeometry(0.55, 0.2, 1.2);
    geometries.push(loungerGeo);
    const lounger1 = new THREE.Mesh(loungerGeo, matCleanWhiteWall);
    lounger1.position.set(2.0, 0.16, 0.8);
    lounger1.rotation.y = 0.15;
    lounger1.castShadow = true;
    villaModule.add(lounger1);

    // ── INFINITY PLUNGE POOL (Left Side of Diorama) ──
    const poolGroup = new THREE.Group();
    poolGroup.position.set(-2.4, 0, 1.2);

    const poolRimGeo = new THREE.BoxGeometry(1.9, 0.24, 1.7);
    geometries.push(poolRimGeo);
    const poolRim = new THREE.Mesh(poolRimGeo, matStoneTile);
    poolRim.position.y = 0.08;
    poolRim.receiveShadow = true;
    poolGroup.add(poolRim);

    const poolWaterGeo = new THREE.PlaneGeometry(1.65, 1.45);
    geometries.push(poolWaterGeo);
    const poolWater = new THREE.Mesh(poolWaterGeo, matPoolWater);
    poolWater.position.y = 0.18;
    poolWater.rotation.x = -Math.PI / 2;
    poolGroup.add(poolWater);

    // Pool Steps
    const stepGeo = new THREE.BoxGeometry(0.45, 0.08, 0.7);
    geometries.push(stepGeo);
    const poolStep = new THREE.Mesh(stepGeo, matStoneTile);
    poolStep.position.set(-0.55, 0.12, 0.3);
    poolGroup.add(poolStep);

    worldGroup.add(poolGroup);
    worldGroup.add(villaModule);

    // ── 3. TROPICAL PALM TREES & LUSH GREENERY (Ref 1 & 2 Style) ──
    function createTropicalPalmTree(x: number, z: number, scale: number = 1) {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(x, 0, z);

      // Curved Trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1 * scale, 0.8 * scale, 0.05 * scale),
        new THREE.Vector3(0.25 * scale, 1.7 * scale, 0.15 * scale),
      ]);
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 12, 0.09 * scale, 8, false);
      geometries.push(trunkGeo);
      const trunk = new THREE.Mesh(trunkGeo, matPalmTrunk);
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Palm Fronds / Leaves
      const leafCount = 7;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafGeo = new THREE.ConeGeometry(0.35 * scale, 1.4 * scale, 4);
        geometries.push(leafGeo);
        const leaf = new THREE.Mesh(leafGeo, matPalmLeaf);
        leaf.position.set(
          0.25 * scale + Math.cos(angle) * 0.45 * scale,
          1.65 * scale,
          0.15 * scale + Math.sin(angle) * 0.45 * scale
        );
        leaf.rotation.x = Math.PI / 2.6;
        leaf.rotation.z = -angle;
        leaf.castShadow = true;
        palmGroup.add(leaf);
      }

      worldGroup.add(palmGroup);
    }

    createTropicalPalmTree(-2.8, -1.8, 1.2);
    createTropicalPalmTree(-3.4, -0.6, 0.95);
    createTropicalPalmTree(3.0, -1.6, 1.15);
    createTropicalPalmTree(3.2, 0.8, 0.85);

    // Decorative Potted Fiddle Leaf Figs & Planters
    const potGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.35, 12);
    geometries.push(potGeo);
    const plantPot1 = new THREE.Mesh(potGeo, matCleanWhiteWall);
    plantPot1.position.set(-1.1, 0.25, 1.2);
    plantPot1.castShadow = true;
    worldGroup.add(plantPot1);

    const bushGeo = new THREE.DodecahedronGeometry(0.28, 1);
    geometries.push(bushGeo);
    const plantBush1 = new THREE.Mesh(bushGeo, matPalmLeaf);
    plantBush1.position.set(-1.1, 0.52, 1.2);
    plantBush1.castShadow = true;
    worldGroup.add(plantBush1);

    const plantPot2 = new THREE.Mesh(potGeo, matCleanWhiteWall);
    plantPot2.position.set(1.8, 0.25, -1.2);
    worldGroup.add(plantPot2);

    const plantBush2 = new THREE.Mesh(bushGeo, matPalmLeaf);
    plantBush2.position.set(1.8, 0.52, -1.2);
    worldGroup.add(plantBush2);

    // Stepping Pathway Stones across grass
    const pathwayCoords = [
      [0.6, 0.02, 1.8, 0.32],
      [0.9, 0.02, 2.3, 0.35],
      [0.5, 0.02, 2.8, 0.38],
      [1.1, 0.02, 3.2, 0.30],
    ];
    pathwayCoords.forEach(([x, y, z, size]) => {
      const stoneGeo = new THREE.CylinderGeometry(size, size * 1.1, 0.04, 7);
      geometries.push(stoneGeo);
      const stone = new THREE.Mesh(stoneGeo, matStoneTile);
      stone.position.set(x, y, z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      worldGroup.add(stone);
    });

    // ── MOUSE PARALLAX & ANIMATION LOOP ──
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / rect.width - 0.5) * 2;
      mouse.targetY = (clientY / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse cursor damping
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      if (!prefersReducedMotion) {
        // Organic gentle floating / breathing
        worldGroup.position.y = Math.sin(elapsedTime * 0.9) * 0.07;

        // Smooth 3D parallax rotation with natural angle limits
        worldGroup.rotation.y = 0.28 + mouse.x * 0.25;
        worldGroup.rotation.x = -mouse.y * 0.14;

        // Water reflection pulse
        poolWater.position.y = 0.18 + Math.sin(elapsedTime * 2.5) * 0.01;

        // Warm cozy interior lamp pulsing
        bedroomLight.intensity = 4.0 + Math.sin(elapsedTime * 3) * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (hasWebGlError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 460,
          borderRadius: 24,
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🏡</div>
          <h4 style={{ fontWeight: 800, fontSize: "1.2rem", margin: "0 0 6px" }}>Olive Grove Luxury Villa</h4>
          <p style={{ fontSize: "0.85rem", color: "#93c5fd", margin: 0 }}>Từ 2.500.000 ₫ / đêm • Hồ bơi vô cực riêng tư</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Three.js Canvas */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          cursor: "grab",
        }}
      />

      {/* Floating Modern Pill Badge (Ref 1 Style) */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 14px",
          borderRadius: 20,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#4ade80",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.4px",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
        <span>Interactive 3D Villa Module</span>
      </div>

      {/* Bottom Floating Info Pill (Ref 1 & 2 Style) */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          zIndex: 10,
          pointerEvents: "none",
          textAlign: "center",
          background: "rgba(15, 23, 42, 0.72)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 16,
          padding: "8px 20px",
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "0.92rem", letterSpacing: "-0.2px" }}>
          Lavender Dream Luxury Villa
        </div>
        <div style={{ fontSize: "0.78rem", color: "#38bdf8", fontWeight: 600 }}>
          Từ 2.500.000 ₫ / đêm • Hồ bơi riêng & View đồi
        </div>
      </div>
    </div>
  );
}
