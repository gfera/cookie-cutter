import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { useAppStore } from '../store';
import { createCutterShapes } from '../utils/cutterGenerator';
import { scaleShapes } from '../utils/shapeUtils';

function CookieCutter() {
  const originalShapes = useAppStore(state => state.originalShapes);
  const wallThickness = useAppStore(state => state.wallThickness);
  const height = useAppStore(state => state.height);
  const scale = useAppStore(state => state.scale);

  const extrudeSettings = useMemo(() => ({
    depth: height,
    bevelEnabled: false,
  }), [height]);

  const cutterShapes = useMemo(() => {
    if (originalShapes.length === 0) return { walls: [], base: [] };
    try {
      const scaled = scaleShapes(originalShapes, scale);
      const walls = createCutterShapes(scaled, wallThickness);
      const base = createCutterShapes(scaled, wallThickness + 2);
      return { walls, base };
    } catch (e) {
      console.error('Error generating cutter shapes', e);
      return { walls: [], base: [] };
    }
  }, [originalShapes, wallThickness, scale]);

  if (cutterShapes.walls.length === 0) return null;

  return (
    <Center>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {cutterShapes.base.map((shape, index) => (
          <mesh key={`base-${index}`} position={[0, 0, 0]}>
            <extrudeGeometry args={[shape, { depth: 2, bevelEnabled: false }]} />
            <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
        {cutterShapes.walls.map((shape, index) => (
          <mesh key={`wall-${index}`} position={[0, 0, 2]}>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>
    </Center>
  );
}

export function Scene() {
  return (
    <Canvas camera={{ position: [0, 60, 60], fov: 45 }}>
      <color attach="background" args={['#242424']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 30, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-20, 10, -10]} intensity={0.5} />
      <Environment preset="city" />
      <CookieCutter />
      <OrbitControls makeDefault minDistance={10} maxDistance={300} />
      <gridHelper args={[200, 20]} position={[0, -0.01, 0]} />
    </Canvas>
  );
}
