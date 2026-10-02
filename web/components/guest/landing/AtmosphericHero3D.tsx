"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function AtmosphericHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // SCENE & FOG
    const scene = new THREE.Scene();
    // Warm twilight blue-slate fog
    const fogColor = new THREE.Color(0x0e1726);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(fogColor, 0.045);

    // CAMERA
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7.2, 3.8, 8.8);
    camera.lookAt(0, 1.2, -0.5);

    // RENDERER
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL initialization failed:", err);
      setHasError(true);
      return;
    }

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ── LIGHTING (Atmospheric Sunset / Golden Hour) ──
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    // Warm Sun Light from the horizon
    const sunLight = new THREE.DirectionalLight(0xfde68a, 2.4);
    sunLight.position.set(12, 8, -6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Soft sky reflection fill
    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.7);
    skyFill.position.set(-8, 12, 10);
    scene.add(skyFill);

    // Warm Interior Glow of the Villa
    const interiorGlow = new THREE.PointLight(0xfbbf24, 4.5, 9, 1.4);
    interiorGlow.position.set(0.2, 1.6, 0.2);
    scene.add(interiorGlow);

    const deckLantern = new THREE.PointLight(0xfef08a, 1.8, 5, 1.5);
    deckLantern.position.set(2.4, 0.6, 2.0);
    scene.add(deckLantern);

    // ── MATERIALS (Architectural Natural Materials) ──
    const woodDeckMaterial = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.65,
      metalness: 0.05,
    });

    const slateRoofMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.2,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
    });

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1,
    });

    const warmInteriorMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.4,
    });

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a2f,
      roughness: 0.75,
      metalness: 0.05,
    });

    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f2b46,
      roughness: 0.15,
      metalness: 0.65,
    });

    // ── GEOMETRY ──

    // 1. Water Plane (Lake / Infinity Reflection)
    const waterGeo = new THREE.PlaneGeometry(36, 36, 40, 40);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMesh = new THREE.Mesh(waterGeo, waterMaterial);
    waterMesh.position.set(0, -0.05, 0);
    waterMesh.receiveShadow = true;
    rootGroup.add(waterMesh);

    // 2. Wooden Lakeside Terrace Deck
    const deckGeo = new THREE.BoxGeometry(6.4, 0.28, 5.2);
    const deckMesh = new THREE.Mesh(deckGeo, woodDeckMaterial);
    deckMesh.position.set(0.4, 0.14, 0.2);
    deckMesh.receiveShadow = true;
    deckMesh.castShadow = true;
    rootGroup.add(deckMesh);

    // Deck Pier Extension over water
    const pierGeo = new THREE.BoxGeometry(2.2, 0.18, 3.2);
    const pierMesh = new THREE.Mesh(pierGeo, woodDeckMaterial);
    pierMesh.position.set(2.4, 0.09, 2.2);
    pierMesh.receiveShadow = true;
    pierMesh.castShadow = true;
    rootGroup.add(pierMesh);

    // 3. Contemporary Minimalist Villa (Floor-to-ceiling glass & slate overhang)
    // Stone foundation / rear wall
    const rearWallGeo = new THREE.BoxGeometry(0.3, 2.5, 4.6);
    const rearWall = new THREE.Mesh(rearWallGeo, stoneMaterial);
    rearWall.position.set(-2.6, 1.4, 0.2);
    rearWall.castShadow = true;
    rearWall.receiveShadow = true;
    rootGroup.add(rearWall);

    // Warm Interior Core
    const interiorCoreGeo = new THREE.BoxGeometry(2.4, 2.2, 2.8);
    const interiorCore = new THREE.Mesh(interiorCoreGeo, warmInteriorMaterial);
    interiorCore.position.set(-1.2, 1.35, 0.1);
    rootGroup.add(interiorCore);

    // Slender Wooden / Dark Metal Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 12);
    const pillarPositions = [
      [1.8, 1.4, 2.4],
      [1.8, 1.4, -1.8],
      [-0.4, 1.4, 2.4],
      [-0.4, 1.4, -1.8],
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, slateRoofMaterial);
      pillar.position.set(px, py, pz);
      pillar.castShadow = true;
      rootGroup.add(pillar);
    });

    // Glass Facade (Front & Sides)
    const frontGlassGeo = new THREE.BoxGeometry(0.06, 2.3, 4.2);
    const frontGlass = new THREE.Mesh(frontGlassGeo, glassMaterial);
    frontGlass.position.set(1.7, 1.4, 0.2);
    rootGroup.add(frontGlass);

    const sideGlassGeo = new THREE.BoxGeometry(3.6, 2.3, 0.06);
    const sideGlass = new THREE.Mesh(sideGlassGeo, glassMaterial);
    sideGlass.position.set(-0.2, 1.4, 2.3);
    rootGroup.add(sideGlass);

    // Modern Floating Overhanging Roof
    const roofGeo = new THREE.BoxGeometry(6.2, 0.22, 5.6);
    const roofMesh = new THREE.Mesh(roofGeo, slateRoofMaterial);
    roofMesh.position.set(0.3, 2.65, 0.2);
    roofMesh.castShadow = true;
    rootGroup.add(roofMesh);

    // Secondary Upper Loft Accent
    const loftGeo = new THREE.BoxGeometry(3.0, 1.1, 2.6);
    const loftMesh = new THREE.Mesh(loftGeo, woodDeckMaterial);
    loftMesh.position.set(-0.8, 3.25, 0.0);
    loftMesh.castShadow = true;
    rootGroup.add(loftMesh);

    const loftRoofGeo = new THREE.BoxGeometry(3.6, 0.16, 3.2);
    const loftRoof = new THREE.Mesh(loftRoofGeo, slateRoofMaterial);
    loftRoof.position.set(-0.8, 3.85, 0.0);
    loftRoof.castShadow = true;
    rootGroup.add(loftRoof);

    // 4. Natural Pine Trees & Foliage (Soft Organic Silhouettes)
    const foliageGroup = new THREE.Group();
    rootGroup.add(foliageGroup);

    function createOrganicTree(x: number, z: number, scale = 1) {
      const tree = new THREE.Group();

      const trunkGeo = new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 2.2 * scale, 8);
      const trunk = new THREE.Mesh(trunkGeo, woodDeckMaterial);
      trunk.position.y = 1.1 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      // Tiered soft foliage spheres
      const tiers = [
        { y: 1.8 * scale, r: 0.9 * scale },
        { y: 2.6 * scale, r: 0.72 * scale },
        { y: 3.3 * scale, r: 0.5 * scale },
      ];
      tiers.forEach((t) => {
        const leafGeo = new THREE.SphereGeometry(t.r, 12, 10);
        leafGeo.scale(1, 1.25, 1);
        const leaf = new THREE.Mesh(leafGeo, foliageMaterial);
        leaf.position.y = t.y;
        leaf.castShadow = true;
        tree.add(leaf);
      });

      tree.position.set(x, 0.1, z);
      return tree;
    }

    const treeConfigs = [
      [-3.8, -1.8, 1.3],
      [-4.6, 0.6, 1.15],
      [-3.4, 2.8, 0.9],
      [-2.2, -3.2, 1.2],
      [3.6, -3.0, 0.85],
      [-5.2, -1.2, 1.5],
    ];
    treeConfigs.forEach(([tx, tz, ts]) => {
      foliageGroup.add(createOrganicTree(tx, tz, ts));
    });

    // 5. Distant Mountain Silhouettes in Evening Mist
    const mountainGroup = new THREE.Group();
    rootGroup.add(mountainGroup);

    const mountainGeo = new THREE.ConeGeometry(7, 4.5, 6);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x162232,
      roughness: 0.95,
      metalness: 0.05,
    });

    const mountain1 = new THREE.Mesh(mountainGeo, mountainMat);
    mountain1.position.set(-8, 1.6, -14);
    mountain1.scale.set(1.4, 1.2, 1);
    mountainGroup.add(mountain1);

    const mountain2 = new THREE.Mesh(mountainGeo, mountainMat);
    mountain2.position.set(2, 2.1, -16);
    mountain2.scale.set(1.8, 1.5, 1.2);
    mountainGroup.add(mountain2);

    const mountain3 = new THREE.Mesh(mountainGeo, mountainMat);
    mountain3.position.set(11, 1.4, -13);
    mountain3.scale.set(1.2, 1.0, 1);
    mountainGroup.add(mountain3);

    // 6. Floating Warm Dust / Fireflies
    const particleCount = prefersReducedMotion ? 15 : 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = Math.random() * 4.5 + 0.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    // ── MOUSE PARALLAX & GENTLE DAMPING ──
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = nx * 0.08;
      targetRotationX = ny * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ── ANIMATION LOOP ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax damping
      currentRotationX += (targetRotationX - currentRotationX) * 0.035;
      currentRotationY += (targetRotationY - currentRotationY) * 0.035;
      rootGroup.rotation.y = currentRotationY;
      rootGroup.rotation.x = currentRotationX;

      // Subtle water wave displacement animation
      if (!prefersReducedMotion) {
        const pos = waterGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getZ(i);
          const wave = Math.sin(u * 0.5 + elapsedTime * 0.7) * 0.03 + Math.cos(v * 0.6 + elapsedTime * 0.6) * 0.02;
          pos.setY(i, wave);
        }
        pos.needsUpdate = true;

        // Gentle breathing light of interior glow
        interiorGlow.intensity = 4.2 + Math.sin(elapsedTime * 1.5) * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── RESIZE LISTENER ──
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 700;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener("resize", handleResize);

    // ── CLEANUP ON UNMOUNT ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // Dispose resources
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      waterGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #09121d 0%, #0f2137 50%, #163654 100%)",
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
