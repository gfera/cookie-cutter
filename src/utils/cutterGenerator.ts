import { Shape } from 'three';
import { offsetShapes, shapeDifference } from './shapeOffset';

export function createCutterShapes(originalShapes: Shape[], thickness: number): Shape[] {
  // Generate the outer boundary by offsetting outwards
  const outerShapes = offsetShapes(originalShapes, thickness);
  
  // Generate the inner boundary by no offset (normalized)
  const innerShapes = offsetShapes(originalShapes, 0);

  // Subtract inner from outer to get the wall
  const cutterShapes = shapeDifference(outerShapes, innerShapes);

  // Filter out any empty shapes that might have been created
  return cutterShapes.filter(s => s.getPoints().length > 0);
}


