'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { QrCodeIcon, ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
  isRequired?: boolean;
}

export default function TwoFactorSetup({ onComplete, onSkip, isRequired = true }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'method' | 'totp-setup' | 'sms-setup' | 'verify'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms'>('totp');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMethodSelect = (method: 'totp' | 'sms') => {
    setSelectedMethod(method);
    setStep(method === 'totp' ? 'totp-setup' : 'sms-setup');
  };

  const setupTOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.setupTwoFactor({ method: 'totp' });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup TOTP');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSMS = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.setupTwoFactor({ method: 'sms' });
      setStep('verify');
      toast.success('SMS code sent to your phone');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup SMS 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.verifyTwoFactor({
        method: selectedMethod,
        code: verificationCode
      });
      
      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
      }
      
      toast.success('Two-factor authentication enabled successfully!');
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <ShieldCheckIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Secure Your Account</h3>
        <p className="text-sm text-gray-600 mt-2">
          Choose your preferred two-factor authentication method
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleMethodSelect('totp')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center">
            <QrCodeIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h4 className="font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-600">Use Google Authenticator, Authy, or similar apps</p>
              <Badge variant="secondary" className="mt-1">Recommended</Badge>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect('sms')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h4 className="font-medium text-gray-900">SMS Verification</h4>
              <p className="text-sm text-gray-600">Receive codes via text message</p>
              <Badge variant="outline" className="mt-1">Backup Option</Badge>
            </div>
          </div>
        </button>
      </div>

      {!isRequired && onSkip && (
        <div className="text-center pt-4">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );

  const renderTOTPSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <QrCodeIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Setup Authenticator App</h3>
        <p className="text-sm text-gray-600 mt-2">
          Scan the QR code with your authenticator app
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <div className="p-4 bg-white border rounded-lg">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          Can't scan the QR code? Enter this key manually:
        </p>
        <div className="flex items-center space-x-2">
          <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
            {secret}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(secret)}
          >
            Copy
          </Button>
        </div>
      </div>

      <Button
        onClick={() => setStep('verify')}
        className="w-full"
        disabled={!qrCode}
      >
        I've Added the Account
      </Button>
    </div>
  );

  const renderSMSSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <DevicePhoneMobileIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">SMS Verification</h3>
        <p className="text-sm text-gray-600 mt-2">
          We'll send verification codes to your registered phone number
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> SMS codes require cellular service and may have delays. 
          We recommend using an authenticator app for better security and reliability.
        </p>
      </div>

      <Button
        onClick={setupSMS}
        className="w-full"
        isLoading={isLoading}
      >
        Send Test Code
      </Button>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <KeyIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Verify Setup</h3>
        <p className="text-sm text-gray-600 mt-2">
          Enter the 6-digit code from your {selectedMethod === 'totp' ? 'authenticator app' : 'SMS'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Verification Code"
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="text-center text-2xl tracking-widest"
        maxLength={6}
      />

      <Button
        onClick={verifySetup}
        className="w-full"
        isLoading={isLoading}
        disabled={verificationCode.length !== 6}
      >
        Verify and Enable 2FA
      </Button>

      {backupCodes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Backup Codes</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Save these codes in a safe place. You can use them to access your account if you lose your device.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code key={index} className="block p-2 bg-white border rounded text-sm font-mono">
                {code}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (step === 'totp-setup') {
      setupTOTP();
    }
  }, [step]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'method' && renderMethodSelection()}
        {step === 'totp-setup' && renderTOTPSetup()}
        {step === 'sms-setup' && renderSMSSetup()}
        {step === 'verify' && renderVerification()}
      </CardContent>
    </Card>
  );
}