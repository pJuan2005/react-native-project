"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function HeroScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGlError, setHasWebGlError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA (Cinematic 3/4 isometric perspective)
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(8.5, 6.2, 9.2);
    camera.lookAt(0, 0.5, 0);

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
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL initialization fallback:", err);
      setHasWebGlError(true);
      return;
    }

    // MAIN GROUP FOR ROTATION / PARALLAX
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ── LIGHTING (Warm golden hour & soft ambient) ──
    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    sunLight.position.set(9, 13, 7);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cozy Interior & Window Glowing Lights
    const cabinInteriorLight = new THREE.PointLight(0xf59e0b, 3.8, 6.5, 1.8);
    cabinInteriorLight.position.set(0, 1.3, 0.6);
    worldGroup.add(cabinInteriorLight);

    const poolLight = new THREE.PointLight(0x38bdf8, 2.0, 5, 2);
    poolLight.position.set(-2.2, 0.2, 1.2);
    worldGroup.add(poolLight);

    // ── REUSABLE MATERIALS & GEOMETRIES ──
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Nature / Grass
    const matGrass = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.75,
      metalness: 0.05,
    });
    materials.push(matGrass);

    const matDirt = new THREE.MeshStandardMaterial({
      color: 0x5c2b09,
      roughness: 0.95,
    });
    materials.push(matDirt);

    // Wood & Architecture (Luxe Villa / Cabin)
    const matTimber = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.65,
      metalness: 0.05,
    });
    materials.push(matTimber);

    const matDarkWood = new THREE.MeshStandardMaterial({
      color: 0x381e09,
      roughness: 0.8,
    });
    materials.push(matDarkWood);

    const matWhiteWall = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.05,
    });
    materials.push(matWhiteWall);

    const matModernBlueWall = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.1,
    });
    materials.push(matModernBlueWall);

    const matRoof = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.2,
    });
    materials.push(matRoof);

    // Glass & Water
    const matGlowingWindow = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.4,
      roughness: 0.15,
    });
    materials.push(matGlowingWindow);

    const matPoolWater = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88,
    });
    materials.push(matPoolWater);

    const matStone = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
    });
    materials.push(matStone);

    const matFoliageDark = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.8,
    });
    materials.push(matFoliageDark);

    const matFoliageLight = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.7,
    });
    materials.push(matFoliageLight);

    const matCloud = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    materials.push(matCloud);

    // ── CIRCULAR DIORAMA PLATFORM (Island Plinth like Reference 1) ──
    const islandGeo = new THREE.CylinderGeometry(4.4, 3.6, 0.65, 36);
    geometries.push(islandGeo);
    const island = new THREE.Mesh(islandGeo, matGrass);
    island.position.y = -0.325;
    island.receiveShadow = true;
    worldGroup.add(island);

    const islandBaseGeo = new THREE.ConeGeometry(3.6, 2.4, 36);
    geometries.push(islandBaseGeo);
    const islandBase = new THREE.Mesh(islandBaseGeo, matDirt);
    islandBase.rotation.x = Math.PI;
    islandBase.position.y = -1.85;
    worldGroup.add(islandBase);

    // ── VILLA ARCHITECTURE (Open Luxury Concept) ──
    const villaGroup = new THREE.Group();
    villaGroup.position.set(0.3, 0, 0.1);

    // Wooden Sundeck / Patio
    const patioGeo = new THREE.BoxGeometry(3.2, 0.12, 3.0);
    geometries.push(patioGeo);
    const patio = new THREE.Mesh(patioGeo, matDarkWood);
    patio.position.set(-0.2, 0.06, 0.1);
    patio.castShadow = true;
    patio.receiveShadow = true;
    villaGroup.add(patio);

    // Main Architectural Accent Wall (Modern Teal/Blue - Reference 1 style)
    const accentWallGeo = new THREE.BoxGeometry(0.2, 1.8, 2.2);
    geometries.push(accentWallGeo);
    const accentWall = new THREE.Mesh(accentWallGeo, matModernBlueWall);
    accentWall.position.set(-1.1, 0.95, -0.2);
    accentWall.castShadow = true;
    accentWall.receiveShadow = true;
    villaGroup.add(accentWall);

    // Main House Body (White / Natural Wood)
    const mainBodyGeo = new THREE.BoxGeometry(2.2, 1.6, 1.9);
    geometries.push(mainBodyGeo);
    const mainBody = new THREE.Mesh(mainBodyGeo, matWhiteWall);
    mainBody.position.set(0.1, 0.85, -0.3);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    villaGroup.add(mainBody);

    // Modern Cantilever / Slanted Roof
    const roofGeo = new THREE.BoxGeometry(2.6, 0.14, 2.3);
    geometries.push(roofGeo);
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.position.set(0.05, 1.72, -0.25);
    roof.rotation.z = -0.05;
    roof.castShadow = true;
    villaGroup.add(roof);

    // Floor-to-ceiling Glowing Glass Windows
    const glassWindowGeo = new THREE.PlaneGeometry(1.6, 1.3);
    geometries.push(glassWindowGeo);
    const frontGlass = new THREE.Mesh(glassWindowGeo, matGlowingWindow);
    frontGlass.position.set(0.2, 0.8, 0.66);
    villaGroup.add(frontGlass);

    // Chimney & Stone accents
    const chimneyGeo = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    geometries.push(chimneyGeo);
    const chimney = new THREE.Mesh(chimneyGeo, matStone);
    chimney.position.set(0.8, 1.9, -0.7);
    chimney.castShadow = true;
    villaGroup.add(chimney);

    // Mini Swimming Pool (Plunge Pool / Reflection Pool)
    const poolBorderGeo = new THREE.BoxGeometry(1.5, 0.18, 1.2);
    geometries.push(poolBorderGeo);
    const poolBorder = new THREE.Mesh(poolBorderGeo, matStone);
    poolBorder.position.set(-2.2, 0.06, 0.8);
    poolBorder.receiveShadow = true;
    villaGroup.add(poolBorder);

    const poolWaterGeo = new THREE.PlaneGeometry(1.3, 1.0);
    geometries.push(poolWaterGeo);
    const poolWater = new THREE.Mesh(poolWaterGeo, matPoolWater);
    poolWater.position.set(-2.2, 0.16, 0.8);
    poolWater.rotation.x = -Math.PI / 2;
    villaGroup.add(poolWater);

    // Loungers / Patio chairs near pool
    const chairGeo = new THREE.BoxGeometry(0.4, 0.15, 0.7);
    geometries.push(chairGeo);
    const chair1 = new THREE.Mesh(chairGeo, matWhiteWall);
    chair1.position.set(-1.8, 0.16, 1.8);
    chair1.rotation.y = 0.2;
    chair1.castShadow = true;
    villaGroup.add(chair1);

    worldGroup.add(villaGroup);

    // ── PATHWAY & GARDEN STEPPING STONES ──
    const stoneCoords = [
      [0.2, 0.01, 1.6, 0.38],
      [0.4, 0.01, 2.1, 0.34],
      [0.1, 0.01, 2.6, 0.36],
      [0.35, 0.01, 3.1, 0.32],
    ];
    stoneCoords.forEach(([x, y, z, size]) => {
      const stoneGeo = new THREE.CylinderGeometry(size, size * 1.1, 0.04, 7);
      geometries.push(stoneGeo);
      const stone = new THREE.Mesh(stoneGeo, matStone);
      stone.position.set(x, y, z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      worldGroup.add(stone);
    });

    // ── NATURE ELEMENTS (Trees & Flora) ──
    function createPineTree(x: number, z: number, scaleFactor: number = 1) {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.12 * scaleFactor, 0.16 * scaleFactor, 0.6 * scaleFactor, 7);
      geometries.push(trunkGeo);
      const trunk = new THREE.Mesh(trunkGeo, matDarkWood);
      trunk.position.y = 0.3 * scaleFactor;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Conical Tiers
      const tiers = [
        { r: 0.95 * scaleFactor, h: 0.95 * scaleFactor, y: 0.75 * scaleFactor, mat: matFoliageDark },
        { r: 0.72 * scaleFactor, h: 0.85 * scaleFactor, y: 1.3 * scaleFactor, mat: matFoliageLight },
        { r: 0.48 * scaleFactor, h: 0.75 * scaleFactor, y: 1.8 * scaleFactor, mat: matFoliageDark },
      ];

      tiers.forEach((t) => {
        const coneGeo = new THREE.ConeGeometry(t.r, t.h, 7);
        geometries.push(coneGeo);
        const cone = new THREE.Mesh(coneGeo, t.mat);
        cone.position.y = t.y;
        cone.castShadow = true;
        cone.receiveShadow = true;
        treeGroup.add(cone);
      });

      worldGroup.add(treeGroup);
    }

    createPineTree(-2.5, -1.4, 1.15);
    createPineTree(-3.0, 0.2, 0.9);
    createPineTree(2.4, -1.6, 1.2);
    createPineTree(2.9, 0.4, 0.85);
    createPineTree(1.9, 2.1, 0.7);

    // Decorative Shrubs
    const shrubCoords = [
      [-1.4, 0.15, 1.5, 0.28],
      [1.4, 0.15, 1.4, 0.32],
      [-0.9, 0.15, 2.4, 0.22],
      [2.2, 0.15, -0.4, 0.35],
    ];
    shrubCoords.forEach(([x, y, z, r]) => {
      const shrubGeo = new THREE.DodecahedronGeometry(r, 1);
      geometries.push(shrubGeo);
      const shrub = new THREE.Mesh(shrubGeo, matFoliageLight);
      shrub.position.set(x, y, z);
      shrub.castShadow = true;
      worldGroup.add(shrub);
    });

    // ── FLOATING CLOUDS ──
    const cloudsGroup = new THREE.Group();
    function createCloud(x: number, y: number, z: number, scaleVal: number = 1) {
      const singleCloud = new THREE.Group();
      singleCloud.position.set(x, y, z);

      const puffs = [
        { r: 0.5 * scaleVal, x: 0, y: 0, z: 0 },
        { r: 0.38 * scaleVal, x: -0.4 * scaleVal, y: -0.05 * scaleVal, z: 0 },
        { r: 0.35 * scaleVal, x: 0.4 * scaleVal, y: -0.05 * scaleVal, z: 0.1 },
        { r: 0.28 * scaleVal, x: 0, y: 0.25 * scaleVal, z: 0 },
      ];

      puffs.forEach((p) => {
        const puffGeo = new THREE.DodecahedronGeometry(p.r, 1);
        geometries.push(puffGeo);
        const puffMesh = new THREE.Mesh(puffGeo, matCloud);
        puffMesh.position.set(p.x, p.y, p.z);
        singleCloud.add(puffMesh);
      });

      cloudsGroup.add(singleCloud);
    }

    createCloud(-3.8, 3.4, -2.5, 1.2);
    createCloud(3.4, 3.8, -3.2, 1.4);
    createCloud(0.4, 4.2, -4.5, 1.0);
    worldGroup.add(cloudsGroup);

    // ── CHIMNEY SMOKE PARTICLES ──
    const smokeCount = 12;
    const smokeParticles: { mesh: THREE.Mesh; speed: number; startY: number }[] = [];
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.5,
      roughness: 0.85,
    });
    materials.push(smokeMat);

    for (let i = 0; i < smokeCount; i++) {
      const sGeo = new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.05, 0);
      geometries.push(sGeo);
      const sMesh = new THREE.Mesh(sGeo, smokeMat);
      const startY = 2.45 + (i / smokeCount) * 1.5;
      sMesh.position.set(
        1.1 + (Math.random() - 0.5) * 0.1,
        startY,
        -0.6 + (Math.random() - 0.5) * 0.1
      );
      villaGroup.add(sMesh);
      smokeParticles.push({
        mesh: sMesh,
        speed: 0.008 + Math.random() * 0.006,
        startY: 2.45,
      });
    }

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

    // Resize Handler
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

    setIsLoaded(true);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      if (!prefersReducedMotion) {
        // Subtle floating / breathing animation
        worldGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;

        // Gentle world tilt based on mouse position
        worldGroup.rotation.y = 0.2 + mouse.x * 0.22;
        worldGroup.rotation.x = -mouse.y * 0.12;

        // Animate smoke particles
        smokeParticles.forEach((sp, idx) => {
          sp.mesh.position.y += sp.speed;
          sp.mesh.position.x = 1.1 + Math.sin(elapsedTime * 2 + idx) * 0.05;
          sp.mesh.position.z = -0.6 + Math.cos(elapsedTime * 1.5 + idx) * 0.05;

          const progress = (sp.mesh.position.y - sp.startY) / 1.6;
          sp.mesh.scale.setScalar(1 + progress * 1.8);

          if (sp.mesh.position.y > 4.0) {
            sp.mesh.position.y = sp.startY;
            sp.mesh.scale.setScalar(1);
          }
        });

        // Gentle cloud drift
        cloudsGroup.position.x = Math.sin(elapsedTime * 0.15) * 0.35;

        // Warm light subtle pulsing
        cabinInteriorLight.intensity = 3.5 + Math.sin(elapsedTime * 3) * 0.35;
      }

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP & DISPOSAL
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
      <div className="w-full h-full min-h-[380px] rounded-3xl bg-gradient-to-tr from-blue-950 to-slate-900 flex items-center justify-center p-8 text-center text-blue-200">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 mx-auto flex items-center justify-center mb-3">
            🏡
          </div>
          <h4 className="font-bold text-white text-base">Không gian Homestay Xanh</h4>
          <p className="text-xs text-blue-300 mt-1">Trải nghiệm nghỉ dưỡng bình yên trọn vẹn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating feature badge on 3D viewport */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Peaceful Villa 3D View</span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-300 font-medium">
        <span>✨ Rê chuột để xoay góc nhìn</span>
      </div>
    </div>
  );
}
