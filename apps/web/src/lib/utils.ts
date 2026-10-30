import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeRemaining(deadline?: string | null): { text: string; isUrgent: boolean; isExpired: boolean } {
  if (!deadline) return { text: 'No deadline', isUrgent: false, isExpired: false };
  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) {
    return { text: 'Expired', isUrgent: false, isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return { text: `${minutes}m remaining`, isUrgent: true, isExpired: false };
  }
  if (hours < 4) {
    return { text: `${hours}h ${minutes}m left`, isUrgent: true, isExpired: false };
  }
  return { text: `${hours} hours left`, isUrgent: false, isExpired: false };
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    cooked_meals: 'Cooked Meals',
    bakery: 'Bakery & Bread',
    produce: 'Fresh Produce',
    packaged: 'Packaged Food',
    dairy: 'Dairy Products',
    beverages: 'Beverages',
    other: 'Other Food',
  };
  return map[category] || category;
}

export function areCitiesCompatible(userCity?: string | null, donationCity?: string | null): boolean {
  if (!userCity || !donationCity) return true;
  const u = userCity.toLowerCase().trim();
  const d = donationCity.toLowerCase().trim();
  if (u === d) return true;
  // Regional corridor compatibility: Delhi NCR and adjacent Noida
  if ((u.includes('delhi') || u.includes('noida')) && (d.includes('delhi') || d.includes('noida'))) {
    return true;
  }
  return false;
}

export const INDIAN_STATES = [
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'Telangana',
  'West Bengal',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Andhra Pradesh',
  'Odisha',
  'Goa',
  'Assam',
  'Jharkhand',
  'Uttarakhand',
  'Himachal Pradesh',
  'Chhattisgarh',
  'Chandigarh',
] as const;

export const STATE_CITIES_MAP: Record<string, string[]> = {
  Delhi: ['Delhi NCR', 'New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'East Delhi', 'Central Delhi'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Aurangabad'],
  Karnataka: ['Bengaluru', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Ghaziabad', 'Prayagraj'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  Telangana: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
  Punjab: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Rishikesh'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur'],
  Chandigarh: ['Chandigarh'],
};

export function inferStateFromCity(city?: string | null): string {
  if (!city) return 'Delhi';
  const c = city.toLowerCase().trim();
  if (
    c.includes('mumbai') ||
    c.includes('pune') ||
    c.includes('nagpur') ||
    c.includes('nashik') ||
    c.includes('thane') ||
    c.includes('navi mumbai')
  ) {
    return 'Maharashtra';
  }
  if (c.includes('delhi') || c.includes('ncr')) {
    return 'Delhi';
  }
  if (
    c.includes('noida') ||
    c.includes('lucknow') ||
    c.includes('kanpur') ||
    c.includes('agra') ||
    c.includes('varanasi') ||
    c.includes('ghaziabad')
  ) {
    return 'Uttar Pradesh';
  }
  if (c.includes('bengaluru') || c.includes('bangalore') || c.includes('mysore')) {
    return 'Karnataka';
  }
  if (c.includes('hyderabad') || c.includes('secunderabad')) {
    return 'Telangana';
  }
  if (c.includes('chennai') || c.includes('coimbatore')) {
    return 'Tamil Nadu';
  }
  if (c.includes('kolkata')) {
    return 'West Bengal';
  }
  if (c.includes('ahmedabad') || c.includes('surat') || c.includes('vadodara')) {
    return 'Gujarat';
  }
  if (c.includes('jaipur') || c.includes('jodhpur') || c.includes('udaipur')) {
    return 'Rajasthan';
  }
  if (c.includes('chandigarh') || c.includes('ludhiana') || c.includes('amritsar')) {
    return 'Punjab';
  }
  if (c.includes('gurugram') || c.includes('gurgaon') || c.includes('faridabad')) {
    return 'Haryana';
  }
  return 'Delhi';
}

export function areStatesCompatible(stateA?: string | null, stateB?: string | null): boolean {
  if (!stateA || !stateB) return true;
  const a = stateA.toLowerCase().trim();
  const b = stateB.toLowerCase().trim();
  if (a === b) return true;
  // Handle 'delhi' and 'delhi ncr' normalization
  if ((a.includes('delhi') || a === 'delhi ncr') && (b.includes('delhi') || b === 'delhi ncr')) {
    return true;
  }
  return false;
}
