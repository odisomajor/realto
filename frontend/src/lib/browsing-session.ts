import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { browsingSessionApi } from './api';

interface BrowsingSessionState {
  sessionId: string;
  propertiesViewed: string[];
  viewCount: number;
  registrationPromptShown: boolean;
  isInitialized: boolean;
  
  // Actions
  initializeSession: () => void;
  trackPropertyView: (propertyId: string) => Promise<{ shouldPromptRegistration: boolean }>;
  markRegistrationPromptShown: () => Promise<void>;
  clearSession: () => void;
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useBrowsingSession = create<BrowsingSessionState>()(
  persist(
    (set, get) => ({
      sessionId: '',
      propertiesViewed: [],
      viewCount: 0,
      registrationPromptShown: false,
      isInitialized: false,

      initializeSession: () => {
        const state = get();
        if (!state.isInitialized) {
          const sessionId = state.sessionId || generateSessionId();
          set({
            sessionId,
            isInitialized: true
          });
        }
      },

      trackPropertyView: async (propertyId: string) => {
        const state = get();
        
        try {
          const response = await browsingSessionApi.trackView(state.sessionId, propertyId);
          const { viewCount, shouldPromptRegistration } = response.data.data;
          
          // Update local state
          const updatedPropertiesViewed = state.propertiesViewed.includes(propertyId)
            ? state.propertiesViewed
            : [...state.propertiesViewed, propertyId];
          
          set({
            propertiesViewed: updatedPropertiesViewed,
            viewCount
          });
          
          return { shouldPromptRegistration };
        } catch (error) {
          console.error('Failed to track property view:', error);
          
          // Fallback to local tracking
          const updatedPropertiesViewed = state.propertiesViewed.includes(propertyId)
            ? state.propertiesViewed
            : [...state.propertiesViewed, propertyId];
          
          const newViewCount = updatedPropertiesViewed.length;
          
          set({
            propertiesViewed: updatedPropertiesViewed,
            viewCount: newViewCount
          });
          
          return { 
            shouldPromptRegistration: newViewCount >= 3 && !state.registrationPromptShown 
          };
        }
      },

      markRegistrationPromptShown: async () => {
        const state = get();
        
        try {
          await browsingSessionApi.markPromptShown(state.sessionId);
        } catch (error) {
          console.error('Failed to mark registration prompt as shown:', error);
        }
        
        set({ registrationPromptShown: true });
      },

      clearSession: () => {
        set({
          sessionId: generateSessionId(),
          propertiesViewed: [],
          viewCount: 0,
          registrationPromptShown: false,
          isInitialized: true
        });
      }
    }),
    {
      name: 'browsing-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        propertiesViewed: state.propertiesViewed,
        viewCount: state.viewCount,
        registrationPromptShown: state.registrationPromptShown
      })
    }
  )
);

// Hook to get browsing session stats for display
export const useBrowsingStats = () => {
  const { session, isRegistrationRequired } = useBrowsingSession()
  
  const remainingViews = session 
    ? Math.max(0, MAX_PROPERTIES_WITHOUT_REGISTRATION - session.propertiesViewed)
    : MAX_PROPERTIES_WITHOUT_REGISTRATION

  return {
    propertiesViewed: session?.propertiesViewed || 0,
    remainingViews,
    maxViews: MAX_PROPERTIES_WITHOUT_REGISTRATION,
    isRegistrationRequired,
    sessionExpired: session ? isSessionExpired(session) : false
  }
}