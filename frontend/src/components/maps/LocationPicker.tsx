'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { geocodingApi } from '@/lib/api';
import { KENYA_BOUNDS, KENYA_CITIES } from '@/lib/google-maps';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  county?: string;
  city?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  placeholder?: string;
  className?: string;
  height?: string;
}

// Map component for location picking
function LocationPickerMap({
  onLocationSelect,
  initialLocation,
}: {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        const center = initialLocation?.coordinates || KENYA_CITIES.Nairobi;
        
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center,
          zoom: initialLocation ? 15 : 7,
          restriction: {
            latLngBounds: KENYA_BOUNDS,
            strictBounds: false,
          },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: false,
        });

        setMap(mapInstance);

        // Create draggable marker
        const markerInstance = new google.maps.Marker({
          position: center,
          map: mapInstance,
          draggable: true,
          title: 'Drag to select location',
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24C32 7.163 24.837 0 16 0z" fill="#dc2626"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
                <circle cx="16" cy="16" r="4" fill="#dc2626"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40)
          }
        });

        setMarker(markerInstance);

        // Handle marker drag
        markerInstance.addListener('dragend', async () => {
          const position = markerInstance.getPosition();
          if (position) {
            await handleLocationChange(position.lat(), position.lng());
          }
        });

        // Handle map click
        mapInstance.addListener('click', async (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            markerInstance.setPosition({ lat, lng });
            await handleLocationChange(lat, lng);
          }
        });

        // Initialize search box
        const searchInput = document.getElementById('location-search') as HTMLInputElement;
        if (searchInput) {
          const searchBoxInstance = new google.maps.places.SearchBox(searchInput);
          setSearchBox(searchBoxInstance);

          // Bias search results to Kenya
          mapInstance.addListener('bounds_changed', () => {
            searchBoxInstance.setBounds(mapInstance.getBounds()!);
          });

          // Handle place selection
          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (!places || places.length === 0) return;

            const place = places[0];
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            mapInstance.setCenter({ lat, lng });
            mapInstance.setZoom(15);
            markerInstance.setPosition({ lat, lng });

            // Use place data if available, otherwise geocode
            if (place.formatted_address) {
              let county = '';
              let city = '';
              
              place.address_components?.forEach(component => {
                if (component.types.includes('administrative_area_level_1')) {
                  county = component.long_name;
                }
                if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                  city = component.long_name;
                }
              });

              onLocationSelect({
                address: place.formatted_address,
                coordinates: { lat, lng },
                county,
                city
              });
            } else {
              handleLocationChange(lat, lng);
            }
          });
        }

        // If initial location provided, trigger location select
        if (initialLocation) {
          onLocationSelect(initialLocation);
        }

      } catch (error) {
        console.error('Failed to initialize location picker:', error);
      }
    };

    initMap();
  }, [initialLocation]);

  // Handle location change (reverse geocoding)
  const handleLocationChange = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    
    try {
      const response = await geocodingApi.reverseGeocode(lat, lng);
      
      if (response.data.success && response.data.data) {
        const result = response.data.data;
        onLocationSelect({
          address: result.formatted_address,
          coordinates: { lat, lng },
          county: result.county || '',
          city: result.city || ''
        });
      } else {
        // Fallback if geocoding fails
        onLocationSelect({
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { lat, lng }
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to coordinates
      onLocationSelect({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng }
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Search input */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <input
            id="location-search"
            type="text"
            placeholder="Search for a location in Kenya..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          />
          <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Geocoding indicator */}
      {isGeocoding && (
        <div className="absolute top-16 left-4 z-10 bg-white px-3 py-1 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            Getting address...
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border text-sm text-gray-600 text-center">
          Click on the map or drag the marker to select a location
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// Main LocationPicker component
export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  placeholder = "Click to select location on map",
  className = "",
  height = "400px"
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [showMap, setShowMap] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  if (!apiKey) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-600">
          <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="mb-1">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  const render = (status: string) => {
    if (status === 'LOADING') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <p className="text-red-600 mb-2">Failed to load Google Maps</p>
            <p className="text-sm text-gray-500">Please check your internet connection and API key</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={className}>
      {/* Location display/trigger */}
      <div
        className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-colors"
        onClick={() => setShowMap(!showMap)}
      >
        <div className="flex items-center gap-3">
          <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {selectedLocation ? (
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedLocation.address}
                </p>
                {selectedLocation.city && selectedLocation.county && (
                  <p className="text-xs text-gray-500">
                    {selectedLocation.city}, {selectedLocation.county}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">{placeholder}</p>
            )}
          </div>
          <div className="text-sm text-green-600">
            {showMap ? 'Hide Map' : 'Select Location'}
          </div>
        </div>
      </div>

      {/* Map container */}
      {showMap && (
        <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
          <Wrapper
            apiKey={apiKey}
            render={render}
            libraries={['places', 'geometry']}
            region="KE"
            language="en"
          >
            <LocationPickerMap
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation || undefined}
            />
          </Wrapper>
        </div>
      )}
    </div>
  );
}