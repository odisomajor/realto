import { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import PropertyCard from '@/components/properties/PropertyCard'
import AgentCard from '@/components/agents/AgentCard'
import { Property, Agent } from '@/types'

export const metadata: Metadata = {
  title: 'Xillix - Kenya Real Estate Portal | Properties for Sale & Rent',
  description: 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals. Trusted real estate platform with verified listings across Nairobi, Mombasa, Kisumu, and all major cities.',
}

async function getFeaturedProperties(): Promise<Property[]> {
  try {
    // Use internal URL for server-side fetching
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/properties?featured=true&limit=3`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch featured properties:', res.statusText);
      return [];
    }
    
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) {
      return data as Property[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

// Mock data for featured agents
const featuredAgents: Agent[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@premiumrealty.co.ke",
    phone: "+254700000000",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=200",
    bio: "Experienced real estate professional with over 8 years in the Kenyan property market.",
    company: {
      name: "Premium Realty Kenya",
      address: "Westlands Square, 4th Floor, Suite 401, Nairobi",
      phone: "+254711000000",
      location: "Westlands, Nairobi",
      website: "https://premiumrealty.co.ke",
      logo: "/images/company-logo-1.jpg"
    },
    specializations: ["Luxury Homes", "Commercial Properties", "Investment Properties"],
    experience: 8,
    propertiesListed: 156,
    propertiesSold: 89,
    rating: 4.8,
    reviews: 47,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@elitehomes.co.ke",
    phone: "+254700000001",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff&size=200",
    bio: "Specializing in luxury residential properties and high-end commercial spaces.",
    company: {
      name: "Elite Homes Kenya",
      address: "Kilimani Road, 2nd Floor, Nairobi",
      phone: "+254722000000",
      location: "Kilimani, Nairobi",
      website: "https://elitehomes.co.ke",
      logo: "/images/company-logo-2.jpg"
    },
    specializations: ["Luxury Residential", "High-end Commercial", "Property Management"],
    experience: 6,
    propertiesListed: 98,
    propertiesSold: 67,
    rating: 4.9,
    reviews: 32,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@landexperts.co.ke",
    phone: "+254700000002",
    avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=f59e0b&color=fff&size=200",
    bio: "Land and agricultural property specialist with extensive knowledge of rural markets.",
    company: {
      name: "Land Experts Kenya",
      address: "Ngong Road, Ground Floor, Nairobi",
      phone: "+254733000000",
      location: "Ngong Road, Nairobi",
      website: "https://landexperts.co.ke",
      logo: "/images/company-logo-3.jpg"
    },
    specializations: ["Land Sales", "Agricultural Properties", "Rural Development"],
    experience: 12,
    propertiesListed: 203,
    propertiesSold: 145,
    rating: 4.7,
    reviews: 78,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a
              href="/properties"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              View All Properties
            </a>
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Real Estate Agents
            </h2>
            <p className="text-lg text-gray-600">
              Connect with our top-rated agents to find your perfect property
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Xillix?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and expertise to help you find your perfect property
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find properties quickly with our advanced search filters and intuitive interface
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Agents</h3>
              <p className="text-gray-600">
                Work with experienced real estate professionals who know the local market
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Service</h3>
              <p className="text-gray-600">
                Reliable and transparent service with thousands of satisfied customers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
