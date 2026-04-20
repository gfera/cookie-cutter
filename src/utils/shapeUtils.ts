import { Shape, Path, Vector2, Box2 } from 'three';

export function scaleShapes(shapes: Shape[], factor: number): Shape[] {
  return shapes.map(s => {
    const pts = s.getPoints().map(p => new Vector2(p.x * factor, p.y * factor));
    const ns = new Shape(pts);
    for (const h of s.holes) {
      const hp = h.getPoints().map(p => new Vector2(p.x * factor, p.y * factor));
      ns.holes.push(new Path(hp));
    }
    return ns;
  });
}

export function shapesBounds(shapes: Shape[]): Box2 {
  const box = new Box2();
  for (const s of shapes) {
    for (const p of s.getPoints()) box.expandByPoint(p);
  }
  return box;
}
