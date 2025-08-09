import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

const propertySearchQueries = [
  'apartment',
  'house',
  'condo',
  'villa',
  'studio',
];

// Authentication helper
function authenticate() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response has token': (r) => r.json('token') !== undefined,
  });

  if (loginSuccess) {
    return loginResponse.json('token');
  }
  
  return null;
}

// Property search test
function searchProperties(token) {
  const query = propertySearchQueries[Math.floor(Math.random() * propertySearchQueries.length)];
  
  const searchResponse = http.get(`${BASE_URL}/api/properties/search?q=${query}&limit=20`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

  const searchSuccess = check(searchResponse, {
    'search successful': (r) => r.status === 200,
    'search has results': (r) => r.json('data') !== undefined,
  });

  errorRate.add(!searchSuccess);
  responseTime.add(searchResponse.timings.duration);
  requestCount.add(1);

  return searchResponse.json('data') || [];
}

// Property details test
function getPropertyDetails(propertyId, token) {
  const detailsResponse = http.get(`${BASE_URL}/api/properties/${propertyId}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

  const detailsSuccess = check(detailsResponse, {
    'property details successful': (r) => r.status === 200,
    'property details has data': (r) => r.json('data') !== undefined,
  });

  errorRate.add(!detailsSuccess);
  responseTime.add(detailsResponse.timings.duration);
  requestCount.add(1);
}

// User profile test
function getUserProfile(token) {
  if (!token) return;

  const profileResponse = http.get(`${BASE_URL}/api/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const profileSuccess = check(profileResponse, {
    'profile fetch successful': (r) => r.status === 200,
    'profile has user data': (r) => r.json('data') !== undefined,
  });

  errorRate.add(!profileSuccess);
  responseTime.add(profileResponse.timings.duration);
  requestCount.add(1);
}

// Favorites test
function manageFavorites(propertyId, token) {
  if (!token || !propertyId) return;

  // Add to favorites
  const addFavoriteResponse = http.post(`${BASE_URL}/api/users/favorites`, JSON.stringify({
    propertyId: propertyId,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const addSuccess = check(addFavoriteResponse, {
    'add favorite successful': (r) => r.status === 200 || r.status === 201,
  });

  errorRate.add(!addSuccess);
  responseTime.add(addFavoriteResponse.timings.duration);
  requestCount.add(1);

  sleep(1);

  // Get favorites list
  const getFavoritesResponse = http.get(`${BASE_URL}/api/users/favorites`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const getFavoritesSuccess = check(getFavoritesResponse, {
    'get favorites successful': (r) => r.status === 200,
  });

  errorRate.add(!getFavoritesSuccess);
  responseTime.add(getFavoritesResponse.timings.duration);
  requestCount.add(1);
}

// Notification test
function testNotifications(token) {
  if (!token) return;

  const notificationsResponse = http.get(`${BASE_URL}/api/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const notificationsSuccess = check(notificationsResponse, {
    'notifications fetch successful': (r) => r.status === 200,
  });

  errorRate.add(!notificationsSuccess);
  responseTime.add(notificationsResponse.timings.duration);
  requestCount.add(1);
}

// Health check test
function healthCheck() {
  const healthResponse = http.get(`${BASE_URL}/health`);
  
  const healthSuccess = check(healthResponse, {
    'health check successful': (r) => r.status === 200,
    'health check has status': (r) => r.json('status') !== undefined,
  });

  errorRate.add(!healthSuccess);
  responseTime.add(healthResponse.timings.duration);
  requestCount.add(1);
}

// Main test function
export default function () {
  // Health check (10% of requests)
  if (Math.random() < 0.1) {
    healthCheck();
    sleep(1);
    return;
  }

  // Authenticate user (30% of the time)
  let token = null;
  if (Math.random() < 0.3) {
    token = authenticate();
    sleep(1);
  }

  // Search for properties (always)
  const properties = searchProperties(token);
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds

  // Get property details (70% of the time)
  if (properties.length > 0 && Math.random() < 0.7) {
    const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    getPropertyDetails(randomProperty.id, token);
    sleep(Math.random() * 2 + 1);

    // Manage favorites (30% of the time, only if authenticated)
    if (token && Math.random() < 0.3) {
      manageFavorites(randomProperty.id, token);
      sleep(1);
    }
  }

  // Get user profile (20% of the time, only if authenticated)
  if (token && Math.random() < 0.2) {
    getUserProfile(token);
    sleep(1);
  }

  // Test notifications (15% of the time, only if authenticated)
  if (token && Math.random() < 0.15) {
    testNotifications(token);
    sleep(1);
  }

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting load test for Xillix Real Estate Platform');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Verify the API is accessible
  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`API is not accessible. Health check failed with status: ${healthResponse.status}`);
  }
  
  console.log('API is accessible. Starting test...');
  return { baseUrl: BASE_URL };
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
}

// Handle summary (custom summary output)
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': generateHTMLReport(data),
  };
}

// Generate HTML report
function generateHTMLReport(data) {
  const date = new Date().toISOString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Xillix Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #007cba; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Xillix Real Estate Platform - Load Test Report</h1>
        <p>Generated: ${date}</p>
        <p>Test Duration: ${data.state.testRunDurationMs / 1000}s</p>
    </div>
    
    <h2>Key Metrics</h2>
    <div class="metric ${data.metrics.http_req_failed.rate < 0.1 ? 'success' : 'error'}">
        <strong>Error Rate:</strong> ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%
    </div>
    <div class="metric ${data.metrics.http_req_duration.p95 < 2000 ? 'success' : 'warning'}">
        <strong>95th Percentile Response Time:</strong> ${data.metrics.http_req_duration.p95.toFixed(2)}ms
    </div>
    <div class="metric">
        <strong>Average Response Time:</strong> ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    </div>
    <div class="metric">
        <strong>Total Requests:</strong> ${data.metrics.http_reqs.count}
    </div>
    <div class="metric">
        <strong>Requests per Second:</strong> ${data.metrics.http_reqs.rate.toFixed(2)}
    </div>
    
    <h2>Detailed Metrics</h2>
    <table>
        <tr><th>Metric</th><th>Average</th><th>Min</th><th>Max</th><th>P90</th><th>P95</th></tr>
        <tr>
            <td>HTTP Request Duration</td>
            <td>${data.metrics.http_req_duration.avg.toFixed(2)}ms</td>
            <td>${data.metrics.http_req_duration.min.toFixed(2)}ms</td>
            <td>${data.metrics.http_req_duration.max.toFixed(2)}ms</td>
            <td>${data.metrics.http_req_duration.p90.toFixed(2)}ms</td>
            <td>${data.metrics.http_req_duration.p95.toFixed(2)}ms</td>
        </tr>
    </table>
</body>
</html>`;
}