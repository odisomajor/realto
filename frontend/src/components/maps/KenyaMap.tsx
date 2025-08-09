'use client'

import { useState } from 'react'

interface KenyaMapProps {
  properties: any[]
  onLocationFilter: (county: string) => void
  selectedCounty?: string
}

export default function KenyaMap({ properties, onLocationFilter, selectedCounty }: KenyaMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)

  // County coordinates for property markers (simplified positions)
  const countyCoordinates: { [key: string]: { x: number; y: number } } = {
    'Nairobi': { x: 50, y: 65 },
    'Mombasa': { x: 85, y: 85 },
    'Kisumu': { x: 25, y: 60 },
    'Nakuru': { x: 40, y: 55 },
    'Eldoret': { x: 30, y: 45 },
    'Thika': { x: 52, y: 62 },
    'Malindi': { x: 82, y: 75 },
    'Kitale': { x: 28, y: 40 },
    'Garissa': { x: 70, y: 50 },
    'Kakamega': { x: 25, y: 50 },
    'Machakos': { x: 55, y: 70 },
    'Meru': { x: 60, y: 55 },
    'Nyeri': { x: 48, y: 58 },
    'Kericho': { x: 32, y: 58 },
    'Embu': { x: 58, y: 62 },
    'Lamu': { x: 78, y: 70 },
    'Isiolo': { x: 65, y: 50 },
    'Marsabit': { x: 68, y: 35 },
    'Turkana': { x: 40, y: 25 },
    'Mandera': { x: 80, y: 25 }
  }

  // Get property count by county
  const getPropertyCountByCounty = (county: string) => {
    return properties.filter(property => 
      property.location.toLowerCase().includes(county.toLowerCase())
    ).length
  }

  const handleCountyClick = (county: string) => {
    onLocationFilter(county)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Locations</h3>
      
      <div className="relative">
        {/* Simplified Kenya Map SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-80 border border-gray-200 rounded-lg"
          style={{ backgroundColor: '#f8fafc' }}
        >
          {/* Kenya outline (simplified) */}
          <path
            d="M20,30 L25,25 L35,20 L45,18 L55,20 L65,25 L75,30 L85,40 L88,50 L85,60 L82,70 L78,80 L70,85 L60,88 L50,85 L40,82 L30,78 L25,70 L22,60 L20,50 L18,40 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.5"
            className="hover:fill-green-100 cursor-pointer transition-colors"
            onClick={() => handleCountyClick('')}
          />

          {/* County regions (simplified clickable areas) */}
          {Object.entries(countyCoordinates).map(([county, coords]) => {
            const propertyCount = getPropertyCountByCounty(county)
            const isSelected = selectedCounty === county
            const isHovered = hoveredCounty === county
            
            return (
              <g key={county}>
                {/* County clickable area */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="4"
                  fill={isSelected ? '#3b82f6' : propertyCount > 0 ? '#10b981' : '#94a3b8'}
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleCountyClick(county)}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                />
                
                {/* Property count indicator */}
                {propertyCount > 0 && (
                  <text
                    x={coords.x}
                    y={coords.y - 6}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700 pointer-events-none"
                  >
                    {propertyCount}
                  </text>
                )}
                
                {/* County name on hover */}
                {isHovered && (
                  <text
                    x={coords.x}
                    y={coords.y + 8}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-900 pointer-events-none"
                  >
                    {county}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Has Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>No Properties</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 mt-2">
          Click on any location to filter properties by that area. Numbers show property count.
        </p>
      </div>

      {/* Selected county info */}
      {selectedCounty && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-green-900">
              Showing properties in: {selectedCounty}
            </span>
            <button
              onClick={() => onLocationFilter('')}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Clear filter
            </button>
          </div>
          <span className="text-sm text-green-700">
            {getPropertyCountByCounty(selectedCounty)} properties found
          </span>
        </div>
      )}
    </div>
  )
}