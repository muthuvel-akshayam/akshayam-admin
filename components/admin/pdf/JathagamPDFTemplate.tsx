import React from 'react';
import QRCode from 'react-qr-code';
import JathagamChart from './JathagamChart';

interface JathagamPDFTemplateProps {
  profile: any;
  profileId: string;
  family?: any;
  akshayamId?: string | null;
  userIndex?: number | null;
  userCreatedAt?: string | Date | null;
}

const convertLegacyGrid = (gridData: any) => {
  if (!gridData || typeof gridData !== 'object') return [];
  const houseMapping: Record<string, number> = {
    'meenam': 0, 'mesham': 1, 'rishabham': 2, 'mithunam': 3,
    'kadagam': 4, 'simmam': 5, 'kanni': 6, 'thulam': 7,
    'viruchigam': 8, 'dhanusu': 9, 'magaram': 10, 'kumbam': 11
  };
  const houses: {houseIndex: number, planets: string[]}[] = [];
  for (const [key, planets] of Object.entries(gridData)) {
    let idx: number | undefined;
    if (!isNaN(Number(key))) {
      idx = Number(key);
    } else {
      idx = houseMapping[key.toLowerCase()];
    }
    if (idx !== undefined && Array.isArray(planets)) {
      houses.push({ houseIndex: idx, planets: planets.map(p => String(p)) });
    }
  }
  return houses;
};

const parseSafeDate = (d: Date | string | null | undefined) => {
  if (!d) return null;
  let dateObj = new Date(d);
  if (isNaN(dateObj.getTime()) && typeof d === 'string') {
    const parts = d.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else if (parts[0].length === 4) {
        dateObj = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      }
    }
  }
  return isNaN(dateObj.getTime()) ? null : dateObj;
};

const calculateAge = (dob: Date | string | null | undefined) => {
  const birth = parseSafeDate(dob);
  if (!birth) return 'N/A';
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return years;
};

const formatSafeDate = (d: Date | string | null | undefined) => {
  const dateObj = parseSafeDate(d);
  if (dateObj) return dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
  return d ? String(d) : 'குறிப்பிடப்படவில்லை';
};

const translateToTamil = (val: string | null | undefined, dict: Record<string, string>) => {
  if (!val) return val;
  const key = val.trim().toLowerCase();
  return dict[key] || dict[val.trim().toUpperCase()] || val;
};

const colorMap: Record<string, string> = {
  'fair': 'சிகப்பு', 'very_fair': 'மிகவும் சிகப்பு', 'very fair': 'மிகவும் சிகப்பு', 
  'wheatish': 'மாநிறம்', 'wheatish_brown': 'கோதுமை நிறம்', 'wheatish brown': 'கோதுமை நிறம்', 'dark': 'கருப்பு'
};

const familyStatusMap: Record<string, string> = {
  'middle_class': 'நடுத்தர வர்க்கம்', 'middle class': 'நடுத்தர வர்க்கம்',
  'upper_middle_class': 'உயர் நடுத்தர வர்க்கம்', 'upper middle class': 'உயர் நடுத்தர வர்க்கம்',
  'rich': 'பணக்காரர்', 'affluent': 'மிகவும் பணக்காரர்'
};

const maritalStatusMap: Record<string, string> = {
  'never_married': 'முதல் மணம்', 'never married': 'முதல் மணம்',
  'widowed': 'விதவை', 'divorced': 'விவாகரத்து பெற்றவர்', 'awaiting_divorce': 'விவாகரத்துக்காக காத்திருப்பவர்'
};

const doshamMap: Record<string, string> = {
  'no_dosham': 'சுத்த ஜாதகம்', 'none': 'சுத்த ஜாதகம்',
  'rahu_ketu': 'ராகு கேது தோஷம்', 'chevvai': 'செவ்வாய் தோஷம்', 'sarpa': 'சர்ப்ப தோஷம்'
};

const nakshatraMap: Record<string, string> = {
  'ashwini': 'அஸ்வினி', 'aswini': 'அஸ்வினி', 'bharani': 'பரணி', 'krithika': 'கிருத்திகை', 'karthigai': 'கிருத்திகை', 
  'rohini': 'ரோகிணி', 'mrigashiras': 'மிருகசீரிடம்', 'mrigasheersham': 'மிருகசீரிடம்', 
  'ardra': 'திருவாதிரை', 'thiruvathirai': 'திருவாதிரை', 'punarvasu': 'புனர்பூசம்', 'punarpoosam': 'புனர்பூசம்',
  'pushya': 'பூசம்', 'poosam': 'பூசம்', 'ashlesha': 'ஆயில்யம்', 'ayilyam': 'ஆயில்யம்',
  'magha': 'மகம்', 'makam': 'மகம்', 'purva phalguni': 'பூரம்', 'pooram': 'பூரம்', 
  'uttara phalguni': 'உத்திரம்', 'uthiram': 'உத்திரம்', 'hasta': 'அஸ்தம்', 'hastham': 'அஸ்தம்',
  'chitra': 'சித்திரை', 'chithirai': 'சித்திரை', 'swati': 'சுவாதி', 'swathi': 'சுவாதி',
  'vishakha': 'விசாகம்', 'visakam': 'விசாகம்', 'anuradha': 'அனுஷம்', 'anusham': 'அனுஷம்',
  'jyeshtha': 'கேட்டை', 'kettai': 'கேட்டை', 'mula': 'மூலம்', 'moolam': 'மூலம்',
  'purva ashadha': 'பூராடம்', 'pooradam': 'பூராடம்', 'uttara ashadha': 'உத்திராடம்', 'uthiradam': 'உத்திராடம்',
  'shravana': 'திருவோணம்', 'thiruvonam': 'திருவோணம்', 'dhanishta': 'அவிட்டம்', 'avittam': 'அவிட்டம்',
  'shatabhisha': 'சதயம்', 'sathayam': 'சதயம்', 'purva bhadrapada': 'பூரட்டாதி', 'poorattathi': 'பூரட்டாதி', 'poorattadhi': 'பூரட்டாதி',
  'uttara bhadrapada': 'உத்திரட்டாதி', 'uthirattathi': 'உத்திரட்டாதி', 'uthirattadhi': 'உத்திரட்டாதி', 'revati': 'ரேவதி', 'revathi': 'ரேவதி'
};

const rasiMap: Record<string, string> = {
  'mesham': 'மேஷம்', 'rishabam': 'ரிஷபம்', 'rishabham': 'ரிஷபம்', 'mithunam': 'மிதுனம்',
  'kadagam': 'கடகம்', 'simmam': 'சிம்மம்', 'kanni': 'கன்னி', 'thulam': 'துலாம்',
  'viruchigam': 'விருச்சிகம்', 'dhanusu': 'தனுசு', 'magaram': 'மகரம்', 'kumbam': 'கும்பம்', 'meenam': 'மீனம்'
};

const mapParentStatus = (status: string | null | undefined) => {
  if (!status) return 'உண்டு';
  const s = status.toLowerCase();
  if (s === 'alive' || s === 'yes') return 'உண்டு';
  if (s === 'late' || s === 'passed away' || s === 'deceased' || s === 'no') return 'இல்லை';
  return status;
};

const propertyTranslationMap: Record<string, string> = {
  'Own House (Individual Villa / House)': 'சொந்த வீடு (தனி வீடு / வில்லா)',
  'Own House (Apartment / Flat)': 'சொந்த வீடு (அடுக்குமாடி / பிளாட்)',
  'Own House (Ancestral / Family Property)': 'சொந்த வீடு (பூர்வீக சொத்து)',
  'Rented House': 'வாடகை வீடு',
  'Leased House': 'குத்தகை வீடு',
  'Government / Company Quarters': 'அரசு / கம்பெனி குடியிருப்பு',
  'No Vacant Land': 'இல்லை',
  'Residential Plot (in City / Town)': 'குடியிருப்பு மனை (நகரம் / டவுன்)',
  'Agricultural Land (under 5 Acres)': 'விவசாய நிலம் (5 ஏக்கருக்கு கீழ்)',
  'Agricultural Land (above 5 Acres)': 'விவசாய நிலம் (5 ஏக்கருக்கு மேல்)',
  'Commercial Land / Industrial Plot': 'வணிக நிலம் / தொழில் கூடம்',
  'None': 'இல்லை',
  'No': 'இல்லை',
};

const translatePropertyText = (text: string | null | undefined) => {
  if (!text) return text;
  let translated = text;
  // Translate exact matches first
  if (propertyTranslationMap[text]) return propertyTranslationMap[text];
  
  // Translate common words in free text
  translated = translated.replace(/\bacres\b/gi, 'ஏக்கர்');
  translated = translated.replace(/\bacre\b/gi, 'ஏக்கர்');
  translated = translated.replace(/\bcents\b/gi, 'சென்ட்');
  translated = translated.replace(/\bcent\b/gi, 'சென்ட்');
  translated = translated.replace(/\bsqft\b/gi, 'சதுர அடி');
  translated = translated.replace(/\bsq ft\b/gi, 'சதுர அடி');
  translated = translated.replace(/\bsquare feet\b/gi, 'சதுர அடி');
  translated = translated.replace(/\bown\b/gi, 'சொந்தம்');
  translated = translated.replace(/\bhouse\b/gi, 'வீடு');
  translated = translated.replace(/\brent\b/gi, 'வாடகை');
  translated = translated.replace(/\brented\b/gi, 'வாடகை');
  translated = translated.replace(/\bnone\b/gi, 'இல்லை');
  translated = translated.replace(/\bno\b/gi, 'இல்லை');
  
  return translated;
};

// Strict colon-aligned row for bottom section
const FieldRow = ({ label, value, labelWidth = "120px", valueWidth = "310px" }: { label: string; value: string | number | null | undefined; labelWidth?: string; valueWidth?: string }) => {
  const lWidth = labelWidth.startsWith('w-[') ? labelWidth.slice(3, -1) : labelWidth;
  const vWidth = valueWidth.startsWith('w-[') ? valueWidth.slice(3, -1) : valueWidth;
  return (
    <div className="flex items-start mb-1 text-[11px] leading-tight" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px', fontSize: '11.5px', lineHeight: '1.4' }}>
      <div className={`font-bold text-emerald-950 whitespace-nowrap flex-shrink-0`} style={{ fontWeight: 'bold', color: '#022c22', whiteSpace: 'nowrap', flexShrink: 0, width: lWidth }}>{label}</div>
      <div className="font-bold text-emerald-950 text-center flex-shrink-0" style={{ fontWeight: 'bold', color: '#022c22', textAlign: 'center', width: '10px', flexShrink: 0 }}>:</div>
      <div className={`font-bold text-gray-900 whitespace-pre-wrap break-words pl-1 flex-shrink-0`} style={{ fontWeight: 'bold', color: '#111827', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingLeft: '4px', flexShrink: 0, width: vWidth }}>{value || '-'}</div>
    </div>
  );
};

const FieldItem = ({ label, value, colSpan = 1 }: { label: string; value: string | number | null | undefined; colSpan?: number }) => {
  const displayValue = (value === null || value === undefined || value === '' || value === 'null' || value === '-') ? 'குறிப்பிடப்படவில்லை' : value;
  return (
    <div className={`flex items-start text-[10.5px] leading-tight text-slate-900`} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11px', lineHeight: '1.3', color: '#0f172a', width: colSpan === 2 ? '100%' : '50%', boxSizing: 'border-box', paddingRight: '8px', marginBottom: '4px' }}>
      <div className={`font-semibold text-slate-800 whitespace-nowrap w-[100px] flex-shrink-0`} style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', width: '100px', flexShrink: 0 }}>{label}</div>
      <div className={`font-bold text-center text-slate-700 w-[10px] flex-shrink-0`} style={{ fontWeight: 'bold', textAlign: 'center', color: '#334155', width: '10px', flexShrink: 0 }}>:</div>
      <div className={`font-medium text-slate-900 pl-1 break-words flex-1 flex-shrink-0`} style={{ fontWeight: 500, color: '#0f172a', paddingLeft: '4px', wordBreak: 'break-word', flex: '1 1 0%', flexShrink: 0 }}>{displayValue}</div>
    </div>
  );
};

export default function JathagamPDFTemplate({ profile, profileId, family: familyProp, akshayamId, userIndex, userCreatedAt }: JathagamPDFTemplateProps) {
  if (!profile) return null;

  const rasiHouses = convertLegacyGrid(profile.jathagamData?.rasiChart || profile.jathagamData?.rasiGrid || profile.rasiGrid);
  const amsamHouses = convertLegacyGrid(profile.jathagamData?.navamsamChart || profile.jathagamData?.amsamGrid || profile.amsamGrid);
  const family = familyProp || profile.family || {};

  const formatExpectations = (exp: any) => {
    if (!exp) return "நல்ல வாழ்க்கைத்துணை";
    if (typeof exp === 'string') return exp;
    
    const parts = [];
    if (exp.maxAgeLimit) parts.push(`வயது: ${exp.maxAgeLimit} வரை`);
    if (exp.expectedHeight) parts.push(`உயரம்: ${exp.expectedHeight} செ.மீ`);
    if (exp.expectedIncome) parts.push(`வருமானம்: ${exp.expectedIncome}`);
    if (exp.preferredSectors && exp.preferredSectors.length > 0) parts.push(`பணி: ${exp.preferredSectors.join(', ')}`);
    if (exp.preferredLocations && exp.preferredLocations.length > 0) parts.push(`இடம்: ${exp.preferredLocations.join(', ')}`);
    if (exp.dowryExpectation) parts.push(`வரதட்சணை: ${exp.dowryExpectation}`);
    if (exp.expectsThottam) parts.push(`தோட்டம்: ஆம்`);
    if (exp.expectsRentalIncome) parts.push(`வாடகை வருமானம்: ஆம்`);
    if (exp.comments) parts.push(exp.comments);

    return parts.length > 0 ? parts.join(' | ') : "நல்ல வாழ்க்கைத்துணை";
  };
  
  const getDerivedTamilDay = (dateStr: any) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('ta-IN', { weekday: 'long' });
  };

  const siblingsArray = Array.isArray(family.siblings) ? family.siblings : [];
  const brothersCount = siblingsArray.filter((s: any) => s.relation?.toLowerCase().includes('brother')).length || family.brothers || 0;
  const sistersCount = siblingsArray.filter((s: any) => s.relation?.toLowerCase().includes('sister')).length || family.sisters || 0;
  
  const siblingsCount = brothersCount + sistersCount;
  const siblingsText = siblingsCount > 0 
    ? `${brothersCount ? `சகோதரன்: ${brothersCount} ` : ''}${sistersCount ? `சகோதரி: ${sistersCount}` : ''}`.trim()
    : "இல்லை";

  const ChartCenterLogo = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
      <img src="/akshayam_logo.png" alt="Logo" className="w-10 opacity-80" style={{ width: '45px', height: 'auto', opacity: 0.9, marginBottom: '4px' }} />
      <div className="font-bold text-emerald-800 text-[11px]" style={{ fontWeight: 'bold', color: '#065f46', fontSize: '11px' }}>{title}</div>
    </div>
  );

  const PDFChartBox = ({ title, houses }: { title: "ராசி" | "நவாம்சம்", houses: any }) => (
    <div className="text-[9px]" style={{ width: '160px', height: '160px', position: 'relative' }}>
      <div className="w-full h-full border border-emerald-800 bg-white p-[1px]" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid #065f46', backgroundColor: '#ffffff', padding: '1px', boxSizing: 'border-box' }}>
        <JathagamChart title={title} houses={houses || []} centerElement={<ChartCenterLogo title={title} />} pdfMode={true} />
      </div>
    </div>
  );

  const displayId = akshayamId || profile.displayId || (userIndex ? `${1000 + userIndex}` : `${profileId.substring(0, 8).toUpperCase()}`);
  const profileUrl = `https://www.akshayamtamilmatrimony.com/profiles/${profileId}`;

  // Priority Mapping Logic
  const jData = profile.jathagamData || {};
  
  const name = jData.name || profile.name;
  const nakshatra = translateToTamil(jData.nakshatra || profile.nakshatra, nakshatraMap) || 'குறிப்பிடப்படவில்லை';
  const rasi = translateToTamil(jData.rasi || profile.rasi, rasiMap) || 'குறிப்பிடப்படவில்லை';
  const padam = jData.padam || profile.padam || '1';
  const lagnam = translateToTamil(jData.lagnam || profile.lagnam, nakshatraMap) || 'குறிப்பிடப்படவில்லை';
  const dosham = translateToTamil(profile.dosham, doshamMap) || "சுத்த ஜாதகம்"; 
  
  const dob = jData.dateOfBirth || profile.dateOfBirth || profile.dob;
  const tob = jData.timeOfBirth || profile.timeOfBirth || profile.tob;
  const dayOfBirth = jData.dayOfBirth || profile.dayOfBirth || (dob ? getDerivedTamilDay(dob) : 'குறிப்பிடப்படவில்லை');
  const placeOfBirth = translateToTamil(jData.placeOfBirth || jData.nativePlace || profile.placeOfBirth || profile.lob || profile.city, { 'coimbatore': 'கோயம்புத்தூர்', 'chennai': 'சென்னை', 'tiruppur': 'திருப்பூர்', 'erode': 'ஈரோடு', 'salem': 'சேலம்', 'karur': 'கரூர்', 'namakkal': 'நாமக்கல்' }) || 'குறிப்பிடப்படவில்லை';
  const dasaBalance = jData.dasaBalance || profile.dasaBalance || profile.birthDetails || 'தசா இருப்பு விவரம் பார்க்கவும்';
  
  const kovil = jData.kovil || profile.houseLocation || 'குலதெய்வம் குறிப்பிடப்படவில்லை';
  const kulam = profile.koottam || jData.kulam || profile.subCaste || 'குறிப்பிடப்படவில்லை';
  const fatherStatus = mapParentStatus(jData.fatherName || family.fatherStatus);
  const motherStatus = mapParentStatus(jData.motherName || family.motherStatus);
  
  const formatSiblings = (siblingsStr: any) => {
    if (!siblingsStr || typeof siblingsStr !== 'string') return siblingsStr;
    if (!siblingsStr.includes('மூத்தவர் ஆண்:')) return siblingsStr;
    try {
      const parts = siblingsStr.split(';');
      const elderPart = parts[0] || '';
      const youngerPart = parts[1] || '';
      
      const elderMaleMatch = elderPart.match(/ஆண்:\s*(\d+)/);
      const elderFemaleMatch = elderPart.match(/பெண்:\s*(\d+)/);
      const youngerMaleMatch = youngerPart.match(/ஆண்:\s*(\d+)/);
      const youngerFemaleMatch = youngerPart.match(/பெண்:\s*(\d+)/);
      
      const elderMale = elderMaleMatch ? parseInt(elderMaleMatch[1]) : 0;
      const elderFemale = elderFemaleMatch ? parseInt(elderFemaleMatch[1]) : 0;
      const youngerMale = youngerMaleMatch ? parseInt(youngerMaleMatch[1]) : 0;
      const youngerFemale = youngerFemaleMatch ? parseInt(youngerFemaleMatch[1]) : 0;
      
      const result = [];
      if (elderMale > 0) result.push(`அண்ணன்: ${elderMale}`);
      if (elderFemale > 0) result.push(`அக்கா: ${elderFemale}`);
      if (youngerMale > 0) result.push(`தம்பி: ${youngerMale}`);
      if (youngerFemale > 0) result.push(`தங்கை: ${youngerFemale}`);
      
      if (result.length === 0) return 'இல்லை';
      return result.join(', ');
    } catch (e) {
      return siblingsStr;
    }
  };

  const siblingsDisplay = formatSiblings(jData.siblings || (siblingsCount > 0 ? siblingsText : (profile.siblings || 'இல்லை')));
  
  let formattedOccupation = [];
  if (family.workNature) formattedOccupation.push(family.workNature);
  if (family.designation) formattedOccupation.push(family.designation);
  if (family.organisation) formattedOccupation.push(family.organisation);
  let occupationStr = formattedOccupation.length > 0 ? formattedOccupation.join(' - ') : (jData.occupation || profile.occupations?.map((o: any) => o.jobTitle || o.jobType).filter(Boolean).join(', ') || profile.occupation || "-");
  
  const lowerOcc = String(occupationStr).toLowerCase();
  if (lowerOcc === 'not_working' || lowerOcc === 'not working' || lowerOcc === 'none' || lowerOcc === 'no') {
    occupationStr = 'வேலைக்குச் செல்லவில்லை';
  }
  const isNotWorking = occupationStr === 'வேலைக்குச் செல்லவில்லை';
  
  const income = family.salary || profile.income || jData.monthlyIncome || jData.income || "-";
  
  let formattedProperty = [];
  if (family.houseType && family.houseType !== 'None' && family.houseType !== 'No') {
    formattedProperty.push(`வீடு: ${translatePropertyText(family.houseType)}`);
  }
  if (family.thottam && family.thottam !== 'இல்லை' && family.thottam !== 'None' && family.thottam !== 'No') {
    formattedProperty.push(`தோட்டம்: ${translatePropertyText(family.thottam)}`);
  }
  if (family.vacantLand && family.vacantLand !== 'இல்லை' && family.vacantLand !== 'None' && family.vacantLand !== 'No') {
    formattedProperty.push(`காலி இடம்: ${translatePropertyText(family.vacantLand)}`);
  }
  if (family.propertyValue) formattedProperty.push(`மதிப்பு: ${translatePropertyText(family.propertyValue)}`);
  const propertyStr = formattedProperty.length > 0 ? formattedProperty.join(', ') : translatePropertyText(family.propertyDetails || profile.property || jData.propertyDetails || jData.property || "-");
  const nativePlace = translateToTamil(jData.nativePlace || profile.nativePlace || profile.city, { 'coimbatore': 'கோயம்புத்தூர்', 'chennai': 'சென்னை', 'tiruppur': 'திருப்பூர்', 'erode': 'ஈரோடு', 'salem': 'சேலம்', 'karur': 'கரூர்', 'namakkal': 'நாமக்கல்' }) || "-";

  // Height translation (e.g. 5ft 3in -> 5 அடி 3 அங்குலம்)
  let heightStr = 'குறிப்பிடப்படவில்லை';
  if (profile.height) {
    const feet = Math.floor(profile.height / 30.48);
    const inches = Math.round((profile.height % 30.48) / 2.54);
    heightStr = `${feet} அடி ${inches} அங்குலம் / ${profile.height} செ.மீ`;
  }
  
  const casteDisplay = translateToTamil(profile.caste, { 'kongu vellala gounder': 'கொங்கு வேளாளக் கவுண்டர்', 'gounder': 'கவுண்டர்' }) || 'குறிப்பிடப்படவில்லை';

  return (
    <div 
      id={`pdf-template-${profileId}`} 
      className="w-[794px] h-[1123px] bg-white box-border flex flex-col justify-between overflow-hidden font-sans text-slate-900 mx-auto relative"
      style={{ 
        width: '794px', 
        height: '1123px', 
        padding: '36px 48px',
        boxSizing: 'border-box',
        fontFamily: "'Mukta Malar', 'Latha', 'Vijaya', 'Tamil MN', 'Arial', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        color: '#0f172a'
      }}
    >
      <div className="w-full h-full flex flex-col justify-between" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* 1. Top Header Banner */}
        <div className="flex flex-col items-center pb-1 border-b border-gray-300" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '4px', borderBottom: '1px solid #d1d5db', width: '100%' }}>
          
          {/* Top Title Image (New Green Text) */}
          {/* <div className="mb-2 w-full flex justify-center" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <img src="/akshayam_title.png" alt="Akshayam Title" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
          </div> */}

          <div className="flex justify-between items-end w-full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
            {/* Left Couple Image */}
            <div className="flex items-end w-[120px]" style={{ display: 'flex', alignItems: 'flex-end', width: '120px' }}>
              <img src="/hero-couple.png" alt="Couple" className="object-cover rounded" style={{ height: '80px', width: 'auto', objectFit: 'cover', borderRadius: '4px' }} />
            </div>
            
            {/* Center Logo Area with Text */}
            <div className="flex-1 flex items-center justify-center px-2 gap-4" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', gap: '16px' }}>
              <div className="text-emerald-800 font-bold tracking-wide" style={{ color: '#065f46', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.05em', transform: 'translateY(4px)' }}>ஜாதகம் முதல்</div>
              <img src="/akshayam_logo.png" alt="Logo" style={{ height: '60px' }} />
              <div className="text-emerald-800 font-bold tracking-wide" style={{ color: '#065f46', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.05em', transform: 'translateY(4px)' }}>பந்தி வரை</div>
            </div>

            {/* Right Temple Image */}
            <div className="flex items-end justify-end" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
               <img src="/temple.jpg" alt="Temple" className="object-cover rounded shadow-sm" style={{ height: '80px', width: 'auto', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="flex justify-center items-center bg-white py-1 text-[10px]" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', backgroundColor: '#ffffff', padding: '4px 0', fontSize: '10px', marginTop: '8px', width: '100%' }}>
          <div className="flex items-center gap-1 font-bold whitespace-nowrap shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span className="text-emerald-800" style={{ color: '#065f46' }}>📞</span>
            <span className="text-red-600 tracking-wide" style={{ color: '#dc2626', letterSpacing: '0.025em' }}>96776 13716, 93452 89217</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-emerald-800 whitespace-nowrap shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: '#065f46', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span>🌐</span> www.akshayamtamilmatrimony.com
          </div>
          <div className="flex items-center gap-1 font-bold text-gray-800 whitespace-nowrap shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: '#1f2937', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span className="text-emerald-800" style={{ color: '#065f46' }}>📍</span> மலைக்கோயில், மங்கலம் ரோடு, திருப்பூர் - 641 604.
          </div>
        </div>

        {/* Registration Bar */}
        <div className="flex justify-between items-center bg-gray-50 border-y border-slate-300 py-0.5 mt-1 font-bold text-[10px] text-emerald-950" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '4px 0', marginTop: '4px', marginBottom: '12px', fontWeight: 'bold', fontSize: '10px', color: '#022c22' }}>
          <div>Profile ID: {displayId}</div>
          <div>Date Reg: {new Date(userCreatedAt || profile.createdAt || Date.now()).toLocaleDateString('en-GB')} | Expiry: {new Date(new Date(userCreatedAt || profile.createdAt || Date.now()).setFullYear(new Date(userCreatedAt || profile.createdAt || Date.now()).getFullYear() + 1)).toLocaleDateString('en-GB')}</div>
        </div>

        {/* 2. Profile Details & Photo Grid */}
        <div className="flex justify-between w-full gap-4 pt-2 pb-1" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
          {/* Left Text Columns */}
          <div className="flex-1 pr-2 leading-tight text-[10.5px] text-slate-900 content-start" style={{ flex: '1', paddingRight: '12px', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
            <FieldItem label="பெயர்" value={name} />
            <FieldItem label="குலம்" value={kulam} />
            
            <FieldItem label="பாலினம்" value={profile.gender === 'MALE' ? 'ஆண்' : 'பெண்'} />
            <FieldItem label="தாய் நிலை" value={motherStatus} />
            
            <FieldItem label="வயது" value={`${calculateAge(dob)} வருடம்`} />
            <FieldItem label="சமூக நிலை" value={translateToTamil(profile.familyStatus, familyStatusMap)} />
            
            <FieldItem label="திருமண நிலை" value={translateToTamil(profile.maritalStatus, maritalStatusMap)} />
            <FieldItem label="பிறந்த தேதி" value={formatSafeDate(dob)} />
            
            <FieldItem label="பதிவு செய்தவர்" value={profile.profileCreatedBy || "உறவினர்"} />
            <FieldItem label="பிறந்த நேரம்" value={tob} />
            
            <FieldItem label="நிறம்" value={translateToTamil(profile.skinColour, colorMap)} />
            <FieldItem label="பிறந்த கிழமை" value={dayOfBirth} />
            
            <FieldItem label="உயரம்" value={heightStr} />
            <FieldItem label="பிறந்த ஊர்" value={placeOfBirth} />
            
            <FieldItem label="எடை" value={`${profile.weight} கிலோ`} />
            <FieldItem label="கோவில்" value={kovil} />
            
            <FieldItem label="சாதி" value={casteDisplay} />
            <FieldItem label="தந்தை நிலை" value={fatherStatus} />
            
            <FieldItem label="உடன் பிறந்தோர்" value={siblingsDisplay} />
            <FieldItem label="பாதம்" value={padam} />
            
            <FieldItem label="நட்சத்திரம்" value={nakshatra} />
            <FieldItem label="ராசி" value={rasi} />
            
            <FieldItem label="லக்னம்" value={lagnam} />
            <FieldItem label="ஜாதகம்" value={dosham} />
          </div>

          {/* Right Photo Column */}
          <div className="flex-shrink-0 flex items-start justify-end" style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
            <div className="border border-slate-300 rounded overflow-hidden bg-white" style={{ width: '132px', height: '170px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              {profile.photoUrl ? (
                <img crossOrigin="anonymous" src={`/api/proxy-image?url=${encodeURIComponent(profile.photoUrl)}`} alt="Profile" className="w-full h-full object-cover object-top" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm" style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Photo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Astrology Charts & Center QR Code */}
        <div className="flex items-center justify-between gap-4 my-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', margin: '8px 0', width: '100%' }}>
          <PDFChartBox title="ராசி" houses={rasiHouses} />
          
          <div className="flex flex-col items-center justify-center border border-[#d4af37] rounded-lg p-1.5 relative bg-[#fdfbf2]" style={{ width: '160px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid #d4af37', borderRadius: '8px', padding: '6px', position: 'relative', backgroundColor: '#fdfbf2' }}>
            <div className="bg-white p-1 rounded relative mb-1" style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '4px', position: 'relative', marginBottom: '2px' }}>
              <img src="/app_qr_code.jpg" alt="QR Code" style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
            </div>
            
            <div className="flex flex-col items-center justify-center text-center w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
               <div className="font-bold text-emerald-800" style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#065f46', lineHeight: '1.2', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>www.akshayamtamilmatrimony.com</div>
               <div className="font-bold text-red-600" style={{ fontSize: '9px', fontWeight: 'bold', color: '#dc2626', lineHeight: '1.2', letterSpacing: '0.01em', marginTop: '2px', whiteSpace: 'nowrap' }}>📞 96776 13716, 93452 89217</div>
               <div className="font-semibold text-gray-800" style={{ fontSize: '7.5px', fontWeight: 600, color: '#1f2937', lineHeight: '1.2', marginTop: '2px', wordBreak: 'break-word', padding: '0 2px' }}>மலைக்கோயில், மங்கலம் ரோடு, திருப்பூர் - 641 604.</div>
            </div>
          </div>

          <PDFChartBox title="நவாம்சம்" houses={amsamHouses} />
        </div>

        {/* 4. Bottom Career & Family Details */}
        <div className="flex py-1 gap-4" style={{ display: 'flex', padding: '8px 0', gap: '16px' }}>
          <div className="flex-1 flex flex-col gap-0.5" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <FieldRow label="ஜனன கால தகவல்" value={dasaBalance} />
            <FieldRow label="படிப்பு - விவரங்கள்" value={profile.educations?.map((e: any) => e.degreeName || e.degree).filter(Boolean).join(', ') || "-"} />
            <FieldRow label="மாத வருமானம்" value={income} />
            <FieldRow label="சொத்து விவரம்" value={propertyStr} />
            <FieldRow label="நட்சத்திரங்கள்" value={profile.poruthaNakshatram?.length ? profile.poruthaNakshatram.map((val: string) => {
              const parts = val.split('(');
              const nakName = parts[0].trim();
              const tamilNak = translateToTamil(nakName, nakshatraMap) || nakName;
              if (parts.length > 1) {
                let padaPart = parts[1].replace(')', '').trim();
                padaPart = padaPart.replace(/1st/g, '1').replace(/2nd/g, '2').replace(/3rd/g, '3').replace(/4th/g, '4');
                padaPart = padaPart.replace(/ Pada/gi, 'ம் பாதம்');
                padaPart = padaPart.replace(/&/g, 'மற்றும்');
                padaPart = padaPart.replace(/to/gi, 'முதல்');
                return `${tamilNak} (${padaPart})`;
              }
              return tamilNak;
            }).join(', ') : "Any"} />
            <FieldRow label="எதிர்பார்ப்பு" value={formatExpectations(profile.expectations)} />
            <FieldRow label="ராகு கேது ஜாதகம்" value={profile.dosham === 'RAHU_KETU' ? "உண்டு" : "-"} />
            <div className="grid grid-cols-[130px_10px_1fr] mt-1 text-[11px] leading-tight" style={{ display: 'flex', marginTop: '4px', fontSize: '11px', lineHeight: '1.2' }}>
              <div className="font-bold text-emerald-950" style={{ fontWeight: 'bold', color: '#022c22', width: '130px' }}>தொடர்பு எண்</div>
              <div className="font-bold text-emerald-950 text-center" style={{ fontWeight: 'bold', color: '#022c22', width: '10px', textAlign: 'center' }}>:</div>
              <div className="font-bold text-red-600" style={{ fontWeight: 'bold', color: '#dc2626', flex: '1' }}>+91 {profile.user?.mobile_no || "96776 13716, 93452 89217"}</div>
            </div>
          </div>
          <div className="w-[280px] flex flex-col gap-0.5 pt-5" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '20px' }}>
            <FieldRow label={family?.workNature === 'JOB' ? 'பதவி' : 'தொழில்'} value={occupationStr} labelWidth="145px" valueWidth="125px" />
            {!isNotWorking && <FieldRow label={family?.workNature === 'JOB' ? 'வேலை செய்யும் இடம்' : 'தொழில் அலுவலகம்'} value={translateToTamil(profile.city, { 'coimbatore': 'கோயம்புத்தூர்', 'chennai': 'சென்னை', 'tiruppur': 'திருப்பூர்', 'erode': 'ஈரோடு', 'salem': 'சேலம்', 'karur': 'கரூர்', 'namakkal': 'நாமக்கல்' }) || nativePlace} labelWidth="145px" valueWidth="125px" />}
          </div>
        </div>

        {/* 5. Akshayam Services Footer Box */}
        <div className="mt-auto flex-shrink-0 flex flex-col justify-end" style={{ marginTop: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="text-center font-bold text-red-600 mb-1" style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626', textAlign: 'center', marginBottom: '4px' }}>ஜாதகம் முதல் பந்தி வரை</div>
          <div className="bg-[#fdfbf2] border border-emerald-900 rounded-t p-1.5 text-[9px] leading-tight relative flex justify-between" style={{ backgroundColor: '#fdfbf2', border: '1px solid #064e3b', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', padding: '6px', fontSize: '9px', lineHeight: '1.2', position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
            {/* Left List */}
            <div className="w-[45%] flex flex-col gap-0.5 font-bold text-gray-800 pl-4" style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: 'bold', color: '#1f2937', paddingLeft: '16px' }}>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> ஜாதகம் பதிவு</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> வாழை மரம்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> ஐயர்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> மாங்கல்ய வாத்தியம்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> சீர்வரிசை தட்டு</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> சமையல் கேட்டரிங் பொருட்கள்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> காய்கறி, காளான்</div>
            </div>
            
            {/* Center Ornamental Divider */}
            <div className="absolute top-2 bottom-2 left-1/2 border-l border-emerald-800 border-dashed" style={{ position: 'absolute', top: '8px', bottom: '8px', left: '50%', borderLeft: '1px dashed #065f46' }}></div>

            {/* Right List */}
            <div className="w-[45%] flex flex-col gap-0.5 font-bold text-gray-800 pr-2" style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: 'bold', color: '#1f2937', paddingRight: '8px' }}>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> பால், தயிர், நெய்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> பால் கோவா, பன்னீர்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> இங்கிலிஷ் காய்கறிகள்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> தண்ணீர் 300 ml to 20 லிட்டர்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> டெக்கரேஷன்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> போட்டோ வீடியோ</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> ஐஸ்கிரீம், பீடா, பழங்கள்</div>
               <div className="flex items-start gap-1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span className="text-red-600" style={{ color: '#dc2626' }}>▶</span> கரும்பு ஜூஸ் மற்றும் பல</div>
            </div>
          </div>
          
          {/* Bottom Dark Green Bar */}
          <div className="bg-[#004d25] text-white text-[9.5px] py-1 text-center font-medium rounded-b relative z-10" style={{ backgroundColor: '#004d25', color: '#ffffff', fontSize: '9.5px', padding: '4px 0', textAlign: 'center', fontWeight: 500, borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', position: 'relative', zIndex: 10 }}>
             <div className="font-bold tracking-wide" style={{ fontWeight: 'bold', letterSpacing: '0.025em' }}>அனைத்து சுப காரியங்களுக்கும் சிறந்த முறையில் சேவைகள் செய்து தரப்படும்.</div>
             <div className="flex items-center justify-center gap-1 mt-0.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
               <span>🌐</span> www.akshayamtamilmatrimony.com
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
