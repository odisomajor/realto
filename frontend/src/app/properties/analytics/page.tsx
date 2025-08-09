'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { propertyApi } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageSquare, 
  Home,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface PropertyAnalytics {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  favorites: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
  inquiriesThisWeek: number;
  inquiriesLastWeek: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  createdAt: string;
  lastUpdated: string;
}

interface OverallStats {
  totalProperties: number;
  totalViews: number;
  totalInquiries: number;
  totalFavorites: number;
  averagePrice: number;
  activeListings: number;
  soldProperties: number;
  averageViewsPerProperty: number;
  conversionRate: number;
  topPerformingProperty: string;
}

export default function PropertyAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="AGENT">
      <AnalyticsDashboard />
    </ProtectedRoute>
  );
}

function AnalyticsDashboard() {
  const [properties, setProperties] = useState<PropertyAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockProperties: PropertyAnalytics[] = [
        {
          id: '1',
          title: 'Modern 3BR Apartment in Westlands',
          location: 'Westlands, Nairobi',
          price: 15000000,
          status: 'active',
          views: 1250,
          inquiries: 45,
          favorites: 89,
          viewsThisWeek: 180,
          viewsLastWeek: 165,
          inquiriesThisWeek: 8,
          inquiriesLastWeek: 6,
          averageTimeOnPage: 245,
          bounceRate: 35,
          conversionRate: 3.6,
          createdAt: '2024-01-15T00:00:00Z',
          lastUpdated: '2024-01-20T00:00:00Z'
        },
        {
          id: '2',
          title: 'Luxury Villa in Karen',
          location: 'Karen, Nairobi',
          price: 45000000,
          status: 'active',
          views: 890,
          inquiries: 32,
          favorites: 156,
          viewsThisWeek: 120,
          viewsLastWeek: 140,
          inquiriesThisWeek: 5,
          inquiriesLastWeek: 8,
          averageTimeOnPage: 320,
          bounceRate: 28,
          conversionRate: 3.6,
          createdAt: '2024-01-10T00:00:00Z',
          lastUpdated: '2024-01-18T00:00:00Z'
        },
        {
          id: '3',
          title: 'Commercial Space in CBD',
          location: 'CBD, Nairobi',
          price: 25000000,
          status: 'sold',
          views: 2100,
          inquiries: 78,
          favorites: 234,
          viewsThisWeek: 0,
          viewsLastWeek: 0,
          inquiriesThisWeek: 0,
          inquiriesLastWeek: 0,
          averageTimeOnPage: 180,
          bounceRate: 45,
          conversionRate: 3.7,
          createdAt: '2023-12-01T00:00:00Z',
          lastUpdated: '2024-01-05T00:00:00Z'
        }
      ];

      const mockOverallStats: OverallStats = {
        totalProperties: mockProperties.length,
        totalViews: mockProperties.reduce((sum, p) => sum + p.views, 0),
        totalInquiries: mockProperties.reduce((sum, p) => sum + p.inquiries, 0),
        totalFavorites: mockProperties.reduce((sum, p) => sum + p.favorites, 0),
        averagePrice: mockProperties.reduce((sum, p) => sum + p.price, 0) / mockProperties.length,
        activeListings: mockProperties.filter(p => p.status === 'active').length,
        soldProperties: mockProperties.filter(p => p.status === 'sold').length,
        averageViewsPerProperty: mockProperties.reduce((sum, p) => sum + p.views, 0) / mockProperties.length,
        conversionRate: 3.6,
        topPerformingProperty: mockProperties.sort((a, b) => b.views - a.views)[0]?.title || 'N/A'
      };

      setProperties(mockProperties);
      setOverallStats(mockOverallStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Analytics</h1>
            <p className="text-gray-600">Track your property performance and insights</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Link href="/properties/my-properties">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                My Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Avg: {Math.round(overallStats.averageViewsPerProperty)} per property
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalInquiries}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {overallStats.conversionRate}% conversion rate
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.activeListings}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {overallStats.soldProperties} sold
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(overallStats.averagePrice)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {overallStats.totalFavorites} total favorites
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Performing Property */}
        {overallStats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Top Performing</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {overallStats.topPerformingProperty}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {overallStats.conversionRate}%
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(overallStats.totalViews + overallStats.totalInquiries + overallStats.totalFavorites).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Property Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>
              Detailed analytics for each of your property listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {properties.map((property) => {
                const viewsChange = getPercentageChange(property.viewsThisWeek, property.viewsLastWeek);
                const inquiriesChange = getPercentageChange(property.inquiriesThisWeek, property.inquiriesLastWeek);
                
                return (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                          {getStatusBadge(property.status)}
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(property.price)}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0">
                        <Link href={`/properties/${property.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Property
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.views}</p>
                        <p className="text-xs text-gray-600">Total Views</p>
                        {viewsChange !== 0 && (
                          <div className={`flex items-center justify-center mt-1 ${viewsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {viewsChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            <span className="text-xs">{Math.abs(viewsChange).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.inquiries}</p>
                        <p className="text-xs text-gray-600">Inquiries</p>
                        {inquiriesChange !== 0 && (
                          <div className={`flex items-center justify-center mt-1 ${inquiriesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {inquiriesChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            <span className="text-xs">{Math.abs(inquiriesChange).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.favorites}</p>
                        <p className="text-xs text-gray-600">Favorites</p>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.averageTimeOnPage}s</p>
                        <p className="text-xs text-gray-600">Avg. Time</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <PieChart className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.bounceRate}%</p>
                        <p className="text-xs text-gray-600">Bounce Rate</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold text-gray-900">{property.conversionRate}%</p>
                        <p className="text-xs text-gray-600">Conversion</p>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500">
                      <span>Listed: {formatDate(property.createdAt)}</span>
                      <span>Last updated: {formatDate(property.lastUpdated)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}