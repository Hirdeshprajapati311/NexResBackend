"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};
startServer();
