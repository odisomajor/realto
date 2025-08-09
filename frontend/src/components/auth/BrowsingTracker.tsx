'use client';

import { useEffect, useState } from 'react';
import { useBrowsingSession } from '@/lib/browsing-session';
import { useAuth } from '@/lib/auth';
import RegistrationModal from './RegistrationModal';
import LoginModal from './LoginModal';

export default function BrowsingTracker() {
  const { user } = useAuth();
  const { initializeSession } = useBrowsingSession();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Initialize browsing session for unauthenticated users
    if (!user) {
      initializeSession();
    }
  }, [user, initializeSession]);

  useEffect(() => {
    // Listen for custom event to show registration modal
    const handleShowRegistrationModal = () => {
      setShowRegistrationModal(true);
    };

    window.addEventListener('showRegistrationModal', handleShowRegistrationModal);
    
    return () => {
      window.removeEventListener('showRegistrationModal', handleShowRegistrationModal);
    };
  }, []);

  const handleCloseModals = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  return (
    <>
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </>
  );
}

// Hook to track property views
export function usePropertyViewTracker(propertyId: string) {
  const { user } = useAuth();
  const { trackPropertyView, markRegistrationPromptShown } = useBrowsingSession();
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    const trackView = async () => {
      if (!user && propertyId && !hasTracked) {
        try {
          const result = await trackPropertyView(propertyId);
          
          if (result.shouldPromptRegistration) {
            // Trigger registration modal
            const event = new CustomEvent('showRegistrationModal');
            window.dispatchEvent(event);
            await markRegistrationPromptShown();
          }
          
          setHasTracked(true);
        } catch (error) {
          console.error('Failed to track property view:', error);
        }
      }
    };

    trackView();
  }, [propertyId, user, trackPropertyView, markRegistrationPromptShown, hasTracked]);
}

// Hook to get browsing session stats for display
export function useBrowsingStats() {
  const { viewCount, propertiesViewed } = useBrowsingSession();
  
  return {
    viewCount,
    propertiesViewed: propertiesViewed.length,
    remainingViews: Math.max(0, 3 - viewCount)
  };
}