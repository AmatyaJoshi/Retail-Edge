import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL
    }
  }
});

// User data to insert
const usersData = [
  {
    id: "017a935d-94e7-4e51-a8c1-48513ccd383a",
    clerkId: "user_2zyhurO9yL1bvWQGGKdYSuHbN4y",
    appwriteId: "6878383600122f12bcf4",
    email: "tanvi.bhatt1122@yahoo.com",
    emailVerified: true,
    firstName: "Tanvi",
    lastName: "Bhatt",
    role: "Manager",
    pan: "BNZPA1234G",
    aadhaar: "903456781234",
    phone: "9023445612",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-017a935d-94e7-4e51-a8c1-48513ccd383a-1752716706004.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:45:06.124")
  },
  {
    id: "2240be0b-9104-4d8a-b3b5-3677c2bd630d",
    clerkId: "user_2zzHE5VsV3LdVec4AUa5rxHbQx5",
    appwriteId: "68787cee0035397617b3",
    email: "karan.malhotra88@outlook.com",
    emailVerified: true,
    firstName: "Karan",
    lastName: "Malhotra",
    role: "Admin",
    pan: "AZTPM9382C",
    aadhaar: "609832147526",
    phone: "9932745120",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-2240be0b-9104-4d8a-b3b5-3677c2bd630d-1752727355667.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 04:42:36.091")
  },
  {
    id: "385e743c-18f4-4730-926c-2d2700e7eabb",
    clerkId: "user_2zysBZC4DnUcWp7mN4GQ4pv6I7K",
    appwriteId: "68784ae7001ebb3b01e2",
    email: "amatyajoshiinbox@gmail.com",
    emailVerified: true,
    firstName: "Harvey",
    lastName: "Specter",
    role: "Manager",
    pan: "HSE980808F",
    aadhaar: "789293339029",
    phone: "8839233792",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-385e743c-18f4-4730-926c-2d2700e7eabb-1752716812430.jpg",
    createdAt: new Date("2025-07-17 01:08:31.44"),
    updatedAt: new Date("2025-07-17 01:46:52.514")
  },
  {
    id: "4f6c372f-1ccc-41df-8152-776d9160e6b5",
    clerkId: "user_2zyiEOAerDgrtHzzOkKXcYV1xFm",
    appwriteId: "6878375500323115ff14",
    email: "mohitsharma3332@yahoo.com",
    emailVerified: true,
    firstName: "Mohit",
    lastName: "Sharma",
    role: "Admin",
    pan: "KPMLK3498D",
    aadhaar: "564738291001",
    phone: "8999123477",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-4f6c372f-1ccc-41df-8152-776d9160e6b5-1752716206296.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:36:46.481")
  },
  {
    id: "66872205-bf69-4b66-a4bb-3cbffa5ef955",
    clerkId: "user_2zygHXhCJOyzWlOu3dzAHdz5g97",
    appwriteId: "6878369f0013a3f11b71",
    email: "ishakapoor283@gmail.com",
    emailVerified: true,
    firstName: "Isha",
    lastName: "Kapoor",
    role: "Staff",
    pan: "MPHTR2987E",
    aadhaar: "321098765432",
    phone: "8855223344",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-66872205-bf69-4b66-a4bb-3cbffa5ef955-1752717040023.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:50:40.326")
  },
  {
    id: "7a03787f-1e38-4db1-933f-5b50a7a6b6c7",
    clerkId: "user_2zyi9fr6pJLdlzpKOIuHaQzR6L9",
    appwriteId: "687837a100280b0bd90f",
    email: "pathak.soham23@gmail.com",
    emailVerified: true,
    firstName: "Soham",
    lastName: "Pathak",
    role: "Staff",
    pan: "GHZTK9832P",
    aadhaar: "123456789012",
    phone: "9078563412",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-7a03787f-1e38-4db1-933f-5b50a7a6b6c7-1752717255636.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:54:15.743")
  },
  {
    id: "83b54612-9de5-4331-9013-e5cef5156247",
    clerkId: "user_2zyhneIGhIKpRfAI4gLNz3kNrbL",
    appwriteId: "68783889002aab2a3efd",
    email: "saurabhrane34@yahoo.com",
    emailVerified: true,
    firstName: "Saurabh",
    lastName: "Rane",
    role: "Manager",
    pan: "AIXPR7382B",
    aadhaar: "472890421671",
    phone: "8899332211",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-83b54612-9de5-4331-9013-e5cef5156247-1752716609644.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:43:30.019")
  },
  {
    id: "a63e2909-851c-4da0-83d8-f973b4674638",
    clerkId: "user_2zzH8KJwRZzChXpVBaHUmkNBDvt",
    appwriteId: "68787cc80008313cbdbe",
    email: "nehabansal@outlook.com",
    emailVerified: true,
    firstName: "Neha",
    lastName: "Bansal",
    role: "Owner",
    pan: "BNZPB7389K",
    aadhaar: "781293450671",
    phone: "9837245123",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-a63e2909-851c-4da0-83d8-f973b4674638-1752727382048.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 04:43:02.182")
  },
  {
    id: "e0ba6614-151d-439b-9dc6-4a5b7d713f90",
    clerkId: "user_2zyi3jAvPtPu3y4JisoB2qXVokC",
    appwriteId: "687837c7000e123f9317",
    email: "pooja.sinha24@gmail.com",
    emailVerified: true,
    firstName: "Pooja",
    lastName: "Sinha",
    role: "Staff",
    pan: "DFVPK8392L",
    aadhaar: "545454545454",
    phone: "9001122334",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-e0ba6614-151d-439b-9dc6-4a5b7d713f90-1752717458027.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:57:38.118")
  },
  {
    id: "e1730007-622e-44e5-b7be-9c48fb5f2b94",
    clerkId: "user_2zNMfWtXyZ0HgQJZkpp6TzS9884",
    appwriteId: "6866cb140035f9e975b0",
    email: "joshiamatya@gmail.com",
    emailVerified: true,
    firstName: "Amatya",
    lastName: "Joshi",
    role: "Owner",
    pan: "CDF342657H",
    aadhaar: "993488854934",
    phone: "9764588609",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-e1730007-622e-44e5-b7be-9c48fb5f2b94-1752726542426.png",
    createdAt: new Date("2025-07-03 18:26:21.229"),
    updatedAt: new Date("2025-07-17 04:29:02.536")
  },
  {
    id: "e1dee9f2-c39c-42ba-b17c-740e618fdf41",
    clerkId: "user_2zynP7j7GhU22DNREDMvPyKu0DV",
    appwriteId: "68783ffe0016613cfdf9",
    email: "workwithamatya@gmail.com",
    emailVerified: true,
    firstName: "Drew",
    lastName: "Sommar",
    role: "Staff",
    pan: "CGF230923J",
    aadhaar: "898982398902",
    phone: "9992001989",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-e1dee9f2-c39c-42ba-b17c-740e618fdf41-1752717364520.png",
    createdAt: new Date("2025-07-17 00:29:12.22"),
    updatedAt: new Date("2025-07-17 01:56:04.624")
  },
  {
    id: "f5f7f949-63f1-4441-be8b-fc7d3ab641ac",
    clerkId: "user_2zyhz5xUn79Mrs40VGRyhoibzXd",
    appwriteId: "6878381600353d63eca5",
    email: "arjunchatterjee@gmail.com",
    emailVerified: true,
    firstName: "Arjun",
    lastName: "Chatterjee",
    role: "Staff",
    pan: "CPMPK9021F",
    aadhaar: "786543210987",
    phone: "9988776655",
    address: "",
    photoUrl: "https://retailedgestorage.blob.core.windows.net/user-avatars/user-avatar-f5f7f949-63f1-4441-be8b-fc7d3ab641ac-1752717103404.png",
    createdAt: new Date("2025-07-17 00:00:00"),
    updatedAt: new Date("2025-07-17 01:51:43.507")
  }
];

async function resetUsersTable() {
  try {
    console.log('=== RESETTING USERS TABLE ===');
    
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    // Step 1: Delete all existing users
    console.log('\n🗑️  Deleting all existing users...');
    const deleteResult = await supabasePrisma.users.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing users`);
    
    // Step 2: Insert all new users
    console.log('\n📝 Inserting new users...');
    const insertResult = await supabasePrisma.users.createMany({
      data: usersData,
      skipDuplicates: false
    });
    console.log(`✅ Inserted ${insertResult.count} new users`);
    
    // Step 3: Verify the data
    console.log('\n🔍 Verifying data...');
    const allUsers = await supabasePrisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        clerkId: true
      },
      orderBy: { firstName: 'asc' }
    });
    
    console.log('\n=== VERIFICATION ===');
    console.log(`Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - Clerk ID: ${user.clerkId}`);
    });
    
    // Step 4: Check for the specific user that was causing issues
    const specificUser = await supabasePrisma.users.findUnique({
      where: { clerkId: 'user_2zNMfWtXyZ0HgQJZkpp6TzS9884' }
    });
    
    if (specificUser) {
      console.log('\n✅ The problematic user is now in the database:');
      console.log(`- ${specificUser.firstName} ${specificUser.lastName} (${specificUser.email})`);
    } else {
      console.log('\n❌ The problematic user was not found!');
    }
    
    console.log('\n🎉 Users table reset completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

resetUsersTable(); 