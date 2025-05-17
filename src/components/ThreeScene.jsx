import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';




function PlanetsGroup({ groupRef, onPlanetClick }) {
  const planetRefs = [useRef(), useRef(), useRef()];
  const textures = [
    useLoader(THREE.TextureLoader, './csilla/color.png'),
    useLoader(THREE.TextureLoader, './volcanic/color.png'),
    useLoader(THREE.TextureLoader, './venus/map.jpg'),
  ];
  const radius = 1.3;
  const segments = 40;
  const orbitRadius = 4.5;

  // Set sRGB color space for textures
  useEffect(() => {
    textures.forEach(texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  // Each planet rotates on its own axis
  useFrame(() => {
    planetRefs.forEach(ref => {
      if (ref.current) ref.current.rotation.y += 0.0003;
    });
  });

  return (
    <group ref={groupRef} rotation={[0.11, 4.715, 0]} position={[0, -0.6, 0]}>
      {textures.map((texture, i) => {
        const angle = (i / 3) * (Math.PI * 2);
        return (
          <mesh
            key={i}
            ref={planetRefs[i]}
            name={`planet${i}`}
            position={[
              orbitRadius * Math.cos(angle),
              0,
              orbitRadius * Math.sin(angle),
            ]}
            onClick={(e) => {
              e.stopPropagation();
              onPlanetClick(i);
            }}
          >
            <sphereGeometry args={[radius, segments, segments]} />
            <meshPhysicalMaterial map={texture} />
          </mesh>
        );
      })}
    </group>
  );
}

function StarsBG({ starRef }) {
  const starTexture = useLoader(THREE.TextureLoader, './stars2.jpg');
  useEffect(() => {
    starTexture.colorSpace = THREE.SRGBColorSpace;
  }, [starTexture]);
  return (
    <mesh ref={starRef}>
      <sphereGeometry args={[50, 64, 64]} />
      <meshStandardMaterial
        map={starTexture}
        transparent
        opacity={0.4}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Ship({ onShipLoaded, onClick }) {
  const gltf = useLoader(GLTFLoader, '/3d/ship.glb');
  const ref = useRef();

  useEffect(() => {
    if (ref.current && onShipLoaded) {
      onShipLoaded(ref.current);
    }
  }, [onShipLoaded]);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    if (onClick) onClick(event);
  };

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      position={[0, 0.1, 7]}
      scale={[0.01, 0.01, 0.01]}
      rotation={[Math.PI / 4, -Math.PI / 2, 0]}
      onPointerDown={handlePointerDown}
    />
  );
}

function Environment() {
  const { scene } = useThree();
  const envMap = useLoader(
    RGBELoader,
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lonely_road_afternoon_puresky_1k.hdr'
  );
  useEffect(() => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envMap;
  }, [envMap, scene]);
  return null;
}

const planetRoutes = [
  '/work.html',
  '/project.html',
  '/contact.html',
];

const planetAnimationTime = 1.58;
const shipAnimationTime = 1.2;
const REVOLUTION_STEP = (Math.PI * 2) / 3;


const ThreeScene = () => {
  const [ship, setShip] = useState();
  const [scrollCount, setScrollCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const wheelTimerRef = useRef(null);
  const groupRef = useRef();
  const starRef = useRef();
  const animationInProgressRef = useRef(false);
  const targetRotationRef = useRef(4.715); // Starting rotation value


  // Complete animation function - separated for clarity
  const completeAnimation = () => {
    animationInProgressRef.current = false;
    setIsAnimating(false);
  };


  
  // Perform rotation animation with fixed angle steps
  const performRotation = () => {
    if (animationInProgressRef.current || !groupRef.current || !starRef.current) return;
    
    // Lock animation state using ref for immediate effect
    animationInProgressRef.current = true;
    setIsAnimating(true);
    
    // Calculate next rotation angle (always exactly one step forward)
    targetRotationRef.current += REVOLUTION_STEP;
    
    // Update scroll count
    const newScrollCount = (scrollCount + 1) % 3;
    setScrollCount(newScrollCount);
    
    // Animate headings
    const heading = document.querySelectorAll('.headings');
    gsap.to(heading, {
      y: `-=${100}%`,
      duration: planetAnimationTime,
      ease: 'none',
    });
    
    gsap.from('h3', {
      opacity: 0,
      duration: 2.1,
      ease: 'expo.in',
    });
    
    // Animate group to exact target angle
    gsap.to(groupRef.current.rotation, {
      y: targetRotationRef.current,
      duration: planetAnimationTime,
      ease: 'none',
      onComplete: completeAnimation
    });
    
    // Animate stars
    gsap.to(starRef.current.rotation, {
      y: targetRotationRef.current,
      duration: planetAnimationTime,
      ease: 'none',
    });
    
    // Reset to first position if needed
    if (newScrollCount === 0) {
      gsap.to(heading, {
        y: `0`,
        duration: planetAnimationTime,
        ease: 'power2.inOut',
      });
    }
    
    // Animate ship
    if (ship) {
      gsap.to(ship.position, {
        y: getRandomInRange(),
        duration: shipAnimationTime,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.to(ship.position, {
            y: 0.1,
            duration: 0.8,
            ease: 'power1.inOut',
          });
        },
      });
      
      gsap.to(ship.rotation, {
        x: getRandomRadianAngle(),
        duration: shipAnimationTime,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.to(ship.rotation, {
            x: Math.PI / 4,
            duration: 0.8,
            ease: 'power1.inOut',
          });
        },
      });
    }
  };

  // Wheel event handler with debounce protection
  useEffect(() => {
    function handleWheel(event) {
      // Skip if animation is in progress
      if (animationInProgressRef.current || isAnimating) return;
      
      // Clear any pending timer
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
      
      // Set a timer to trigger rotation after a short delay
      // This debounces multiple rapid wheel events
      wheelTimerRef.current = setTimeout(() => {
        performRotation();
        wheelTimerRef.current = null;
      }, 50); // Short delay for debouncing
    }
    
    // Add event listener
    window.addEventListener('wheel', handleWheel);
    
    // Cleanup function
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, [scrollCount, ship, isAnimating]);

  function getRandomInRange() {
    return Math.random() * 0.2 - 0.1;
  }
  
  function getRandomRadianAngle() {
    const angles = [Math.PI / 3, Math.PI / 4, Math.PI / 2];
    const randomIndex = Math.floor(Math.random() * angles.length);
    return angles[randomIndex];
  }

  const handlePlanetClick = (planetIdx) => {
    if (!ship || animationInProgressRef.current) return;
    
    // Prevent wheel events during planet click navigation
    animationInProgressRef.current = true;
    setIsAnimating(true);
    
    gsap.to(ship.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      onComplete: () => {
        setTimeout(() => {
          // window.location.href = planetRoutes[planetIdx];
        }, 250);
      },
    });
    
    gsap.to(ship.position, {
      y: -0.1,
      ease: 'power1.inOut',
      duration: 1.5,
    });
  };

  // Ship click handler: scale down ship with GSAP
  const handleShipClick = () => {
    if (!ship) return;
    
    gsap.to(ship.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        // Optional: Reset scale after animation if needed
        // gsap.to(ship.scale, {
        //   x: 0.01,
        //   y: 0.01,
        //   z: 0.01,
        //   duration: 1,
        //   delay: 1
        // });
      }
    });
  };

  // Set initial rotation when component mounts
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = targetRotationRef.current;
    }
    if (starRef.current) {
      starRef.current.rotation.y = targetRotationRef.current;
    }
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 25 }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={0.5} />
      {/* <directionalLight position={[10, 10, 5]} intensity={1} /> */}
      <Environment />
      <StarsBG starRef={starRef} />
      <PlanetsGroup groupRef={groupRef} onPlanetClick={handlePlanetClick} />
      <Ship onShipLoaded={setShip} onClick={handleShipClick} />
    </Canvas>
  );
};

export default ThreeScene; 