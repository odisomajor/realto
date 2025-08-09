const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Kenya Real Estate API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', health.data);

    // Test API root
    console.log('\n2. Testing API root...');
    const root = await axios.get('http://localhost:5000');
    console.log('✅ API root:', root.data);

    // Test user registration
    console.log('\n3. Testing user registration...');
    const registerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+254700000000',
      role: 'USER'
    };
    
    try {
      const register = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ Registration successful:', register.data);
      
      // Test login
      console.log('\n4. Testing user login...');
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };
      
      const login = await axios.post(`${API_BASE}/auth/login`, loginData);
      console.log('✅ Login successful:', login.data);
      
      const token = login.data.token;
      
      // Test protected route - get profile
      console.log('\n5. Testing protected route (profile)...');
      const profile = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile retrieved:', profile.data);
      
      // Test properties endpoint
      console.log('\n6. Testing properties endpoint...');
      const properties = await axios.get(`${API_BASE}/properties`);
      console.log('✅ Properties retrieved:', properties.data);
      
      // Test creating a property
      console.log('\n7. Testing property creation...');
      const propertyData = {
        title: 'Beautiful 3BR House in Nairobi',
        description: 'A stunning 3-bedroom house in a prime location',
        price: 15000000,
        propertyType: 'house',
        listingType: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        location: 'Nairobi',
        county: 'Nairobi',
        features: JSON.stringify(['parking', 'garden', 'security']),
        amenities: JSON.stringify(['gym', 'pool', 'playground']),
        images: JSON.stringify(['image1.jpg', 'image2.jpg'])
      };
      
      const property = await axios.post(`${API_BASE}/properties`, propertyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Property created:', property.data);
      
      const propertyId = property.data.id;
      
      // Test getting single property
      console.log('\n8. Testing single property retrieval...');
      const singleProperty = await axios.get(`${API_BASE}/properties/${propertyId}`);
      console.log('✅ Single property retrieved:', singleProperty.data);
      
      // Test creating an inquiry
      console.log('\n9. Testing inquiry creation...');
      const inquiryData = {
        propertyId: propertyId,
        message: 'I am interested in this property. Can we schedule a viewing?',
        phone: '+254700000001'
      };
      
      const inquiry = await axios.post(`${API_BASE}/inquiries`, inquiryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Inquiry created:', inquiry.data);
      
      // Test adding to favorites
      console.log('\n10. Testing add to favorites...');
      const favorite = await axios.post(`${API_BASE}/favorites`, 
        { propertyId: propertyId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Added to favorites:', favorite.data);
      
      // Test getting favorites
      console.log('\n11. Testing get favorites...');
      const favorites = await axios.get(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Favorites retrieved:', favorites.data);
      
      console.log('\n🎉 All tests passed! API is working correctly.');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'Duplicate entry') {
        console.log('⚠️  User already exists, trying login instead...');
        
        const loginData = {
          email: 'john@example.com',
          password: 'password123'
        };
        
        const login = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ Login successful:', login.data);
        
        console.log('\n🎉 Basic API functionality verified!');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testAPI();