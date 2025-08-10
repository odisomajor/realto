'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Clock,
  Target,
  Activity,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface PropertyMetrics {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalViews: number;
  totalInquiries: number;
  totalFavorites: number;
  averagePrice: number;
  averageDaysOnMarket: number;
  conversionRate: number;
}

interface PropertyPerformance {
  id: string;
  title: string;
  views: number;
  inquiries: number;
  favorites: number;
  price: number;
  daysOnMarket: number;
  status: string;
  type: string;
  location: string;
  performanceScore: number;
}

interface TimeSeriesData {
  date: string;
  views: number;
  inquiries: number;
  favorites: number;
  newListings: number;
}

interface LocationData {
  location: string;
  count: number;
  averagePrice: number;
  averageViews: number;
}

interface PriceRangeData {
  range: string;
  count: number;
  percentage: number;
}

interface PropertyAnalyticsEnhancedProps {
  userId?: string;
  dateRange?: string;
  propertyType?: string;
  location?: string;
  className?: string;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function PropertyAnalyticsEnhanced({
  userId,
  dateRange = '30d',
  propertyType = 'all',
  location = 'all',
  className = ''
}: PropertyAnalyticsEnhancedProps) {
  const [metrics, setMetrics] = useState<PropertyMetrics | null>(null);
  const [topPerformers, setTopPerformers] = useState<PropertyPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [priceRangeData, setPriceRangeData] = useState<PriceRangeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [selectedPropertyType, setSelectedPropertyType] = useState(propertyType);
  const [selectedLocation, setSelectedLocation] = useState(location);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock metrics
      setMetrics({
        totalProperties: 156,
        activeProperties: 89,
        soldProperties: 34,
        rentedProperties: 23,
        totalViews: 12847,
        totalInquiries: 456,
        totalFavorites: 789,
        averagePrice: 2850000,
        averageDaysOnMarket: 45,
        conversionRate: 12.5
      });

      // Mock top performers
      setTopPerformers([
        {
          id: '1',
          title: 'Modern Villa in Karen',
          views: 1234,
          inquiries: 45,
          favorites: 67,
          price: 15000000,
          daysOnMarket: 12,
          status: 'active',
          type: 'sale',
          location: 'Karen',
          performanceScore: 95
        },
        {
          id: '2',
          title: 'Luxury Apartment in Westlands',
          views: 987,
          inquiries: 38,
          favorites: 52,
          price: 8500000,
          daysOnMarket: 8,
          status: 'active',
          type: 'sale',
          location: 'Westlands',
          performanceScore: 88
        },
        {
          id: '3',
          title: 'Family Home in Lavington',
          views: 756,
          inquiries: 29,
          favorites: 41,
          price: 12000000,
          daysOnMarket: 15,
          status: 'active',
          type: 'sale',
          location: 'Lavington',
          performanceScore: 82
        }
      ]);

      // Mock time series data
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      setTimeSeriesData(dates.map(date => ({
        date,
        views: Math.floor(Math.random() * 500) + 200,
        inquiries: Math.floor(Math.random() * 50) + 10,
        favorites: Math.floor(Math.random() * 80) + 20,
        newListings: Math.floor(Math.random() * 10) + 1
      })));

      // Mock location data
      setLocationData([
        { location: 'Karen', count: 23, averagePrice: 12500000, averageViews: 456 },
        { location: 'Westlands', count: 18, averagePrice: 8900000, averageViews: 389 },
        { location: 'Lavington', count: 15, averagePrice: 11200000, averageViews: 423 },
        { location: 'Kilimani', count: 12, averagePrice: 7800000, averageViews: 334 },
        { location: 'Runda', count: 10, averagePrice: 15600000, averageViews: 512 }
      ]);

      // Mock price range data
      setPriceRangeData([
        { range: 'Under 5M', count: 34, percentage: 22 },
        { range: '5M - 10M', count: 45, percentage: 29 },
        { range: '10M - 15M', count: 38, percentage: 24 },
        { range: '15M - 20M', count: 25, percentage: 16 },
        { range: 'Above 20M', count: 14, percentage: 9 }
      ]);

      setIsLoading(false);
    };

    fetchAnalytics();
  }, [selectedDateRange, selectedPropertyType, selectedLocation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const refreshData = () => {
    // Implement refresh functionality
    console.log('Refreshing analytics data...');
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your property portfolio</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalProperties}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalViews || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalInquiries || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                -3%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.conversionRate}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.1%
              </span>
              <span className="text-gray-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Views, inquiries, and favorites over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="views" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="favorites" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Property Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Property Status</CardTitle>
                <CardDescription>Distribution of properties by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: metrics?.activeProperties || 0, color: '#10B981' },
                        { name: 'Sold', value: metrics?.soldProperties || 0, color: '#3B82F6' },
                        { name: 'Rented', value: metrics?.rentedProperties || 0, color: '#F59E0B' },
                        { name: 'Inactive', value: (metrics?.totalProperties || 0) - (metrics?.activeProperties || 0) - (metrics?.soldProperties || 0) - (metrics?.rentedProperties || 0), color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Active', value: metrics?.activeProperties || 0, color: '#10B981' },
                        { name: 'Sold', value: metrics?.soldProperties || 0, color: '#3B82F6' },
                        { name: 'Rented', value: metrics?.rentedProperties || 0, color: '#F59E0B' },
                        { name: 'Inactive', value: (metrics?.totalProperties || 0) - (metrics?.activeProperties || 0) - (metrics?.soldProperties || 0) - (metrics?.rentedProperties || 0), color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>Properties with highest engagement and performance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.location} • {formatCurrency(property.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{formatNumber(property.views)}</p>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{property.inquiries}</p>
                        <p className="text-xs text-gray-600">Inquiries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{property.favorites}</p>
                        <p className="text-xs text-gray-600">Favorites</p>
                      </div>
                      <Badge className={getPerformanceColor(property.performanceScore)}>
                        {property.performanceScore}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Location</CardTitle>
              <CardDescription>Property distribution and performance across different locations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'averagePrice') return [formatCurrency(value as number), 'Average Price'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Property Count" />
                  <Bar yAxisId="right" dataKey="averageViews" fill="#10B981" name="Average Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Range Distribution</CardTitle>
                <CardDescription>Properties grouped by price ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priceRangeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ range, percentage }) => `${range} (${percentage}%)`}
                    >
                      {priceRangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Pricing by Location</CardTitle>
                <CardDescription>Compare average property prices across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <YAxis type="category" dataKey="location" />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Average Price']} />
                    <Bar dataKey="averagePrice" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}