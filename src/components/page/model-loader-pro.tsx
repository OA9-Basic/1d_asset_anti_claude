'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Professional 3D Model Loader with Advanced Effects
 *
 * Features inspired by Awwwards-winning websites:
 * - Smooth loading animations
 * - Mouse/touch interactive rotation
 * - Parallax effects on scroll
 * - Professional lighting setup
 * - Auto-rotation with user override
 * - Fade-in on load complete
 * - Responsive to viewport changes
 */

interface ModelLoaderProProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
  scale?: number;
  position?: [number, number, number];
  enableControls?: boolean;
  loadingColor?: string;
  onModelLoaded?: () => void;
}

export function ModelLoaderPro({
  modelPath,
  className = '',
  autoRotate = true,
  rotateSpeed = 0.3,
  scale = 1,
  position = [0, 0, 0],
  enableControls = true,
  loadingColor = '#8b5cf6',
  onModelLoaded,
}: ModelLoaderProProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

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

    // Renderer with professional settings
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Professional lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Transparent for CSS backgrounds
    scene.background = null;

    let model: THREE.Group | null = null;

    // Load model with progress tracking
    const loadModel = async () => {
      try {
        const manager = new THREE.LoadingManager();

        // Track loading progress
        manager.onProgress = (url, loaded, total) => {
          const progress = (loaded / total) * 100;
          setLoadingProgress(Math.min(progress, 95));
        };

        manager.onLoad = () => {
          setLoadingProgress(100);
          setLoading(false);
          setModelLoaded(true);
          if (onModelLoaded) onModelLoaded();
        };

        const resourceLoader = new THREE.FileLoader(manager);
        resourceLoader.load = function(url, onLoad, onProgress, onError) {
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

        const response = await fetch(modelPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Verify GLB format
        const header = new Uint8Array(arrayBuffer, 0, 4);
        const magic = String.fromCharCode(header[0], header[1], header[2], header[3]);
        if (magic !== 'glTF') {
          throw new Error('Invalid GLB file format');
        }

        const customLoader = new GLTFLoader(manager);
        const fullPath = new URL(modelPath, window.location.origin).href;

        customLoader.parse(
          arrayBuffer,
          fullPath,
          (gltf) => {
            model = gltf.scene;

            // Enable shadows
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            model.scale.setScalar(scale);
            model.position.set(...position);
            scene.add(model);
          },
          (err) => {
            console.error('Error parsing GLB:', err);
            setError('Failed to parse 3D model');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    };

    loadModel();

    // Mouse/touch interaction state
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let manualRotationY = 0;
    let manualRotationX = 0;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (!enableControls) return;
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMouseX = clientX;
      previousMouseY = clientY;
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Parallax effect - subtle mouse tracking
      mouseX = (clientX / window.innerWidth) * 2 - 1;
      mouseY = -(clientY / window.innerHeight) * 2 + 1;

      if (isDragging && enableControls) {
        const deltaX = clientX - previousMouseX;
        const deltaY = clientY - previousMouseY;

        manualRotationY += deltaX * 0.01;
        manualRotationX += deltaY * 0.01;

        previousMouseX = clientX;
        previousMouseY = clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };

    // Mouse events
    if (enableControls) {
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchstart', handleMouseDown, { passive: true });
      window.addEventListener('touchmove', handleMouseMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }

    container.style.cursor = enableControls ? 'grab' : 'default';

    // Animation loop with smooth transitions
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let fadeIn = 0;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Fade in effect
      if (modelLoaded && fadeIn < 1) {
        fadeIn += 0.02;
        if (fadeIn > 1) fadeIn = 1;
      }

      if (model) {
        // Auto-rotation (unless user is manually controlling)
        if (autoRotate && !isDragging) {
          // Smooth blend between auto-rotation and manual rotation
          targetRotationY = time * rotateSpeed + manualRotationY;
          targetRotationX = manualRotationX;
        } else {
          targetRotationY = manualRotationY;
          targetRotationX = manualRotationX;
        }

        // Smooth interpolation
        model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;

        // Floating motion
        model.position.y = position[1] + Math.sin(time * 0.5) * 0.1;

        // Apply fade-in
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat.transparent !== undefined) {
              mat.opacity = fadeIn;
              mat.transparent = true;
            }
          }
        });
      }

      // Parallax camera movement
      const parallaxX = mouseX * 0.3;
      const parallaxY = mouseY * 0.2;

      camera.position.x += (parallaxX - camera.position.x) * 0.03;
      camera.position.y += (parallaxY + 1 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [modelPath, autoRotate, rotateSpeed, scale, position, enableControls, onModelLoaded, modelLoaded]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            {/* Circular Progress */}
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={loadingColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 - (175.93 * loadingProgress) / 100}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                {Math.round(loadingProgress)}%
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Loading 3D model...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 dark:bg-red-950/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-500 dark:text-red-400 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Drag hint (shows on first load) */}
      {modelLoaded && enableControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100 transition-opacity">
          <svg
            className="w-4 h-4 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M15 15l-3 3m0 0l-3-3m3 3V9m0 12a9 9 0 110-18 9 9 0 010 18z"
              strokeWidth={2}
            />
          </svg>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Drag to rotate
          </span>
        </div>
      )}
    </div>
  );
}
