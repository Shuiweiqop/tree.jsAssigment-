import { describe, it, expect } from 'vitest';
import { computeLayoutPosition } from '../src/layouts.js';

describe('computeLayoutPosition - helix', () => {
  const p = (i) => computeLayoutPosition('helix', i, 200);

  it('strand 0 and strand 1 start at the same height', () => {
    expect(p(1).y).toBeCloseTo(p(0).y);
  });

  it('the two strands are on opposite sides of the cylinder', () => {
    const d = Math.hypot(p(0).x - p(1).x, p(0).z - p(1).z);
    expect(d).toBeCloseTo(2200); // 2 * radius (1100)
  });

  it('one strand rises by a constant step', () => {
    expect(p(0).y - p(2).y).toBeCloseTo(p(2).y - p(4).y);
  });
});

describe('computeLayoutPosition - table', () => {
  it('places 200 tiles in 20 columns and 10 rows without overlap', () => {
    const pts = Array.from({ length: 200 }, (_, i) =>
      computeLayoutPosition('table', i, 200)
    );
    const uniqueKeys = new Set(pts.map((p) => `${p.x},${p.y},${p.z}`));
    expect(uniqueKeys.size).toBe(200);
    expect(pts.every((p) => p.z === 0 && p.faceOutward === false)).toBe(true);
  });
});

describe('computeLayoutPosition - sphere', () => {
  it('places all tiles at radius 1200 facing outward', () => {
    for (const i of [0, 50, 123, 199]) {
      const p = computeLayoutPosition('sphere', i, 200);
      const dist = Math.hypot(p.x, p.y, p.z);
      expect(dist).toBeCloseTo(1200);
      expect(p.faceOutward).toBe(true);
    }
  });
});

describe('computeLayoutPosition - grid', () => {
  it('produces 5 x 4 x 10 distinct coordinates', () => {
    const pts = Array.from({ length: 200 }, (_, i) =>
      computeLayoutPosition('grid', i, 200)
    );
    const xs = new Set(pts.map((p) => p.x));
    const ys = new Set(pts.map((p) => p.y));
    const zs = new Set(pts.map((p) => p.z));

    expect(xs.size).toBe(5);
    expect(ys.size).toBe(4);
    expect(zs.size).toBe(10);
  });
});