'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Key, 
  Bell, 
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi, authApi } from '@/lib/api';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'totp' | 'sms';
  createdAt: string;
  lastLoginAt?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await userApi.getProfile();
        const profileData = response.data.data;
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasHydrated && isAuthenticated) {
      fetchProfile();
    }
  }, [user?.id, hasHydrated, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const response = await userApi.updateProfile(formData);
      const updatedProfile = response.data.data;
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setErrors({ general: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleResendVerification = async () => {
    try {
      await authApi.resendVerification(profile?.email || '');
      setMessage('Verification email sent successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      setErrors({ general: errorMessage });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render if not authenticated
  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/change-password')}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {errors.general && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                    <button className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50">
                      <Camera className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                    <Badge variant={profile.role === 'ADMIN' ? 'destructive' : 'default'} className="mt-1">
                      {profile.role}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.firstName ? 'border-red-300' : ''}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.lastName ? 'border-red-300' : ''}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-red-300' : ''}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security & Verification */}
          <div className="space-y-6">
            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Verification */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Email Verification</p>
                      <p className="text-xs text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.isEmailVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="destructive">Unverified</Badge>
                        <button
                          onClick={handleResendVerification}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Resend
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Verification */}
                {profile.phone && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Phone Verification</p>
                        <p className="text-xs text-gray-600">{profile.phone}</p>
                      </div>
                    </div>
                    <Badge className={profile.isPhoneVerified ? 'bg-green-100 text-green-800' : ''} 
                           variant={profile.isPhoneVerified ? 'default' : 'destructive'}>
                      {profile.isPhoneVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                )}

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-600">
                        {profile.twoFactorEnabled 
                          ? `Enabled (${profile.twoFactorMethod?.toUpperCase()})` 
                          : 'Add extra security to your account'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={profile.twoFactorEnabled ? "destructive" : "default"}
                    onClick={() => setShowTwoFactorSetup(true)}
                  >
                    {profile.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">{formatDate(profile.createdAt)}</span>
                </div>
                {profile.lastLoginAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Last login</span>
                    <span className="font-medium">{formatDate(profile.lastLoginAt)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Account ID</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {profile.id.slice(0, 8)}...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Two-Factor Setup Modal */}
        {showTwoFactorSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                  <button
                    onClick={() => setShowTwoFactorSetup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <TwoFactorSetup
                  onComplete={() => {
                    setShowTwoFactorSetup(false);
                    // Refresh profile to get updated 2FA status
                    window.location.reload();
                  }}
                  onSkip={() => setShowTwoFactorSetup(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}