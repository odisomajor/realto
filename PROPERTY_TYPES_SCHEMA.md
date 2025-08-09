# Property Types & Database Schema - Kenya Real Estate Portal

## Overview

This document outlines the comprehensive property types supported by the Kenya
Real Estate Portal and their specific database schema requirements.

## Property Types Supported

### 1. Land Properties

**Description:** Various types of land for different purposes

**Sub-categories:**

- **Agricultural Land**
  - Crop farming land
  - Livestock farming land
  - Mixed farming land
  - Irrigation-ready land

- **Residential Land**
  - Residential plots
  - Gated community plots
  - Subdivision lots
  - Beachfront land

- **Commercial Land**
  - Commercial plots
  - Industrial land
  - Mixed-use development land
  - Investment land

**Specific Attributes:**

- Land size (acres/hectares)
- Soil type
- Water availability
- Access roads
- Title deed status
- Zoning classification
- Topography

### 2. Rental Properties

**Description:** Properties available for rent

**Sub-categories:**

- **Apartments**
  - Studio apartments
  - 1-bedroom apartments
  - 2-bedroom apartments
  - 3+ bedroom apartments
  - Penthouse apartments

- **Houses**
  - Bungalows
  - Maisonettes
  - Townhouses
  - Villas
  - Mansions

- **Rooms**
  - Single rooms
  - Bedsitters
  - Shared accommodation
  - Student hostels

**Specific Attributes:**

- Number of bedrooms
- Number of bathrooms
- Furnished/unfurnished
- Parking spaces
- Security features
- Utilities included
- Lease terms
- Pet policy

### 3. Commercial Properties

**Description:** Properties for business use

**Sub-categories:**

- **Offices**
  - Executive offices
  - Open plan offices
  - Co-working spaces
  - Business centers
  - Medical offices

- **Retail Spaces**
  - Shopping mall units
  - Street-level shops
  - Kiosks
  - Market stalls
  - Pop-up spaces

- **Shops**
  - Standalone shops
  - Chain store locations
  - Specialty stores
  - Restaurants/cafes
  - Service centers

**Specific Attributes:**

- Floor area (sq ft/sq m)
- Floor level
- Foot traffic rating
- Parking availability
- Loading dock access
- HVAC systems
- Security systems
- Business license requirements

### 4. Warehouses

**Description:** Storage and industrial facilities

**Sub-categories:**

- **Storage Facilities**
  - Cold storage
  - Dry storage
  - Climate-controlled storage
  - Self-storage units

- **Industrial Spaces**
  - Manufacturing facilities
  - Distribution centers
  - Logistics hubs
  - Processing plants

**Specific Attributes:**

- Storage capacity (cubic meters)
- Ceiling height
- Loading dock specifications
- Power supply capacity
- Security systems
- Fire safety systems
- Temperature control
- Access for heavy vehicles

### 5. Containers

**Description:** Shipping containers converted for various uses

**Sub-categories:**

- **Shipping Containers**
  - 20ft containers
  - 40ft containers
  - High cube containers
  - Refrigerated containers

- **Container Offices**
  - Single container offices
  - Multi-container complexes
  - Mobile offices
  - Site offices

**Specific Attributes:**

- Container size (20ft/40ft)
- Condition (new/used)
- Modifications made
- Insulation type
- Electrical setup
- Plumbing availability
- Mobility (fixed/portable)
- Certification status

### 6. Others

**Description:** Unique or specialized property types

**Examples:**

- Parking spaces/garages
- Storage units
- Event venues
- Churches/religious buildings
- Schools/educational facilities
- Hospitals/medical facilities
- Hotels/hospitality
- Gas stations
- Car washes
- Recreational facilities

## Database Schema

### Property Types Table

```sql
CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('land', 'rental', 'commercial', 'warehouse', 'container', 'other') NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enhanced Properties Table

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type_id UUID REFERENCES property_types(id),
    user_id UUID REFERENCES users(id),

    -- Location Information
    county VARCHAR(100) NOT NULL,
    town VARCHAR(100),
    area VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Basic Information
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    price_type ENUM('sale', 'rent_monthly', 'rent_daily', 'lease') NOT NULL,

    -- Property Specifications (JSON for flexibility)
    specifications JSONB, -- Stores type-specific attributes

    -- Media
    images TEXT[], -- Array of image URLs
    videos TEXT[], -- Array of video URLs
    virtual_tour_url VARCHAR(255),

    -- Status and Visibility
    status ENUM('draft', 'active', 'sold', 'rented', 'suspended') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,

    -- SEO and Search
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    expires_at TIMESTAMP
);
```

### Property Specifications Examples

#### Land Property Specifications

```json
{
  "land_size": {
    "value": 2.5,
    "unit": "acres"
  },
  "soil_type": "loam",
  "water_availability": "borehole",
  "access_road": "tarmac",
  "title_deed": "freehold",
  "zoning": "agricultural",
  "topography": "flat"
}
```

#### Rental Property Specifications

```json
{
  "bedrooms": 3,
  "bathrooms": 2,
  "furnished": true,
  "parking_spaces": 2,
  "security_features": ["CCTV", "security_guard", "perimeter_wall"],
  "utilities_included": ["water", "garbage_collection"],
  "lease_terms": "minimum_1_year",
  "pet_policy": "allowed_with_deposit"
}
```

#### Commercial Property Specifications

```json
{
  "floor_area": {
    "value": 1500,
    "unit": "sq_ft"
  },
  "floor_level": "ground",
  "foot_traffic": "high",
  "parking_spaces": 10,
  "loading_dock": true,
  "hvac": "central_air",
  "security_system": "24_7_monitoring"
}
```

#### Warehouse Specifications

```json
{
  "storage_capacity": {
    "value": 5000,
    "unit": "cubic_meters"
  },
  "ceiling_height": {
    "value": 12,
    "unit": "meters"
  },
  "loading_docks": 4,
  "power_supply": "3_phase_industrial",
  "temperature_control": "climate_controlled",
  "heavy_vehicle_access": true
}
```

#### Container Specifications

```json
{
  "container_size": "40ft",
  "condition": "used_good",
  "modifications": ["insulation", "electrical", "windows"],
  "insulation_type": "spray_foam",
  "electrical_setup": "220v_ready",
  "plumbing": false,
  "mobility": "fixed",
  "certification": "ISO_certified"
}
```

## Search and Filter Implementation

### Property Type Filters

```javascript
const propertyTypeFilters = {
  land: {
    subcategories: ['agricultural', 'residential', 'commercial'],
    filters: ['land_size', 'soil_type', 'water_availability', 'title_deed']
  },
  rental: {
    subcategories: ['apartments', 'houses', 'rooms'],
    filters: ['bedrooms', 'bathrooms', 'furnished', 'parking_spaces']
  },
  commercial: {
    subcategories: ['offices', 'retail', 'shops'],
    filters: ['floor_area', 'floor_level', 'parking_spaces', 'foot_traffic']
  },
  warehouse: {
    subcategories: ['storage', 'industrial'],
    filters: [
      'storage_capacity',
      'ceiling_height',
      'loading_docks',
      'temperature_control'
    ]
  },
  container: {
    subcategories: ['shipping', 'offices'],
    filters: ['container_size', 'condition', 'modifications', 'mobility']
  }
};
```

## Google Ads Integration Strategy

### Ad Placement Locations

1. **Header Banner (728x90 or 970x250)**
   - Displayed on all pages
   - High visibility placement
   - Responsive design

2. **Sidebar Ad (300x250 or 300x600)**
   - Property listing pages
   - Search results pages
   - Property details pages

3. **Footer/Content Ad (728x90 or 320x100 mobile)**
   - Between property listings
   - Bottom of property details
   - End of blog articles

### Ad Configuration

```javascript
const adSlots = {
  header: {
    adUnitId: 'ca-pub-xxxxxxxx/header-slot',
    sizes: [
      [728, 90],
      [970, 250]
    ],
    responsive: true
  },
  sidebar: {
    adUnitId: 'ca-pub-xxxxxxxx/sidebar-slot',
    sizes: [
      [300, 250],
      [300, 600]
    ],
    responsive: true
  },
  footer: {
    adUnitId: 'ca-pub-xxxxxxxx/footer-slot',
    sizes: [
      [728, 90],
      [320, 100]
    ],
    responsive: true
  }
};
```

This comprehensive property type system ensures that the Kenya Real Estate
Portal can accommodate all types of properties in the Kenyan market while
providing targeted search and filtering capabilities for users.
