import { Loader } from '@googlemaps/js-api-loader';

// Google Maps configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry', 'geocoding'] as const,
  region: 'KE',
  language: 'en'
} as const;

let googleMapsLoader: Loader | null = null;
let isGoogleMapsLoaded = false;

// Initialize Google Maps loader
export const initializeGoogleMaps = (): Loader => {
  if (!googleMapsLoader) {
    googleMapsLoader = new Loader({
      ...GOOGLE_MAPS_CONFIG,
      libraries: [...GOOGLE_MAPS_CONFIG.libraries]
    });
  }
  return googleMapsLoader;
};

// Load Google Maps API
export const loadGoogleMaps = async (): Promise<typeof google> => {
  if (isGoogleMapsLoaded && window.google) {
    return window.google;
  }

  const loader = initializeGoogleMaps();
  
  try {
    const google = await loader.load();
    isGoogleMapsLoaded = true;
    return google;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw new Error('Failed to load Google Maps API');
  }
};

// Geocoding service
export class GeocodingService {
  private geocoder: google.maps.Geocoder | null = null;

  async initialize() {
    if (!this.geocoder) {
      await loadGoogleMaps();
      this.geocoder = new google.maps.Geocoder();
    }
  }

  // Convert address to coordinates
  async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
    county?: string;
    city?: string;
  } | null> {
    await this.initialize();
    
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { 
          address: `${address}, Kenya`,
          region: 'KE'
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            // Extract county and city from address components
            let county = '';
            let city = '';
            
            result.address_components.forEach(component => {
              if (component.types.includes('administrative_area_level_1')) {
                county = component.long_name;
              }
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
              }
            });

            resolve({
              lat: location.lat(),
              lng: location.lng(),
              formattedAddress: result.formatted_address,
              county,
              city
            });
          } else {
            console.error('Geocoding failed:', status);
            resolve(null);
          }
        }
      );
    });
  }

  // Convert coordinates to address (reverse geocoding)
  async reverseGeocode(lat: number, lng: number): Promise<{
    formattedAddress: string;
    county?: string;
    city?: string;
    streetAddress?: string;
  } | null> {
    await this.initialize();
    
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            
            // Extract address components
            let county = '';
            let city = '';
            let streetAddress = '';
            
            result.address_components.forEach(component => {
              if (component.types.includes('administrative_area_level_1')) {
                county = component.long_name;
              }
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
              }
              if (component.types.includes('street_number') || component.types.includes('route')) {
                streetAddress += component.long_name + ' ';
              }
            });

            resolve({
              formattedAddress: result.formatted_address,
              county,
              city,
              streetAddress: streetAddress.trim()
            });
          } else {
            console.error('Reverse geocoding failed:', status);
            resolve(null);
          }
        }
      );
    });
  }
}

// Distance calculation utility
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Kenya bounds for map initialization
export const KENYA_BOUNDS = {
  north: 5.019,
  south: -4.678,
  west: 33.908,
  east: 41.899
};

// Major Kenya cities coordinates
export const KENYA_CITIES = {
  'Nairobi': { lat: -1.2921, lng: 36.8219 },
  'Mombasa': { lat: -4.0435, lng: 39.6682 },
  'Kisumu': { lat: -0.0917, lng: 34.7680 },
  'Nakuru': { lat: -0.3031, lng: 36.0800 },
  'Eldoret': { lat: 0.5143, lng: 35.2698 },
  'Thika': { lat: -1.0332, lng: 37.0692 },
  'Malindi': { lat: -3.2175, lng: 40.1169 },
  'Kitale': { lat: 1.0177, lng: 35.0062 },
  'Garissa': { lat: -0.4536, lng: 39.6401 },
  'Kakamega': { lat: 0.2827, lng: 34.7519 },
  'Machakos': { lat: -1.5177, lng: 37.2634 },
  'Meru': { lat: 0.0467, lng: 37.6556 },
  'Nyeri': { lat: -0.4167, lng: 36.9500 },
  'Kericho': { lat: -0.3691, lng: 35.2861 },
  'Embu': { lat: -0.5314, lng: 37.4502 }
};

// Create singleton instance
export const geocodingService = new GeocodingService();
