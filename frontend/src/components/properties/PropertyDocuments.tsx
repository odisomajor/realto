'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Share2,
  Lock,
  Unlock,
  Calendar,
  User,
  FileImage,
  FileSpreadsheet,
  File,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface PropertyDocument {
  id: string
  name: string
  type: 'title_deed' | 'survey_plan' | 'valuation' | 'inspection' | 'contract' | 'insurance' | 'tax' | 'other'
  category: 'legal' | 'financial' | 'technical' | 'administrative'
  fileType: 'pdf' | 'doc' | 'docx' | 'jpg' | 'png' | 'xlsx' | 'other'
  size: number
  uploadDate: string
  uploadedBy: string
  isRequired: boolean
  isVerified: boolean
  isPrivate: boolean
  expiryDate?: string
  description?: string
  url: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
}

interface PropertyDocumentsProps {
  propertyId: string
  userRole?: 'buyer' | 'seller' | 'agent' | 'admin'
  onDocumentUpload?: (document: PropertyDocument) => void
  onDocumentDelete?: (documentId: string) => void
}

export function PropertyDocuments({
  propertyId,
  userRole = 'buyer',
  onDocumentUpload,
  onDocumentDelete
}: PropertyDocumentsProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([
    {
      id: '1',
      name: 'Title Deed - Original',
      type: 'title_deed',
      category: 'legal',
      fileType: 'pdf',
      size: 2048000,
      uploadDate: '2024-01-15',
      uploadedBy: 'John Doe (Agent)',
      isRequired: true,
      isVerified: true,
      isPrivate: false,
      description: 'Original title deed document',
      url: '/documents/title-deed.pdf',
      status: 'approved'
    },
    {
      id: '2',
      name: 'Property Survey Plan',
      type: 'survey_plan',
      category: 'technical',
      fileType: 'pdf',
      size: 5120000,
      uploadDate: '2024-01-10',
      uploadedBy: 'Survey Company',
      isRequired: true,
      isVerified: true,
      isPrivate: false,
      description: 'Detailed survey plan showing boundaries',
      url: '/documents/survey-plan.pdf',
      status: 'approved'
    },
    {
      id: '3',
      name: 'Property Valuation Report',
      type: 'valuation',
      category: 'financial',
      fileType: 'pdf',
      size: 1536000,
      uploadDate: '2024-01-20',
      uploadedBy: 'Valuation Expert',
      isRequired: false,
      isVerified: true,
      isPrivate: true,
      expiryDate: '2024-07-20',
      description: 'Professional valuation report',
      url: '/documents/valuation.pdf',
      status: 'approved'
    },
    {
      id: '4',
      name: 'Building Inspection Report',
      type: 'inspection',
      category: 'technical',
      fileType: 'pdf',
      size: 3072000,
      uploadDate: '2024-01-25',
      uploadedBy: 'Inspector Ltd',
      isRequired: false,
      isVerified: false,
      isPrivate: false,
      expiryDate: '2024-06-25',
      description: 'Comprehensive building inspection',
      url: '/documents/inspection.pdf',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Property Insurance Policy',
      type: 'insurance',
      category: 'financial',
      fileType: 'pdf',
      size: 1024000,
      uploadDate: '2024-02-01',
      uploadedBy: 'Insurance Co.',
      isRequired: false,
      isVerified: true,
      isPrivate: true,
      expiryDate: '2025-02-01',
      description: 'Current insurance policy',
      url: '/documents/insurance.pdf',
      status: 'approved'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'other' as PropertyDocument['type'],
    category: 'administrative' as PropertyDocument['category'],
    description: '',
    isPrivate: false,
    expiryDate: ''
  })

  const documentTypes = [
    { value: 'title_deed', label: 'Title Deed', required: true },
    { value: 'survey_plan', label: 'Survey Plan', required: true },
    { value: 'valuation', label: 'Valuation Report', required: false },
    { value: 'inspection', label: 'Inspection Report', required: false },
    { value: 'contract', label: 'Sale Contract', required: false },
    { value: 'insurance', label: 'Insurance Policy', required: false },
    { value: 'tax', label: 'Tax Documents', required: false },
    { value: 'other', label: 'Other', required: false }
  ]

  const categories = [
    { value: 'legal', label: 'Legal', color: 'blue' },
    { value: 'financial', label: 'Financial', color: 'green' },
    { value: 'technical', label: 'Technical', color: 'purple' },
    { value: 'administrative', label: 'Administrative', color: 'gray' }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'jpg':
      case 'png':
        return <FileImage className="h-5 w-5 text-blue-500" />
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: PropertyDocument['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
      default:
        return null
    }
  }

  const getCategoryBadge = (category: PropertyDocument['category']) => {
    const categoryInfo = categories.find(c => c.value === category)
    if (!categoryInfo) return null

    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      gray: 'bg-gray-100 text-gray-700'
    }

    return (
      <Badge className={colorClasses[categoryInfo.color as keyof typeof colorClasses]}>
        {categoryInfo.label}
      </Badge>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newDocument: PropertyDocument = {
      id: Date.now().toString(),
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category,
      fileType: 'pdf',
      size: Math.floor(Math.random() * 5000000) + 500000,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      isRequired: documentTypes.find(t => t.value === uploadForm.type)?.required || false,
      isVerified: false,
      isPrivate: uploadForm.isPrivate,
      expiryDate: uploadForm.expiryDate || undefined,
      description: uploadForm.description,
      url: `/documents/${uploadForm.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      status: 'pending'
    }

    setDocuments([...documents, newDocument])
    onDocumentUpload?.(newDocument)
    setShowUploadForm(false)
    setUploadForm({
      name: '',
      type: 'other',
      category: 'administrative',
      description: '',
      isPrivate: false,
      expiryDate: ''
    })
  }

  const handleDelete = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId))
    onDocumentDelete?.(documentId)
  }

  const requiredDocuments = documentTypes.filter(type => type.required)
  const uploadedRequiredDocs = documents.filter(doc => 
    requiredDocuments.some(req => req.value === doc.type) && doc.status === 'approved'
  )
  const completionPercentage = (uploadedRequiredDocs.length / requiredDocuments.length) * 100

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Property Documents
            </CardTitle>
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Required Documents Progress</span>
              <span className="text-sm text-gray-600">
                {uploadedRequiredDocs.length} of {requiredDocuments.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docName">Document Name</Label>
                  <Input
                    id="docName"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    placeholder="Enter document name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <select
                    id="docType"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value as PropertyDocument['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.required && '(Required)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docCategory">Category</Label>
                  <select
                    id="docCategory"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value as PropertyDocument['category']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={uploadForm.isPrivate}
                  onChange={(e) => setUploadForm({...uploadForm, isPrivate: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPrivate">Mark as private (restricted access)</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map(document => (
          <Card key={document.id} className={`${
            isExpired(document.expiryDate) ? 'border-red-200 bg-red-50' :
            isExpiringSoon(document.expiryDate) ? 'border-yellow-200 bg-yellow-50' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.fileType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {document.name}
                      </h3>
                      {document.isRequired && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      {document.isPrivate && (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                      {document.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {getCategoryBadge(document.category)}
                      {getStatusBadge(document.status)}
                    </div>

                    {document.description && (
                      <p className="text-sm text-gray-600 mb-3">{document.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Uploaded: {formatDate(document.uploadDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        By: {document.uploadedBy}
                      </span>
                      <span>Size: {formatFileSize(document.size)}</span>
                      {document.expiryDate && (
                        <span className={`flex items-center gap-1 ${
                          isExpired(document.expiryDate) ? 'text-red-600' :
                          isExpiringSoon(document.expiryDate) ? 'text-yellow-600' : ''
                        }`}>
                          <AlertCircle className="h-3 w-3" />
                          Expires: {formatDate(document.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  {(userRole === 'agent' || userRole === 'admin') && (
                    <>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Button onClick={() => setShowUploadForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
