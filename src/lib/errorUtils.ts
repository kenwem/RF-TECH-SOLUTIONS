export const cleanFirebaseError = (message: string): string => {
  if (!message) return 'An unknown error occurred.';
  
  // Remove "Firebase:" prefix
  let cleaned = message.replace(/^Firebase:\s*/, '');
  
  // Remove error codes in parentheses like (auth/user-not-found)
  cleaned = cleaned.replace(/\s*\(auth\/[^)]+\)\.?/g, '');
  
  // Capitalize first letter if needed
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  // Common user-friendly mappings
  if (cleaned.toLowerCase().includes('invalid-credential') || cleaned.toLowerCase().includes('wrong-password') || cleaned.toLowerCase().includes('user-not-found')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (cleaned.toLowerCase().includes('email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }

  if (cleaned.toLowerCase().includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (cleaned.toLowerCase().includes('network-request-failed')) {
    return 'Network error. Please check your connection.';
  }

  if (cleaned.toLowerCase().includes('too-many-requests')) {
    return 'Too many failed attempts. Please try again later.';
  }
  
  return cleaned.trim() || 'An error occurred. Please try again.';
};
