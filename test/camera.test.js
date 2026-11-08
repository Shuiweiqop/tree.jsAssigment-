import { describe, it, expect } from 'vitest';
import { computeFitDistance } from '../src/camera.js';

describe('computeFitDistance', () => {
  it('calculates the correct camera Z distance based on bounds and FOV', () => {
    // Assume bounds width and height are both 1000, depth is 0, FOV is 90 degrees, and aspect ratio is 1
    const bounds = { width: 1000, height: 1000, depth: 0 };
    // When FOV is 90 degrees, tan(45 degrees) = 1. Therefore, distance = 1000 / (2 * 1) = 500
    const dist = computeFitDistance(bounds, 90, 1);
    
    expect(dist).toBeCloseTo(500);
  });
  
  it('adds half the depth to the final distance', () => {
    const bounds = { width: 1000, height: 1000, depth: 200 };
    const dist = computeFitDistance(bounds, 90, 1);
    expect(dist).toBeCloseTo(600); // 500 + 100
  });
});