"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const AirportAmbiance3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Cena, Câmara e Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.025);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05070a, 1);
    container.appendChild(renderer.domElement);

    // Luzes ambiente e holofotes de pista
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const runwaySpot1 = new THREE.SpotLight(0x38bdf8, 3, 40, Math.PI / 4, 0.5);
    runwaySpot1.position.set(-15, 12, 10);
    scene.add(runwaySpot1);

    const runwaySpot2 = new THREE.SpotLight(0xfbbf24, 2.5, 40, Math.PI / 4, 0.5);
    runwaySpot2.position.set(15, 12, 10);
    scene.add(runwaySpot2);

    // Grelha de pista / hangar no solo
    const gridHelper = new THREE.GridHelper(60, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Sistema de partículas de poeira atmosférica / hangar
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20 - 4;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Redimensionamento
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Loop de Animação
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Oscilação suave da câmara como uma torre de controlo ou observação
      camera.position.x = Math.sin(elapsedTime * 0.15) * 1.5;
      camera.position.y = 5 + Math.cos(elapsedTime * 0.1) * 0.4;
      camera.lookAt(0, 0, 0);

      // Rotação subtil das partículas
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
    />
  );
};
