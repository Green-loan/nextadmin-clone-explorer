
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000; // Reduced particle count for less visual noise
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      // Random positions between -100 and 100
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x27ae60, // Green to match theme
      transparent: true,
      opacity: 0.6, // Reduced opacity
    });
    
    // Create particle mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;
    
    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particles
      particlesMesh.rotation.x += 0.0003; // Slowed down rotation
      particlesMesh.rotation.y += 0.0003;
      
      // Responsive to mouse movement
      particlesMesh.rotation.x += mouseY * 0.0003;
      particlesMesh.rotation.y += mouseX * 0.0003;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 bg-gradient-to-b from-gray-50 to-gray-200"
    />
  );
};

export default ThreeBackground;
