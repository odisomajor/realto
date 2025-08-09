'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function VerificationPendingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from localStorage
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no email found, redirect to registration
      router.push('/auth/register');
    }
  }, [router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage('No email found. Please register again.');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const response = await fetch(api.auth.resendVerification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        setCanResend(false);
        setCountdown(60);
      } else {
        setMessage(data.error || 'Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('An error occurred while resending the email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Mail className="h-16 w-16 text-blue-500" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Clock className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Verification email sent to:
              </p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {maskEmail(email)}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">What's next?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected back to complete your registration</li>
              </ol>
            </div>

            {message && (
              <Alert className={message.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={resendVerificationEmail}
                disabled={!canResend || isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : canResend ? (
                  'Resend Verification Email'
                ) : (
                  `Resend in ${countdown}s`
                )}
              </Button>

              <Button
                onClick={() => router.push('/auth/login')}
                variant="ghost"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}