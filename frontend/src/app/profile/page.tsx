'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, User } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { api } from '@/lib/api'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>(
    user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    } : {}
  )
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || '')

  if (!user) {
    return null // Protected route will handle redirect
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For now, just update local state since we don't have a proper user API
      // const response = await api.users.updateProfile({
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   phone: formData.phone || undefined,
      // })

      // Update avatar if changed
      // if (avatarUrl && avatarUrl !== user.avatar) {
      //   await api.users.uploadAvatar({ avatarUrl })
      // }

      // Update local user state
      setUser({
        ...user,
        ...formData,
        avatar: avatarUrl || user.avatar,
      })

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information and account settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt={`${user.firstName} ${user.lastName}`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-600 text-white text-2xl">
                    {user.firstName.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  value={avatarUrl}
                  onChange={handleAvatarChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL for your profile picture (JPG, PNG, or WebP format)
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Role Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.role === 'AGENT' ? 'Real Estate Agent' : 'Regular User'}
                </span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Verification
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Verification
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.phoneVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.phoneVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
