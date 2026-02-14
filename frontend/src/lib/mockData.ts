
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'sale' | 'rent';
  category: 'residential' | 'commercial' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending' | 'under-construction';
  features: string[];
  images: string[];
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Villa in Karen',
    description: 'Luxurious 5-bedroom villa with a swimming pool and large garden.',
    price: 85000000,
    location: 'Karen, Nairobi',
    latitude: -1.3192,
    longitude: 36.7062,
    bedrooms: 5,
    bathrooms: 6,
    area: 4500,
    type: 'sale',
    category: 'residential',
    status: 'available',
    features: ['Swimming Pool', 'Garden', 'Security', 'Parking', 'Gym'],
    images: ['/images/property-1.svg'],
    agent: {
      id: 'a1',
      name: 'John Doe',
      phone: '+254712345678',
      email: 'john@xillix.co.ke',
      avatar: '/images/agent-1.jpg'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Luxury Apartment in Westlands',
    description: '3-bedroom apartment with panoramic views of the city.',
    price: 25000000,
    location: 'Westlands, Nairobi',
    latitude: -1.2683,
    longitude: 36.8111,
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    type: 'sale',
    category: 'residential',
    status: 'available',
    features: ['Elevator', 'Backup Generator', 'CCTV', 'Borehole'],
    images: ['/images/property-2.svg'],
    agent: {
      id: 'a2',
      name: 'Jane Smith',
      phone: '+254723456789',
      email: 'jane@xillix.co.ke',
      avatar: '/images/agent-2.jpg'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Commercial Office Space',
    description: 'Prime office space in Upper Hill ready for occupation.',
    price: 150000,
    location: 'Upper Hill, Nairobi',
    latitude: -1.2995,
    longitude: 36.8143,
    bedrooms: 0,
    bathrooms: 2,
    area: 1500,
    type: 'rent',
    category: 'commercial',
    status: 'available',
    features: ['High Speed Internet', 'Parking', 'Security', 'Reception'],
    images: ['/images/property-3.svg'],
    agent: {
      id: 'a3',
      name: 'Michael Brown',
      phone: '+254734567890',
      email: 'michael@xillix.co.ke'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Cozy Apartment in Kilimani',
    description: 'Fully furnished 2-bedroom apartment near Yaya Centre.',
    price: 80000,
    location: 'Kilimani, Nairobi',
    latitude: -1.2921,
    longitude: 36.7867,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: 'rent',
    category: 'residential',
    status: 'available',
    features: ['Furnished', 'Pool', 'Gym', 'Internet'],
    images: ['/images/property-1.svg'],
    agent: {
      id: 'a1',
      name: 'John Doe',
      phone: '+254712345678',
      email: 'john@xillix.co.ke'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
