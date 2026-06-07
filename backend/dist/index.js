"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const phases_1 = __importDefault(require("./routes/phases"));
const scheduler_1 = __importDefault(require("./routes/scheduler"));
const finance_1 = __importDefault(require("./routes/finance"));
const resources_1 = __importDefault(require("./routes/resources"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/phases', phases_1.default);
app.use('/api/scheduler', scheduler_1.default);
app.use('/api/finance', finance_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/users', users_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`SSMS Backend running on port ${PORT}`);
});
