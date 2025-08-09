const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Add property to favorites
const addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.body;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Property already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        propertyId
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: true,
            propertyType: true,
            listingType: true,
            city: true,
            county: true,
            bedrooms: true,
            bathrooms: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Property added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove property from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Property not in favorites' });
    }

    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's favorite properties
const getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
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
              description: true,
              price: true,
              images: true,
              propertyType: true,
              listingType: true,
              status: true,
              address: true,
              city: true,
              county: true,
              bedrooms: true,
              bathrooms: true,
              squareFootage: true,
              featured: true,
              views: true,
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              },
              _count: {
                select: {
                  favorites: true,
                  inquiries: true
                }
              }
            }
          }
        }
      }),
      prisma.favorite.count({ where: { userId: req.user.id } })
    ]);

    // Parse JSON fields in properties
    const formattedFavorites = favorites.map(favorite => ({
      ...favorite,
      property: {
        ...favorite.property,
        images: favorite.property.images ? JSON.parse(favorite.property.images) : []
      }
    }));

    res.json({
      favorites: formattedFavorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if property is in user's favorites
const checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get favorite statistics
const getFavoriteStats = async (req, res) => {
  try {
    const stats = await prisma.favorite.groupBy({
      by: ['userId'],
      where: { userId: req.user.id },
      _count: {
        id: true
      }
    });

    const totalFavorites = stats.length > 0 ? stats[0]._count.id : 0;

    // Get favorite properties by type
    const favoritesByType = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          select: {
            propertyType: true,
            listingType: true
          }
        }
      }
    });

    const typeStats = favoritesByType.reduce((acc, favorite) => {
      const type = favorite.property.propertyType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const listingStats = favoritesByType.reduce((acc, favorite) => {
      const type = favorite.property.listingType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalFavorites,
      byPropertyType: typeStats,
      byListingType: listingStats
    });
  } catch (error) {
    console.error('Get favorite stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
  getFavoriteStats
};