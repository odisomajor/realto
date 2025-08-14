const axios = require('axios');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Convert address to coordinates (geocoding)
   * @param {string} address - The address to geocode
   * @returns {Promise<{lat: number, lng: number, formattedAddress: string, county?: string, city?: string}>}
   */
  async geocodeAddress(address) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: `${address}, Kenya`,
          key: this.apiKey,
          region: 'ke'
        }
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error('Address not found');
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      // Extract county and city from address components
      let county = null;
      let city = null;

      result.address_components.forEach(component => {
        if (component.types.includes('administrative_area_level_1')) {
          county = component.long_name;
        }
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_2')
        ) {
          city = component.long_name;
        }
      });

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        county,
        city
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<{formattedAddress: string, county?: string, city?: string}>}
   */
  async reverseGeocode(lat, lng) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
          region: 'ke'
        }
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error('Location not found');
      }

      const result = response.data.results[0];

      // Extract county and city from address components
      let county = null;
      let city = null;

      result.address_components.forEach(component => {
        if (component.types.includes('administrative_area_level_1')) {
          county = component.long_name;
        }
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_2')
        ) {
          city = component.long_name;
        }
      });

      return {
        formattedAddress: result.formatted_address,
        county,
        city
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Calculate distance between two points
   * @param {number} lat1 - First point latitude
   * @param {number} lng1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lng2 - Second point longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number}
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Search for nearby amenities using Google Places API
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} type - Place type (restaurant, school, hospital, etc.)
   * @param {number} radius - Search radius in meters (default: 5000)
   * @returns {Promise<Array>} Array of nearby places
   */
  async findNearbyAmenities(lat, lng, type, radius = 5000) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating,
        priceLevel: place.price_level,
        vicinity: place.vicinity,
        types: place.types,
        location: place.geometry.location,
        distance: this.calculateDistance(
          lat,
          lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        )
      }));
    } catch (error) {
      console.error('Places API error:', error);
      throw new Error('Failed to find nearby amenities');
    }
  }
}

module.exports = new GeocodingService();
