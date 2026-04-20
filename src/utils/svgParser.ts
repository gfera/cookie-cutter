import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';

export function parseSVG(svgText: string): THREE.Shape[] {
  const loader = new SVGLoader();
  const parsed = loader.parse(svgText);
  const shapes: THREE.Shape[] = [];
  
  // SVGLoader returns an array of paths
  for (const path of parsed.paths) {
    const pShapes = SVGLoader.createShapes(path);
    shapes.push(...pShapes);
  }

  // Optional: Center and normalize the shapes
  if (shapes.length > 0) {
    const box = new THREE.Box2();
    for (const shape of shapes) {
      const points = shape.getPoints();
      for (const p of points) {
        box.expandByPoint(p);
      }
    }
    
    const center = new THREE.Vector2();
    box.getCenter(center);
    
    // Calculate a scale factor to make it roughly a reasonable size (e.g. 50 units wide)
    const size = new THREE.Vector2();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const scale = 50 / (maxDim || 1);

    for (const shape of shapes) {
      const points = shape.getPoints();
      for (let i = 0; i < points.length; i++) {
        points[i].sub(center).multiplyScalar(scale);
        // Do not flip Y here, do it on geometry if needed, or leave it.
        // Actually, SVG is y-down, ThreeJS is y-up.
        points[i].y *= -1; 
      }
      // Re-initialize the shape from the modified points to preserve orientation
      const newShape = new THREE.Shape(points);
      
      // Do the same for holes
      for (const hole of shape.holes) {
        const holePoints = hole.getPoints();
        for (let i = 0; i < holePoints.length; i++) {
          holePoints[i].sub(center).multiplyScalar(scale);
          holePoints[i].y *= -1;
        }
        newShape.holes.push(new THREE.Path(holePoints));
      }
      
      // Replace in array
      shapes[shapes.indexOf(shape)] = newShape;
    }
  }

  return shapes;
}

