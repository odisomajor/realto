'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PropertyDocuments } from '@/components/properties/PropertyDocuments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  Star,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Share2
} from 'lucide-react'

// Mock property data - in real app, this would come from API
const mockProperty = {
  id: '1',
  title: 'Modern 4-Bedroom Villa in Karen',
  price: 15000000,
  location: 'Karen, Nairobi',
  type: 'Villa',
  status: 'For Sale',
  bedrooms: 4,
  bathrooms: 3,
  area: 350,
  images: ['/api/placeholder/400/300'],
  listedDate: '2024-01-15',
  agent: {
    name: 'Sarah Johnson',
    phone: '+254 700 123 456',
    email: 'sarah@realestate.com',
    rating: 4.8,
    reviews: 124,
    company: 'Prime Properties Ltd'
  },
  seller: {
    name: 'John Smith',
    type: 'Individual'
  },
  verification: {
    status: 'verified',
    verifiedBy: 'Legal Team',
    verifiedDate: '2024-01-20',
    completionPercentage: 85
  }
}

const documentStats = {
  total: 12,
  required: 5,
  completed: 4,
  pending: 2,
  expired: 1
}

export default function PropertyDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState(mockProperty)
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'agent' | 'admin'>('buyer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch property details
    const fetchProperty = async () => {
      try {
        // In real app, fetch property data using params.id
        setLoading(false)
      } catch (error) {
        console.error('Error fetching property:', error)
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getVerificationBadge = () => {
    switch (property.verification.status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'incomplete':
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Incomplete
          </Badge>
        )
      default:
        return null
    }
  }

  const handleDocumentUpload = (document: any) => {
    console.log('Document uploaded:', document)
    // Handle document upload logic
  }

  const handleDocumentDelete = (documentId: string) => {
    console.log('Document deleted:', documentId)
    // Handle document deletion logic
  }

  const exportAllDocuments = () => {
    // Logic to export all documents as ZIP
    console.log('Exporting all documents...')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Documents</h1>
              <p className="text-gray-600">
                Manage and review all documents related to this property
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={exportAllDocuments}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Access
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <PropertyDocuments
              propertyId={params.id as string}
              userRole={userRole}
              onDocumentUpload={handleDocumentUpload}
              onDocumentDelete={handleDocumentDelete}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Property Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <div className="text-xl font-bold text-green-600 mb-3">
                    {formatCurrency(property.price)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {property.type} • {property.bedrooms} bed • {property.bathrooms} bath
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">{property.status}</Badge>
                    {getVerificationBadge()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Document Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{documentStats.total}</div>
                    <div className="text-xs text-gray-600">Total Documents</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{documentStats.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{documentStats.pending}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{documentStats.expired}</div>
                    <div className="text-xs text-gray-600">Expired</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Progress</span>
                    <span className="text-sm text-gray-600">
                      {property.verification.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${property.verification.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getVerificationBadge()}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified By</span>
                  <span className="text-sm font-medium">{property.verification.verifiedBy}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified Date</span>
                  <span className="text-sm font-medium">
                    {formatDate(property.verification.verifiedDate)}
                  </span>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-700">
                      <strong>Verified Property:</strong> All required legal documents 
                      have been reviewed and verified by our legal team.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Property Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {property.agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{property.agent.name}</div>
                    <div className="text-sm text-gray-600">{property.agent.company}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {property.agent.rating} ({property.agent.reviews} reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {property.agent.phone}
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Seller</span>
                  <span className="text-sm font-medium">{property.seller.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="outline">{property.seller.type}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Listed Date</span>
                  <span className="text-sm font-medium">{formatDate(property.listedDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}