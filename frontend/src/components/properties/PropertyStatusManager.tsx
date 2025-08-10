'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircleIcon,
  ClockIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export interface PropertyStatus {
  id: string;
  status: 'active' | 'pending' | 'sold' | 'rented' | 'draft' | 'inactive';
  lastUpdated: string;
}

interface PropertyStatusManagerProps {
  property: PropertyStatus;
  onStatusChange: (propertyId: string, newStatus: PropertyStatus['status']) => Promise<void>;
  onEdit?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    description: 'Property is live and visible to buyers'
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon,
    description: 'Property has an offer pending'
  },
  sold: {
    label: 'Sold',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircleIcon,
    description: 'Property has been sold'
  },
  rented: {
    label: 'Rented',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircleIcon,
    description: 'Property has been rented'
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: PencilIcon,
    description: 'Property is being prepared'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-100 text-red-800',
    icon: EyeSlashIcon,
    description: 'Property is not visible to buyers'
  }
};

export default function PropertyStatusManager({
  property,
  onStatusChange,
  onEdit,
  onDelete,
  className = ''
}: PropertyStatusManagerProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const currentStatus = statusConfig[property.status];
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = async (newStatus: PropertyStatus['status']) => {
    if (newStatus === property.status) return;

    try {
      setIsChangingStatus(true);
      await onStatusChange(property.id, newStatus);
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Failed to update property status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {currentStatus.label}
          </div>
          <span className="text-sm text-gray-500">
            Updated {new Date(property.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Change Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isChangingStatus}
            >
              {isChangingStatus ? 'Updating...' : 'Change Status'}
            </Button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const isCurrentStatus = status === property.status;
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status as PropertyStatus['status'])}
                        disabled={isCurrentStatus}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isCurrentStatus ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-8">
                          {config.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
      </div>

      {/* Status Description */}
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Status:</strong> {currentStatus.description}
        </p>
      </div>

      {/* Click outside to close menu */}
      {showStatusMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowStatusMenu(false)}
        />
      )}
    </Card>
  );
}
