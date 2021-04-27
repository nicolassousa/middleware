"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
class ApiKeyAuthenticatedService extends service_1.default {
    constructor(client) {
        super(client);
        this.apiKeyRequired = true;
    }
}
exports.default = ApiKeyAuthenticatedService;
//# sourceMappingURL=apiKeyAuthenticatedService.js.map