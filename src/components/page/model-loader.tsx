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
    // LOAD 3D MODEL - Manual fetch with custom resource loading
    // ═══════════════════════════════════════════════════════════════
    // GLTFLoader.parse() still tries to fetch resources via XHR.
    // We need to provide a custom resource loader callback.

    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;

    // Override the resource loading to use fetch instead of XHR
    const loadModel = async () => {
      try {
        console.log('🎮 Loading 3D model:', modelPath);

        const response = await fetch(modelPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('✅ Model fetched, size:', arrayBuffer.byteLength, 'bytes');

        // Verify it's a valid GLB file (starts with 'glTF' magic bytes)
        const header = new Uint8Array(arrayBuffer, 0, 4);
        const magic = String.fromCharCode(header[0], header[1], header[2], header[3]);
        console.log('🔍 File magic bytes:', magic, '(should be "glTF")');

        if (magic !== 'glTF') {
          console.error('❌ Not a valid GLB file! Magic bytes:', magic);
          // Check if we got HTML instead
          const textDecoder = new TextDecoder();
          const beginning = textDecoder.decode(arrayBuffer.slice(0, 100));
          console.error('📄 File begins with:', beginning);
          throw new Error('Invalid GLB file format');
        }

        // Set up a resource loading manager that uses fetch instead of XHR
        const manager = new THREE.LoadingManager();
        const resourceLoader = new THREE.FileLoader(manager);

        // Override the load method to use fetch
        resourceLoader.load = function(url: string, onLoad?: (data: string | ArrayBuffer) => void, onProgress?: () => void, onError?: (err: unknown) => void) {
          fetch(url)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to load ${url}`);
              return res.arrayBuffer();
            })
            .then(buffer => {
              if (onLoad) onLoad(buffer);
            })
            .catch(err => {
              if (onError) onError(err);
            });
        };

        // Create new loader with custom manager
        const customLoader = new GLTFLoader(manager);

        // Parse with the full URL as base path
        const fullPath = new URL(modelPath, window.location.origin).href;
        console.log('📂 Full path for parsing:', fullPath);

        customLoader.parse(
          arrayBuffer,
          fullPath, // Use full URL as base path
          (gltf) => {
            console.log('✅ Model parsed successfully!');
            console.log('📦 Scene:', gltf.scene);
            console.log('🎨 Children:', gltf.scene.children);
            model = gltf.scene;
            model.scale.setScalar(scale);
            model.position.set(...position);
            scene.add(model);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Error parsing GLB:', err);
            console.error('🔴 Error details:', err);
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
