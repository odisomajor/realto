'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import { loadGoogleMaps, KENYA_BOUNDS, KENYA_CITIES, calculateDistance } from '@/lib/google-maps';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  type: string;
  bedrooms?: number;
  bathrooms?: number;
}

interface GoogleMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
  showSearch?: boolean;
  className?: string;
}

// Map component that renders inside the Google Maps wrapper
function MapComponent({
  properties,
  center = KENYA_CITIES.Nairobi,
  zoom = 7,
  onPropertySelect,
  selectedProperty,
  showSearch = false
}: Omit<GoogleMapProps, 'className' | 'height'>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [markerClusterer, setMarkerClusterer] = useState<MarkerClusterer | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    console.log('Initializing Google Maps with window.google...');

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: center || KENYA_CITIES.Nairobi,
        zoom: zoom || 10,
        restriction: {
          latLngBounds: KENYA_BOUNDS,
          strictBounds: false,
        },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      console.log('Map instance created successfully');
      setMap(mapInstance);

      const infoWindowInstance = new google.maps.InfoWindow();
      setInfoWindow(infoWindowInstance);
      console.log('Info window created successfully');

      // Initialize search functionality if enabled
      if (showSearch) {
        const searchInput = document.getElementById('map-search') as HTMLInputElement;
        if (searchInput) {
          const searchBox = new google.maps.places.SearchBox(searchInput);
          
          // Bias the SearchBox results towards current map's viewport
          mapInstance.addListener('bounds_changed', () => {
            searchBox.setBounds(mapInstance.getBounds()!);
          });

          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (!places || places.length === 0) return;

            const place = places[0];
            if (!place.geometry || !place.geometry.location) return;

            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(12);
          });
        }
      }

    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
    }
  }, [center, zoom, showSearch]);

  // Create property markers with clustering
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers and clusterer
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];

    // Create custom marker icon based on property type
    const getMarkerIcon = (type: string, isSelected: boolean) => {
      const color = isSelected ? '#3b82f6' : '#10b981';
      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
            <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">₹</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40)
      };
    };

    // Create info window content
    const createInfoWindowContent = (property: Property) => {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(price);
      };

      return `
        <div class="p-3 max-w-xs">
          ${property.images && property.images[0] ? 
            `<img src="${property.images[0]}" alt="${property.title}" class="w-full h-32 object-cover rounded-lg mb-2" />` : 
            ''
          }
          <h3 class="font-semibold text-gray-900 mb-1">${property.title}</h3>
          <p class="text-lg font-bold text-green-600 mb-1">${formatPrice(property.price)}</p>
          <p class="text-sm text-gray-600 mb-2">${property.location}</p>
          <div class="flex gap-2 text-xs text-gray-500 mb-2">
            ${property.bedrooms ? `<span>${property.bedrooms} beds</span>` : ''}
            ${property.bathrooms ? `<span>${property.bathrooms} baths</span>` : ''}
            <span class="capitalize">${property.type}</span>
          </div>
          <button 
            onclick="window.selectProperty('${property.id}')" 
            class="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
          >
            View Details
          </button>
        </div>
      `;
    };

    properties.forEach(property => {
      if (!property.coordinates) return;

      const marker = new google.maps.Marker({
        position: property.coordinates,
        title: property.title,
        icon: getMarkerIcon(property.type, selectedProperty?.id === property.id),
        animation: selectedProperty?.id === property.id ? google.maps.Animation.BOUNCE : undefined
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.setContent(createInfoWindowContent(property));
        infoWindow.open(map, marker);
        
        if (onPropertySelect) {
          onPropertySelect(property);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Create or update marker clusterer
    if (newMarkers.length > 0) {
      const clusterer = new MarkerClusterer({
        map,
        markers: newMarkers,
        algorithm: new GridAlgorithm({ gridSize: 60 }),
        renderer: {
          render: ({ count, position }) => {
            // Custom cluster marker
            const color = count > 10 ? '#dc2626' : count > 5 ? '#f59e0b' : '#10b981';
            const size = count > 10 ? 50 : count > 5 ? 45 : 40;
            
            return new google.maps.Marker({
              position,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}" stroke="white" stroke-width="3"/>
                    <text x="${size/2}" y="${size/2+4}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${count}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(size, size),
                anchor: new google.maps.Point(size/2, size/2)
              },
              label: {
                text: count.toString(),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              },
              zIndex: 1000
            });
          }
        }
      });
      
      setMarkerClusterer(clusterer);
    }

    // Global function for info window button clicks
    (window as any).selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property && onPropertySelect) {
        onPropertySelect(property);
      }
    };

    return () => {
      // Cleanup
      delete (window as any).selectProperty;
    };
  }, [map, properties, infoWindow, onPropertySelect, selectedProperty]);

  // Update marker styles when selected property changes
  useEffect(() => {
    if (!markers.length) return;
    
    markers.forEach((marker, index) => {
      const property = properties[index];
      if (property) {
        const getMarkerIcon = (type: string, isSelected: boolean) => {
          const color = isSelected ? '#3b82f6' : '#10b981';
          return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
                <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">₹</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40)
          };
        };

        marker.setIcon(getMarkerIcon(property.type, selectedProperty?.id === property.id));
        marker.setAnimation(selectedProperty?.id === property.id ? google.maps.Animation.BOUNCE : undefined);
      }
    });
  }, [selectedProperty, markers, properties]);

  return (
    <div className="relative w-full h-full">
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <input
            id="map-search"
            type="text"
            placeholder="Search for a location in Kenya..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// Main Google Map component with wrapper
export default function GoogleMap({
  properties,
  center,
  zoom,
  height = '400px',
  onPropertySelect,
  selectedProperty,
  showSearch,
  className = ''
}: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  console.log('GoogleMap component rendering with:', {
    apiKey: apiKey ? 'Present' : 'Missing',
    propertiesCount: properties.length,
    center,
    zoom,
    height
  });

  if (!apiKey) {
    console.error('Google Maps API key is missing');
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <p className="text-red-600 mb-2">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  const render = (status: string) => {
    console.log('Google Maps render status:', status);
    
    if (status === 'LOADING') {
      return (
        <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      console.error('Google Maps failed to load');
      return (
        <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
          <div className="text-center p-6">
            <p className="text-red-600 mb-2">Failed to load Google Maps</p>
            <p className="text-sm text-gray-500">Please check your internet connection and API key</p>
            <p className="text-xs text-gray-400 mt-2">API Key: {apiKey ? 'Present' : 'Missing'}</p>
          </div>
        </div>
      );
    }

    if (status === 'SUCCESS') {
      console.log('Google Maps loaded successfully');
      return (
        <MapComponent
          properties={properties}
          center={center}
          zoom={zoom}
          onPropertySelect={onPropertySelect}
          selectedProperty={selectedProperty}
          showSearch={showSearch}
        />
      );
    }

    return <div />;
  };

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <Wrapper
        apiKey={apiKey}
        render={render}
        libraries={['places', 'geometry']}
        region="KE"
        language="en"
      >
        <MapComponent
          properties={properties}
          center={center}
          zoom={zoom}
          onPropertySelect={onPropertySelect}
          selectedProperty={selectedProperty}
          showSearch={showSearch}
        />
      </Wrapper>
    </div>
  );
}
