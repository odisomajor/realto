'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Search, Star, Eye, Home, Calendar, Filter } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  title: string;
  experience: number;
  rating: number;
  propertiesListed: number;
  propertyViews: number;
  joinedDate: string;
  specialties: string[];
  location: string;
  avatar: string;
}

// Sample agent data
const SAMPLE_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Sarah Wanjiku',
    title: 'Senior Real Estate Agent',
    experience: 8,
    rating: 4.9,
    propertiesListed: 45,
    propertyViews: 12500,
    joinedDate: '2016-03-15',
    specialties: ['Residential', 'Luxury Homes'],
    location: 'Nairobi',
    avatar: 'SW'
  },
  {
    id: 2,
    name: 'John Kamau',
    title: 'Commercial Property Specialist',
    experience: 12,
    rating: 4.8,
    propertiesListed: 67,
    propertyViews: 18900,
    joinedDate: '2012-08-22',
    specialties: ['Commercial', 'Investment Properties'],
    location: 'Mombasa',
    avatar: 'JK'
  },
  {
    id: 3,
    name: 'Grace Akinyi',
    title: 'Residential Property Expert',
    experience: 6,
    rating: 4.7,
    propertiesListed: 38,
    propertyViews: 9800,
    joinedDate: '2018-01-10',
    specialties: ['Residential', 'First-time Buyers'],
    location: 'Kisumu',
    avatar: 'GA'
  },
  {
    id: 4,
    name: 'Michael Ochieng',
    title: 'Land & Development Specialist',
    experience: 15,
    rating: 4.9,
    propertiesListed: 89,
    propertyViews: 25600,
    joinedDate: '2009-05-18',
    specialties: ['Land', 'Development Projects'],
    location: 'Nakuru',
    avatar: 'MO'
  },
  {
    id: 5,
    name: 'Mary Njeri',
    title: 'Rental Property Manager',
    experience: 4,
    rating: 4.6,
    propertiesListed: 23,
    propertyViews: 6700,
    joinedDate: '2020-11-03',
    specialties: ['Rentals', 'Property Management'],
    location: 'Nairobi',
    avatar: 'MN'
  },
  {
    id: 6,
    name: 'David Kiprop',
    title: 'Investment Property Advisor',
    experience: 10,
    rating: 4.8,
    propertiesListed: 56,
    propertyViews: 15400,
    joinedDate: '2014-07-12',
    specialties: ['Investment', 'Commercial'],
    location: 'Eldoret',
    avatar: 'DK'
  }
];

type SortOption = 'rating' | 'properties' | 'views' | 'experience' | 'newest' | 'oldest';

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedAgents = useMemo(() => {
    let filtered = SAMPLE_AGENTS.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.specialties.some(specialty => 
                             specialty.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      const matchesLocation = !filterLocation || agent.location === filterLocation;
      
      return matchesSearch && matchesLocation;
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'properties':
          return b.propertiesListed - a.propertiesListed;
        case 'views':
          return b.propertyViews - a.propertyViews;
        case 'experience':
          return b.experience - a.experience;
        case 'newest':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case 'oldest':
          return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterLocation]);

  const uniqueLocations = Array.from(new Set(SAMPLE_AGENTS.map(agent => agent.location)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Real Estate Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with experienced real estate professionals who know the Kenyan market inside out.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search agents by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="properties">Most Properties</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedAgents.length} of {SAMPLE_AGENTS.length} agents
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{agent.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{agent.title}</p>
                    <p className="text-gray-500 text-xs">{agent.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {renderStars(agent.rating)}
                  </div>
                  <span className="text-sm font-medium">{agent.rating}</span>
                  <span className="text-xs text-gray-500">rating</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Home className="h-4 w-4" />
                      <span className="font-semibold">{agent.propertiesListed}</span>
                    </div>
                    <p className="text-xs text-gray-500">Properties Listed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="font-semibold">{agent.propertyViews.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">Property Views</p>
                  </div>
                </div>

                {/* Experience & Join Date */}
                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>{agent.experience} years experience</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Joined {formatDate(agent.joinedDate)}
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Button */}
                <Button size="sm" className="w-full">
                  Contact Agent
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more agents.
            </p>
          </div>
        )}

        {/* Become an Agent Section */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Become an Agent
              </h2>
              <p className="text-gray-600 mb-6">
                Join our network of professional real estate agents and grow your business with Xillix.
              </p>
              <Button size="lg">Join as an Agent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}