const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Track property view for browsing session
const trackPropertyView = async (req, res) => {
  try {
    const { sessionId, propertyId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!sessionId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and Property ID are required'
      });
    }

    // Find or create browsing session
    let session = await prisma.browsingSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      // Create new session with 24-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      session = await prisma.browsingSession.create({
        data: {
          sessionId,
          propertiesViewed: JSON.stringify([propertyId]),
          viewCount: 1,
          ipAddress,
          userAgent,
          expiresAt
        }
      });
    } else {
      // Update existing session
      const viewedProperties = JSON.parse(session.propertiesViewed || '[]');
      
      // Only increment if this property hasn't been viewed in this session
      if (!viewedProperties.includes(propertyId)) {
        viewedProperties.push(propertyId);
        
        await prisma.browsingSession.update({
          where: { sessionId },
          data: {
            propertiesViewed: JSON.stringify(viewedProperties),
            viewCount: viewedProperties.length,
            updatedAt: new Date()
          }
        });
      }
    }

    // Get updated session data
    const updatedSession = await prisma.browsingSession.findUnique({
      where: { sessionId }
    });

    res.json({
      success: true,
      data: {
        viewCount: updatedSession.viewCount,
        shouldPromptRegistration: updatedSession.viewCount >= 3 && !updatedSession.registrationPromptShown
      }
    });

  } catch (error) {
    console.error('Error tracking property view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track property view'
    });
  }
};

// Mark registration prompt as shown
const markRegistrationPromptShown = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    await prisma.browsingSession.update({
      where: { sessionId },
      data: { registrationPromptShown: true }
    });

    res.json({
      success: true,
      message: 'Registration prompt marked as shown'
    });

  } catch (error) {
    console.error('Error marking registration prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark registration prompt'
    });
  }
};

// Get browsing session stats
const getBrowsingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.browsingSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        viewCount: session.viewCount,
        propertiesViewed: JSON.parse(session.propertiesViewed || '[]'),
        registrationPromptShown: session.registrationPromptShown,
        createdAt: session.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting browsing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get browsing session'
    });
  }
};

// Link browsing session to user after registration/login
const linkSessionToUser = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and User ID are required'
      });
    }

    await prisma.browsingSession.update({
      where: { sessionId },
      data: { userId }
    });

    res.json({
      success: true,
      message: 'Session linked to user successfully'
    });

  } catch (error) {
    console.error('Error linking session to user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link session to user'
    });
  }
};

module.exports = {
  trackPropertyView,
  markRegistrationPromptShown,
  getBrowsingSession,
  linkSessionToUser
};