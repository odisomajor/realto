const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const geocodingService = require('../services/geocodingService');

const prisma = new PrismaClient();

// Helper function to generate unique slug
const generateSlug = async (title, id = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.property.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing || (id && existing.id === id)) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Get all properties with filtering and pagination
const getProperties = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      propertyType,
      listingType,
      type, // Handle frontend 'type' parameter
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      county,
      city,
      featured,
      sortBy,
      sortOrder
    } = req.query;

    // Map frontend 'type' parameter to backend 'listingType'
    let finalListingType = listingType;
    if (type) {
      if (type === 'sale') {
        finalListingType = 'FOR_SALE';
      } else if (type === 'rent') {
        finalListingType = 'FOR_RENT';
      }
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      status: 'ACTIVE',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { county: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(propertyType && { propertyType }),
      ...(finalListingType && { listingType: finalListingType }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(bedrooms && { bedrooms }),
      ...(bathrooms && { bathrooms }),
      ...(county && { county: { contains: county, mode: 'insensitive' } }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(featured !== undefined && { featured })
    };

    // Handle price range
    if (minPrice && maxPrice) {
      where.price = { gte: minPrice, lte: maxPrice };
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              role: true
            }
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    // Parse JSON fields and format for frontend compatibility
    const formattedProperties = properties.map(property => ({
      ...property,
      // Map backend fields to frontend expectations
      type: property.listingType === 'FOR_SALE' ? 'sale' : 'rent',
      location: `${property.address}, ${property.city}, ${property.county}`.replace(/^, |, $/g, ''),
      area: property.squareFootage,
      agent: {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`,
        email: property.owner.email,
        phone: property.owner.phone,
        avatar: property.owner.avatar
      },
      category: property.propertyType?.toLowerCase() || 'residential',
      status: property.status?.toLowerCase() || 'available',
      coordinates: property.latitude && property.longitude ? {
        lat: property.latitude,
        lng: property.longitude
      } : undefined,
      features: property.features ? JSON.parse(property.features) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      images: property.images ? JSON.parse(property.images) : [],
      // Remove backend-specific fields that frontend doesn't need
      listingType: undefined,
      propertyType: undefined,
      address: undefined,
      city: undefined,
      county: undefined,
      squareFootage: undefined,
      owner: undefined,
      latitude: undefined,
      longitude: undefined
    }));

    res.json({
      success: true,
      data: formattedProperties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single property by ID or slug
const getProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            bio: true
          }
        },
        _count: {
          select: {
            favorites: true,
            inquiries: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment views
    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } }
    });

    // Parse JSON fields and format for frontend compatibility
    const formattedProperty = {
      ...property,
      // Map backend fields to frontend expectations
      type: property.listingType === 'FOR_SALE' ? 'sale' : 'rent',
      location: `${property.address}, ${property.city}, ${property.county}`.replace(/^, |, $/g, ''),
      area: property.squareFootage,
      agent: {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`,
        email: property.owner.email,
        phone: property.owner.phone,
        avatar: property.owner.avatar
      },
      category: property.propertyType?.toLowerCase() || 'residential',
      status: property.status?.toLowerCase() || 'available',
      coordinates: property.latitude && property.longitude ? {
        lat: property.latitude,
        lng: property.longitude
      } : undefined,
      features: property.features ? JSON.parse(property.features) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      images: property.images ? JSON.parse(property.images) : [],
      // Remove backend-specific fields that frontend doesn't need
      listingType: undefined,
      propertyType: undefined,
      address: undefined,
      city: undefined,
      county: undefined,
      squareFootage: undefined,
      owner: undefined,
      latitude: undefined,
      longitude: undefined
    };

    res.json({ 
      success: true,
      data: formattedProperty 
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new property
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      address,
      city,
      county,
      bedrooms,
      bathrooms,
      squareFootage,
      yearBuilt,
      features,
      amenities,
      images,
      virtualTour,
      latitude,
      longitude
    } = req.body;

    // Generate slug
    const slug = await generateSlug(title);

    // Auto-geocode if coordinates not provided but address is available
    let finalLatitude = latitude;
    let finalLongitude = longitude;
    let finalAddress = address;
    let finalCity = city;
    let finalCounty = county;

    if (!latitude || !longitude) {
      if (address) {
        try {
          const geocodeResult = await geocodingService.geocodeAddress(address);
          finalLatitude = geocodeResult.lat;
          finalLongitude = geocodeResult.lng;
          finalAddress = geocodeResult.formattedAddress;
          
          // Use geocoded location data if not provided
          if (!city && geocodeResult.city) {
            finalCity = geocodeResult.city;
          }
          if (!county && geocodeResult.county) {
            finalCounty = geocodeResult.county;
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed:', geocodeError.message);
          // Continue without coordinates if geocoding fails
        }
      }
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        slug,
        propertyType,
        listingType,
        price,
        address: finalAddress,
        city: finalCity,
        county: finalCounty,
        bedrooms,
        bathrooms,
        squareFootage,
        yearBuilt,
        features: features ? JSON.stringify(features) : null,
        amenities: amenities ? JSON.stringify(amenities) : null,
        images: images ? JSON.stringify(images) : null,
        virtualTour,
        latitude: finalLatitude,
        longitude: finalLongitude,
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Format property to match frontend expectations
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: `${property.address}, ${property.city}, ${property.county}`,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.squareFootage,
      type: property.listingType,
      category: property.propertyType,
      status: property.status,
      images: property.images ? JSON.parse(property.images) : [],
      features: property.features ? JSON.parse(property.features) : [],
      coordinates: property.latitude && property.longitude ? {
        lat: property.latitude,
        lng: property.longitude
      } : null,
      agent: {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`,
        email: property.owner.email,
        phone: property.owner.phone,
        avatar: property.owner.avatar,
        role: property.owner.role
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      featured: property.featured || false,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      yearBuilt: property.yearBuilt,
      virtualTour: property.virtualTour,
      slug: property.slug
    };

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: formattedProperty
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      address,
      city,
      county,
      bedrooms,
      bathrooms,
      squareFootage,
      yearBuilt,
      features,
      amenities,
      images,
      virtualTour,
      latitude,
      longitude,
      status
    } = req.body;

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true, title: true }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    // Generate new slug if title changed
    let slug;
    if (title && title !== existingProperty.title) {
      slug = await generateSlug(title, id);
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(slug && { slug }),
        ...(propertyType && { propertyType }),
        ...(listingType && { listingType }),
        ...(price !== undefined && { price }),
        ...(address && { address }),
        ...(city && { city }),
        ...(county && { county }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(squareFootage !== undefined && { squareFootage }),
        ...(yearBuilt !== undefined && { yearBuilt }),
        ...(features !== undefined && { features: features ? JSON.stringify(features) : null }),
        ...(amenities !== undefined && { amenities: amenities ? JSON.stringify(amenities) : null }),
        ...(images !== undefined && { images: images ? JSON.stringify(images) : null }),
        ...(virtualTour !== undefined && { virtualTour }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(status && req.user.role === 'ADMIN' && { status })
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Format property to match frontend expectations
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: `${property.address}, ${property.city}, ${property.county}`,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.squareFootage,
      type: property.listingType,
      category: property.propertyType,
      status: property.status,
      images: property.images ? JSON.parse(property.images) : [],
      features: property.features ? JSON.parse(property.features) : [],
      coordinates: property.latitude && property.longitude ? {
        lat: property.latitude,
        lng: property.longitude
      } : null,
      agent: {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`,
        email: property.owner.email,
        phone: property.owner.phone,
        avatar: property.owner.avatar,
        role: property.owner.role
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      featured: property.featured || false,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      yearBuilt: property.yearBuilt,
      virtualTour: property.virtualTour,
      slug: property.slug
    };

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: formattedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's properties
const getUserProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { ownerId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              role: true
            }
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true
            }
          }
        }
      }),
      prisma.property.count({ where: { ownerId: req.user.id } })
    ]);

    // Format properties to match frontend expectations
    const formattedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: `${property.address}, ${property.city}, ${property.county}`,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.squareFootage,
      type: property.listingType,
      category: property.propertyType,
      status: property.status,
      images: property.images ? JSON.parse(property.images) : [],
      features: property.features ? JSON.parse(property.features) : [],
      coordinates: property.latitude && property.longitude ? {
        lat: property.latitude,
        lng: property.longitude
      } : null,
      agent: {
        id: property.owner.id,
        name: `${property.owner.firstName} ${property.owner.lastName}`,
        email: property.owner.email,
        phone: property.owner.phone,
        avatar: property.owner.avatar,
        role: property.owner.role
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      featured: property.featured || false,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      yearBuilt: property.yearBuilt,
      virtualTour: property.virtualTour,
      slug: property.slug,
      _count: property._count
    }));

    res.json({
      success: true,
      data: formattedProperties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProperties
};