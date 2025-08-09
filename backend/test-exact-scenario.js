// Test the exact scenario happening in routes/users.ts
const userController = require('./src/controllers/userController.js');

console.log('userController:', userController);
console.log('typeof userController:', typeof userController);
console.log('userController.getProfile:', userController.getProfile);
console.log('typeof userController.getProfile:', typeof userController.getProfile);

// Test if it's undefined
if (userController.getProfile === undefined) {
  console.log('❌ getProfile is undefined!');
} else {
  console.log('✅ getProfile is defined');
}

// Check all properties
console.log('All properties:', Object.keys(userController));
console.log('Has getProfile property:', userController.hasOwnProperty('getProfile'));

// Test the function call
try {
  if (typeof userController.getProfile === 'function') {
    console.log('✅ getProfile is a function and can be called');
  } else {
    console.log('❌ getProfile is not a function:', userController.getProfile);
  }
} catch (error) {
  console.error('❌ Error testing getProfile:', error.message);
}