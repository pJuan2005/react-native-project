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
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    // CAMERA
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7.5, 5.2, 8.5);
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
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL initialization fallback:", err);
      setHasWebGlError(true);
      return;
    }

    // MAIN GROUP FOR ROTATION / PARALLAX
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ── LIGHTING ──
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cozy Window & Porch Light
    const cabinLight = new THREE.PointLight(0xf59e0b, 3.5, 6, 1.8);
    cabinLight.position.set(0, 1.2, 0.8);
    worldGroup.add(cabinLight);

    const secondaryWarmLight = new THREE.PointLight(0x38bdf8, 1.5, 8, 2);
    secondaryWarmLight.position.set(-2, 2, -2);
    worldGroup.add(secondaryWarmLight);

    // ── MATERIALS (Reusable) ──
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const matGrass = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      metalness: 0.1,
    });
    materials.push(matGrass);

    const matDirt = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
    });
    materials.push(matDirt);

    const matWood = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.7,
      metalness: 0.05,
    });
    materials.push(matWood);

    const matDarkWood = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.8,
    });
    materials.push(matDarkWood);

    const matRoof = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.15,
    });
    materials.push(matRoof);

    const matGlowingWindow = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    materials.push(matGlowingWindow);

    const matFoliage = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.8,
    });
    materials.push(matFoliage);

    const matFoliageLight = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.75,
    });
    materials.push(matFoliageLight);

    const matStone = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.9,
    });
    materials.push(matStone);

    const matCloud = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      transparent: true,
      opacity: 0.82,
    });
    materials.push(matCloud);

    // ── TERRAIN (Floating Grass Island) ──
    const islandGeo = new THREE.CylinderGeometry(4.2, 3.2, 0.7, 32);
    geometries.push(islandGeo);
    const island = new THREE.Mesh(islandGeo, matGrass);
    island.position.y = -0.35;
    island.receiveShadow = true;
    worldGroup.add(island);

    const islandBaseGeo = new THREE.ConeGeometry(3.2, 2.2, 32);
    geometries.push(islandBaseGeo);
    const islandBase = new THREE.Mesh(islandBaseGeo, matDirt);
    islandBase.rotation.x = Math.PI;
    islandBase.position.y = -1.8;
    worldGroup.add(islandBase);

    // Stepping Pathway Stones
    const pathCoords = [
      [0, 0.01, 1.4, 0.35],
      [0.2, 0.01, 1.9, 0.32],
      [-0.1, 0.01, 2.4, 0.38],
      [0.15, 0.01, 2.9, 0.34],
    ];
    pathCoords.forEach(([x, y, z, size]) => {
      const stoneGeo = new THREE.CylinderGeometry(size, size * 1.1, 0.05, 8);
      geometries.push(stoneGeo);
      const stone = new THREE.Mesh(stoneGeo, matStone);
      stone.position.set(x, y, z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      worldGroup.add(stone);
    });

    // ── COZY HOMESTAY CABIN ──
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, 0, 0.2);

    // Main House Body
    const houseBodyGeo = new THREE.BoxGeometry(2.2, 1.4, 1.8);
    geometries.push(houseBodyGeo);
    const houseBody = new THREE.Mesh(houseBodyGeo, matWood);
    houseBody.position.y = 0.7;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    cabinGroup.add(houseBody);

    // Foundation / Deck
    const deckGeo = new THREE.BoxGeometry(2.6, 0.15, 2.4);
    geometries.push(deckGeo);
    const deck = new THREE.Mesh(deckGeo, matDarkWood);
    deck.position.set(0, 0.075, 0.2);
    deck.castShadow = true;
    deck.receiveShadow = true;
    cabinGroup.add(deck);

    // Pitched Roof
    const roofGeo = new THREE.ConeGeometry(2.1, 1.1, 4);
    geometries.push(roofGeo);
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.position.y = 1.95;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.15, 1, 0.95);
    roof.castShadow = true;
    cabinGroup.add(roof);

    // Chimney
    const chimneyGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    geometries.push(chimneyGeo);
    const chimney = new THREE.Mesh(chimneyGeo, matStone);
    chimney.position.set(0.65, 2.0, -0.2);
    chimney.castShadow = true;
    cabinGroup.add(chimney);

    // Glowing Windows
    const windowFrontGeo = new THREE.PlaneGeometry(0.45, 0.45);
    geometries.push(windowFrontGeo);
    const windowFrontLeft = new THREE.Mesh(windowFrontGeo, matGlowingWindow);
    windowFrontLeft.position.set(-0.55, 0.85, 0.91);
    cabinGroup.add(windowFrontLeft);

    const windowFrontRight = new THREE.Mesh(windowFrontGeo, matGlowingWindow);
    windowFrontRight.position.set(0.55, 0.85, 0.91);
    cabinGroup.add(windowFrontRight);

    // Wooden Door
    const doorGeo = new THREE.PlaneGeometry(0.45, 0.8);
    geometries.push(doorGeo);
    const door = new THREE.Mesh(doorGeo, matDarkWood);
    door.position.set(0, 0.475, 0.91);
    cabinGroup.add(door);

    // Side Window
    const sideWindowGeo = new THREE.PlaneGeometry(0.5, 0.5);
    geometries.push(sideWindowGeo);
    const sideWindow = new THREE.Mesh(sideWindowGeo, matGlowingWindow);
    sideWindow.position.set(-1.11, 0.85, 0);
    sideWindow.rotation.y = -Math.PI / 2;
    cabinGroup.add(sideWindow);

    worldGroup.add(cabinGroup);

    // ── NATURE ELEMENTS: PINE TREES ──
    function createPineTree(x: number, z: number, scaleFactor: number = 1) {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.12 * scaleFactor, 0.16 * scaleFactor, 0.6 * scaleFactor, 8);
      geometries.push(trunkGeo);
      const trunk = new THREE.Mesh(trunkGeo, matDarkWood);
      trunk.position.y = (0.3 * scaleFactor);
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Cones
      const tiers = [
        { r: 0.9 * scaleFactor, h: 0.9 * scaleFactor, y: 0.7 * scaleFactor, mat: matFoliage },
        { r: 0.7 * scaleFactor, h: 0.8 * scaleFactor, y: 1.2 * scaleFactor, mat: matFoliageLight },
        { r: 0.45 * scaleFactor, h: 0.7 * scaleFactor, y: 1.7 * scaleFactor, mat: matFoliage },
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

    createPineTree(-2.2, -1.2, 1.15);
    createPineTree(-2.8, 0.4, 0.85);
    createPineTree(-1.8, -2.1, 0.95);
    createPineTree(2.2, -1.4, 1.1);
    createPineTree(2.7, 0.6, 0.8);
    createPineTree(1.8, 2.0, 0.65);

    // ── FLOATING CLOUDS ──
    const cloudsGroup = new THREE.Group();
    const cloudGeos: THREE.Mesh[] = [];

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
      cloudGeos.push(singleCloud as any);
    }

    createCloud(-3.5, 3.2, -2.5, 1.2);
    createCloud(3.2, 3.6, -3.0, 1.4);
    createCloud(0.5, 4.0, -4.5, 1.0);
    worldGroup.add(cloudsGroup);

    // ── SMOKE PARTICLES FROM CHIMNEY ──
    const smokeCount = 12;
    const smokeParticles: { mesh: THREE.Mesh; speed: number; startY: number }[] = [];
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.55,
      roughness: 0.8,
    });
    materials.push(smokeMat);

    for (let i = 0; i < smokeCount; i++) {
      const sGeo = new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06, 0);
      geometries.push(sGeo);
      const sMesh = new THREE.Mesh(sGeo, smokeMat);
      const startY = 2.45 + (i / smokeCount) * 1.5;
      sMesh.position.set(
        0.65 + (Math.random() - 0.5) * 0.1,
        startY,
        -0.2 + (Math.random() - 0.5) * 0.1
      );
      cabinGroup.add(sMesh);
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
        worldGroup.rotation.y = 0.15 + mouse.x * 0.22;
        worldGroup.rotation.x = -mouse.y * 0.12;

        // Animate smoke particles
        smokeParticles.forEach((sp, idx) => {
          sp.mesh.position.y += sp.speed;
          sp.mesh.position.x = 0.65 + Math.sin(elapsedTime * 2 + idx) * 0.06;
          sp.mesh.position.z = -0.2 + Math.cos(elapsedTime * 1.5 + idx) * 0.06;

          const progress = (sp.mesh.position.y - sp.startY) / 1.6;
          sp.mesh.scale.setScalar(1 + progress * 1.8);

          if (sp.mesh.position.y > 4.0) {
            sp.mesh.position.y = sp.startY;
            sp.mesh.scale.setScalar(1);
          }
        });

        // Gentle cloud drift
        cloudsGroup.position.x = Math.sin(elapsedTime * 0.15) * 0.4;

        // Warm light subtle pulsing
        cabinLight.intensity = 3.2 + Math.sin(elapsedTime * 3) * 0.4;
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
      <div className="w-full h-full min-h-[380px] rounded-3xl bg-gradient-to-tr from-blue-900 to-indigo-950 flex items-center justify-center p-8 text-center text-blue-200">
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

      {/* Subtle floating feature tags on 3D viewport */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Peaceful Nature 3D View</span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-300 font-medium">
        <span>✨ Rê chuột để tương tác</span>
      </div>
    </div>
  );
}
