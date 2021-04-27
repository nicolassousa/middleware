import Service from "../../../service";
import Resource from "../../resource";
declare class PaymentLinksId extends Resource {
    static _id: string;
    constructor(service: Service);
    set id(id: string);
}
export default PaymentLinksId;
