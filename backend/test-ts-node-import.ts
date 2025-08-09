// Test ts-node with require in TypeScript
console.log('Testing ts-node with require...');

const userController = require('./src/controllers/userController.js');

console.log('userController type:', typeof userController);
console.log('getProfile exists:', 'getProfile' in userController);
console.log('getProfile type:', typeof userController.getProfile);

if (userController.getProfile === undefined) {
  console.log('❌ getProfile is undefined in ts-node context');
} else {
  console.log('✅ getProfile is available in ts-node context');
}