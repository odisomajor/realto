'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  MagnifyingGlassIcon,
  BellIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  BookmarkIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface SavedSearch {
  id: string;
  name: string;
  criteria: {
    search?: string;
    type?: 'sale' | 'rent';
    category?: string;
    priceRange?: [number, number];
    bedrooms?: number;
    bathrooms?: number;
    areaRange?: [number, number];
    location?: string;
    county?: string;
    features?: string[];
  };
  notifications: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  createdAt: string;
  lastRun?: string;
  newResults?: number;
  totalResults?: number;
}

interface SavedSearchesProps {
  className?: string;
}

export default function SavedSearches({ className = '' }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [newSearchName, setNewSearchName] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockSavedSearches: SavedSearch[] = [
      {
        id: '1',
        name: 'Family Home in Nairobi',
        criteria: {
          search: 'family home',
          type: 'sale',
          category: 'House',
          priceRange: [5000000, 15000000],
          bedrooms: 3,
          bathrooms: 2,
          location: 'Nairobi',
          county: 'Nairobi',
          features: ['parking', 'garden']
        },
        notifications: true,
        frequency: 'daily',
        createdAt: '2024-01-15T10:00:00Z',
        lastRun: '2024-01-20T08:00:00Z',
        newResults: 3,
        totalResults: 24
      },
      {
        id: '2',
        name: 'Rental Apartment Westlands',
        criteria: {
          search: 'apartment',
          type: 'rent',
          category: 'Apartment',
          priceRange: [50000, 150000],
          bedrooms: 2,
          location: 'Westlands',
          county: 'Nairobi'
        },
        notifications: false,
        frequency: 'weekly',
        createdAt: '2024-01-10T14:30:00Z',
        lastRun: '2024-01-18T09:00:00Z',
        newResults: 0,
        totalResults: 12
      },
      {
        id: '3',
        name: 'Luxury Villa Mombasa',
        criteria: {
          search: 'luxury villa',
          type: 'sale',
          category: 'Villa',
          priceRange: [20000000, 50000000],
          bedrooms: 4,
          bathrooms: 3,
          location: 'Mombasa',
          county: 'Mombasa',
          features: ['swimming pool', 'ocean view', 'security']
        },
        notifications: true,
        frequency: 'instant',
        createdAt: '2024-01-05T16:45:00Z',
        lastRun: '2024-01-19T12:30:00Z',
        newResults: 1,
        totalResults: 8
      }
    ];

    setTimeout(() => {
      setSavedSearches(mockSavedSearches);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCriteria = (criteria: SavedSearch['criteria']) => {
    const parts = [];
    
    if (criteria.search) parts.push(`"${criteria.search}"`);
    if (criteria.type) parts.push(criteria.type === 'sale' ? 'For Sale' : 'For Rent');
    if (criteria.category) parts.push(criteria.category);
    if (criteria.priceRange) {
      parts.push(`${formatCurrency(criteria.priceRange[0])} - ${formatCurrency(criteria.priceRange[1])}`);
    }
    if (criteria.bedrooms) parts.push(`${criteria.bedrooms}+ bed`);
    if (criteria.bathrooms) parts.push(`${criteria.bathrooms}+ bath`);
    if (criteria.location) parts.push(criteria.location);
    if (criteria.features && criteria.features.length > 0) {
      parts.push(`+${criteria.features.length} features`);
    }
    
    return parts.join(' • ');
  };

  const toggleNotifications = (searchId: string) => {
    setSavedSearches(searches =>
      searches.map(search =>
        search.id === searchId
          ? { ...search, notifications: !search.notifications }
          : search
      )
    );
  };

  const updateFrequency = (searchId: string, frequency: SavedSearch['frequency']) => {
    setSavedSearches(searches =>
      searches.map(search =>
        search.id === searchId
          ? { ...search, frequency }
          : search
      )
    );
  };

  const deleteSearch = (searchId: string) => {
    if (confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(searches => searches.filter(search => search.id !== searchId));
    }
  };

  const runSearch = (search: SavedSearch) => {
    // Simulate running the search
    console.log('Running search:', search.name);
    // In a real app, this would navigate to the properties page with the search criteria
    // or open the search results in a modal
  };

  const createNewSearch = () => {
    if (!newSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName,
      criteria: {
        search: '',
        type: 'sale'
      },
      notifications: false,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      totalResults: 0
    };

    setSavedSearches([newSearch, ...savedSearches]);
    setNewSearchName('');
    setIsCreating(false);
    setEditingSearch(newSearch);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-8 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookmarkIconSolid className="w-6 h-6 mr-2 text-green-600" />
              Saved Searches
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your saved property searches and get notified of new listings
            </p>
          </div>
          
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Search
          </Button>
        </div>
      </div>

      {/* Create New Search Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Saved Search
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Family Home in Nairobi"
                    value={newSearchName}
                    onChange={(e) => setNewSearchName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewSearch()}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createNewSearch}
                    disabled={!newSearchName.trim()}
                  >
                    Create Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      <div className="p-6">
        {savedSearches.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Saved Searches
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first saved search to get notified when new properties match your criteria.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Search
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <Card key={search.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {search.name}
                      </h3>
                      
                      {search.notifications && (
                        <Badge className="bg-green-100 text-green-800">
                          <BellIconSolid className="w-3 h-3 mr-1" />
                          Notifications On
                        </Badge>
                      )}
                      
                      {search.newResults && search.newResults > 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {search.newResults} New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {formatCriteria(search.criteria)}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Created {formatDate(search.createdAt)}
                      </div>
                      
                      {search.lastRun && (
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Last run {formatDate(search.lastRun)}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <HomeIcon className="w-4 h-4 mr-1" />
                        {search.totalResults || 0} results
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSearch(search)}
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                      Run Search
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleNotifications(search.id)}
                      className={search.notifications ? 'text-green-600' : 'text-gray-600'}
                    >
                      {search.notifications ? (
                        <BellIconSolid className="w-4 h-4" />
                      ) : (
                        <BellIcon className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSearch(search)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSearch(search.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {search.notifications && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">Notification frequency:</span>
                      <div className="flex space-x-2">
                        {(['instant', 'daily', 'weekly'] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => updateFrequency(search.id, freq)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              search.frequency === freq
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Search Modal */}
      {editingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Search: {editingSearch.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSearch(null)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Name
                  </label>
                  <Input
                    type="text"
                    value={editingSearch.name}
                    onChange={(e) => setEditingSearch({
                      ...editingSearch,
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Keywords
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., luxury apartment, family home"
                    value={editingSearch.criteria.search || ''}
                    onChange={(e) => setEditingSearch({
                      ...editingSearch,
                      criteria: { ...editingSearch.criteria, search: e.target.value }
                    })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={editingSearch.criteria.type || 'sale'}
                      onChange={(e) => setEditingSearch({
                        ...editingSearch,
                        criteria: { ...editingSearch.criteria, type: e.target.value as 'sale' | 'rent' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., House, Apartment, Villa"
                      value={editingSearch.criteria.category || ''}
                      onChange={(e) => setEditingSearch({
                        ...editingSearch,
                        criteria: { ...editingSearch.criteria, category: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Nairobi, Westlands"
                      value={editingSearch.criteria.location || ''}
                      onChange={(e) => setEditingSearch({
                        ...editingSearch,
                        criteria: { ...editingSearch.criteria, location: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Nairobi, Mombasa"
                      value={editingSearch.criteria.county || ''}
                      onChange={(e) => setEditingSearch({
                        ...editingSearch,
                        criteria: { ...editingSearch.criteria, county: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingSearch(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setSavedSearches(searches =>
                        searches.map(search =>
                          search.id === editingSearch.id ? editingSearch : search
                        )
                      );
                      setEditingSearch(null);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}