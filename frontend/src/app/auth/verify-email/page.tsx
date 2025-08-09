'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${api.auth.verifyEmail}?token=${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 3000);
      } else {
        if (data.error === 'Token expired') {
          setStatus('expired');
          setMessage('Your verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again.');
    }
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        setMessage('No email found for resending. Please register again.');
        return;
      }

      const response = await fetch(api.auth.resendVerification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('An error occurred while resending the email.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Mail className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl font-bold ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'expired' && 'Link Expired'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {status === 'success' && 'Your account is now fully activated.'}
              {status === 'error' && 'There was a problem verifying your email.'}
              {status === 'expired' && 'Your verification link has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={status === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {status === 'success' && (
                <Button 
                  onClick={() => router.push('/auth/login?verified=true')} 
                  className="w-full"
                >
                  Continue to Login
                </Button>
              )}

              {(status === 'expired' || status === 'error') && (
                <Button 
                  onClick={resendVerificationEmail}
                  disabled={isResending}
                  className="w-full"
                  variant="outline"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              )}

              <Button 
                onClick={() => router.push('/auth/login')} 
                variant="ghost" 
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}