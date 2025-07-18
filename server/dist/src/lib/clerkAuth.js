"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClerkUser = createClerkUser;
exports.authenticateClerkUser = authenticateClerkUser;
const clerk_sdk_node_1 = __importDefault(require("@clerk/clerk-sdk-node"));
async function createClerkUser({ email, password, firstName, lastName }) {
    if (!process.env.CLERK_SECRET_KEY) {
        throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }
    return clerk_sdk_node_1.default.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
    });
}
async function authenticateClerkUser({ email, password }) {
    // Clerk does not provide direct password authentication in the backend SDK.
    // You should use Clerk's frontend SDK for session creation, or use the API for verification.
    // Here, we just fetch the user by email for backend checks.
    const users = await clerk_sdk_node_1.default.users.getUserList({ emailAddress: [email] });
    if (users.length === 0)
        throw new Error('User not found');
    return users[0];
}
