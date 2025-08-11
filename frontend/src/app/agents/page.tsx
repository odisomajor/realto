'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import AgentCard from '@/components/agents/AgentCard';
import { Agent } from '@/types';

// Mock agents data - replace with API call
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@premiumrealty.co.ke",
    phone: "+254700000000",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=200",
    bio: "Experienced real estate professional with over 8 years in the Kenyan property market.",
    company: {
      name: "Premium Realty Kenya",
      address: "Westlands Square, 4th Floor, Suite 401, Nairobi",
      phone: "+254711000000",
      location: "Westlands, Nairobi",
      website: "https://premiumrealty.co.ke",
      logo: "https://picsum.photos/100/50?random=20"
    },
    specializations: ["Luxury Homes", "Commercial Properties", "Investment Properties"],
    experience: 8,
    propertiesListed: 156,
    propertiesSold: 89,
    rating: 4.8,
    reviews: 47,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@urbanspaces.co.ke",
    phone: "+254722000000",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff&size=200",
    bio: "Specializing in residential properties and first-time home buyers in Nairobi and Kiambu.",
    company: {
      name: "Urban Spaces Realty",
      address: "Karen Shopping Centre, 2nd Floor, Nairobi",
      phone: "+254733000000",
      location: "Karen, Nairobi",
      website: "https://urbanspaces.co.ke",
      logo: "https://picsum.photos/100/50?random=21"
    },
    specializations: ["Residential Properties", "First-time Buyers", "Rental Properties"],
    experience: 5,
    propertiesListed: 89,
    propertiesSold: 67,
    rating: 4.6,
    reviews: 32,
    featured: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Michael Ochieng",
    email: "michael@coastalproperties.co.ke",
    phone: "+254733000000",
    avatar: "https://ui-avatars.com/api/?name=Michael+Ochieng&background=f59e0b&color=fff&size=200",
    bio: "Coastal property expert with extensive knowledge of Mombasa and Kilifi real estate markets.",
    company: {
      name: "Coastal Properties Ltd",
      address: "Nyali Centre, 3rd Floor, Mombasa",
      phone: "+254744000000",
      location: "Nyali, Mombasa",
      website: "https://coastalproperties.co.ke",
      logo: "https://picsum.photos/100/50?random=22"
    },
    specializations: ["Coastal Properties", "Vacation Homes", "Land Sales"],
    experience: 12,
    propertiesListed: 203,
    propertiesSold: 145,
    rating: 4.9,
    reviews: 78,
    featured: false,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Grace Wanjiku",
    email: "grace@modernliving.co.ke",
    phone: "+254755000000",
    avatar: "https://ui-avatars.com/api/?name=Grace+Wanjiku&background=8b5cf6&color=fff&size=200",
    bio: "Modern living specialist focusing on contemporary apartments and townhouses.",
    company: {
      name: "Modern Living Realty",
      address: "Sarit Centre, 1st Floor, Westlands, Nairobi",
      phone: "+254766000000",
      location: "Westlands, Nairobi",
      website: "https://modernliving.co.ke",
      logo: "https://picsum.photos/100/50?random=23"
    },
    specializations: ["Modern Apartments", "Townhouses", "Young Professionals"],
    experience: 6,
    propertiesListed: 124,
    propertiesSold: 78,
    rating: 4.7,
    reviews: 41,
    featured: false,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z"
  }
];

export default function AgentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique locations and specializations for filters
  const locations = Array.from(new Set(agents.map(agent => agent.company?.location).filter(Boolean)));
  const specializations = Array.from(new Set(agents.flatMap(agent => agent.specializations || [])));

  useEffect(() => {
    let filtered = agents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(agent => agent.company?.location === locationFilter);
    }

    // Specialization filter
    if (specializationFilter) {
      filtered = filtered.filter(agent => 
        agent.specializations?.includes(specializationFilter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'properties':
          return (b.propertiesListed || 0) - (a.propertiesListed || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, locationFilter, specializationFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSpecializationFilter('');
    setSortBy('rating');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Find Your Perfect Real Estate Agent
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Connect with experienced professionals who know the Kenyan property market inside out
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search agents by name, company, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </Button>
              
              {(searchTerm || locationFilter || specializationFilter) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="properties">Properties Listed</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <select
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {filteredAgents.length} of {agents.length} agents
            </p>
            
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {locationFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                  <MapPinIcon className="h-3 w-3" />
                  {locationFilter}
                  <button
                    onClick={() => setLocationFilter('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {specializationFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                  {specializationFilter}
                  <button
                    onClick={() => setSpecializationFilter('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No agents found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-green-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Are you a real estate professional?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform and connect with potential clients looking for properties in Kenya. 
            Showcase your expertise and grow your business with us.
          </p>
          <Button
            onClick={() => router.push('/auth/register?role=agent')}
            className="bg-green-600 hover:bg-green-700"
          >
            Join as an Agent
          </Button>
        </div>
      </div>
    </div>
  );
}