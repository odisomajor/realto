'use client';

import { useState } from 'react';
import { useBrowsingSession } from '@/lib/browsing-session';
import { usePropertyViewTracker, useBrowsingStats } from '@/components/auth/BrowsingTracker';

export default function TestRegistrationPage() {
  const { sessionId, propertiesViewed, viewCount, registrationPromptShown, trackPropertyView, markRegistrationPromptShown, clearSession } = useBrowsingSession();
  const [testPropertyId, setTestPropertyId] = useState('test-property-1');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackView = async () => {
    setIsTracking(true);
    try {
      const result = await trackPropertyView(testPropertyId);
      console.log('Track view result:', result);
      
      if (result.shouldPromptRegistration) {
        console.log('Should show registration modal!');
        // Trigger registration modal
        const event = new CustomEvent('showRegistrationModal');
        window.dispatchEvent(event);
        await markRegistrationPromptShown();
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const handleClearSession = () => {
    clearSession();
    console.log('Session cleared');
  };

  const handleTriggerModal = () => {
    const event = new CustomEvent('showRegistrationModal');
    window.dispatchEvent(event);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Registration Flow Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Session Information</h2>
        <div className="space-y-2">
          <p><strong>Session ID:</strong> {sessionId}</p>
          <p><strong>View Count:</strong> {viewCount}</p>
          <p><strong>Properties Viewed:</strong> {propertiesViewed.join(', ')}</p>
          <p><strong>Registration Prompt Shown:</strong> {registrationPromptShown ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={testPropertyId}
              onChange={(e) => setTestPropertyId(e.target.value)}
              placeholder="Property ID"
              className="border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={handleTrackView}
              disabled={isTracking}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isTracking ? 'Tracking...' : 'Track Property View'}
            </button>
          </div>
          
          <button
            onClick={handleTriggerModal}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Trigger Registration Modal
          </button>
          
          <button
            onClick={handleClearSession}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Session
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Track Property View" 3 times with different property IDs</li>
          <li>After the 3rd view, the registration modal should appear automatically</li>
          <li>You can also manually trigger the modal with the green button</li>
          <li>Use "Clear Session" to reset and test again</li>
        </ol>
      </div>
    </div>
  );
}
