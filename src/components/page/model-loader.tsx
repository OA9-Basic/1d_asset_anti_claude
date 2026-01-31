'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * 3D Model Loader Component
 *
 * Loads and displays GLTF/GLB 3D models
 * Supports rotation, scaling, and mouse interaction
 */

interface ModelLoaderProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  scale?: number;
  position?: [number, number, number];
}

export function ModelLoader({
  modelPath,
  className = '',
  autoRotate = true,
  scale = 1,
  position = [0, 0, 0],
}: ModelLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // ═══════════════════════════════════════════════════════════════
    // LOAD 3D MODEL - Manual fetch workaround for Next.js compatibility
    // ═══════════════════════════════════════════════════════════════
    // NOTE: GLTFLoader's internal XHR fails with Next.js in some cases.
    // We manually fetch the file and use loader.parse() instead.

    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;

    // Set resource path for associated files (textures, etc.)
    loader.setResourcePath(modelPath.substring(0, modelPath.lastIndexOf('/') + 1));

    // Manual fetch + parse approach
    const loadModel = async () => {
      try {
        console.log('🎮 Loading 3D model:', modelPath);

        const response = await fetch(modelPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('✅ Model fetched, size:', arrayBuffer.byteLength, 'bytes');

        // Parse the GLB data
        loader.parse(
          arrayBuffer,
          '', // No URL needed since we have the data directly
          (gltf) => {
            console.log('✅ Model parsed successfully!');
            model = gltf.scene;
            model.scale.setScalar(scale);
            model.position.set(...position);
            scene.add(model);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Error parsing GLB:', err);
            setError('Failed to parse 3D model');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('❌ Error loading model:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    };

    loadModel();

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    function animate() {
      const time = clock.getElapsedTime();

      if (model && autoRotate) {
        model.rotation.y = time * 0.3;
        // Subtle floating motion
        model.position.y = position[1] + Math.sin(time) * 0.1;
      }

      // Mouse interaction - subtle camera movement
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.3 + 1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [modelPath, autoRotate, scale, position]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-700 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading 3D model...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
