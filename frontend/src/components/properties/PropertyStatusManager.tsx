'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  User,
  MessageSquare,
  ArrowRight,
  History,
  Star,
  DollarSign,
  PencilIcon,
  TrashIcon
} from 'lucide-react';

export interface PropertyStatus {
  id: string;
  title: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'DRAFT';
  featured: boolean;
  price: number;
  currency: string;
  listingType: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  inquiries: number;
  favorites: number;
}

interface StatusChange {
  id: string;
  fromStatus: PropertyStatus['status'];
  toStatus: PropertyStatus['status'];
  reason: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

interface PropertyStatusManagerProps {
  property: PropertyStatus;
  statusHistory?: StatusChange[];
  onStatusChange: (propertyId: string, newStatus: PropertyStatus['status'], reason: string, notes?: string) => Promise<void>;
  onToggleFeatured: (propertyId: string, featured: boolean) => Promise<void>;
  onEdit?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  className?: string;
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    description: 'Property is being prepared and not yet published'
  },
  PENDING: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Property is awaiting admin approval'
  },
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Property is live and visible to potential buyers/renters'
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-red-100 text-red-800',
    icon: EyeOff,
    description: 'Property is hidden from public view'
  },
  SOLD: {
    label: 'Sold',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Property has been sold'
  },
  RENTED: {
    label: 'Rented',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
    description: 'Property has been rented out'
  }
};

const STATUS_TRANSITIONS = {
  DRAFT: ['PENDING', 'ACTIVE', 'INACTIVE'],
  PENDING: ['ACTIVE', 'INACTIVE', 'DRAFT'],
  ACTIVE: ['INACTIVE', 'SOLD', 'RENTED'],
  INACTIVE: ['ACTIVE', 'DRAFT'],
  SOLD: ['ACTIVE', 'INACTIVE'],
  RENTED: ['ACTIVE', 'INACTIVE']
};

const CHANGE_REASONS = {
  DRAFT: {
    PENDING: ['Ready for review', 'Completed property details'],
    ACTIVE: ['Direct publish', 'Skip review process'],
    INACTIVE: ['Not ready yet', 'Need more information']
  },
  PENDING: {
    ACTIVE: ['Approved by admin', 'Meets all requirements'],
    INACTIVE: ['Rejected by admin', 'Needs corrections'],
    DRAFT: ['Needs more work', 'Incomplete information']
  },
  ACTIVE: {
    INACTIVE: ['Temporarily unavailable', 'Under maintenance', 'Owner request'],
    SOLD: ['Property sold', 'Sale completed'],
    RENTED: ['Property rented', 'Lease signed']
  },
  INACTIVE: {
    ACTIVE: ['Ready to show again', 'Issues resolved'],
    DRAFT: ['Major changes needed', 'Complete revision required']
  },
  SOLD: {
    ACTIVE: ['Sale fell through', 'Back on market'],
    INACTIVE: ['Temporary removal', 'Administrative hold']
  },
  RENTED: {
    ACTIVE: ['Lease ended', 'Available again'],
    INACTIVE: ['Temporary removal', 'Administrative hold']
  }
};

export default function PropertyStatusManager({
  property,
  statusHistory = [],
  onStatusChange,
  onToggleFeatured,
  onEdit,
  onDelete,
  isLoading = false,
  canEdit = true,
  className = ''
}: PropertyStatusManagerProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus['status'] | ''>('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const currentStatus = property.status;
  const currentConfig = statusConfig[currentStatus];
  const CurrentIcon = currentConfig.icon;
  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async () => {
    if (!selectedStatus || (!selectedReason && !customReason)) return;

    const reason = customReason || selectedReason;
    await onStatusChange(property.id, selectedStatus as PropertyStatus['status'], reason, notes);
    
    // Reset form
    setSelectedStatus('');
    setSelectedReason('');
    setCustomReason('');
    setNotes('');
    setShowStatusDialog(false);
  };

  const handleToggleFeatured = async () => {
    await onToggleFeatured(property.id, !property.featured);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableReasons = () => {
    if (!selectedStatus) return [];
    const currentReasons = CHANGE_REASONS[currentStatus as keyof typeof CHANGE_REASONS];
    if (!currentReasons) return [];
    return currentReasons[selectedStatus as keyof typeof currentReasons] || [];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CurrentIcon className="h-6 w-6 text-gray-600" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Property Status
                  <Badge className={currentConfig.color}>
                    {currentConfig.label}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentConfig.description}
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  onClick={() => setShowStatusDialog(true)}
                  disabled={isLoading || availableTransitions.length === 0}
                >
                  Change Status
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(property.id)}
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(property.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property Metrics */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="font-semibold">{property.views.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="font-semibold">{property.inquiries}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="font-semibold">{property.favorites}</p>
              </div>
            </div>
          </div>

          {/* Featured Status */}
          <div className="mt-4 flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Star className={`h-5 w-5 ${property.featured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">Featured Property</p>
                <p className="text-sm text-gray-600">
                  {property.featured ? 'This property is featured and gets priority placement' : 'Feature this property for better visibility'}
                </p>
              </div>
            </div>
            {canEdit && (
              <Button
                variant={property.featured ? 'outline' : 'default'}
                size="sm"
                onClick={handleToggleFeatured}
                disabled={isLoading}
              >
                {property.featured ? 'Remove Featured' : 'Make Featured'}
              </Button>
            )}
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Last updated: {formatDate(property.updatedAt)}</p>
            <p>Created: {formatDate(property.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {showHistory && statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Status History
            </CardTitle>
            <CardDescription>
              Track of all status changes for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusHistory.map((change, index) => {
                const fromConfig = statusConfig[change.fromStatus];
                const toConfig = statusConfig[change.toStatus];
                const FromIcon = fromConfig.icon;
                const ToIcon = toConfig.icon;

                return (
                  <div key={change.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className={fromConfig.color}>
                        <FromIcon className="h-3 w-3 mr-1" />
                        {fromConfig.label}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <Badge className={toConfig.color}>
                        <ToIcon className="h-3 w-3 mr-1" />
                        {toConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{change.changedBy}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                        <span>{formatDate(change.changedAt)}</span>
                      </div>
                      <p className="text-sm font-medium mt-1">{change.reason}</p>
                      {change.notes && (
                        <p className="text-sm text-gray-600 mt-1">{change.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Property Status</DialogTitle>
            <DialogDescription>
              Update the status of "{property.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PropertyStatus['status'] | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map(status => {
                    const config = statusConfig[status as PropertyStatus['status']];
                    const Icon = config.icon;
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change
                </label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableReasons().map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom reason...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedReason === 'custom' || !selectedReason) && selectedStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedReason === 'custom' ? 'Custom Reason' : 'Reason'}
                </label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter reason for status change"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isLoading || !selectedStatus || (!selectedReason && !customReason)}
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
