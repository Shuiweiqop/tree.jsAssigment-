import { describe, it, expect } from 'vitest';
import { getBounds } from '../src/bounds.js';
import { computeLayoutPosition } from '../src/layouts.js';

describe('getBounds', () => {
  it('returns zeros for empty targets', () => {
    const bounds = getBounds([]);
    expect(bounds).toEqual({ width: 0, height: 0, depth: 0 });
  });

  it('calculates bounds for a single target based on tile dimensions', () => {
    const targets = [{ position: { x: 100, y: 100, z: 100 } }];
    const bounds = getBounds(targets, 170, 250);

    expect(bounds).toEqual({ width: 170, height: 250, depth: 0 });
  });

  it('calculates correct bounds for the full Table layout', () => {
    
    const tableTargets = Array.from({ length: 200 }, (_, i) => {
      const pos = computeLayoutPosition('table', i, 200);
      return { position: { x: pos.x, y: pos.y, z: pos.z } };
    });

    const bounds = getBounds(tableTargets, 170, 250);

    expect(bounds.width).toBe(3780);
    expect(bounds.height).toBe(2680);
    expect(bounds.depth).toBe(0);
  });
});