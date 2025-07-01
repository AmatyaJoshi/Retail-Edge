# Migration from Clerk to Appwrite Authentication

This document outlines the steps taken to migrate the authentication system from Clerk to Appwrite.

## Completed Changes

1. Created a new `appwriteAuth.ts` service with the following functionality:
   - User creation in Appwrite
   - Session management
   - JWT validation
   - User lookup
   - Phone number formatting to ensure Appwrite compatibility (adding "+" prefix)

2. Updated authentication controllers:
   - Modified `authController.ts` to use Appwrite for user registration and login
   - Modified `checkSessionController.ts` to validate Appwrite JWTs instead of Clerk tokens
   - Updated cookie management to use Appwrite session cookies
   - Ensured phone numbers are always properly formatted for Appwrite requirements

3. Created a migration script to help transition users from Clerk to Appwrite

4. Updated database schema:
   - Added `appwriteId` field to the User model (unique, required)
   - Removed `clerkId` field from the User model
   - Reordered columns for better database organization
   - Created and executed migration scripts for schema changes

## Pending Changes

1. Test the full authentication flow:
   - User registration
   - Login
   - Session validation
   - Logout

2. Remove any remaining Clerk-specific environment variables from your configuration

## Migration Steps for Users

1. Run the `migrateClerkToAppwrite.ts` script to create Appwrite accounts for existing users
2. Implement a password reset flow for migrated users since their passwords won't be carried over
3. Update the client-side code to work with the new authentication endpoints

## Environment Variables

Make sure the following environment variables are set:

```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

## Testing Recommendations

1. Test user registration with new accounts
2. Test login with migrated accounts (after password reset)
3. Test session persistence and expiration
4. Test logout functionality
5. Test protected routes with the new authentication system

## Rollback Plan

If issues arise, the system is designed to accept both Clerk and Appwrite tokens temporarily.
This allows for a phased migration and easy rollback if needed.
