'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Building,
  Users,
  Target,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface MarketTrend {
  period: string
  averagePrice: number
  priceChange: number
  salesVolume: number
  volumeChange: number
  daysOnMarket: number
  marketChange: number
}

interface LocationInsight {
  location: string
  averagePrice: number
  priceChange: number
  hotness: 'hot' | 'warm' | 'cool'
  inventory: number
  demand: 'high' | 'medium' | 'low'
  appreciation: number
}

interface PropertyTypeInsight {
  type: string
  averagePrice: number
  priceChange: number
  marketShare: number
  demand: 'high' | 'medium' | 'low'
  roi: number
}

interface MarketPrediction {
  timeframe: string
  prediction: 'bullish' | 'bearish' | 'stable'
  confidence: number
  factors: string[]
}

interface PropertyMarketInsightsProps {
  location?: string
  propertyType?: string
  priceRange?: { min: number; max: number }
}

export function PropertyMarketInsights({
  location,
  propertyType,
  priceRange
}: PropertyMarketInsightsProps) {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [locationInsights, setLocationInsights] = useState<LocationInsight[]>([])
  const [typeInsights, setTypeInsights] = useState<PropertyTypeInsight[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | '2y'>('6m')

  useEffect(() => {
    fetchMarketInsights()
  }, [location, propertyType, priceRange, selectedTimeframe])

  const fetchMarketInsights = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockTrends: MarketTrend[] = [
        {
          period: 'Jan 2024',
          averagePrice: 12500000,
          priceChange: 2.5,
          salesVolume: 145,
          volumeChange: 8.2,
          daysOnMarket: 45,
          marketChange: -3.1
        },
        {
          period: 'Feb 2024',
          averagePrice: 12750000,
          priceChange: 2.0,
          salesVolume: 162,
          volumeChange: 11.7,
          daysOnMarket: 42,
          marketChange: -6.7
        },
        {
          period: 'Mar 2024',
          averagePrice: 13100000,
          priceChange: 2.7,
          salesVolume: 178,
          volumeChange: 9.9,
          daysOnMarket: 38,
          marketChange: -9.5
        }
      ]

      const mockLocationInsights: LocationInsight[] = [
        {
          location: 'Westlands',
          averagePrice: 15200000,
          priceChange: 3.2,
          hotness: 'hot',
          inventory: 89,
          demand: 'high',
          appreciation: 12.5
        },
        {
          location: 'Kilimani',
          averagePrice: 11800000,
          priceChange: 1.8,
          hotness: 'warm',
          inventory: 124,
          demand: 'medium',
          appreciation: 8.3
        },
        {
          location: 'Karen',
          averagePrice: 28500000,
          priceChange: 4.1,
          hotness: 'hot',
          inventory: 45,
          demand: 'high',
          appreciation: 15.2
        },
        {
          location: 'Kasarani',
          averagePrice: 7200000,
          priceChange: 0.5,
          hotness: 'cool',
          inventory: 198,
          demand: 'low',
          appreciation: 3.1
        }
      ]

      const mockTypeInsights: PropertyTypeInsight[] = [
        {
          type: 'Apartment',
          averagePrice: 12500000,
          priceChange: 2.3,
          marketShare: 45,
          demand: 'high',
          roi: 8.5
        },
        {
          type: 'House',
          averagePrice: 18700000,
          priceChange: 3.1,
          marketShare: 35,
          demand: 'medium',
          roi: 7.2
        },
        {
          type: 'Townhouse',
          averagePrice: 15900000,
          priceChange: 2.8,
          marketShare: 15,
          demand: 'medium',
          roi: 7.8
        },
        {
          type: 'Villa',
          averagePrice: 35200000,
          priceChange: 4.2,
          marketShare: 5,
          demand: 'high',
          roi: 9.1
        }
      ]

      const mockPredictions: MarketPrediction[] = [
        {
          timeframe: 'Next 3 months',
          prediction: 'bullish',
          confidence: 78,
          factors: ['Increased foreign investment', 'Infrastructure development', 'Low interest rates']
        },
        {
          timeframe: 'Next 6 months',
          prediction: 'stable',
          confidence: 65,
          factors: ['Election uncertainty', 'Economic stability', 'Steady demand']
        },
        {
          timeframe: 'Next year',
          prediction: 'bullish',
          confidence: 72,
          factors: ['Population growth', 'Urban expansion', 'Government housing initiatives']
        }
      ]

      setMarketTrends(mockTrends)
      setLocationInsights(mockLocationInsights)
      setTypeInsights(mockTypeInsights)
      setPredictions(mockPredictions)
    } catch (error) {
      console.error('Error fetching market insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getHotnessColor = (hotness: LocationInsight['hotness']) => {
    switch (hotness) {
      case 'hot': return 'bg-red-100 text-red-700'
      case 'warm': return 'bg-orange-100 text-orange-700'
      case 'cool': return 'bg-blue-100 text-blue-700'
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-gray-100 text-gray-700'
    }
  }

  const getPredictionIcon = (prediction: MarketPrediction['prediction']) => {
    switch (prediction) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getPredictionColor = (prediction: MarketPrediction['prediction']) => {
    switch (prediction) {
      case 'bullish': return 'text-green-600'
      case 'bearish': return 'text-red-600'
      case 'stable': return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Insights</h2>
          <p className="text-gray-600">
            Real-time property market analysis and trends
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['3m', '6m', '1y', '2y'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(marketTrends[marketTrends.length - 1]?.averagePrice || 0)}
              </div>
              <div className="text-sm text-gray-600">Average Price</div>
              <div className={`text-sm font-medium ${getTrendColor(marketTrends[marketTrends.length - 1]?.priceChange || 0)}`}>
                {formatPercentage(marketTrends[marketTrends.length - 1]?.priceChange || 0)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {marketTrends[marketTrends.length - 1]?.salesVolume || 0}
              </div>
              <div className="text-sm text-gray-600">Sales Volume</div>
              <div className={`text-sm font-medium ${getTrendColor(marketTrends[marketTrends.length - 1]?.volumeChange || 0)}`}>
                {formatPercentage(marketTrends[marketTrends.length - 1]?.volumeChange || 0)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {marketTrends[marketTrends.length - 1]?.daysOnMarket || 0}
              </div>
              <div className="text-sm text-gray-600">Days on Market</div>
              <div className={`text-sm font-medium ${getTrendColor(marketTrends[marketTrends.length - 1]?.marketChange || 0)}`}>
                {formatPercentage(marketTrends[marketTrends.length - 1]?.marketChange || 0)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {locationInsights.filter(l => l.demand === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Hot Markets</div>
              <div className="text-sm font-medium text-green-600">
                High Demand
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Location Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationInsights.map((insight) => (
              <div key={insight.location} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.location}</h3>
                    <Badge className={getHotnessColor(insight.hotness)}>
                      {insight.hotness}
                    </Badge>
                    <Badge className={getDemandColor(insight.demand)}>
                      {insight.demand} demand
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Avg Price</div>
                      <div className="font-medium">{formatCurrency(insight.averagePrice)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Price Change</div>
                      <div className={`font-medium ${getTrendColor(insight.priceChange)}`}>
                        {getTrendIcon(insight.priceChange)}
                        <span className="ml-1">{formatPercentage(insight.priceChange)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Inventory</div>
                      <div className="font-medium">{insight.inventory} properties</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Appreciation</div>
                      <div className="font-medium text-green-600">
                        {formatPercentage(insight.appreciation)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Property Type Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {typeInsights.map((insight) => (
              <div key={insight.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{insight.type}</h3>
                  <Badge className={getDemandColor(insight.demand)}>
                    {insight.demand} demand
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Price</span>
                    <span className="font-medium">{formatCurrency(insight.averagePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Change</span>
                    <span className={`font-medium ${getTrendColor(insight.priceChange)}`}>
                      {formatPercentage(insight.priceChange)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Share</span>
                    <span className="font-medium">{insight.marketShare}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI</span>
                    <span className="font-medium text-green-600">{insight.roi}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Market Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPredictionIcon(prediction.prediction)}
                    <h3 className="font-semibold text-gray-900">{prediction.timeframe}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {prediction.confidence}% confidence
                    </Badge>
                    <Badge className={getPredictionColor(prediction.prediction)}>
                      {prediction.prediction}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Key factors:</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.factors.map((factor, factorIndex) => (
                      <Badge key={factorIndex} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Investment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Buy Now</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Karen and Westlands show strong appreciation potential with high demand.
              </p>
              <Badge className="bg-green-100 text-green-700">
                High ROI Expected
              </Badge>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Wait & Watch</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Kilimani market is stable but showing signs of potential growth.
              </p>
              <Badge className="bg-yellow-100 text-yellow-700">
                Monitor Closely
              </Badge>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Long-term Hold</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Kasarani offers good value for long-term appreciation as infrastructure develops.
              </p>
              <Badge className="bg-blue-100 text-blue-700">
                Future Growth
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
