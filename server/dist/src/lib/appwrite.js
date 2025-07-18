"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = exports.Databases = exports.Storage = exports.Locale = exports.Avatars = exports.Teams = exports.Functions = exports.ID = exports.Account = exports.Users = void 0;
const node_appwrite_1 = require("node-appwrite");
Object.defineProperty(exports, "Databases", { enumerable: true, get: function () { return node_appwrite_1.Databases; } });
Object.defineProperty(exports, "ID", { enumerable: true, get: function () { return node_appwrite_1.ID; } });
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return node_appwrite_1.Query; } });
Object.defineProperty(exports, "Users", { enumerable: true, get: function () { return node_appwrite_1.Users; } });
Object.defineProperty(exports, "Account", { enumerable: true, get: function () { return node_appwrite_1.Account; } });
Object.defineProperty(exports, "Functions", { enumerable: true, get: function () { return node_appwrite_1.Functions; } });
Object.defineProperty(exports, "Teams", { enumerable: true, get: function () { return node_appwrite_1.Teams; } });
Object.defineProperty(exports, "Avatars", { enumerable: true, get: function () { return node_appwrite_1.Avatars; } });
Object.defineProperty(exports, "Locale", { enumerable: true, get: function () { return node_appwrite_1.Locale; } });
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return node_appwrite_1.Storage; } });
const appwriteClient = new node_appwrite_1.Client();
appwriteClient
    .setEndpoint(process.env.APPWRITE_ENDPOINT || '')
    .setProject(process.env.APPWRITE_PROJECT_ID || '');
exports.default = appwriteClient;
