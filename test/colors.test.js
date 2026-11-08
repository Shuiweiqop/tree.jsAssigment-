import { describe, it, expect } from 'vitest';
import { getNetWorthColor } from '../src/colors.js';

describe('getNetWorthColor', () => {
  it('returns red (#ef4444) when net worth is below 100,000', () => {
    expect(getNetWorthColor(0)).toBe('#ef4444');
    expect(getNetWorthColor(99999.99)).toBe('#ef4444');
  });

  it('returns orange (#f97316) when net worth is between 100,000 and 200,000 inclusive', () => {
    expect(getNetWorthColor(100000)).toBe('#f97316');
    expect(getNetWorthColor(150000)).toBe('#f97316');
    expect(getNetWorthColor(200000)).toBe('#f97316');
  });

  it('returns green (#22c55e) when net worth is above 200,000', () => {
    expect(getNetWorthColor(200000.01)).toBe('#22c55e');
    expect(getNetWorthColor(500000)).toBe('#22c55e');
  });
});