/**
 * This is a simple test file to verify phone number formatting for Appwrite
 * 
 * Run it with: npx ts-node test-phone-formatting.ts
 */

const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters first
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If the phone number already starts with +, return it as is
  if (phone.startsWith('+')) return phone;
  
  // Otherwise, add the + prefix
  return `+${digitsOnly}`;
};

// Test cases
const testCases = [
  { input: '1234567890', expected: '+1234567890' },
  { input: '+1234567890', expected: '+1234567890' },
  { input: '(123) 456-7890', expected: '+1234567890' },
  { input: '', expected: '' },
  { input: undefined, expected: '' }
];

// Run tests
testCases.forEach(test => {
  const result = formatPhoneNumber(test.input);
  const passed = result === test.expected;
  
  console.log(`Input: "${test.input}", Result: "${result}", Expected: "${test.expected}", Passed: ${passed ? '✅' : '❌'}`);
});

console.log('\nVerification complete!');
