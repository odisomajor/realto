'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'county' | 'city' | 'area';
  county?: string;
  region?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationSuggestion | null) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

// Kenya counties and major cities/areas
const KENYA_LOCATIONS: LocationSuggestion[] = [
  // Counties
  { id: 'nairobi', name: 'Nairobi', type: 'county', region: 'Central' },
  { id: 'mombasa', name: 'Mombasa', type: 'county', region: 'Coast' },
  { id: 'kisumu', name: 'Kisumu', type: 'county', region: 'Nyanza' },
  { id: 'nakuru', name: 'Nakuru', type: 'county', region: 'Rift Valley' },
  { id: 'eldoret', name: 'Uasin Gishu (Eldoret)', type: 'county', region: 'Rift Valley' },
  { id: 'thika', name: 'Kiambu', type: 'county', region: 'Central' },
  { id: 'machakos', name: 'Machakos', type: 'county', region: 'Eastern' },
  { id: 'meru', name: 'Meru', type: 'county', region: 'Eastern' },
  { id: 'nyeri', name: 'Nyeri', type: 'county', region: 'Central' },
  { id: 'kakamega', name: 'Kakamega', type: 'county', region: 'Western' },
  { id: 'kilifi', name: 'Kilifi', type: 'county', region: 'Coast' },
  { id: 'kajiado', name: 'Kajiado', type: 'county', region: 'Rift Valley' },
  { id: 'murang\'a', name: 'Murang\'a', type: 'county', region: 'Central' },
  { id: 'kirinyaga', name: 'Kirinyaga', type: 'county', region: 'Central' },
  { id: 'embu', name: 'Embu', type: 'county', region: 'Eastern' },
  
  // Major areas in Nairobi
  { id: 'westlands', name: 'Westlands', type: 'area', county: 'Nairobi' },
  { id: 'karen', name: 'Karen', type: 'area', county: 'Nairobi' },
  { id: 'kilimani', name: 'Kilimani', type: 'area', county: 'Nairobi' },
  { id: 'lavington', name: 'Lavington', type: 'area', county: 'Nairobi' },
  { id: 'kileleshwa', name: 'Kileleshwa', type: 'area', county: 'Nairobi' },
  { id: 'runda', name: 'Runda', type: 'area', county: 'Nairobi' },
  { id: 'muthaiga', name: 'Muthaiga', type: 'area', county: 'Nairobi' },
  { id: 'gigiri', name: 'Gigiri', type: 'area', county: 'Nairobi' },
  { id: 'spring-valley', name: 'Spring Valley', type: 'area', county: 'Nairobi' },
  { id: 'riverside', name: 'Riverside', type: 'area', county: 'Nairobi' },
  { id: 'parklands', name: 'Parklands', type: 'area', county: 'Nairobi' },
  { id: 'upperhill', name: 'Upper Hill', type: 'area', county: 'Nairobi' },
  { id: 'hurlingham', name: 'Hurlingham', type: 'area', county: 'Nairobi' },
  { id: 'south-b', name: 'South B', type: 'area', county: 'Nairobi' },
  { id: 'south-c', name: 'South C', type: 'area', county: 'Nairobi' },
  { id: 'langata', name: 'Langata', type: 'area', county: 'Nairobi' },
  { id: 'kibera', name: 'Kibera', type: 'area', county: 'Nairobi' },
  { id: 'kasarani', name: 'Kasarani', type: 'area', county: 'Nairobi' },
  { id: 'embakasi', name: 'Embakasi', type: 'area', county: 'Nairobi' },
  
  // Major cities
  { id: 'thika-city', name: 'Thika', type: 'city', county: 'Kiambu' },
  { id: 'nyahururu', name: 'Nyahururu', type: 'city', county: 'Laikipia' },
  { id: 'nanyuki', name: 'Nanyuki', type: 'city', county: 'Laikipia' },
  { id: 'malindi', name: 'Malindi', type: 'city', county: 'Kilifi' },
  { id: 'watamu', name: 'Watamu', type: 'city', county: 'Kilifi' },
  { id: 'diani', name: 'Diani', type: 'city', county: 'Kwale' },
];

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search counties, cities, or areas...", 
  className = "",
  value = ""
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = KENYA_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.county && location.county.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.region && location.region.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 10); // Limit to 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setSelectedLocation(null);
      onLocationSelect(null);
    }
  };

  const handleSuggestionClick = (location: LocationSuggestion) => {
    setSearchTerm(location.name);
    setSelectedLocation(location);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedLocation(null);
    setShowSuggestions(false);
    onLocationSelect(null);
    inputRef.current?.focus();
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'county':
        return '🏛️';
      case 'city':
        return '🏙️';
      case 'area':
        return '📍';
      default:
        return '📍';
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'county':
        return 'County';
      case 'city':
        return 'City';
      case 'area':
        return 'Area';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSuggestionClick(location)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getLocationTypeIcon(location.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-500">
                      {location.type === 'area' && location.county && `${location.county} County`}
                      {location.type === 'city' && location.county && `${location.county} County`}
                      {location.type === 'county' && location.region && `${location.region} Region`}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {getLocationTypeLabel(location.type)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}