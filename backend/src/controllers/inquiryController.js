const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create new inquiry
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, propertyId } = req.body;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, ownerId: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        message,
        propertyId,
        userId: req.user?.id // Optional if user is logged in
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        type: 'INQUIRY',
        title: 'New Property Inquiry',
        message: `You have received a new inquiry for "${property.title}" from ${name}`,
        data: JSON.stringify({
          inquiryId: inquiry.id,
          propertyId: property.id,
          inquirerName: name,
          inquirerEmail: email
        }),
        userId: property.ownerId
      }
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get inquiries for property owner
const getInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, propertyId } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      property: {
        ownerId: req.user.id
      },
      ...(status && { status }),
      ...(propertyId && { propertyId })
    };

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              propertyType: true,
              listingType: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.inquiry.count({ where })
    ]);

    res.json({
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single inquiry
const getInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            propertyType: true,
            listingType: true,
            ownerId: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Check if user owns the property or is the inquirer
    if (inquiry.property.ownerId !== req.user.id && 
        inquiry.userId !== req.user.id && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to view this inquiry' });
    }

    res.json({ inquiry });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update inquiry status
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if inquiry exists and user owns the property
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingInquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (existingInquiry.property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this inquiry' });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Inquiry status updated successfully',
      inquiry
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete inquiry
const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if inquiry exists and user owns the property
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingInquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (existingInquiry.property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this inquiry' });
    }

    await prisma.inquiry.delete({
      where: { id }
    });

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's own inquiries
const getUserInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              propertyType: true,
              listingType: true,
              price: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      }),
      prisma.inquiry.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getUserInquiries
};