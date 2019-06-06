"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
var errors_1 = require("./errors");
var DgraphClientStub = (function () {
    function DgraphClientStub(addr, legacyApi) {
        if (addr === undefined) {
            this.addr = "http://localhost:8080";
        }
        else {
            this.addr = addr;
        }
        this.legacyApi = !!legacyApi;
    }
    DgraphClientStub.prototype.alter = function (op) {
        var body;
        if (op.schema !== undefined) {
            body = op.schema;
        }
        else if (op.dropAttr !== undefined) {
            body = JSON.stringify({ drop_attr: op.dropAttr });
        }
        else if (op.dropAll) {
            body = JSON.stringify({ drop_all: true });
        }
        else {
            return Promise.reject("Invalid op argument in alter");
        }
        return this.callAPI("alter", {
            method: "POST",
            body: body,
        });
    };
    DgraphClientStub.prototype.query = function (req) {
        var headers = {};
        if (req.vars !== undefined) {
            if (this.legacyApi) {
                headers["X-Dgraph-Vars"] = JSON.stringify(req.vars);
            }
            else {
                headers["Content-Type"] = "application/json";
                req.query = JSON.stringify({
                    query: req.query,
                    variables: req.vars,
                });
            }
        }
        if (headers["Content-Type"] === undefined) {
            headers["Content-Type"] = "application/graphqlpm";
        }
        var startTs = req.startTs === 0
            ? ""
            : (!this.legacyApi ? "?startTs=" + req.startTs : "/" + req.startTs);
        return this.callAPI("query" + startTs, {
            method: "POST",
            body: req.query,
            headers: headers,
        });
    };
    DgraphClientStub.prototype.mutate = function (mu) {
        var body;
        var usingJSON = false;
        if (mu.setJson !== undefined || mu.deleteJson !== undefined) {
            usingJSON = true;
            var obj = {};
            if (mu.setJson !== undefined) {
                obj.set = mu.setJson;
            }
            if (mu.deleteJson !== undefined) {
                obj.delete = mu.deleteJson;
            }
            body = JSON.stringify(obj);
        }
        else if (mu.setNquads !== undefined || mu.deleteNquads !== undefined) {
            body = "{\n                " + (mu.setNquads === undefined ? "" : "set {\n                    " + mu.setNquads + "\n                }") + "\n                " + (mu.deleteNquads === undefined ? "" : "delete {\n                    " + mu.deleteNquads + "\n                }") + "\n            }";
        }
        else {
            return Promise.reject("Mutation has no data");
        }
        var headers = {
            "Content-Type": "application/" + (usingJSON ? "json" : "rdf"),
        };
        if (usingJSON && this.legacyApi) {
            headers["X-Dgraph-MutationType"] = "json";
        }
        var url = "mutate";
        var nextDelim = "?";
        if (mu.startTs > 0) {
            url += (!this.legacyApi ? "?startTs=" : "/") + mu.startTs.toString();
            nextDelim = "&";
        }
        if (mu.commitNow) {
            if (!this.legacyApi) {
                url += nextDelim + "commitNow=true";
            }
            else {
                headers["X-Dgraph-CommitNow"] = "true";
            }
        }
        return this.callAPI(url, {
            method: "POST",
            body: body,
            headers: headers,
        });
    };
    DgraphClientStub.prototype.commit = function (ctx) {
        var body;
        if (ctx.keys === undefined) {
            body = "[]";
        }
        else {
            body = JSON.stringify(ctx.keys);
        }
        var url = !this.legacyApi
            ? "commit?startTs=" + ctx.start_ts
            : "commit/" + ctx.start_ts;
        return this.callAPI(url, {
            method: "POST",
            body: body,
        });
    };
    DgraphClientStub.prototype.abort = function (ctx) {
        var url = !this.legacyApi
            ? "commit?startTs=" + ctx.start_ts + "&abort=true"
            : "/abort/" + ctx.start_ts;
        return this.callAPI(url, { method: "POST" });
    };
    DgraphClientStub.prototype.health = function () {
        return fetch(this.getURL("health"), {
            method: "GET",
        })
            .then(function (response) {
            if (response.status >= 300 || response.status < 200) {
                throw new Error("Invalid status code = " + response.status);
            }
            return response.text();
        });
    };
    DgraphClientStub.prototype.login = function (userid, password, refreshJWT) {
        return __awaiter(this, void 0, void 0, function () {
            var body, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.legacyApi) {
                            throw new Error("Pre v1.1 clients do not support Login methods");
                        }
                        body = {};
                        if (userid === undefined && this.refreshJWT === undefined) {
                            throw new Error("Cannot find login details: neither userid/password nor refresh token are specified");
                        }
                        if (userid === undefined) {
                            body.refresh_token = refreshJWT !== undefined ? refreshJWT : this.refreshJWT;
                        }
                        else {
                            body.userid = userid;
                            body.password = password;
                        }
                        return [4, this.callAPI("login", {
                                method: "POST",
                                body: JSON.stringify(body),
                            })];
                    case 1:
                        res = _a.sent();
                        this.accessJWT = res.data.accessJWT;
                        this.refreshJWT = res.data.refreshJWT;
                        return [2, true];
                }
            });
        });
    };
    DgraphClientStub.prototype.callAPI = function (path, config) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = this.getURL(path);
                if (this.accessJWT !== undefined) {
                    config.headers = config.headers !== undefined ? config.headers : {};
                    config.headers["X-Dgraph-AccessToken"] = this.accessJWT;
                }
                return [2, fetch(url, config)
                        .then(function (response) {
                        if (response.status >= 300 || response.status < 200) {
                            throw new Error("Invalid status code = " + response.status);
                        }
                        return response.json();
                    })
                        .then(function (json) {
                        var errors = json.errors;
                        if (errors !== undefined) {
                            throw new errors_1.APIError(url, errors);
                        }
                        return json;
                    })];
            });
        });
    };
    DgraphClientStub.prototype.getURL = function (path) {
        return "" + this.addr + (this.addr.endsWith("/") ? "" : "/") + path;
    };
    return DgraphClientStub;
}());
exports.DgraphClientStub = DgraphClientStub;