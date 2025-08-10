'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface EmailVerificationProps {
  email?: string;
  onVerified?: () => void;
  showResend?: boolean;
}

export default function EmailVerification({ 
  email, 
  onVerified, 
  showResend = true 
}: EmailVerificationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-verify if token is in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (token: string) => {
    setStatus('verifying');
    
    try {
      await authApi.verifyEmail(token);
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      
      if (onVerified) {
        setTimeout(onVerified, 2000);
      } else {
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Email verification failed. The link may be expired or invalid.');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      toast.error('Email address is required to resend verification');
      return;
    }

    setIsResending(true);
    
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <h3 className="text-lg font-semibold text-gray-900">Verifying your email...</h3>
            <p className="text-sm text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-green-900">Email Verified!</h3>
            <p className="text-sm text-gray-600">{message}</p>
            <div className="text-sm text-gray-500">
              Redirecting you to login...
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto" />
            <h3 className="text-lg font-semibold text-red-900">Verification Failed</h3>
            <p className="text-sm text-gray-600">{message}</p>
            
            {showResend && email && (
              <div className="space-y-3">
                <Button
                  onClick={resendVerification}
                  variant="outline"
                  isLoading={isResending}
                  disabled={resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'
                  }
                </Button>
                
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <EnvelopeIcon className="h-16 w-16 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Check Your Email</h3>
            <p className="text-sm text-gray-600">
              We've sent a verification link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to verify your account. 
              Don't forget to check your spam folder!
            </p>
            
            {showResend && (
              <div className="space-y-3 pt-4">
                <Button
                  onClick={resendVerification}
                  variant="outline"
                  isLoading={isResending}
                  disabled={resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'
                  }
                </Button>
                
                <div className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or try resending.
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          Verify your email address to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
