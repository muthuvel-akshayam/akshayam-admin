import maleMatchingData from '../data/male_star_matching.json';
import femaleMatchingData from '../data/female_star_matching.json';

export interface NakshatraMatchOptions {
  gender: string | null;
  nakshatra: string | null;
  pada: string | number | null;
}

export interface NakshatraMatchResult {
  targetNakshatra: string;
  score: number;
  isCompatible: boolean;
}

export const ENGLISH_TO_TAMIL_NAKSHATRA: Record<string, string> = {
  // Base names
  'Aswini': 'அசுபதி',
  'Ashwini': 'அசுபதி',
  'Bharani': 'பரணி',
  'Karthigai': 'கார்த்திகை',
  'Krittika (Karthigai)': 'கார்த்திகை',
  'Rohini': 'ரோகிணி',
  'Mrigasheersham': 'மிருகசீரிஷம்',
  'Mrigashira (Mrigashirsham)': 'மிருகசீரிஷம்',
  'Thiruvaathirai': 'திருவாதிரை',
  'Ardra (Thiruvathirai)': 'திருவாதிரை',
  'Punarpoosam': 'புனர்பூசம்',
  'Punarvasu (Punarpoosam)': 'புனர்பூசம்',
  'Poosam': 'பூசம்',
  'Pushya (Poosam)': 'பூசம்',
  'Ayilyam': 'ஆயில்யம்',
  'Ashlesha (Ayilyam)': 'ஆயில்யம்',
  'Magam': 'மகம்',
  'Magha (Makam)': 'மகம்',
  'Pooram': 'பூரம்',
  'Purva Phalguni (Pooram)': 'பூரம்',
  'Uthiram': 'உத்திரம்',
  'Uttara Phalguni (Uthiram)': 'உத்திரம்',
  'Hastham (Astham)': 'அஸ்தம்',
  'Hasta (Hastham)': 'அஸ்தம்',
  'Chithirai': 'சித்திரை',
  'Chitra (Chithirai)': 'சித்திரை',
  'Swathi': 'சுவாதி',
  'Swati (Swathi)': 'சுவாதி',
  'Visagam': 'விசாகம்',
  'Vishakha (Visakam)': 'விசாகம்',
  'Anusham': 'அனுஷம்',
  'Anuradha (Anusham)': 'அனுஷம்',
  'Kettai': 'கேட்டை',
  'Jyeshtha (Kettai)': 'கேட்டை',
  'Moolam': 'மூலம்',
  'Mula (Moolam)': 'மூலம்',
  'Pooradam': 'பூராடம்',
  'Purva Ashadha (Pooradam)': 'பூராடம்',
  'Uthiradam': 'உத்திராடம்',
  'Uttara Ashadha (Uthiradam)': 'உத்திராடம்',
  'Thiruvonam': 'திருவோணம்',
  'Shravana (Thiruvonam)': 'திருவோணம்',
  'Avittam': 'அவிட்டம்',
  'Dhanishta (Avittam)': 'அவிட்டம்',
  'Sathayam': 'சதயம்',
  'Shatabhisha (Sathayam)': 'சதயம்',
  'Poorattadhi': 'பூரட்டாதி',
  'Purva Bhadrapada (Poorattathi)': 'பூரட்டாதி',
  'Uthirattadhi': 'உத்திரட்டாதி',
  'Uttara Bhadrapada (Uthirattathi)': 'உத்திரட்டாதி',
  'Revathi': 'ரேவதி',
  'Revati': 'ரேவதி',

  // Exact DB values with Padas mapped directly to JSON keys
  'Karthigai (1st Pada)': 'கார்த்திகை 1',
  'Karthigai (2nd to 4th Pada)': 'கார்த்திகை 2,3,4',
  'Mrigasheersham (1st & 2nd Pada)': 'மிருகசீரிஷம் 1,2',
  'Mrigasheersham (3rd & 4th Pada)': 'மிருகசீரிஷம் 3,4',
  'Punarpoosam (1st to 3rd Pada)': 'புனர்பூசம் 1,2,3',
  'Punarpoosam (4th Pada)': 'புனர்பூசம் 4',
  'Uthiram (1st Pada)': 'உத்திரம் 1',
  'Uthiram (2nd to 4th Pada)': 'உத்திரம் 2,3,4',
  'Chithirai (1st & 2nd Pada)': 'சித்திரை 1,2',
  'Chithirai (3rd & 4th Pada)': 'சித்திரை 3,4',
  'Visagam (1st to 3rd Pada)': 'விசாகம் 1,2,3',
  'Visagam (4th Pada)': 'விசாகம் 4',
  'Uthiradam (1st Pada)': 'உத்திராடம் 1',
  'Uthiradam (2nd to 4th Pada)': 'உத்திராடம் 2,3,4',
  'Avittam (1st & 2nd Pada)': 'அவிட்டம் 1,2',
  'Avittam (3rd & 4th Pada)': 'அவிட்டம் 3,4',
  'Poorattadhi (1st to 3rd Pada)': 'பூரட்டாதி 1,2,3',
  'Poorattadhi (4th Pada)': 'பூரட்டாதி 4',
};

/**
 * Finds the exact key in the dataset that corresponds to the given nakshatra and pada.
 */
function findMatchingKey(
  dataset: Record<string, Record<string, number>>,
  nakshatra: string,
  pada: string | number | null
): string | null {
  const normalizedNakshatra = nakshatra.trim();
  const normalizedPada = pada ? String(pada).trim() : '';

  // 1. Check for exact match without pada (e.g., "அசுபதி")
  if (dataset[normalizedNakshatra]) {
    return normalizedNakshatra;
  }

  // 2. Check for exact match with pada (e.g., "கார்த்திகை 1")
  const exactPadaMatch = `${normalizedNakshatra} ${normalizedPada}`;
  if (dataset[exactPadaMatch]) {
    return exactPadaMatch;
  }

  // 3. Check for grouped pada match (e.g., "கார்த்திகை 2,3,4")
  const groupedPadaKeys = Object.keys(dataset).filter((key) => key.startsWith(normalizedNakshatra + ' '));
  for (const key of groupedPadaKeys) {
    const padasPart = key.replace(normalizedNakshatra, '').trim(); // e.g., "2,3,4"
    const padasList = padasPart.split(',').map((p) => p.trim());
    if (padasList.includes(normalizedPada)) {
      return key;
    }
  }

  // Fallback 4: Pick the first key that starts with the nakshatra (useful if pada is entirely missing from DB)
  const partialMatch = Object.keys(dataset).find((key) => key.startsWith(normalizedNakshatra));
  if (partialMatch) {
    return partialMatch;
  }

  // Final Fallback: return null
  return null;
}

/**
 * Get matching nakshatras and their compatibility score based on gender, nakshatra, and pada.
 */
export function getNakshatraMatches({
  gender,
  nakshatra,
  pada,
}: NakshatraMatchOptions): NakshatraMatchResult[] {
  if (!gender || !nakshatra) {
    return [];
  }

  const normalizedGender = gender.toUpperCase();
  let dataset: Record<string, Record<string, number>>;

  if (normalizedGender === 'MALE') {
    dataset = maleMatchingData;
  } else if (normalizedGender === 'FEMALE') {
    dataset = femaleMatchingData;
  } else {
    return [];
  }

  // Translate English to Tamil if found in mapping, else use the raw string
  const tamilNakshatra = ENGLISH_TO_TAMIL_NAKSHATRA[nakshatra] || nakshatra;

  const matchingKey = findMatchingKey(dataset, tamilNakshatra, pada);
  if (!matchingKey) {
    return [];
  }

  const matches = dataset[matchingKey];
  const results: NakshatraMatchResult[] = Object.entries(matches).map(([targetNakshatra, score]) => ({
    targetNakshatra,
    score,
    isCompatible: score > 0,
  }));

  // Sort by score descending, then by target nakshatra alphabetically for stable ordering
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.targetNakshatra.localeCompare(b.targetNakshatra, 'ta');
  });
}
