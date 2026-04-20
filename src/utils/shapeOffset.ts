import { Shape, Vector2, Path } from 'three';
import ClipperLib from 'clipper-lib';

export function offsetShapes(shapes: Shape[], offsetAmount: number, scale = 1000): Shape[] {
  if (shapes.length === 0) return [];
  const c = new ClipperLib.ClipperOffset();
  const pathType = ClipperLib.JoinType.jtRound;
  const endType = ClipperLib.EndType.etClosedPolygon;
  const subj: { X: number, Y: number }[][] = [];

  const toClipperPath = (points: Vector2[]) => {
    return points.map(p => ({ X: Math.round(p.x * scale), Y: Math.round(p.y * scale) }));
  };

  for (const shape of shapes) {
    const points = shape.extractPoints(10);
    if (points.shape.length > 0) {
      subj.push(toClipperPath(points.shape));
    }
    for (const hole of points.holes) {
      if (hole.length > 0) {
        subj.push(toClipperPath(hole));
      }
    }
  }

  if (subj.length === 0) return [];

  const solution: { X: number, Y: number }[][] = [];
  c.AddPaths(subj, pathType, endType);
  c.Execute(solution, offsetAmount * scale);

  return pathsToShapes(solution, scale);
}

export function shapeDifference(subjects: Shape[], clips: Shape[], scale = 1000): Shape[] {
  if (subjects.length === 0 || clips.length === 0) return subjects;
  
  const toClipperPath = (points: Vector2[]) => {
    return points.map(p => ({ X: Math.round(p.x * scale), Y: Math.round(p.y * scale) }));
  };

  const c = new ClipperLib.Clipper();

  for (const subject of subjects) {
    const points = subject.extractPoints(10);
    if (points.shape.length > 0) {
      c.AddPaths([toClipperPath(points.shape)], ClipperLib.PolyType.ptSubject, true);
    }
    for (const hole of points.holes) {
      if (hole.length > 0) {
        c.AddPaths([toClipperPath(hole)], ClipperLib.PolyType.ptSubject, true);
      }
    }
  }

  for (const clip of clips) {
    const points = clip.extractPoints(10);
    if (points.shape.length > 0) {
      c.AddPaths([toClipperPath(points.shape)], ClipperLib.PolyType.ptClip, true);
    }
    for (const hole of points.holes) {
      if (hole.length > 0) {
        c.AddPaths([toClipperPath(hole)], ClipperLib.PolyType.ptClip, true);
      }
    }
  }

  const polyTree = new ClipperLib.PolyTree();
  c.Execute(ClipperLib.ClipType.ctDifference, polyTree, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

  return polyTreeToShapes(polyTree, scale);
}

function pathsToShapes(solution: { X: number, Y: number }[][], scale: number): Shape[] {
  if (solution.length === 0) return [];
  const cl = new ClipperLib.Clipper();
  cl.AddPaths(solution, ClipperLib.PolyType.ptSubject, true);
  const polyTree = new ClipperLib.PolyTree();
  cl.Execute(ClipperLib.ClipType.ctUnion, polyTree, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

  return polyTreeToShapes(polyTree, scale);
}

function polyTreeToShapes(polyTree: ClipperLib.PolyTree, scale: number): Shape[] {
  const fromClipperPath = (path: { X: number, Y: number }[]) => {
    return path.map(p => new Vector2(p.X / scale, p.Y / scale));
  };

  const newShapes: Shape[] = [];

  const addNodeToShape = (node: ClipperLib.PolyNode, parentShape: Shape | null) => {
    if (!node.IsHole()) {
      const contour = node.Contour();
      if (contour && contour.length > 0) {
        const s = new Shape(fromClipperPath(contour));
        newShapes.push(s);
        const childs = node.Childs();
        for (let i = 0; i < childs.length; i++) {
          addNodeToShape(childs[i], s);
        }
      } else {
        const childs = node.Childs();
        for (let i = 0; i < childs.length; i++) {
          addNodeToShape(childs[i], parentShape);
        }
      }
    } else if (node.IsHole() && parentShape) {
      const contour = node.Contour();
      if (contour && contour.length > 0) {
        const points = fromClipperPath(contour);
        const threePath = new Path(points);
        parentShape.holes.push(threePath);
        
        const childs = node.Childs();
        for (let i = 0; i < childs.length; i++) {
          addNodeToShape(childs[i], null);
        }
      } else {
        const childs = node.Childs();
        for (let i = 0; i < childs.length; i++) {
          addNodeToShape(childs[i], parentShape);
        }
      }
    }
  };

  const childs = polyTree.Childs();
  for (let i = 0; i < childs.length; i++) {
    addNodeToShape(childs[i], null);
  }

  return newShapes;
}

