"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const URI = 'http://localhost:8080/api/user/1';
function fetchUser() {
    try {
        axios_1.default.get(URI)
            .then((response) => console.log('Retrieved User: ' + JSON.stringify(response.data)));
    }
    catch (error) {
        console.log("ERROR: " + error);
    }
}
fetchUser();
//# sourceMappingURL=client-rest.js.map