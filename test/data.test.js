import { describe, it, expect } from 'vitest';
import { transformData } from '../src/data.js';

describe('transformData', () => {
  it('parses Google Sheets rows correctly', () => {
    const rawRows = [
      ["Name", "Photo", "Age", "Country", "Interest", "Net Worth"], // Header (should be skipped)
      ["Alice", "url1", "25", "US", "Coding", "$150,000"],
      ["Bob", "url2", "30", "UK", "Reading", "$2,000,000"]
    ];
    
    const result = transformData(rawRows);
    
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Alice");
    expect(result[0].age).toBe(25); // Converted to number
    expect(result[0].netWorth).toBe(150000); // Removed dollar sign and commas
    
    expect(result[1].netWorth).toBe(2000000);
  });
});