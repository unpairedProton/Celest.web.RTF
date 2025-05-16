import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { gsap } from 'gsap';

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

function Ship({ onShipLoaded }) {
  const gltf = useLoader(GLTFLoader, '/3d/ship.glb');
  const ref = useRef();

  useEffect(() => {
    if (ref.current && onShipLoaded) {
      onShipLoaded(ref.current);
    }
  }, [onShipLoaded]);

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      position={[0, 0.1, 7]}
      scale={[0.01, 0.01, 0.01]}
      rotation={[Math.PI / 4, -Math.PI / 2, 0]}
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
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const groupRef = useRef();
  const starRef = useRef();

  // Wheel event handler
  useEffect(() => {
    function handleWheel(event) {
      if (isAnimating || !groupRef.current || !starRef.current) return;
      const currentTime = Date.now();
      if (currentTime - lastWheelTime > 2000) {
        setLastWheelTime(currentTime);
        setIsAnimating(true);
        const wheelDirect = event.deltaY > 0 ? 'down' : 'up';
        let newScrollCount = (scrollCount + 1) % 3;
        setScrollCount(newScrollCount);
        // Animate headings (if needed)
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
        // Animate group and stars to the next angle from current
        const currentAngle = groupRef.current.rotation.y;
        const nextAngle = currentAngle + REVOLUTION_STEP;
        gsap.to(groupRef.current.rotation, {
            y: `+=${(Math.PI * 2) / 3}`,
          duration: planetAnimationTime,
          ease: 'none',
          onComplete: () => setIsAnimating(false),
        });
        gsap.to(starRef.current.rotation, {
          y: nextAngle,
          duration: planetAnimationTime,
          ease: 'none',
        });
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
      }
    }
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [lastWheelTime, scrollCount, ship, isAnimating]);

  function getRandomInRange() {
    return Math.random() * 0.2 - 0.1;
  }
  function getRandomRadianAngle() {
    const angles = [Math.PI / 3, Math.PI / 4, Math.PI / 2];
    const randomIndex = Math.floor(Math.random() * angles.length);
    return angles[randomIndex];
  }

  const handlePlanetClick = (planetIdx) => {
    if (!ship) return;
    gsap.to(ship.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      onComplete: () => {
        setTimeout(() => {
          window.location.href = planetRoutes[planetIdx];
        }, 250);
      },
    });
    gsap.to(ship.position, {
      y: -0.1,
      ease: 'power1.inOut',
      duration: 1.5,
    });
  };

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 25 }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment />
      <StarsBG starRef={starRef} />
      <PlanetsGroup groupRef={groupRef} onPlanetClick={handlePlanetClick} />
      <Ship onShipLoaded={setShip} />
    </Canvas>
  );
};

export default ThreeScene; 