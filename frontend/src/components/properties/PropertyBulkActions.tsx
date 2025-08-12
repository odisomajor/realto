'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Edit,
  Copy,
  Archive,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Property {
  id: string
  title: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SOLD' | 'RENTED'
  featured: boolean
  price: number
  propertyType: string
  listingType: string
}

interface PropertyBulkActionsProps {
  selectedProperties: Property[]
  onClearSelection: () => void
  onBulkUpdate: (propertyIds: string[], updates: Partial<Property>) => Promise<void>
  onBulkDelete: (propertyIds: string[]) => Promise<void>
  onBulkDuplicate: (propertyIds: string[]) => Promise<void>
  isLoading?: boolean
}

type BulkAction = 
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'archive'
  | 'restore'
  | 'delete'
  | 'duplicate'

interface ConfirmationDialog {
  isOpen: boolean
  action: BulkAction | null
  title: string
  description: string
  confirmText: string
  variant: 'default' | 'destructive'
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', icon: CheckCircle, color: 'text-green-600' },
  INACTIVE: { label: 'Inactive', icon: XCircle, color: 'text-red-600' },
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  SOLD: { label: 'Sold', icon: CheckCircle, color: 'text-blue-600' },
  RENTED: { label: 'Rented', icon: CheckCircle, color: 'text-purple-600' }
}

export default function PropertyBulkActions({
  selectedProperties,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete,
  onBulkDuplicate,
  isLoading = false
}: PropertyBulkActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    action: null,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default'
  })

  const selectedCount = selectedProperties.length

  if (selectedCount === 0) {
    return null
  }

  const handleBulkAction = async (action: BulkAction) => {
    const propertyIds = selectedProperties.map(p => p.id)

    try {
      switch (action) {
        case 'activate':
          await onBulkUpdate(propertyIds, { status: 'ACTIVE' })
          break
        case 'deactivate':
          await onBulkUpdate(propertyIds, { status: 'INACTIVE' })
          break
        case 'feature':
          await onBulkUpdate(propertyIds, { featured: true })
          break
        case 'unfeature':
          await onBulkUpdate(propertyIds, { featured: false })
          break
        case 'archive':
          await onBulkUpdate(propertyIds, { status: 'INACTIVE' })
          break
        case 'restore':
          await onBulkUpdate(propertyIds, { status: 'ACTIVE' })
          break
        case 'delete':
          await onBulkDelete(propertyIds)
          break
        case 'duplicate':
          await onBulkDuplicate(propertyIds)
          break
      }
      onClearSelection()
    } catch (error) {
      console.error(`Failed to perform bulk action: ${action}`, error)
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    }
  }

  const openConfirmDialog = (action: BulkAction) => {
    const dialogs: Record<BulkAction, Omit<ConfirmationDialog, 'isOpen' | 'action'>> = {
      activate: {
        title: 'Activate Properties',
        description: `Are you sure you want to activate ${selectedCount} selected properties? They will become visible to potential buyers/renters.`,
        confirmText: 'Activate',
        variant: 'default'
      },
      deactivate: {
        title: 'Deactivate Properties',
        description: `Are you sure you want to deactivate ${selectedCount} selected properties? They will be hidden from public view.`,
        confirmText: 'Deactivate',
        variant: 'default'
      },
      feature: {
        title: 'Feature Properties',
        description: `Are you sure you want to feature ${selectedCount} selected properties? This may incur additional costs.`,
        confirmText: 'Feature',
        variant: 'default'
      },
      unfeature: {
        title: 'Unfeature Properties',
        description: `Are you sure you want to remove featured status from ${selectedCount} selected properties?`,
        confirmText: 'Unfeature',
        variant: 'default'
      },
      archive: {
        title: 'Archive Properties',
        description: `Are you sure you want to archive ${selectedCount} selected properties? They will be moved to inactive status.`,
        confirmText: 'Archive',
        variant: 'default'
      },
      restore: {
        title: 'Restore Properties',
        description: `Are you sure you want to restore ${selectedCount} selected properties to active status?`,
        confirmText: 'Restore',
        variant: 'default'
      },
      delete: {
        title: 'Delete Properties',
        description: `Are you sure you want to permanently delete ${selectedCount} selected properties? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'destructive'
      },
      duplicate: {
        title: 'Duplicate Properties',
        description: `Are you sure you want to create copies of ${selectedCount} selected properties? New listings will be created with "(Copy)" added to their titles.`,
        confirmText: 'Duplicate',
        variant: 'default'
      }
    }

    setConfirmDialog({
      isOpen: true,
      action,
      ...dialogs[action]
    })
  }

  const getStatusCounts = () => {
    const counts = selectedProperties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([status, count]) => {
      const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
      return { status, count, config }
    })
  }

  const getFeaturedCount = () => {
    return selectedProperties.filter(p => p.featured).length
  }

  const canActivate = selectedProperties.some(p => p.status !== 'ACTIVE')
  const canDeactivate = selectedProperties.some(p => p.status === 'ACTIVE')
  const canFeature = selectedProperties.some(p => !p.featured)
  const canUnfeature = selectedProperties.some(p => p.featured)

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">
                {selectedCount} {selectedCount === 1 ? 'property' : 'properties'} selected
              </span>
            </div>

            {/* Status breakdown */}
            <div className="flex items-center gap-2">
              {getStatusCounts().map(({ status, count, config }) => {
                const Icon = config.icon
                return (
                  <Badge key={status} variant="outline" className="flex items-center gap-1">
                    <Icon className={`h-3 w-3 ${config.color}`} />
                    {count} {config.label}
                  </Badge>
                )
              })}
              {getFeaturedCount() > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {getFeaturedCount()} Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {canActivate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmDialog('activate')}
                  disabled={isLoading}
                  className="text-green-600 hover:text-green-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Activate
                </Button>
              )}
              {canDeactivate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmDialog('deactivate')}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
              )}
            </div>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size="sm" variant="outline" disabled={isLoading}>
                  More Actions
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canFeature && (
                  <DropdownMenuItem
                    onClick={() => openConfirmDialog('feature')}
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Feature Properties
                  </DropdownMenuItem>
                )}
                {canUnfeature && (
                  <DropdownMenuItem
                    onClick={() => openConfirmDialog('unfeature')}
                    className="flex items-center gap-2"
                  >
                    <StarOff className="h-4 w-4" />
                    Remove Featured
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => openConfirmDialog('duplicate')}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate Properties
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => openConfirmDialog('archive')}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive Properties
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => openConfirmDialog('restore')}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore Properties
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => openConfirmDialog('delete')}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Properties
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={isLoading}
            >
              Clear Selection
            </Button>
          </div>
        </div>

        {/* Selected Properties Preview */}
        {selectedCount <= 5 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {selectedProperties.map(property => (
                <div
                  key={property.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-1 text-sm"
                >
                  <span className="font-medium truncate max-w-32">
                    {property.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_CONFIG[property.status].color}`}
                  >
                    {STATUS_CONFIG[property.status].label}
                  </Badge>
                  {property.featured && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'delete' && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.action && handleBulkAction(confirmDialog.action)}
              disabled={isLoading}
              className={confirmDialog.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoading ? 'Processing...' : confirmDialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}