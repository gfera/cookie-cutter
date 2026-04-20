import React, { useMemo } from 'react';
import { Upload, Download, Settings, Ruler } from 'lucide-react';
import { useAppStore } from '../store';
import { parseSVG } from '../utils/svgParser';
import { createCutterShapes } from '../utils/cutterGenerator';
import { scaleShapes, shapesBounds } from '../utils/shapeUtils';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export function Sidebar() {
  const originalShapes = useAppStore(state => state.originalShapes);
  const wallThickness = useAppStore(state => state.wallThickness);
  const height = useAppStore(state => state.height);
  const scale = useAppStore(state => state.scale);
  const setOriginalShapes = useAppStore(state => state.setOriginalShapes);
  const setWallThickness = useAppStore(state => state.setWallThickness);
  const setHeight = useAppStore(state => state.setHeight);
  const setScale = useAppStore(state => state.setScale);

  const sizeCm = useMemo(() => {
    if (originalShapes.length === 0) return null;
    const box = shapesBounds(originalShapes);
    const size = new THREE.Vector2();
    box.getSize(size);
    // Shapes are in mm. Apply scale then convert to cm.
    const wallMm = wallThickness + 2; // base is slightly wider
    const w = (size.x * scale + wallMm * 2) / 10;
    const h = (size.y * scale + wallMm * 2) / 10;
    return { w, h };
  }, [originalShapes, scale, wallThickness]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const shapes = parseSVG(text);
      setOriginalShapes([...shapes]);
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again
    e.target.value = '';
  };

  const handleExport = () => {
    if (originalShapes.length === 0) return;
    
    try {
      const scaled = scaleShapes(originalShapes, scale);
      const cutterWalls = createCutterShapes(scaled, wallThickness);
      const cutterBase = createCutterShapes(scaled, wallThickness + 2);
      
      const group = new THREE.Group();
      group.rotation.x = Math.PI / 2; // Flat on bed
      
      const wallSettings = {
        depth: height,
        bevelEnabled: false,
      };

      const baseSettings = {
        depth: 2,
        bevelEnabled: false,
      };

      for (const shape of cutterBase) {
        const geometry = new THREE.ExtrudeGeometry(shape, baseSettings);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
        mesh.position.z = 0;
        mesh.updateMatrixWorld(true);
        group.add(mesh);
      }

      for (const shape of cutterWalls) {
        const geometry = new THREE.ExtrudeGeometry(shape, wallSettings);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
        mesh.position.z = 2; // Sit on top of base
        mesh.updateMatrixWorld(true);
        group.add(mesh);
      }

      group.updateMatrixWorld(true);
      const exporter = new STLExporter();
      const stlString = exporter.parse(group);
      
      const blob = new Blob([stlString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = 'cookie_cutter.stl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting STL:', e);
      alert('Failed to generate cutter for export.');
    }
  };

  return (
    <div className="w-80 h-full bg-white shadow-lg p-6 flex flex-col gap-6 z-10 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Cutter Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Generate 3D printable cookie cutters from SVG files</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload SVG Shape</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
              <p className="text-xs text-gray-500">SVG files only</p>
            </div>
            <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          </label>
          {originalShapes.length > 0 && (
            <p className="text-sm text-green-600 mt-2">✓ Shape loaded successfully</p>
          )}
        </div>

        {originalShapes.length > 0 && (
          <>
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale ({scale.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="4"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wall Thickness ({wallThickness} mm)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={wallThickness}
                  onChange={(e) => setWallThickness(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height ({height} mm)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {sizeCm && (
              <div className="border-t pt-4 flex items-center gap-2 text-sm text-gray-700">
                <Ruler className="w-4 h-4 text-gray-500" />
                <span>
                  Approx. size: <strong>{sizeCm.w.toFixed(1)} × {sizeCm.h.toFixed(1)} cm</strong>
                </span>
              </div>
            )}

            <div className="border-t pt-4">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Export STL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
