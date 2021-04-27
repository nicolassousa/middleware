"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(options = {}) {
        if (options.username)
            this.username = options.username;
        if (options.password)
            this.password = options.password;
        if (options.merchantAccount)
            this.merchantAccount = options.merchantAccount;
        if (options.environment)
            this.environment = options.environment;
        if (options.endpoint)
            this.endpoint = options.endpoint;
        if (options.marketPayEndpoint)
            this.marketPayEndpoint = options.marketPayEndpoint;
        if (options.applicationName)
            this.applicationName = options.applicationName;
        if (options.apiKey)
            this.apiKey = options.apiKey;
        if (options.connectionTimeoutMillis)
            this.connectionTimeoutMillis = options.connectionTimeoutMillis || 30000;
        if (options.readTimeoutMillis)
            this.readTimeoutMillis = options.readTimeoutMillis || 3000;
        if (options.certificatePath)
            this.certificatePath = options.certificatePath;
        if (options.hppEndpoint)
            this.hppEndpoint = options.hppEndpoint;
        if (options.skinCode)
            this.skinCode = options.skinCode;
        if (options.hmacKey)
            this.hmacKey = options.hmacKey;
        if (options.checkoutEndpoint)
            this._checkoutEndpoint = options.checkoutEndpoint;
        if (options.terminalApiCloudEndpoint)
            this.terminalApiCloudEndpoint = options.terminalApiCloudEndpoint;
        if (options.terminalApiLocalEndpoint)
            this.terminalApiLocalEndpoint = options.terminalApiLocalEndpoint;
    }
    set checkoutEndpoint(checkoutEndpoint) {
        this._checkoutEndpoint = checkoutEndpoint;
    }
    get checkoutEndpoint() {
        if (!this._checkoutEndpoint) {
            const message = "Please provide your unique live url prefix on the setEnvironment() call on the Client or provide checkoutEndpoint in your config object.";
            throw new Error(message);
        }
        else {
            return this._checkoutEndpoint;
        }
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map