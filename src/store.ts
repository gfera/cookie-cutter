import { create } from 'zustand';
import { Shape } from 'three';

interface AppState {
  originalShapes: Shape[];
  wallThickness: number;
  height: number;
  scale: number;
  setOriginalShapes: (shapes: Shape[]) => void;
  setWallThickness: (t: number) => void;
  setHeight: (h: number) => void;
  setScale: (s: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  originalShapes: [],
  wallThickness: 1.0,
  height: 15.0,
  scale: 1.0,
  setOriginalShapes: (shapes) => set({ originalShapes: shapes }),
  setWallThickness: (wallThickness) => set({ wallThickness }),
  setHeight: (height) => set({ height }),
  setScale: (scale) => set({ scale }),
}));
