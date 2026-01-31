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
  // Log props on mount
  console.log('🎮 ModelLoader Component Props:', { modelPath, className, autoRotate, scale, position });

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
    // EXTENSIVE LOGGING - 3D Model Loading Debug
    // ═══════════════════════════════════════════════════════════════

    console.group('🎮 3D Model Loader - Debug Session');
    console.log('📁 Model Path prop:', modelPath);
    console.log('🌐 Window location:', window.location.href);
    console.log('🔗 Window origin:', window.location.origin);
    console.log('📍 Current hostname:', window.location.hostname);
    console.log('⚡ Port:', window.location.port);
    console.log('🛤️ Full URL would be:', window.location.origin + modelPath);

    // Try multiple URL strategies and log each attempt
    const urlStrategies = [
      { name: 'Direct path', url: modelPath },
      { name: 'Origin + path', url: window.location.origin + modelPath },
      { name: 'Public path', url: '/public' + modelPath },
      { name: 'Absolute URL', url: new URL(modelPath, window.location.origin).href },
    ];

    console.log('🔍 Testing URL strategies:');
    urlStrategies.forEach((strategy, index) => {
      console.log(`  ${index + 1}. ${strategy.name}:`, strategy.url);
    });

    // Manual fetch to see what we actually get
    const testFetch = async (url: string, name: string) => {
      try {
        console.group(`🌐 Testing fetch for: ${name}`);
        console.log('📡 Fetching URL:', url);

        const response = await fetch(url);
        console.log('📊 Response status:', response.status, response.statusText);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('🔐 Content-Type:', response.headers.get('content-type'));
        console.log('📦 Content-Length:', response.headers.get('content-length'));

        const contentType = response.headers.get('content-type');
        const isHtml = contentType?.includes('html') || contentType?.includes('text/plain');

        if (isHtml) {
          const text = await response.text();
          console.warn('⚠️ Received HTML instead of GLB!');
          console.warn('📄 First 500 chars of response:', text.substring(0, 500));
          console.warn('📄 Full response:', text);
        } else if (contentType?.includes('application/octet-stream') || contentType?.includes('model/gltf-binary')) {
          console.log('✅ Looks like a valid GLB file!');
          const blob = await response.blob();
          console.log('📦 Blob size:', blob.size, 'bytes');
          console.log('📦 Blob type:', blob.type);
        } else {
          console.warn('❓ Unknown content type:', contentType);
          const text = await response.text();
          console.warn('📄 First 200 chars:', text.substring(0, 200));
        }

        console.groupEnd();
        return { success: response.ok, contentType, url };
      } catch (err) {
        console.error(`❌ Fetch failed for ${name}:`, err);
        console.groupEnd();
        return { success: false, contentType: null, url };
      }
    };

    // Test all strategies
    Promise.all(urlStrategies.map(s => testFetch(s.url, s.name))).then((results) => {
      console.log('📋 Fetch results summary:');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${urlStrategies[index].name}:`, result.success ? '✅' : '❌', result.contentType);
      });
      console.groupEnd();
    });

    // Load model with detailed error tracking
    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;

    // Use resourcePath to help loader find associated files
    loader.setResourcePath(modelPath.substring(0, modelPath.lastIndexOf('/') + 1));

    console.log('🚀 Starting GLTFLoader.load with URL:', modelPath);

    loader.load(
      modelPath,
      (gltf) => {
        console.log('✅ Model loaded successfully!');
        console.log('📦 GLTF scene:', gltf.scene);
        console.log('🎨 Scene children count:', gltf.scene.children.length);

        model = gltf.scene;
        model.scale.setScalar(scale);
        model.position.set(...position);
        scene.add(model);
        setLoading(false);

        console.log('✨ Model added to scene!');
        console.groupEnd();
      },
      (progress) => {
        if (progress) {
          console.log('📈 Loading progress:', {
            loaded: progress.loaded,
            total: progress.total || 'unknown',
            percentage: progress.total ? Math.round((progress.loaded / progress.total) * 100) + '%' : 'calculating...',
          });
        }
      },
      (err) => {
        console.error('❌ GLTFLoader Error Details:');
        console.error('🔴 Error object:', err);
        console.error('🔴 Error message:', err?.message);
        console.error('🔴 Error stack:', err?.stack);

        // Try to extract more info from the error
        if (err?.message) {
          const errorMsg = err.message;
          if (errorMsg.includes('<!DOCTYPE')) {
            console.error('📄 HTML response detected! Server is returning HTML instead of the GLB file.');
            console.error('🔧 This usually means:');
            console.error('   1. The file path is incorrect (404 page)');
            console.error('   2. Next.js is not serving from /public correctly');
            console.error('   3. The dev server needs to be restarted');

            // Try to show what HTML we got
            const match = errorMsg.match(/<!DOCTYPE[^>]*>[\s\S]{0,500}/);
            if (match) {
              console.error('📄 HTML preview:', match[0]);
            }
          }
        }

        setError('Failed to load 3D model');
        setLoading(false);
        console.groupEnd();
      }
    );

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
