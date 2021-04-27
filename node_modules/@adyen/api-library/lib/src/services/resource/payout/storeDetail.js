"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *                       ######
 *                       ######
 * ############    ####( ######  #####. ######  ############   ############
 * #############  #####( ######  #####. ######  #############  #############
 *        ######  #####( ######  #####. ######  #####  ######  #####  ######
 * ###### ######  #####( ######  #####. ######  #####  #####   #####  ######
 * ###### ######  #####( ######  #####. ######  #####          #####  ######
 * #############  #############  #############  #############  #####  ######
 *  ############   ############  #############   ############  #####  ######
 *                                      ######
 *                               #############
 *                               ############
 * Adyen NodeJS API Library
 * Copyright (c) 2020 Adyen B.V.
 * This file is open source and available under the MIT license.
 * See the LICENSE file for more info.
 */
const resource_1 = __importDefault(require("../../resource"));
const client_1 = __importDefault(require("../../../client"));
class StoreDetail extends resource_1.default {
    constructor(service) {
        super(service, `${service.client.config.endpoint}/pal/servlet/Payout/${client_1.default.API_VERSION}/storeDetail`);
    }
}
exports.default = StoreDetail;
//# sourceMappingURL=storeDetail.js.map