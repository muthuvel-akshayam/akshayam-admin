import { getNakshatraMatches } from './nakshatraMatcher';

describe('nakshatraMatcher', () => {
  it('should return empty array for missing gender or nakshatra', () => {
    expect(getNakshatraMatches({ gender: null, nakshatra: 'அசுபதி', pada: 1 })).toEqual([]);
    expect(getNakshatraMatches({ gender: 'MALE', nakshatra: null, pada: 1 })).toEqual([]);
  });

  it('should return empty array for unknown gender', () => {
    expect(getNakshatraMatches({ gender: 'OTHER', nakshatra: 'அசுபதி', pada: 1 })).toEqual([]);
  });

  it('should handle exact match without pada properly (e.g. அசுபதி)', () => {
    const matches = getNakshatraMatches({ gender: 'FEMALE', nakshatra: 'அசுபதி', pada: 1 });
    expect(matches.length).toBeGreaterThan(0);
    // அசுபதி FEMALE matching should contain பரணி
    const found = matches.find(m => m.targetNakshatra === 'பரணி');
    expect(found).toBeDefined();
    expect(found?.score).toBe(8);
    expect(found?.isCompatible).toBe(true);
  });

  it('should handle exact match with pada properly (e.g. கார்த்திகை 1)', () => {
    const matches = getNakshatraMatches({ gender: 'FEMALE', nakshatra: 'கார்த்திகை', pada: 1 });
    expect(matches.length).toBeGreaterThan(0);
    // கார்த்திகை 1 FEMALE matching should contain அசுபதி
    const found = matches.find(m => m.targetNakshatra === 'அசுபதி');
    expect(found).toBeDefined();
    expect(found?.score).toBe(7);
  });

  it('should handle grouped match with pada properly (e.g. கார்த்திகை 2,3,4)', () => {
    const matches = getNakshatraMatches({ gender: 'FEMALE', nakshatra: 'கார்த்திகை', pada: 3 });
    expect(matches.length).toBeGreaterThan(0);
    // கார்த்திகை 2,3,4 FEMALE matching should contain பரணி with score 6
    const found = matches.find(m => m.targetNakshatra === 'பரணி');
    expect(found).toBeDefined();
    expect(found?.score).toBe(6);
  });

  it('should fallback to first grouped match if grouped pada is missing/wrong', () => {
    const matches = getNakshatraMatches({ gender: 'FEMALE', nakshatra: 'கார்த்திகை', pada: 5 });
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should translate English Nakshatras to Tamil and find matches', () => {
    const matches = getNakshatraMatches({ gender: 'FEMALE', nakshatra: 'Ashwini', pada: 1 });
    expect(matches.length).toBeGreaterThan(0);
    const found = matches.find(m => m.targetNakshatra === 'பரணி');
    expect(found).toBeDefined();
    expect(found?.score).toBe(8);
  });
});
