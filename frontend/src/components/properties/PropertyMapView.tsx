'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Home, DollarSign, Eye, Heart, MessageSquare, X, Filter, List, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  listingType: 'SALE' | 'RENT' | 'LEASE';
  category: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  status: string;
  views: number;
  inquiries: number;
  favorites: number;
  featured: boolean;
  createdAt: string;
}

interface PropertyMapViewProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property | null) => void;
  onPropertyClick: (property: Property) => void;
  filters?: any;
  isLoading?: boolean;
  className?: string;
}

interface MapMarker {
  property: Property;
  element: HTMLDivElement;
}

export default function PropertyMapView({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyClick,
  filters,
  isLoading = false,
  className = ''
}: PropertyMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 }); // Nairobi
  const [mapZoom, setMapZoom] = useState(11);
  const [clusteredProperties, setClusteredProperties] = useState<Property[][]>([]);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  // Mock Google Maps implementation (replace with actual Google Maps)
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize mock map
    const mockMap = {
      center: mapCenter,
      zoom: mapZoom,
      markers: [],
      setCenter: (center: { lat: number; lng: number }) => {
        setMapCenter(center);
      },
      setZoom: (zoom: number) => {
        setMapZoom(zoom);
      }
    };

    setMap(mockMap);
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map || !properties.length) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.element.parentNode) {
        marker.element.parentNode.removeChild(marker.element);
      }
    });

    // Create new markers
    const newMarkers: MapMarker[] = properties.map(property => {
      const markerElement = createMarkerElement(property);
      return {
        property,
        element: markerElement
      };
    });

    setMarkers(newMarkers);
  }, [map, properties]);

  // Cluster nearby properties
  useEffect(() => {
    const clusters = clusterProperties(properties, mapZoom);
    setClusteredProperties(clusters);
  }, [properties, mapZoom]);

  const createMarkerElement = (property: Property) => {
    const marker = document.createElement('div');
    marker.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
      selectedProperty?.id === property.id ? 'scale-110' : 'hover:scale-105'
    } transition-transform duration-200`;
    
    const isSelected = selectedProperty?.id === property.id;
    const priceColor = property.listingType === 'SALE' ? 'bg-green-600' : 'bg-blue-600';
    
    marker.innerHTML = `
      <div class="relative">
        <div class="${priceColor} ${isSelected ? 'ring-4 ring-white shadow-lg' : ''} text-white px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-md">
          ${property.currency} ${property.price.toLocaleString()}
        </div>
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-${property.listingType === 'SALE' ? 'green' : 'blue'}-600"></div>
        ${property.featured ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>' : ''}
      </div>
    `;

    // Position marker based on coordinates
    const x = ((property.coordinates.lng + 180) / 360) * 100;
    const y = ((90 - property.coordinates.lat) / 180) * 100;
    marker.style.left = `${x}%`;
    marker.style.top = `${y}%`;

    // Add event listeners
    marker.addEventListener('click', () => {
      onPropertySelect(property);
    });

    marker.addEventListener('mouseenter', () => {
      setHoveredProperty(property);
    });

    marker.addEventListener('mouseleave', () => {
      setHoveredProperty(null);
    });

    return marker;
  };

  const clusterProperties = (properties: Property[], zoom: number): Property[][] => {
    // Simple clustering algorithm based on distance
    const clusters: Property[][] = [];
    const processed = new Set<string>();
    const clusterDistance = Math.max(0.01, 0.1 / Math.pow(2, zoom - 10));

    properties.forEach(property => {
      if (processed.has(property.id)) return;

      const cluster = [property];
      processed.add(property.id);

      properties.forEach(otherProperty => {
        if (processed.has(otherProperty.id)) return;

        const distance = Math.sqrt(
          Math.pow(property.coordinates.lat - otherProperty.coordinates.lat, 2) +
          Math.pow(property.coordinates.lng - otherProperty.coordinates.lng, 2)
        );

        if (distance < clusterDistance) {
          cluster.push(otherProperty);
          processed.add(otherProperty.id);
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SOLD': return 'bg-red-100 text-red-800';
      case 'RENTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative h-full ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gray-100 relative overflow-hidden rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
        
        {/* Property Markers */}
        {markers.map((marker, index) => (
          <div key={marker.property.id}>
            {React.createElement('div', {
              dangerouslySetInnerHTML: { __html: marker.element.innerHTML },
              className: marker.element.className,
              style: marker.element.style,
              onClick: () => onPropertySelect(marker.property),
              onMouseEnter: () => setHoveredProperty(marker.property),
              onMouseLeave: () => setHoveredProperty(null)
            })}
          </div>
        ))}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading properties...</span>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPropertyList(!showPropertyList)}
            className="bg-white shadow-md"
          >
            {showPropertyList ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
            className="bg-white shadow-md"
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
            className="bg-white shadow-md"
          >
            -
          </Button>
        </div>

        {/* Property Count */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white shadow-md">
            {properties.length} properties
          </Badge>
        </div>
      </div>

      {/* Hovered Property Tooltip */}
      {hoveredProperty && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <Card className="w-80 shadow-lg">
            <CardContent className="p-3">
              <div className="flex space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {hoveredProperty.images[0] ? (
                    <img
                      src={hoveredProperty.images[0]}
                      alt={hoveredProperty.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{hoveredProperty.title}</h4>
                  <p className="text-xs text-gray-600 truncate">{hoveredProperty.location}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-sm text-green-600">
                      {formatPrice(hoveredProperty.price, hoveredProperty.currency)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {hoveredProperty.listingType}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    {hoveredProperty.bedrooms && (
                      <span>{hoveredProperty.bedrooms} bed</span>
                    )}
                    {hoveredProperty.bathrooms && (
                      <span>{hoveredProperty.bathrooms} bath</span>
                    )}
                    {hoveredProperty.area && (
                      <span>{hoveredProperty.area} m²</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property List Sidebar */}
      {showPropertyList && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg z-10 overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Properties ({properties.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPropertyList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto h-full pb-16">
            {properties.map(property => (
              <div
                key={property.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedProperty?.id === property.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onPropertyClick(property)}
              >
                <div className="flex space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                    <p className="text-xs text-gray-600 truncate flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm text-green-600">
                        {formatPrice(property.price, property.currency)}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(property.status)}`}
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      {property.bedrooms && (
                        <span>{property.bedrooms} bed</span>
                      )}
                      {property.bathrooms && (
                        <span>{property.bathrooms} bath</span>
                      )}
                      {property.area && (
                        <span>{property.area} m²</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {property.views}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {property.inquiries}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {property.favorites}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Property Details */}
      {selectedProperty && !showPropertyList && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4 flex-1">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedProperty.images[0] ? (
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{selectedProperty.title}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedProperty.location}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="font-bold text-xl text-green-600">
                        {formatPrice(selectedProperty.price, selectedProperty.currency)}
                      </span>
                      <Badge variant="outline">
                        {selectedProperty.listingType}
                      </Badge>
                      <Badge className={getStatusColor(selectedProperty.status)}>
                        {selectedProperty.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {selectedProperty.bedrooms && (
                        <span>{selectedProperty.bedrooms} bedrooms</span>
                      )}
                      {selectedProperty.bathrooms && (
                        <span>{selectedProperty.bathrooms} bathrooms</span>
                      )}
                      {selectedProperty.area && (
                        <span>{selectedProperty.area} m²</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPropertyClick(selectedProperty)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPropertySelect(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}