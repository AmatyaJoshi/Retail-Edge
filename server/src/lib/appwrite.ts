import { Client, Databases, ID, Query, Users, Account, Functions, Teams, Avatars, Locale, Storage } from 'node-appwrite';

const appwriteClient = new Client();

appwriteClient
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export default appwriteClient;
export { Users, Account, ID, Functions, Teams, Avatars, Locale, Storage, Databases, Query };
