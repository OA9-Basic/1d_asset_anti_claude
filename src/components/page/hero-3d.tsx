'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Enhanced 3D Hero Background Component
 *
 * Creates an interactive 3D scene with:
 * - Floating geometric shapes with wireframe materials
 * - Particle system
 * - Mouse interaction
 * - Smooth animations
 */

interface Hero3DProps {
  className?: string;
}

export function Hero3D({ className = '' }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create main geometric shape - Icosahedron with wireframe
    const mainGeometry = new THREE.IcosahedronGeometry(2, 1);
    const mainMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // violet-500
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const mainShape = new THREE.Mesh(mainGeometry, mainMaterial);
    scene.add(mainShape);

    // Inner shape - smaller Icosahedron
    const innerGeometry = new THREE.IcosahedronGeometry(1, 0);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xa78bfa, // violet-400
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const innerShape = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerShape);

    // Floating particles - create multiple small shapes
    const particlesGroup = new THREE.Group();

    interface FloatingShape {
      mesh: THREE.Mesh;
      rotationSpeed: {
        x: number;
        y: number;
        z: number;
      };
      floatSpeed: number;
      floatOffset: number;
    }

    const floatingShapes: FloatingShape[] = [];

    const shapeTypes = [
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.OctahedronGeometry(0.25, 0),
      new THREE.TetrahedronGeometry(0.3, 0),
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = shapeTypes[i % shapeTypes.length];
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x8b5cf6 : 0xa78bfa,
        wireframe: true,
        transparent: true,
        opacity: 0.1 + Math.random() * 0.15,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 2
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.scale.setScalar(0.3 + Math.random() * 0.4);

      particlesGroup.add(mesh);
      floatingShapes.push({
        mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: 0.001 + Math.random() * 0.002,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    scene.add(particlesGroup);

    // Point cloud particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.4,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Touch support
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    function animate() {
      const time = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate main shapes
      mainShape.rotation.x = time * 0.1 + targetY * 0.5;
      mainShape.rotation.y = time * 0.15 + targetX * 0.5;

      innerShape.rotation.x = time * 0.15 + targetY * 0.3;
      innerShape.rotation.y = time * 0.2 + targetX * 0.3;

      // Animate floating shapes
      floatingShapes.forEach((item) => {
        const { mesh, rotationSpeed, floatSpeed, floatOffset } = item;

        mesh.rotation.x += rotationSpeed.x;
        mesh.rotation.y += rotationSpeed.y;
        mesh.rotation.z += rotationSpeed.z;

        // Floating motion
        mesh.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.002;

        // Subtle mouse influence
        mesh.position.x += (targetX * 0.5 - mesh.position.x) * 0.01;
        mesh.position.y += (targetY * 0.5 - mesh.position.y) * 0.01;
      });

      // Rotate particles slowly
      particlesMesh.rotation.y = time * 0.03;
      particlesMesh.rotation.x = targetY * 0.1;

      // Camera subtle movement
      camera.position.x += (targetX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (targetY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();

      // Dispose geometries and materials
      mainGeometry.dispose();
      mainMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();

      floatingShapes.forEach((item) => {
        if (item.mesh.geometry) item.mesh.geometry.dispose();
        if (item.mesh.material) (item.mesh.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
