/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var MetricTypes = {
    STRING: 1,
    NUMBER: 2,
    TIMESTAMP: 3,
    OBJECT: 4
};

function getMetricTypeByValue(metric) {
    if (metric.type === MetricTypes.TIMESTAMP) {
        return "timestamp";
    }
    else if (metric.type === MetricTypes.NUMBER) {
        return "number";
    }
    else if (metric.type === MetricTypes.STRING) {
        return "string";
    }
    else if (metric.type === MetricTypes.OBJECT) {
        return "object";
    }
    return "unknown";
}
function getTypeByValue(value) {
    if (value.constructor === Date) {
        return "timestamp";
    }
    else if (typeof value === "number") {
        return "number";
    }
    else if (typeof value === "string") {
        return "string";
    }
    else if (typeof value === "object") {
        return "object";
    }
    else {
        return "string";
    }
}
function serializeMetric(metric) {
    var serializedMetrics = {};
    var type = getMetricTypeByValue(metric);
    if (type === "object") {
        var values = Object.keys(metric.value).reduce(function (memo, key) {
            var innerType = getTypeByValue(metric.value[key]);
            if (innerType === "object") {
                var composite = defineNestedComposite(metric.value[key]);
                memo[key] = {
                    type: "object",
                    description: "",
                    context: {},
                    composite: composite,
                };
            }
            else {
                memo[key] = {
                    type: innerType,
                    description: "",
                    context: {},
                };
            }
            return memo;
        }, {});
        serializedMetrics.composite = values;
    }
    serializedMetrics.name = normalizeMetricName(metric.path.join("/") + "/" + metric.name);
    serializedMetrics.type = type;
    serializedMetrics.description = metric.description;
    serializedMetrics.context = {};
    return serializedMetrics;
}
function defineNestedComposite(values) {
    return Object.keys(values).reduce(function (memo, key) {
        var type = getTypeByValue(values[key]);
        if (type === "object") {
            memo[key] = {
                type: "object",
                description: "",
                context: {},
                composite: defineNestedComposite(values[key]),
            };
        }
        else {
            memo[key] = {
                type: type,
                description: "",
                context: {},
            };
        }
        return memo;
    }, {});
}
function normalizeMetricName(name) {
    if (typeof name !== "undefined" && name.length > 0 && name[0] !== "/") {
        return "/" + name;
    }
    else {
        return name;
    }
}
function getMetricValueByType(metric) {
    var type = getMetricTypeByValue(metric);
    if (type === "timestamp") {
        return Date.now();
    }
    else {
        return publishNestedComposite(metric.value);
    }
}
function publishNestedComposite(values) {
    if (typeof values !== "object") {
        return values;
    }
    return Object.keys(values).reduce(function (memo, key) {
        var value = values[key];
        if (typeof value === "object" && value.constructor !== Date) {
            memo[key] = publishNestedComposite(value);
        }
        else if (value.constructor === Date) {
            memo[key] = new Date(value).getTime();
        }
        else if (value.constructor === Boolean) {
            memo[key] = value.toString();
        }
        else {
            memo[key] = value;
        }
        return memo;
    }, {});
}
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
function getHighestState(arr) {
    return arr.sort(function (a, b) {
        if (!a.state) {
            return 1;
        }
        if (!b.state) {
            return -1;
        }
        return b.state - a.state;
    })[0];
}
function aggregateDescription(arr) {
    var msg = "";
    arr.forEach(function (m, idx, a) {
        var path = m.path.join(".");
        if (idx === a.length - 1) {
            msg += path + "." + m.name + ": " + m.description;
        }
        else {
            msg += path + "." + m.name + ": " + m.description + ",";
        }
    });
    if (msg.length > 100) {
        return msg.slice(0, 100) + "...";
    }
    else {
        return msg;
    }
}
function composeMsgForRootStateMetric(system) {
    var aggregatedState = system.root.getAggregateState();
    var merged = flatten(aggregatedState);
    var highestState = getHighestState(merged);
    var aggregateDesc = aggregateDescription(merged);
    return {
        description: aggregateDesc,
        value: highestState.state,
    };
}

function gw3 (connection, config) {
    var _this = this;
    if (!connection || typeof connection !== "object") {
        throw new Error("Connection is required parameter");
    }
    var joinPromise;
    var session;
    var init = function (repo) {
        var resolveReadyPromise;
        joinPromise = new Promise(function (resolve) {
            resolveReadyPromise = resolve;
        });
        session = connection.domain("metrics");
        session.onJoined(function (reconnect) {
            if (!reconnect && resolveReadyPromise) {
                resolveReadyPromise();
                resolveReadyPromise = undefined;
            }
            var rootStateMetric = {
                name: "/State",
                type: "object",
                composite: {
                    Description: {
                        type: "string",
                        description: "",
                    },
                    Value: {
                        type: "number",
                        description: "",
                    },
                },
                description: "System state",
                context: {},
            };
            var defineRootMetricsMsg = {
                type: "define",
                metrics: [rootStateMetric],
            };
            session.send(defineRootMetricsMsg);
            if (reconnect) {
                replayRepo(repo);
            }
        });
        session.join({
            system: config.system,
            service: config.service,
            instance: config.instance
        });
    };
    var replayRepo = function (repo) {
        replaySystem(repo.root);
    };
    var replaySystem = function (system) {
        createSystem(system);
        system.metrics.forEach(function (m) {
            createMetric(m);
        });
        system.subSystems.forEach(function (ss) {
            replaySystem(ss);
        });
    };
    var createSystem = function (system) { return __awaiter(_this, void 0, void 0, function () {
        var metric, createMetricsMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (system.parent === undefined) {
                        return [2];
                    }
                    return [4, joinPromise];
                case 1:
                    _a.sent();
                    metric = {
                        name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                        type: "object",
                        composite: {
                            Description: {
                                type: "string",
                                description: "",
                            },
                            Value: {
                                type: "number",
                                description: "",
                            },
                        },
                        description: "System state",
                        context: {},
                    };
                    createMetricsMsg = {
                        type: "define",
                        metrics: [metric],
                    };
                    session.send(createMetricsMsg);
                    return [2];
            }
        });
    }); };
    var updateSystem = function (system, state) { return __awaiter(_this, void 0, void 0, function () {
        var shadowedUpdateMetric, stateObj, rootMetric;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, joinPromise];
                case 1:
                    _a.sent();
                    shadowedUpdateMetric = {
                        type: "publish",
                        values: [{
                                name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                                value: {
                                    Description: state.description,
                                    Value: state.state,
                                },
                                timestamp: Date.now(),
                            }],
                    };
                    session.send(shadowedUpdateMetric);
                    stateObj = composeMsgForRootStateMetric(system);
                    rootMetric = {
                        type: "publish",
                        peer_id: connection.peerId,
                        values: [{
                                name: "/State",
                                value: {
                                    Description: stateObj.description,
                                    Value: stateObj.value,
                                },
                                timestamp: Date.now(),
                            }],
                    };
                    session.send(rootMetric);
                    return [2];
            }
        });
    }); };
    var createMetric = function (metric) { return __awaiter(_this, void 0, void 0, function () {
        var metricClone, m, createMetricsMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metricClone = cloneMetric(metric);
                    return [4, joinPromise];
                case 1:
                    _a.sent();
                    m = serializeMetric(metricClone);
                    createMetricsMsg = {
                        type: "define",
                        metrics: [m],
                    };
                    session.send(createMetricsMsg);
                    if (typeof metricClone.value !== "undefined") {
                        updateMetricCore(metricClone);
                    }
                    return [2];
            }
        });
    }); };
    var updateMetric = function (metric) { return __awaiter(_this, void 0, void 0, function () {
        var metricClone;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metricClone = cloneMetric(metric);
                    return [4, joinPromise];
                case 1:
                    _a.sent();
                    updateMetricCore(metricClone);
                    return [2];
            }
        });
    }); };
    var updateMetricCore = function (metric) {
        if (canUpdate()) {
            var value = getMetricValueByType(metric);
            var publishMetricsMsg = {
                type: "publish",
                values: [{
                        name: normalizeMetricName(metric.path.join("/") + "/" + metric.name),
                        value: value,
                        timestamp: Date.now(),
                    }],
            };
            return session.sendFireAndForget(publishMetricsMsg);
        }
        return Promise.resolve();
    };
    var cloneMetric = function (metric) {
        var metricClone = __assign({}, metric);
        if (typeof metric.value === "object" && metric.value !== null) {
            metricClone.value = __assign({}, metric.value);
        }
        return metricClone;
    };
    var canUpdate = function () {
        var _a;
        try {
            var func = (_a = config.canUpdateMetric) !== null && _a !== void 0 ? _a : (function () { return true; });
            return func();
        }
        catch (_b) {
            return true;
        }
    };
    return {
        init: init,
        createSystem: createSystem,
        updateSystem: updateSystem,
        createMetric: createMetric,
        updateMetric: updateMetric,
    };
}

var Helpers = {
    validate: function (definition, parent, transport) {
        if (definition === null || typeof definition !== "object") {
            throw new Error("Missing definition");
        }
        if (parent === null || typeof parent !== "object") {
            throw new Error("Missing parent");
        }
        if (transport === null || typeof transport !== "object") {
            throw new Error("Missing transport");
        }
    },
};

var BaseMetric = (function () {
    function BaseMetric(definition, system, transport, value, type) {
        this.definition = definition;
        this.system = system;
        this.transport = transport;
        this.value = value;
        this.type = type;
        this.path = [];
        Helpers.validate(definition, system, transport);
        this.path = system.path.slice(0);
        this.path.push(system.name);
        this.name = definition.name;
        this.description = definition.description;
        transport.createMetric(this);
    }
    Object.defineProperty(BaseMetric.prototype, "repo", {
        get: function () {
            var _a;
            return (_a = this.system) === null || _a === void 0 ? void 0 : _a.repo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseMetric.prototype, "id", {
        get: function () { return this.system.path + "/" + name; },
        enumerable: true,
        configurable: true
    });
    BaseMetric.prototype.update = function (newValue) {
        this.value = newValue;
        return this.transport.updateMetric(this);
    };
    return BaseMetric;
}());

var NumberMetric = (function (_super) {
    __extends(NumberMetric, _super);
    function NumberMetric(definition, system, transport, value) {
        return _super.call(this, definition, system, transport, value, MetricTypes.NUMBER) || this;
    }
    NumberMetric.prototype.incrementBy = function (num) {
        this.update(this.value + num);
    };
    NumberMetric.prototype.increment = function () {
        this.incrementBy(1);
    };
    NumberMetric.prototype.decrement = function () {
        this.incrementBy(-1);
    };
    NumberMetric.prototype.decrementBy = function (num) {
        this.incrementBy(num * -1);
    };
    return NumberMetric;
}(BaseMetric));

var ObjectMetric = (function (_super) {
    __extends(ObjectMetric, _super);
    function ObjectMetric(definition, system, transport, value) {
        return _super.call(this, definition, system, transport, value, MetricTypes.OBJECT) || this;
    }
    ObjectMetric.prototype.update = function (newValue) {
        this.mergeValues(newValue);
        return this.transport.updateMetric(this);
    };
    ObjectMetric.prototype.mergeValues = function (values) {
        var _this = this;
        return Object.keys(this.value).forEach(function (k) {
            if (typeof values[k] !== "undefined") {
                _this.value[k] = values[k];
            }
        });
    };
    return ObjectMetric;
}(BaseMetric));

var StringMetric = (function (_super) {
    __extends(StringMetric, _super);
    function StringMetric(definition, system, transport, value) {
        return _super.call(this, definition, system, transport, value, MetricTypes.STRING) || this;
    }
    return StringMetric;
}(BaseMetric));

var TimestampMetric = (function (_super) {
    __extends(TimestampMetric, _super);
    function TimestampMetric(definition, system, transport, value) {
        return _super.call(this, definition, system, transport, value, MetricTypes.TIMESTAMP) || this;
    }
    TimestampMetric.prototype.now = function () {
        this.update(new Date());
    };
    return TimestampMetric;
}(BaseMetric));

function system(name, repo, protocol, parent, description) {
    if (!repo) {
        throw new Error("Repository is required");
    }
    if (!protocol) {
        throw new Error("Transport is required");
    }
    var _transport = protocol;
    var _name = name;
    var _description = description || "";
    var _repo = repo;
    var _parent = parent;
    var _path = _buildPath(parent);
    var _state = {};
    var id = _arrayToString(_path, "/") + name;
    var root = repo.root;
    var _subSystems = [];
    var _metrics = [];
    function subSystem(nameSystem, descriptionSystem) {
        if (!nameSystem || nameSystem.length === 0) {
            throw new Error("name is required");
        }
        var match = _subSystems.filter(function (s) { return s.name === nameSystem; });
        if (match.length > 0) {
            return match[0];
        }
        var _system = system(nameSystem, _repo, _transport, me, descriptionSystem);
        _subSystems.push(_system);
        return _system;
    }
    function setState(state, stateDescription) {
        _state = { state: state, description: stateDescription };
        _transport.updateSystem(me, _state);
    }
    function stringMetric(definition, value) {
        return _getOrCreateMetric(definition, MetricTypes.STRING, value, function (metricDef) { return new StringMetric(metricDef, me, _transport, value); });
    }
    function numberMetric(definition, value) {
        return _getOrCreateMetric(definition, MetricTypes.NUMBER, value, function (metricDef) { return new NumberMetric(metricDef, me, _transport, value); });
    }
    function objectMetric(definition, value) {
        return _getOrCreateMetric(definition, MetricTypes.OBJECT, value, function (metricDef) { return new ObjectMetric(metricDef, me, _transport, value); });
    }
    function timestampMetric(definition, value) {
        return _getOrCreateMetric(definition, MetricTypes.TIMESTAMP, value, function (metricDef) { return new TimestampMetric(metricDef, me, _transport, value); });
    }
    function _getOrCreateMetric(metricObject, expectedType, value, createMetric) {
        var metricDef = { name: "" };
        if (typeof metricObject === "string") {
            metricDef = { name: metricObject };
        }
        else {
            metricDef = metricObject;
        }
        var matching = _metrics.filter(function (shadowedMetric) { return shadowedMetric.name === metricDef.name; });
        if (matching.length > 0) {
            var existing = matching[0];
            if (existing.type !== expectedType) {
                throw new Error("A metric named " + metricDef.name + " is already defined with different type.");
            }
            if (typeof value !== "undefined") {
                existing
                    .update(value)
                    .catch(function () { });
            }
            return existing;
        }
        var metric = createMetric(metricDef);
        _metrics.push(metric);
        return metric;
    }
    function _buildPath(shadowedSystem) {
        if (!shadowedSystem || !shadowedSystem.parent) {
            return [];
        }
        var path = _buildPath(shadowedSystem.parent);
        path.push(shadowedSystem.name);
        return path;
    }
    function _arrayToString(path, separator) {
        return ((path && path.length > 0) ? path.join(separator) : "");
    }
    function getAggregateState() {
        var aggState = [];
        if (Object.keys(_state).length > 0) {
            aggState.push({
                name: _name,
                path: _path,
                state: _state.state,
                description: _state.description,
            });
        }
        _subSystems.forEach(function (shadowedSubSystem) {
            var result = shadowedSubSystem.getAggregateState();
            if (result.length > 0) {
                aggState.push.apply(aggState, result);
            }
        });
        return aggState;
    }
    var me = {
        get name() {
            return _name;
        },
        get description() {
            return _description;
        },
        get repo() {
            return _repo;
        },
        get parent() {
            return _parent;
        },
        path: _path,
        id: id,
        root: root,
        get subSystems() {
            return _subSystems;
        },
        get metrics() {
            return _metrics;
        },
        subSystem: subSystem,
        getState: function () {
            return _state;
        },
        setState: setState,
        stringMetric: stringMetric,
        timestampMetric: timestampMetric,
        objectMetric: objectMetric,
        numberMetric: numberMetric,
        getAggregateState: getAggregateState,
    };
    _transport.createSystem(me);
    return me;
}

var Repository = (function () {
    function Repository(options, protocol) {
        protocol.init(this);
        this.root = system("", this, protocol);
        this.addSystemMetrics(this.root, options.clickStream || options.clickStream === undefined);
    }
    Repository.prototype.addSystemMetrics = function (rootSystem, useClickStream) {
        if (typeof navigator !== "undefined") {
            rootSystem.stringMetric("UserAgent", navigator.userAgent);
        }
        if (useClickStream && typeof document !== "undefined") {
            var clickStream_1 = rootSystem.subSystem("ClickStream");
            var documentClickHandler = function (e) {
                var _a;
                if (!e.target) {
                    return;
                }
                var target = e.target;
                var className = target ? (_a = target.getAttribute("class")) !== null && _a !== void 0 ? _a : "" : "";
                clickStream_1.objectMetric("LastBrowserEvent", {
                    type: "click",
                    timestamp: new Date(),
                    target: {
                        className: className,
                        id: target.id,
                        type: "<" + target.tagName.toLowerCase() + ">",
                        href: target.href || "",
                    },
                });
            };
            clickStream_1.objectMetric("Page", {
                title: document.title,
                page: window.location.href,
            });
            if (document.addEventListener) {
                document.addEventListener("click", documentClickHandler);
            }
            else {
                document.attachEvent("onclick", documentClickHandler);
            }
        }
        rootSystem.stringMetric("StartTime", (new Date()).toString());
        var urlMetric = rootSystem.stringMetric("StartURL", "");
        var appNameMetric = rootSystem.stringMetric("AppName", "");
        if (typeof window !== "undefined") {
            if (typeof window.location !== "undefined") {
                var startUrl = window.location.href;
                urlMetric.update(startUrl);
            }
            if (typeof window.glue42gd !== "undefined") {
                appNameMetric.update(window.glue42gd.appName);
            }
        }
    };
    return Repository;
}());

var NullProtocol = (function () {
    function NullProtocol() {
    }
    NullProtocol.prototype.init = function (repo) {
    };
    NullProtocol.prototype.createSystem = function (system) {
        return Promise.resolve();
    };
    NullProtocol.prototype.updateSystem = function (metric, state) {
        return Promise.resolve();
    };
    NullProtocol.prototype.createMetric = function (metric) {
        return Promise.resolve();
    };
    NullProtocol.prototype.updateMetric = function (metric) {
        return Promise.resolve();
    };
    return NullProtocol;
}());

var PerfTracker = (function () {
    function PerfTracker(api, initialPublishTimeout, publishInterval) {
        this.api = api;
        this.lastCount = 0;
        this.initialPublishTimeout = 10 * 1000;
        this.publishInterval = 60 * 1000;
        this.initialPublishTimeout = initialPublishTimeout !== null && initialPublishTimeout !== void 0 ? initialPublishTimeout : this.initialPublishTimeout;
        this.publishInterval = publishInterval !== null && publishInterval !== void 0 ? publishInterval : this.publishInterval;
        this.scheduleCollection();
        this.system = this.api.subSystem("performance", "Performance data published by the web application");
    }
    PerfTracker.prototype.scheduleCollection = function () {
        var _this = this;
        setTimeout(function () {
            _this.collect();
            setInterval(function () {
                _this.collect();
            }, _this.publishInterval);
        }, this.initialPublishTimeout);
    };
    PerfTracker.prototype.collect = function () {
        try {
            this.collectMemory();
            this.collectEntries();
        }
        catch (_a) {
        }
    };
    PerfTracker.prototype.collectMemory = function () {
        var memory = window.performance.memory;
        this.system.stringMetric("memory", JSON.stringify({
            totalJSHeapSize: memory.totalJSHeapSize,
            usedJSHeapSize: memory.usedJSHeapSize
        }));
    };
    PerfTracker.prototype.collectEntries = function () {
        var allEntries = window.performance.getEntries();
        if (allEntries.length <= this.lastCount) {
            return;
        }
        this.lastCount = allEntries.length;
        var jsonfiedEntries = allEntries.map(function (i) { return i.toJSON(); });
        this.system.stringMetric("entries", JSON.stringify(jsonfiedEntries));
    };
    return PerfTracker;
}());

var metrics = (function (options) {
    var protocol;
    if (!options.connection || typeof options.connection !== "object") {
        protocol = new NullProtocol();
    }
    else {
        protocol = gw3(options.connection, options);
    }
    var repo = new Repository(options, protocol);
    var rootSystem = repo.root;
    if (!options.disableAutoAppSystem) {
        rootSystem = rootSystem.subSystem("App");
    }
    var api = addFAVSupport(rootSystem);
    initPerf(api, options.pagePerformanceMetrics);
    return api;
});
function initPerf(api, config) {
    var _a, _b;
    if (typeof window === "undefined") {
        return;
    }
    var perfConfig = (_b = (_a = window === null || window === void 0 ? void 0 : window.glue42gd) === null || _a === void 0 ? void 0 : _a.metrics) === null || _b === void 0 ? void 0 : _b.pagePerformanceMetrics;
    if (perfConfig) {
        config = perfConfig;
    }
    if (config === null || config === void 0 ? void 0 : config.enabled) {
        new PerfTracker(api, config.initialPublishTimeout, config.publishInterval);
    }
}
function addFAVSupport(system) {
    var reportingSystem = system.subSystem("reporting");
    var def = {
        name: "features"
    };
    var featureMetric;
    var featureMetricFunc = function (name, action, payload) {
        if (typeof name === "undefined" || name === "") {
            throw new Error("name is mandatory");
        }
        else if (typeof action === "undefined" || action === "") {
            throw new Error("action is mandatory");
        }
        else if (typeof payload === "undefined" || payload === "") {
            throw new Error("payload is mandatory");
        }
        if (!featureMetric) {
            featureMetric = reportingSystem.objectMetric(def, { name: name, action: action, payload: payload });
        }
        else {
            featureMetric.update({
                name: name,
                action: action,
                payload: payload
            });
        }
    };
    system.featureMetric = featureMetricFunc;
    return system;
}

function createRegistry$1(options) {
    if (options && options.errorHandling
        && typeof options.errorHandling !== "function"
        && options.errorHandling !== "log"
        && options.errorHandling !== "silent"
        && options.errorHandling !== "throw") {
        throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
    }
    var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
    var callbacks = {};
    function add(key, callback, replayArgumentsArr) {
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey) {
            callbacksForKey = [];
            callbacks[key] = callbacksForKey;
        }
        callbacksForKey.push(callback);
        if (replayArgumentsArr) {
            setTimeout(function () {
                replayArgumentsArr.forEach(function (replayArgument) {
                    var _a;
                    if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                        try {
                            if (Array.isArray(replayArgument)) {
                                callback.apply(undefined, replayArgument);
                            }
                            else {
                                callback.apply(undefined, [replayArgument]);
                            }
                        }
                        catch (err) {
                            _handleError(err, key);
                        }
                    }
                });
            }, 0);
        }
        return function () {
            var allForKey = callbacks[key];
            if (!allForKey) {
                return;
            }
            allForKey = allForKey.reduce(function (acc, element, index) {
                if (!(element === callback && acc.length === index)) {
                    acc.push(element);
                }
                return acc;
            }, []);
            if (allForKey.length === 0) {
                delete callbacks[key];
            }
            else {
                callbacks[key] = allForKey;
            }
        };
    }
    function execute(key) {
        var argumentsArr = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argumentsArr[_i - 1] = arguments[_i];
        }
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey || callbacksForKey.length === 0) {
            return [];
        }
        var results = [];
        callbacksForKey.forEach(function (callback) {
            try {
                var result = callback.apply(undefined, argumentsArr);
                results.push(result);
            }
            catch (err) {
                results.push(undefined);
                _handleError(err, key);
            }
        });
        return results;
    }
    function _handleError(exceptionArtifact, key) {
        var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
        if (_userErrorHandler) {
            _userErrorHandler(errParam);
            return;
        }
        var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
        if (options) {
            switch (options.errorHandling) {
                case "log":
                    return console.error(msg);
                case "silent":
                    return;
                case "throw":
                    throw new Error(msg);
            }
        }
        console.error(msg);
    }
    function clear() {
        callbacks = {};
    }
    function clearKey(key) {
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey) {
            return;
        }
        delete callbacks[key];
    }
    return {
        add: add,
        execute: execute,
        clear: clear,
        clearKey: clearKey
    };
}
createRegistry$1.default = createRegistry$1;
var lib$2 = createRegistry$1;

var InProcTransport = (function () {
    function InProcTransport(settings, logger) {
        var _this = this;
        this.registry = lib$2();
        this.gw = settings.facade;
        this.gw.connect(function (_client, message) {
            _this.messageHandler(message);
        }).then(function (client) {
            _this.client = client;
        });
    }
    Object.defineProperty(InProcTransport.prototype, "isObjectBasedTransport", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    InProcTransport.prototype.sendObject = function (msg) {
        if (this.client) {
            this.client.send(msg);
            return Promise.resolve(undefined);
        }
        else {
            return Promise.reject("not connected");
        }
    };
    InProcTransport.prototype.send = function (_msg) {
        return Promise.reject("not supported");
    };
    InProcTransport.prototype.onMessage = function (callback) {
        return this.registry.add("onMessage", callback);
    };
    InProcTransport.prototype.onConnectedChanged = function (callback) {
        callback(true);
        return function () { };
    };
    InProcTransport.prototype.close = function () {
        return Promise.resolve();
    };
    InProcTransport.prototype.open = function () {
        return Promise.resolve();
    };
    InProcTransport.prototype.name = function () {
        return "in-memory";
    };
    InProcTransport.prototype.reconnect = function () {
        return Promise.resolve();
    };
    InProcTransport.prototype.messageHandler = function (msg) {
        this.registry.execute("onMessage", msg);
    };
    return InProcTransport;
}());

var SharedWorkerTransport = (function () {
    function SharedWorkerTransport(workerFile, logger) {
        var _this = this;
        this.logger = logger;
        this.registry = lib$2();
        this.worker = new SharedWorker(workerFile);
        this.worker.port.onmessage = function (e) {
            _this.messageHandler(e.data);
        };
    }
    Object.defineProperty(SharedWorkerTransport.prototype, "isObjectBasedTransport", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    SharedWorkerTransport.prototype.sendObject = function (msg) {
        this.worker.port.postMessage(msg);
        return Promise.resolve();
    };
    SharedWorkerTransport.prototype.send = function (_msg) {
        return Promise.reject("not supported");
    };
    SharedWorkerTransport.prototype.onMessage = function (callback) {
        return this.registry.add("onMessage", callback);
    };
    SharedWorkerTransport.prototype.onConnectedChanged = function (callback) {
        callback(true);
        return function () { };
    };
    SharedWorkerTransport.prototype.close = function () {
        return Promise.resolve();
    };
    SharedWorkerTransport.prototype.open = function () {
        return Promise.resolve();
    };
    SharedWorkerTransport.prototype.name = function () {
        return "shared-worker";
    };
    SharedWorkerTransport.prototype.reconnect = function () {
        return Promise.resolve();
    };
    SharedWorkerTransport.prototype.messageHandler = function (msg) {
        this.registry.execute("onMessage", msg);
    };
    return SharedWorkerTransport;
}());

var Utils$1 = (function () {
    function Utils() {
    }
    Utils.getGDMajorVersion = function () {
        if (typeof window === "undefined") {
            return undefined;
        }
        if (!window.glueDesktop) {
            return undefined;
        }
        if (!window.glueDesktop.version) {
            return undefined;
        }
        var ver = Number(window.glueDesktop.version.substr(0, 1));
        return isNaN(ver) ? undefined : ver;
    };
    Utils.isNode = function () {
        if (typeof Utils._isNode !== "undefined") {
            return Utils._isNode;
        }
        if (typeof window !== "undefined") {
            Utils._isNode = false;
            return false;
        }
        try {
            Utils._isNode = Object.prototype.toString.call(global.process) === "[object process]";
        }
        catch (e) {
            Utils._isNode = false;
        }
        return Utils._isNode;
    };
    return Utils;
}());

var PromiseWrapper = (function () {
    function PromiseWrapper() {
        var _this = this;
        this.rejected = false;
        this.resolved = false;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = function (t) {
                _this.resolved = true;
                resolve(t);
            };
            _this.reject = function (err) {
                _this.rejected = true;
                reject(err);
            };
        });
    }
    PromiseWrapper.delay = function (time) {
        return new Promise(function (resolve) { return setTimeout(resolve, time); });
    };
    Object.defineProperty(PromiseWrapper.prototype, "ended", {
        get: function () {
            return this.rejected || this.resolved;
        },
        enumerable: true,
        configurable: true
    });
    return PromiseWrapper;
}());

var timers = {};
function getAllTimers() {
    return timers;
}
function timer (timerName) {
    var existing = timers[timerName];
    if (existing) {
        return existing;
    }
    var marks = [];
    function now() {
        return new Date().getTime();
    }
    var startTime = now();
    mark("start", startTime);
    var endTime;
    var period;
    function stop() {
        endTime = now();
        mark("end", endTime);
        period = endTime - startTime;
        return period;
    }
    function mark(name, time) {
        var currentTime = time !== null && time !== void 0 ? time : now();
        var diff = 0;
        if (marks.length > 0) {
            diff = currentTime - marks[marks.length - 1].time;
        }
        marks.push({ name: name, time: currentTime, diff: diff });
    }
    var timerObj = {
        get startTime() {
            return startTime;
        },
        get endTime() {
            return endTime;
        },
        get period() {
            return period;
        },
        stop: stop,
        mark: mark,
        marks: marks
    };
    timers[timerName] = timerObj;
    return timerObj;
}

var WebSocketConstructor = Utils$1.isNode() ? require("ws") : window.WebSocket;
var WS = (function () {
    function WS(settings, logger) {
        this.startupTimer = timer("connection");
        this._running = true;
        this._registry = lib$2();
        this.wsRequests = [];
        this.settings = settings;
        this.logger = logger;
        if (!this.settings.ws) {
            throw new Error("ws is missing");
        }
    }
    WS.prototype.onMessage = function (callback) {
        return this._registry.add("onMessage", callback);
    };
    WS.prototype.send = function (msg, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.waitForSocketConnection(function () {
                var _a;
                try {
                    (_a = _this.ws) === null || _a === void 0 ? void 0 : _a.send(msg);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            }, reject);
        });
    };
    WS.prototype.open = function () {
        var _this = this;
        this.logger.info("opening ws...");
        this._running = true;
        return new Promise(function (resolve, reject) {
            _this.waitForSocketConnection(resolve, reject);
        });
    };
    WS.prototype.close = function () {
        this._running = false;
        if (this.ws) {
            this.ws.close();
        }
        return Promise.resolve();
    };
    WS.prototype.onConnectedChanged = function (callback) {
        return this._registry.add("onConnectedChanged", callback);
    };
    WS.prototype.name = function () {
        return this.settings.ws;
    };
    WS.prototype.reconnect = function () {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        var pw = new PromiseWrapper();
        this.waitForSocketConnection(function () {
            pw.resolve();
        });
        return pw.promise;
    };
    WS.prototype.waitForSocketConnection = function (callback, failed) {
        var _a;
        failed = failed !== null && failed !== void 0 ? failed : (function () { });
        if (!this._running) {
            failed("wait for socket on " + this.settings.ws + " failed - socket closed by user");
            return;
        }
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === 1) {
            callback();
            return;
        }
        this.wsRequests.push({ callback: callback, failed: failed });
        if (this.wsRequests.length > 1) {
            return;
        }
        this.openSocket();
    };
    WS.prototype.openSocket = function (retryInterval, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.startupTimer.mark("opening-socket");
                        if (retryInterval === undefined) {
                            retryInterval = this.settings.reconnectInterval;
                        }
                        if (typeof retriesLeft === "undefined") {
                            retriesLeft = this.settings.reconnectAttempts;
                        }
                        if (retriesLeft !== undefined) {
                            if (retriesLeft === 0) {
                                this.notifyForSocketState("wait for socket on " + this.settings.ws + " failed - no more retries left");
                                return [2];
                            }
                            this.logger.debug("will retry " + retriesLeft + " more times (every " + retryInterval + " ms)");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4, this.initiateSocket()];
                    case 2:
                        _b.sent();
                        this.startupTimer.mark("socket-initiated");
                        this.notifyForSocketState();
                        return [3, 4];
                    case 3:
                        _b.sent();
                        setTimeout(function () {
                            var retries = retriesLeft === undefined ? undefined : retriesLeft - 1;
                            _this.openSocket(retryInterval, retries);
                        }, retryInterval);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    WS.prototype.initiateSocket = function () {
        var _this = this;
        var pw = new PromiseWrapper();
        this.logger.debug("initiating ws to " + this.settings.ws + "...");
        this.ws = new WebSocketConstructor(this.settings.ws || "");
        this.ws.onerror = function (err) {
            var reason = "";
            try {
                reason = JSON.stringify(err);
            }
            catch (error) {
                var seen_1 = new WeakSet();
                var replacer = function (key, value) {
                    if (typeof value === "object" && value !== null) {
                        if (seen_1.has(value)) {
                            return;
                        }
                        seen_1.add(value);
                    }
                    return value;
                };
                reason = JSON.stringify(err, replacer);
            }
            pw.reject("error");
            _this.notifyStatusChanged(false, reason);
        };
        this.ws.onclose = function (err) {
            _this.logger.info("ws closed " + err);
            pw.reject("closed");
            _this.notifyStatusChanged(false);
        };
        this.ws.onopen = function () {
            var _a;
            _this.startupTimer.mark("ws-opened");
            _this.logger.info("ws opened " + ((_a = _this.settings.identity) === null || _a === void 0 ? void 0 : _a.application));
            pw.resolve();
            _this.notifyStatusChanged(true);
        };
        this.ws.onmessage = function (message) {
            _this._registry.execute("onMessage", message.data);
        };
        return pw.promise;
    };
    WS.prototype.notifyForSocketState = function (error) {
        this.wsRequests.forEach(function (wsRequest) {
            if (error) {
                if (wsRequest.failed) {
                    wsRequest.failed(error);
                }
            }
            else {
                wsRequest.callback();
            }
        });
        this.wsRequests = [];
    };
    WS.prototype.notifyStatusChanged = function (status, reason) {
        this._registry.execute("onConnectedChanged", status, reason);
    };
    return WS;
}());

function createCommonjsModule$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

// Found this seed-based random generator somewhere
// Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

var seed$1 = 1;

/**
 * return a random number based on a seed
 * @param seed
 * @returns {number}
 */
function getNextValue$1() {
    seed$1 = (seed$1 * 9301 + 49297) % 233280;
    return seed$1/(233280.0);
}

function setSeed$2(_seed_) {
    seed$1 = _seed_;
}

var randomFromSeed$1 = {
    nextValue: getNextValue$1,
    seed: setSeed$2
};

var ORIGINAL$1 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
var alphabet$1;
var previousSeed$1;

var shuffled$1;

function reset$1() {
    shuffled$1 = false;
}

function setCharacters$1(_alphabet_) {
    if (!_alphabet_) {
        if (alphabet$1 !== ORIGINAL$1) {
            alphabet$1 = ORIGINAL$1;
            reset$1();
        }
        return;
    }

    if (_alphabet_ === alphabet$1) {
        return;
    }

    if (_alphabet_.length !== ORIGINAL$1.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL$1.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
    }

    var unique = _alphabet_.split('').filter(function(item, ind, arr){
       return ind !== arr.lastIndexOf(item);
    });

    if (unique.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL$1.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
    }

    alphabet$1 = _alphabet_;
    reset$1();
}

function characters$1(_alphabet_) {
    setCharacters$1(_alphabet_);
    return alphabet$1;
}

function setSeed$1$1(seed) {
    randomFromSeed$1.seed(seed);
    if (previousSeed$1 !== seed) {
        reset$1();
        previousSeed$1 = seed;
    }
}

function shuffle$1() {
    if (!alphabet$1) {
        setCharacters$1(ORIGINAL$1);
    }

    var sourceArray = alphabet$1.split('');
    var targetArray = [];
    var r = randomFromSeed$1.nextValue();
    var characterIndex;

    while (sourceArray.length > 0) {
        r = randomFromSeed$1.nextValue();
        characterIndex = Math.floor(r * sourceArray.length);
        targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
    }
    return targetArray.join('');
}

function getShuffled$1() {
    if (shuffled$1) {
        return shuffled$1;
    }
    shuffled$1 = shuffle$1();
    return shuffled$1;
}

/**
 * lookup shuffled letter
 * @param index
 * @returns {string}
 */
function lookup$1(index) {
    var alphabetShuffled = getShuffled$1();
    return alphabetShuffled[index];
}

var alphabet_1$1 = {
    characters: characters$1,
    seed: setSeed$1$1,
    lookup: lookup$1,
    shuffled: getShuffled$1
};

var crypto$1 = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

function randomByte$1() {
    if (!crypto$1 || !crypto$1.getRandomValues) {
        return Math.floor(Math.random() * 256) & 0x30;
    }
    var dest = new Uint8Array(1);
    crypto$1.getRandomValues(dest);
    return dest[0] & 0x30;
}

var randomByteBrowser$1 = randomByte$1;

function encode$1(lookup, number) {
    var loopCounter = 0;
    var done;

    var str = '';

    while (!done) {
        str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | randomByteBrowser$1() );
        done = number < (Math.pow(16, loopCounter + 1 ) );
        loopCounter++;
    }
    return str;
}

var encode_1$1 = encode$1;

/**
 * Decode the id to get the version and worker
 * Mainly for debugging and testing.
 * @param id - the shortid-generated id.
 */
function decode$1(id) {
    var characters = alphabet_1$1.shuffled();
    return {
        version: characters.indexOf(id.substr(0, 1)) & 0x0f,
        worker: characters.indexOf(id.substr(1, 1)) & 0x0f
    };
}

var decode_1$1 = decode$1;

function isShortId$1(id) {
    if (!id || typeof id !== 'string' || id.length < 6 ) {
        return false;
    }

    var characters = alphabet_1$1.characters();
    var len = id.length;
    for(var i = 0; i < len;i++) {
        if (characters.indexOf(id[i]) === -1) {
            return false;
        }
    }
    return true;
}

var isValid$1 = isShortId$1;

var lib$1$1 = createCommonjsModule$1(function (module) {






// Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
// This number should be updated every year or so to keep the generated id short.
// To regenerate `new Date() - 0` and bump the version. Always bump the version!
var REDUCE_TIME = 1459707606518;

// don't change unless we change the algos or REDUCE_TIME
// must be an integer and less than 16
var version = 6;

// if you are using cluster or multiple servers use this to make each instance
// has a unique value for worker
// Note: I don't know if this is automatically set when using third
// party cluster solutions such as pm2.
var clusterWorkerId =  0;

// Counter is used when shortid is called multiple times in one second.
var counter;

// Remember the last time shortid was called in case counter is needed.
var previousSeconds;

/**
 * Generate unique id
 * Returns string id
 */
function generate() {

    var str = '';

    var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

    if (seconds === previousSeconds) {
        counter++;
    } else {
        counter = 0;
        previousSeconds = seconds;
    }

    str = str + encode_1$1(alphabet_1$1.lookup, version);
    str = str + encode_1$1(alphabet_1$1.lookup, clusterWorkerId);
    if (counter > 0) {
        str = str + encode_1$1(alphabet_1$1.lookup, counter);
    }
    str = str + encode_1$1(alphabet_1$1.lookup, seconds);

    return str;
}


/**
 * Set the seed.
 * Highly recommended if you don't want people to try to figure out your id schema.
 * exposed as shortid.seed(int)
 * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
 */
function seed(seedValue) {
    alphabet_1$1.seed(seedValue);
    return module.exports;
}

/**
 * Set the cluster worker or machine id
 * exposed as shortid.worker(int)
 * @param workerId worker must be positive integer.  Number less than 16 is recommended.
 * returns shortid module so it can be chained.
 */
function worker(workerId) {
    clusterWorkerId = workerId;
    return module.exports;
}

/**
 *
 * sets new characters to use in the alphabet
 * returns the shuffled alphabet
 */
function characters(newCharacters) {
    if (newCharacters !== undefined) {
        alphabet_1$1.characters(newCharacters);
    }

    return alphabet_1$1.shuffled();
}


// Export all other functions as properties of the generate function
module.exports = generate;
module.exports.generate = generate;
module.exports.seed = seed;
module.exports.worker = worker;
module.exports.characters = characters;
module.exports.decode = decode_1$1;
module.exports.isValid = isValid$1;
});
lib$1$1.generate;
lib$1$1.seed;
lib$1$1.worker;
lib$1$1.characters;
lib$1$1.decode;
lib$1$1.isValid;

var shortid$1 = lib$1$1;

function domainSession (domain, connection, logger, successMessages, errorMessages) {
    if (domain == null) {
        domain = "global";
    }
    successMessages = successMessages || ["success"];
    errorMessages = errorMessages || ["error"];
    var isJoined = false;
    var tryReconnecting = false;
    var _latestOptions;
    var _connectionOn = false;
    var callbacks = lib$2();
    connection.disconnected(handleConnectionDisconnected);
    connection.loggedIn(handleConnectionLoggedIn);
    connection.on("success", function (msg) { return handleSuccessMessage(msg); });
    connection.on("error", function (msg) { return handleErrorMessage(msg); });
    connection.on("result", function (msg) { return handleSuccessMessage(msg); });
    if (successMessages) {
        successMessages.forEach(function (sm) {
            connection.on(sm, function (msg) { return handleSuccessMessage(msg); });
        });
    }
    if (errorMessages) {
        errorMessages.forEach(function (sm) {
            connection.on(sm, function (msg) { return handleErrorMessage(msg); });
        });
    }
    var requestsMap = {};
    function join(options) {
        _latestOptions = options;
        return new Promise(function (resolve, reject) {
            if (isJoined) {
                resolve();
                return;
            }
            var joinPromise;
            if (domain === "global") {
                joinPromise = _connectionOn ? Promise.resolve({}) : Promise.reject("not connected to gateway");
            }
            else {
                logger.debug("joining domain " + domain);
                var joinMsg = {
                    type: "join",
                    destination: domain,
                    domain: "global",
                    options: options,
                };
                joinPromise = send(joinMsg);
            }
            joinPromise
                .then(function () {
                handleJoined();
                resolve();
            })
                .catch(function (err) {
                logger.debug("error joining " + domain + " domain: " + JSON.stringify(err));
                reject(err);
            });
        });
    }
    function leave() {
        if (domain === "global") {
            return Promise.resolve();
        }
        logger.debug("stopping session " + domain + "...");
        var leaveMsg = {
            type: "leave",
            destination: domain,
            domain: "global",
        };
        tryReconnecting = false;
        return send(leaveMsg)
            .then(function () {
            isJoined = false;
            callbacks.execute("onLeft");
        })
            .catch(function () {
            isJoined = false;
            callbacks.execute("onLeft");
        });
    }
    function handleJoined() {
        logger.debug("did join " + domain);
        isJoined = true;
        var wasReconnect = tryReconnecting;
        tryReconnecting = false;
        callbacks.execute("onJoined", wasReconnect);
    }
    function handleConnectionDisconnected() {
        _connectionOn = false;
        logger.debug("connection is down");
        isJoined = false;
        tryReconnecting = true;
        callbacks.execute("onLeft", { disconnected: true });
    }
    function handleConnectionLoggedIn() {
        _connectionOn = true;
        if (tryReconnecting) {
            logger.debug("connection is now up - trying to reconnect...");
            join(_latestOptions);
        }
    }
    function onJoined(callback) {
        if (isJoined) {
            callback(false);
        }
        return callbacks.add("onJoined", callback);
    }
    function onLeft(callback) {
        if (!isJoined) {
            callback();
        }
        return callbacks.add("onLeft", callback);
    }
    function handleErrorMessage(msg) {
        if (domain !== msg.domain) {
            return;
        }
        var requestId = msg.request_id;
        if (!requestId) {
            return;
        }
        var entry = requestsMap[requestId];
        if (!entry) {
            return;
        }
        entry.error(msg);
    }
    function handleSuccessMessage(msg) {
        if (msg.domain !== domain) {
            return;
        }
        var requestId = msg.request_id;
        if (!requestId) {
            return;
        }
        var entry = requestsMap[requestId];
        if (!entry) {
            return;
        }
        entry.success(msg);
    }
    function getNextRequestId() {
        return shortid$1();
    }
    function send(msg, tag, options) {
        options = options || {};
        msg.request_id = msg.request_id || getNextRequestId();
        msg.domain = msg.domain || domain;
        if (!options.skipPeerId) {
            msg.peer_id = connection.peerId;
        }
        var requestId = msg.request_id;
        return new Promise(function (resolve, reject) {
            requestsMap[requestId] = {
                success: function (successMsg) {
                    delete requestsMap[requestId];
                    successMsg._tag = tag;
                    resolve(successMsg);
                },
                error: function (errorMsg) {
                    logger.warn("GW error - " + JSON.stringify(errorMsg) + " for request " + JSON.stringify(msg));
                    delete requestsMap[requestId];
                    errorMsg._tag = tag;
                    reject(errorMsg);
                },
            };
            connection
                .send(msg, options)
                .catch(function (err) {
                requestsMap[requestId].error({ err: err });
            });
        });
    }
    function sendFireAndForget(msg) {
        msg.request_id = msg.request_id ? msg.request_id : getNextRequestId();
        msg.domain = msg.domain || domain;
        msg.peer_id = connection.peerId;
        return connection.send(msg);
    }
    return {
        join: join,
        leave: leave,
        onJoined: onJoined,
        onLeft: onLeft,
        send: send,
        sendFireAndForget: sendFireAndForget,
        on: function (type, callback) {
            connection.on(type, function (msg) {
                if (msg.domain !== domain) {
                    return;
                }
                try {
                    callback(msg);
                }
                catch (e) {
                    logger.error("Callback  failed: " + e + " \n " + e.stack + " \n msg was: " + JSON.stringify(msg), e);
                }
            });
        },
        loggedIn: function (callback) { return connection.loggedIn(callback); },
        connected: function (callback) { return connection.connected(callback); },
        disconnected: function (callback) { return connection.disconnected(callback); },
        get peerId() {
            return connection.peerId;
        },
        get domain() {
            return domain;
        },
    };
}

var GW3ProtocolImpl = (function () {
    function GW3ProtocolImpl(connection, settings, logger) {
        var _this = this;
        this.connection = connection;
        this.settings = settings;
        this.logger = logger;
        this.protocolVersion = 3;
        this.datePrefix = "#T42_DATE#";
        this.datePrefixLen = this.datePrefix.length;
        this.dateMinLen = this.datePrefixLen + 1;
        this.datePrefixFirstChar = this.datePrefix[0];
        this.registry = lib$2();
        this._isLoggedIn = false;
        this.shouldTryLogin = true;
        this.initialLogin = true;
        this.initialLoginAttempts = 3;
        this.sessions = [];
        connection.disconnected(function () {
            _this.handleDisconnected();
        });
        this.ping();
    }
    Object.defineProperty(GW3ProtocolImpl.prototype, "isLoggedIn", {
        get: function () {
            return this._isLoggedIn;
        },
        enumerable: true,
        configurable: true
    });
    GW3ProtocolImpl.prototype.processStringMessage = function (message) {
        var _this = this;
        var msg = JSON.parse(message, function (key, value) {
            if (typeof value !== "string") {
                return value;
            }
            if (value.length < _this.dateMinLen) {
                return value;
            }
            if (value[0] !== _this.datePrefixFirstChar) {
                return value;
            }
            if (value.substring(0, _this.datePrefixLen) !== _this.datePrefix) {
                return value;
            }
            try {
                var milliseconds = parseInt(value.substring(_this.datePrefixLen, value.length), 10);
                if (isNaN(milliseconds)) {
                    return value;
                }
                return new Date(milliseconds);
            }
            catch (ex) {
                return value;
            }
        });
        return {
            msg: msg,
            msgType: msg.type,
        };
    };
    GW3ProtocolImpl.prototype.createStringMessage = function (message) {
        var oldToJson = Date.prototype.toJSON;
        try {
            var datePrefix_1 = this.datePrefix;
            Date.prototype.toJSON = function () {
                return datePrefix_1 + this.getTime();
            };
            var result = JSON.stringify(message);
            return result;
        }
        finally {
            Date.prototype.toJSON = oldToJson;
        }
    };
    GW3ProtocolImpl.prototype.processObjectMessage = function (message) {
        if (!message.type) {
            throw new Error("Object should have type property");
        }
        return {
            msg: message,
            msgType: message.type,
        };
    };
    GW3ProtocolImpl.prototype.createObjectMessage = function (message) {
        return message;
    };
    GW3ProtocolImpl.prototype.login = function (config, reconnect) {
        return __awaiter(this, void 0, void 0, function () {
            var authentication, token, e_1, _a, helloMsg, sendOptions, welcomeMsg, msg, token, _b, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.logger.debug("logging in...");
                        this.loginConfig = config;
                        if (!this.loginConfig) {
                            this.loginConfig = { username: "", password: "" };
                        }
                        this.shouldTryLogin = true;
                        authentication = {};
                        this.connection.gatewayToken = config.gatewayToken;
                        if (!config.gatewayToken) return [3, 5];
                        if (!reconnect) return [3, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4, this.getNewGWToken()];
                    case 2:
                        token = _c.sent();
                        config.gatewayToken = token;
                        return [3, 4];
                    case 3:
                        e_1 = _c.sent();
                        this.logger.warn("failed to get GW token when reconnecting " + ((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1));
                        return [3, 4];
                    case 4:
                        authentication.method = "gateway-token";
                        authentication.token = config.gatewayToken;
                        this.connection.gatewayToken = config.gatewayToken;
                        return [3, 10];
                    case 5:
                        if (!(config.flowName === "sspi")) return [3, 9];
                        authentication.provider = "win";
                        authentication.method = "access-token";
                        if (!(config.flowCallback && config.sessionId)) return [3, 7];
                        _a = authentication;
                        return [4, config.flowCallback(config.sessionId, null)];
                    case 6:
                        _a.token =
                            (_c.sent())
                                .data
                                .toString("base64");
                        return [3, 8];
                    case 7: throw new Error("Invalid SSPI config");
                    case 8: return [3, 10];
                    case 9:
                        if (config.token) {
                            authentication.method = "access-token";
                            authentication.token = config.token;
                        }
                        else if (config.username) {
                            authentication.method = "secret";
                            authentication.login = config.username;
                            authentication.secret = config.password;
                        }
                        else if (config.provider) {
                            authentication.provider = config.provider;
                            authentication.providerContext = config.providerContext;
                        }
                        else {
                            throw new Error("invalid auth message" + JSON.stringify(config));
                        }
                        _c.label = 10;
                    case 10:
                        helloMsg = {
                            type: "hello",
                            identity: this.settings.identity,
                            authentication: authentication
                        };
                        if (config.sessionId) {
                            helloMsg.request_id = config.sessionId;
                        }
                        this.globalDomain = domainSession("global", this.connection, this.logger.subLogger("global-domain"), [
                            "welcome",
                            "token",
                            "authentication-request"
                        ]);
                        sendOptions = { skipPeerId: true };
                        if (this.initialLogin) {
                            sendOptions.retryInterval = this.settings.reconnectInterval;
                            sendOptions.maxRetries = this.settings.reconnectAttempts;
                        }
                        _c.label = 11;
                    case 11:
                        _c.trys.push([11, 19, 20, 21]);
                        welcomeMsg = void 0;
                        _c.label = 12;
                    case 12:
                        return [4, this.globalDomain.send(helloMsg, undefined, sendOptions)];
                    case 13:
                        msg = _c.sent();
                        if (!(msg.type === "authentication-request")) return [3, 16];
                        token = Buffer.from(msg.authentication.token, "base64");
                        if (!(config.flowCallback && config.sessionId)) return [3, 15];
                        _b = helloMsg.authentication;
                        return [4, config.flowCallback(config.sessionId, token)];
                    case 14:
                        _b.token =
                            (_c.sent())
                                .data
                                .toString("base64");
                        _c.label = 15;
                    case 15:
                        helloMsg.request_id = config.sessionId;
                        return [3, 12];
                    case 16:
                        if (msg.type === "welcome") {
                            welcomeMsg = msg;
                            return [3, 18];
                        }
                        else if (msg.type === "error") {
                            throw new Error("Authentication failed: " + msg.reason);
                        }
                        else {
                            throw new Error("Unexpected message type during authentication: " + msg.type);
                        }
                    case 17: return [3, 12];
                    case 18:
                        this.initialLogin = false;
                        this.logger.debug("login successful with peerId " + welcomeMsg.peer_id);
                        this.connection.peerId = welcomeMsg.peer_id;
                        this.connection.resolvedIdentity = welcomeMsg.resolved_identity;
                        this.connection.availableDomains = welcomeMsg.available_domains;
                        if (welcomeMsg.options) {
                            this.connection.token = welcomeMsg.options.access_token;
                            this.connection.info = welcomeMsg.options.info;
                        }
                        this.setLoggedIn(true);
                        return [2, welcomeMsg.resolved_identity];
                    case 19:
                        err_1 = _c.sent();
                        this.logger.error("error sending hello message - " + (err_1.message || err_1.msg || err_1.reason || err_1), err_1);
                        throw err_1;
                    case 20:
                        if (config && config.flowCallback && config.sessionId) {
                            config.flowCallback(config.sessionId, null);
                        }
                        return [7];
                    case 21: return [2];
                }
            });
        });
    };
    GW3ProtocolImpl.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("logging out...");
                        this.shouldTryLogin = false;
                        if (this.pingTimer) {
                            clearTimeout(this.pingTimer);
                        }
                        promises = this.sessions.map(function (session) {
                            session.leave();
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    GW3ProtocolImpl.prototype.loggedIn = function (callback) {
        if (this._isLoggedIn) {
            callback();
        }
        return this.registry.add("onLoggedIn", callback);
    };
    GW3ProtocolImpl.prototype.domain = function (domainName, domainLogger, successMessages, errorMessages) {
        var session = this.sessions.filter(function (s) { return s.domain === domainName; })[0];
        if (!session) {
            session = domainSession(domainName, this.connection, domainLogger, successMessages, errorMessages);
            this.sessions.push(session);
        }
        return session;
    };
    GW3ProtocolImpl.prototype.handleDisconnected = function () {
        var _this = this;
        this.setLoggedIn(false);
        var tryToLogin = this.shouldTryLogin;
        if (tryToLogin && this.initialLogin) {
            if (this.initialLoginAttempts <= 0) {
                return;
            }
            this.initialLoginAttempts--;
        }
        this.logger.debug("disconnected - will try new login?" + this.shouldTryLogin);
        if (this.shouldTryLogin) {
            if (!this.loginConfig) {
                throw new Error("no login info");
            }
            this.connection.login(this.loginConfig, true)
                .catch(function () {
                setTimeout(_this.handleDisconnected.bind(_this), _this.settings.reconnectInterval || 1000);
            });
        }
    };
    GW3ProtocolImpl.prototype.setLoggedIn = function (value) {
        this._isLoggedIn = value;
        if (this._isLoggedIn) {
            this.registry.execute("onLoggedIn");
        }
    };
    GW3ProtocolImpl.prototype.ping = function () {
        var _this = this;
        if (!this.shouldTryLogin) {
            return;
        }
        if (this._isLoggedIn) {
            this.connection.send({ type: "ping" });
        }
        this.pingTimer = setTimeout(function () {
            _this.ping();
        }, 30 * 1000);
    };
    GW3ProtocolImpl.prototype.authToken = function () {
        var createTokenReq = {
            type: "create-token"
        };
        if (!this.globalDomain) {
            return Promise.reject(new Error("no global domain session"));
        }
        return this.globalDomain.send(createTokenReq)
            .then(function (res) {
            return res.token;
        });
    };
    GW3ProtocolImpl.prototype.getNewGWToken = function () {
        if (typeof window !== undefined) {
            var glue42gd = window.glue42gd;
            if (glue42gd) {
                return glue42gd.getGWToken();
            }
        }
        return Promise.reject(new Error("not running in GD"));
    };
    return GW3ProtocolImpl;
}());

var MessageReplayerImpl = (function () {
    function MessageReplayerImpl(specs) {
        this.specsNames = [];
        this.messages = {};
        this.subs = {};
        this.subsRefCount = {};
        this.specs = {};
        for (var _i = 0, specs_1 = specs; _i < specs_1.length; _i++) {
            var spec = specs_1[_i];
            this.specs[spec.name] = spec;
            this.specsNames.push(spec.name);
        }
    }
    MessageReplayerImpl.prototype.init = function (connection) {
        var _this = this;
        this.connection = connection;
        for (var _i = 0, _a = this.specsNames; _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var _loop_1 = function (type) {
                var refCount = this_1.subsRefCount[type];
                if (!refCount) {
                    refCount = 0;
                }
                refCount += 1;
                this_1.subsRefCount[type] = refCount;
                if (refCount > 1) {
                    return "continue";
                }
                var sub = connection.on(type, function (msg) { return _this.processMessage(type, msg); });
                this_1.subs[type] = sub;
            };
            var this_1 = this;
            for (var _b = 0, _c = this.specs[name_1].types; _b < _c.length; _b++) {
                var type = _c[_b];
                _loop_1(type);
            }
        }
    };
    MessageReplayerImpl.prototype.processMessage = function (type, msg) {
        if (this.isDone || !msg) {
            return;
        }
        for (var _i = 0, _a = this.specsNames; _i < _a.length; _i++) {
            var name_2 = _a[_i];
            if (this.specs[name_2].types.indexOf(type) !== -1) {
                var messages = this.messages[name_2] || [];
                this.messages[name_2] = messages;
                messages.push(msg);
            }
        }
    };
    MessageReplayerImpl.prototype.drain = function (name, callback) {
        var _a;
        if (callback) {
            (this.messages[name] || []).forEach(callback);
        }
        delete this.messages[name];
        for (var _i = 0, _b = this.specs[name].types; _i < _b.length; _i++) {
            var type = _b[_i];
            this.subsRefCount[type] -= 1;
            if (this.subsRefCount[type] <= 0) {
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.off(this.subs[type]);
                delete this.subs[type];
                delete this.subsRefCount[type];
            }
        }
        delete this.specs[name];
        if (!this.specs.length) {
            this.isDone = true;
        }
    };
    return MessageReplayerImpl;
}());

var PromisePlus = function (executor, timeoutMilliseconds, timeoutMessage) {
    return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
            var message = timeoutMessage || "Promise timeout hit: " + timeoutMilliseconds;
            reject(message);
        }, timeoutMilliseconds);
        var providedPromise = new Promise(executor);
        providedPromise
            .then(function (result) {
            clearTimeout(timeout);
            resolve(result);
        })
            .catch(function (error) {
            clearTimeout(timeout);
            reject(error);
        });
    });
};

var WebPlatformTransport = (function () {
    function WebPlatformTransport(settings, logger, identity) {
        this.settings = settings;
        this.logger = logger;
        this.identity = identity;
        this.iAmConnected = false;
        this.parentReady = false;
        this.rejected = false;
        this.children = [];
        this.extContentAvailable = false;
        this.extContentConnecting = false;
        this.extContentConnected = false;
        this.parentInExtMode = false;
        this.parentPingTimeout = 5000;
        this.connectionRequestTimeout = 7000;
        this.defaultTargetString = "*";
        this.registry = lib$2();
        this.messages = {
            connectionAccepted: { name: "connectionAccepted", handle: this.handleConnectionAccepted.bind(this) },
            connectionRejected: { name: "connectionRejected", handle: this.handleConnectionRejected.bind(this) },
            connectionRequest: { name: "connectionRequest", handle: this.handleConnectionRequest.bind(this) },
            parentReady: { name: "parentReady", handle: this.handleParentReady.bind(this) },
            parentPing: { name: "parentPing", handle: this.handleParentPing.bind(this) },
            platformPing: { name: "platformPing", handle: this.handlePlatformPing.bind(this) },
            platformReady: { name: "platformReady", handle: this.handlePlatformReady.bind(this) },
            clientUnload: { name: "clientUnload", handle: this.handleClientUnload.bind(this) },
            manualUnload: { name: "manualUnload", handle: this.handleManualUnload.bind(this) },
            extConnectionResponse: { name: "extConnectionResponse", handle: this.handleExtConnectionResponse.bind(this) },
            extSetupRequest: { name: "extSetupRequest", handle: this.handleExtSetupRequest.bind(this) },
            gatewayDisconnect: { name: "gatewayDisconnect", handle: this.handleGatewayDisconnect.bind(this) },
            gatewayInternalConnect: { name: "gatewayInternalConnect", handle: this.handleGatewayInternalConnect.bind(this) }
        };
        this.extContentAvailable = !!window.glue42ext;
        this.setUpMessageListener();
        this.setUpUnload();
        this.setupPlatformUnloadListener();
        if (!this.settings.port) {
            this.parent = window.opener || window.top;
            this.parentType = window.opener ? "opener" :
                window.name.indexOf("#wsp") !== -1 ? "workspace" : "top";
        }
    }
    WebPlatformTransport.prototype.manualSetReadyState = function () {
        this.iAmConnected = true;
        this.parentReady = true;
    };
    Object.defineProperty(WebPlatformTransport.prototype, "transportWindowId", {
        get: function () {
            return this.publicWindowId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebPlatformTransport.prototype, "communicationId", {
        get: function () {
            return this._communicationId;
        },
        enumerable: true,
        configurable: true
    });
    WebPlatformTransport.prototype.sendObject = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.extContentConnected) {
                    return [2, window.postMessage({ glue42ExtOut: msg }, this.defaultTargetString)];
                }
                if (!this.port) {
                    throw new Error("Cannot send message, because the port was not opened yet");
                }
                this.port.postMessage(msg);
                return [2];
            });
        });
    };
    Object.defineProperty(WebPlatformTransport.prototype, "isObjectBasedTransport", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    WebPlatformTransport.prototype.onMessage = function (callback) {
        return this.registry.add("onMessage", callback);
    };
    WebPlatformTransport.prototype.send = function () {
        return Promise.reject("not supported");
    };
    WebPlatformTransport.prototype.onConnectedChanged = function (callback) {
        return this.registry.add("onConnectedChanged", callback);
    };
    WebPlatformTransport.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("opening a connection to the web platform gateway.");
                        return [4, this.connect()];
                    case 1:
                        _a.sent();
                        this.notifyStatusChanged(true);
                        return [2];
                }
            });
        });
    };
    WebPlatformTransport.prototype.close = function () {
        var _a, _b;
        var message = {
            glue42core: {
                type: this.messages.gatewayDisconnect.name,
                data: {
                    clientId: this.myClientId,
                    ownWindowId: (_a = this.identity) === null || _a === void 0 ? void 0 : _a.windowId
                }
            }
        };
        (_b = this.port) === null || _b === void 0 ? void 0 : _b.postMessage(message);
        this.parentReady = false;
        this.notifyStatusChanged(false, "manual reconnection");
        return Promise.resolve();
    };
    WebPlatformTransport.prototype.name = function () {
        return "web-platform";
    };
    WebPlatformTransport.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.close()];
                    case 1:
                        _a.sent();
                        return [2, Promise.resolve()];
                }
            });
        });
    };
    WebPlatformTransport.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.settings.port) return [3, 2];
                        return [4, this.initiateInternalConnection()];
                    case 1:
                        _a.sent();
                        this.logger.debug("internal web platform connection completed");
                        return [2];
                    case 2:
                        if (!this.parentType || !this.parent) {
                            throw new Error("Cannot initiate a connection, because there is no opener, no top and no port.");
                        }
                        this.logger.debug("opening a " + (this.parentType === "opener" ? "child" : "grandchild") + " client web platform connection");
                        return [4, this.waitParent(this.parent, this.parentType)];
                    case 3:
                        _a.sent();
                        if (!this.parentInExtMode) return [3, 5];
                        return [4, this.requestConnectionPermissionFromExt()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4, this.initiateRemoteConnection(this.parent, this.parentType)];
                    case 6:
                        _a.sent();
                        this.logger.debug("the " + (this.parentType === "opener" ? "child" : "grandchild") + " client is connected");
                        return [2];
                }
            });
        });
    };
    WebPlatformTransport.prototype.initiateInternalConnection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.logger.debug("opening an internal web platform connection");
            _this.port = _this.settings.port;
            if (_this.iAmConnected) {
                _this.logger.warn("cannot open a new connection, because this client is currently connected");
                return;
            }
            _this.port.onmessage = function (event) {
                var _a, _b;
                if (_this.iAmConnected && !((_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core)) {
                    _this.registry.execute("onMessage", event.data);
                    return;
                }
                var data = (_b = event.data) === null || _b === void 0 ? void 0 : _b.glue42core;
                if (!data) {
                    return;
                }
                if (data.type === _this.messages.gatewayInternalConnect.name && data.success) {
                    _this.publicWindowId = _this.settings.windowId;
                    if (_this.identity) {
                        _this.identity.windowId = _this.publicWindowId;
                    }
                    resolve();
                }
                if (data.type === _this.messages.gatewayInternalConnect.name && data.error) {
                    reject(data.error);
                }
            };
            _this.port.postMessage({
                glue42core: {
                    type: _this.messages.gatewayInternalConnect.name
                }
            });
        });
    };
    WebPlatformTransport.prototype.initiateRemoteConnection = function (target, parentType) {
        var _this = this;
        return PromisePlus(function (resolve, reject) {
            var _a;
            _this.connectionResolve = resolve;
            _this.connectionReject = reject;
            _this.myClientId = (_a = _this.myClientId) !== null && _a !== void 0 ? _a : shortid$1();
            var bridgeInstanceId = _this.parentType === "workspace" ? window.name.substring(0, window.name.indexOf("#wsp")) : window.name;
            var request = {
                glue42core: {
                    type: _this.messages.connectionRequest.name,
                    clientId: _this.myClientId,
                    clientType: parentType === "top" || parentType === "workspace" ? "grandChild" : "child",
                    bridgeInstanceId: bridgeInstanceId
                }
            };
            _this.logger.debug("sending connection request to " + parentType);
            if (_this.extContentConnecting) {
                request.glue42core.clientType = "child";
                request.glue42core.bridgeInstanceId = _this.myClientId;
                request.glue42core.parentWindowId = _this.parentWindowId;
                return window.postMessage(request, _this.defaultTargetString);
            }
            target.postMessage(request, _this.defaultTargetString);
        }, this.connectionRequestTimeout, "The connection to the opener/top window timed out");
    };
    WebPlatformTransport.prototype.waitParent = function (target, parentType) {
        return __awaiter(this, void 0, void 0, function () {
            var connectionNotPossibleMsg, parentCheck;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connectionNotPossibleMsg = "Cannot initiate glue, because this window was not opened or created by a glue client";
                        parentCheck = PromisePlus(function (resolve, reject) {
                            var isIframe = window.self !== window.top;
                            if (parentType === "top" && !isIframe) {
                                return reject(connectionNotPossibleMsg);
                            }
                            _this.parentPingResolve = resolve;
                            var message = {
                                glue42core: {
                                    type: parentType === "opener" ? _this.messages.platformPing.name : _this.messages.parentPing.name
                                }
                            };
                            _this.logger.debug("checking for " + parentType + " window availability");
                            _this.parentPingInterval = setInterval(function () {
                                target.postMessage(message, _this.defaultTargetString);
                            }, 1000);
                        }, this.parentPingTimeout, connectionNotPossibleMsg);
                        parentCheck.catch(function () {
                            if (_this.parentPingInterval) {
                                clearInterval(_this.parentPingInterval);
                                delete _this.parentPingInterval;
                            }
                        });
                        if (!this.extContentAvailable) {
                            return [2, parentCheck];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4, parentCheck];
                    case 2:
                        _a.sent();
                        return [2];
                    case 3:
                        _a.sent();
                        this.logger.debug("the parent check failed, but there is an associated extension content script, requesting permission...");
                        return [4, this.requestConnectionPermissionFromExt()];
                    case 4:
                        _a.sent();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    WebPlatformTransport.prototype.setUpMessageListener = function () {
        var _this = this;
        if (this.settings.port) {
            this.logger.debug("skipping generic message listener, because this is an internal client");
            return;
        }
        window.addEventListener("message", function (event) {
            var _a;
            var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
            if (!data || _this.rejected) {
                return;
            }
            if (!_this.checkMessageTypeValid(data.type)) {
                _this.logger.error("cannot handle the incoming glue42 core message, because the type is invalid: " + data.type);
                return;
            }
            var messageType = data.type;
            _this.logger.debug("received valid glue42core message of type: " + messageType);
            _this.messages[messageType].handle(event);
        });
    };
    WebPlatformTransport.prototype.setUpUnload = function () {
        var _this = this;
        if (this.settings.port) {
            this.logger.debug("skipping unload event listener, because this is an internal client");
            return;
        }
        window.addEventListener("beforeunload", function () {
            var _a, _b;
            if (_this.extContentConnected) {
                return;
            }
            var message = {
                glue42core: {
                    type: _this.messages.clientUnload.name,
                    data: {
                        clientId: _this.myClientId,
                        ownWindowId: (_a = _this.identity) === null || _a === void 0 ? void 0 : _a.windowId
                    }
                }
            };
            if (_this.parent) {
                _this.parent.postMessage(message, _this.defaultTargetString);
            }
            (_b = _this.port) === null || _b === void 0 ? void 0 : _b.postMessage(message);
        });
    };
    WebPlatformTransport.prototype.handleParentReady = function (event) {
        var _a;
        this.logger.debug("handling the ready signal from the parent, by resoling the pending promise.");
        this.parentReady = true;
        var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
        if (data && data.extMode) {
            this.logger.debug("my parent is connected to its content script, fetching windowId and proceeding with content script connection");
            this.parentWindowId = data.extMode.windowId;
            this.parentInExtMode = true;
        }
        if (this.parentPingResolve) {
            this.parentPingResolve();
            delete this.parentPingResolve;
        }
        if (this.parentPingInterval) {
            clearInterval(this.parentPingInterval);
            delete this.parentPingInterval;
        }
    };
    WebPlatformTransport.prototype.handlePlatformReady = function () {
        this.logger.debug("the web platform gave the ready signal");
        this.parentReady = true;
        if (this.parentPingResolve) {
            this.parentPingResolve();
            delete this.parentPingResolve;
        }
        if (this.parentPingInterval) {
            clearInterval(this.parentPingInterval);
            delete this.parentPingInterval;
        }
    };
    WebPlatformTransport.prototype.handleConnectionAccepted = function (event) {
        var _a;
        var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
        if (this.myClientId === data.clientId) {
            return this.handleAcceptanceOfMyRequest(data);
        }
        return this.handleAcceptanceOfGrandChildRequest(data, event);
    };
    WebPlatformTransport.prototype.handleAcceptanceOfMyRequest = function (data) {
        var _this = this;
        this.logger.debug("handling a connection accepted signal targeted at me.");
        this.isPreferredActivated = data.isPreferredActivated;
        if (this.extContentConnecting) {
            return this.processExtContentConnection(data);
        }
        if (!data.port) {
            this.logger.error("cannot set up my connection, because I was not provided with a port");
            return;
        }
        this.publicWindowId = this.parentType === "opener" ? window.name :
            this.parentType === "top" ? data.parentWindowId :
                window.name.substring(0, window.name.indexOf("#wsp"));
        if (this.identity && this.parentType !== "top") {
            this.identity.windowId = this.publicWindowId;
        }
        if (this.identity && data.appName) {
            this.identity.application = data.appName;
            this.identity.applicationName = data.appName;
        }
        this._communicationId = data.communicationId;
        this.port = data.port;
        this.port.onmessage = function (e) { return _this.registry.execute("onMessage", e.data); };
        if (this.connectionResolve) {
            this.logger.debug("my connection is set up, calling the connection resolve.");
            this.connectionResolve();
            delete this.connectionResolve;
            return;
        }
        this.logger.error("unable to call the connection resolve, because no connection promise was found");
    };
    WebPlatformTransport.prototype.processExtContentConnection = function (data) {
        var _this = this;
        this.logger.debug("handling a connection accepted signal targeted at me for extension content connection.");
        this.extContentConnecting = false;
        this.extContentConnected = true;
        this.publicWindowId = this.parentWindowId || this.myClientId;
        if (this.extContentConnecting && this.identity) {
            this.identity.windowId = this.publicWindowId;
        }
        if (this.identity && data.appName) {
            this.identity.application = data.appName;
            this.identity.applicationName = data.appName;
        }
        window.addEventListener("message", function (event) {
            var _a;
            var extData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42ExtInc;
            if (!extData) {
                return;
            }
            _this.registry.execute("onMessage", extData);
        });
        if (this.connectionResolve) {
            this.logger.debug("my connection is set up, calling the connection resolve.");
            this.connectionResolve();
            delete this.connectionResolve;
            return;
        }
    };
    WebPlatformTransport.prototype.handleAcceptanceOfGrandChildRequest = function (data, event) {
        if (this.extContentConnecting || this.extContentConnected) {
            this.logger.debug("cannot process acceptance of a grandchild, because I am connected to a content script");
            return;
        }
        this.logger.debug("handling a connection accepted signal targeted at a grandchild: " + data.clientId);
        var child = this.children.find(function (c) { return c.grandChildId === data.clientId; });
        if (!child) {
            this.logger.error("cannot handle connection accepted for grandchild: " + data.clientId + ", because there is no grandchild with this id");
            return;
        }
        child.connected = true;
        this.logger.debug("the grandchild connection for " + data.clientId + " is set up, forwarding the success message and the gateway port");
        data.parentWindowId = this.publicWindowId;
        child.source.postMessage(event.data, child.origin, [data.port]);
        return;
    };
    WebPlatformTransport.prototype.handleConnectionRejected = function () {
        this.logger.debug("handling a connection rejection. Most likely the reason is that this window was not created by a glue API call");
        if (this.connectionReject) {
            this.connectionReject("The platform connection was rejected. Most likely because this window was not created by a glue API call");
            delete this.connectionReject;
        }
    };
    WebPlatformTransport.prototype.handleConnectionRequest = function (event) {
        if (this.extContentConnecting) {
            this.logger.debug("This connection request event is targeted at the extension content");
            return;
        }
        var source = event.source;
        var data = event.data.glue42core;
        if (!data.clientType || data.clientType !== "grandChild") {
            return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source was not opened by a glue API call");
        }
        if (!data.clientId) {
            return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source did not provide a valid id");
        }
        if (this.parentType !== "opener" || !this.parent) {
            return this.rejectConnectionRequest(source, event.origin, "Cannot forward the connection request, because no direct connection to the platform was found");
        }
        this.logger.debug("handling a connection request for a grandchild: " + data.clientId);
        this.children.push({ grandChildId: data.clientId, source: source, connected: false, origin: event.origin });
        this.logger.debug("grandchild: " + data.clientId + " is prepared, forwarding connection request to the platform");
        this.parent.postMessage(event.data, this.defaultTargetString);
    };
    WebPlatformTransport.prototype.handleParentPing = function (event) {
        if (!this.parentReady) {
            this.logger.debug("my parent is not ready, I am ignoring the parent ping");
            return;
        }
        if (!this.iAmConnected) {
            this.logger.debug("i am not fully connected yet, I am ignoring the parent ping");
            return;
        }
        var message = {
            glue42core: {
                type: this.messages.parentReady.name
            }
        };
        if (this.extContentConnected) {
            message.glue42core.extMode = { windowId: this.myClientId };
        }
        var source = event.source;
        this.logger.debug("responding to a parent ping with a ready message");
        source.postMessage(message, event.origin);
    };
    WebPlatformTransport.prototype.setupPlatformUnloadListener = function () {
        var _this = this;
        this.onMessage(function (msg) {
            if (msg.type === "platformUnload") {
                _this.logger.debug("detected a web platform unload");
                _this.parentReady = false;
                _this.notifyStatusChanged(false, "Gateway unloaded");
            }
        });
    };
    WebPlatformTransport.prototype.handleManualUnload = function () {
        var _a, _b;
        var message = {
            glue42core: {
                type: this.messages.clientUnload.name,
                data: {
                    clientId: this.myClientId,
                    ownWindowId: (_a = this.identity) === null || _a === void 0 ? void 0 : _a.windowId
                }
            }
        };
        if (this.extContentConnected) {
            return window.postMessage({ glue42ExtOut: message }, this.defaultTargetString);
        }
        (_b = this.port) === null || _b === void 0 ? void 0 : _b.postMessage(message);
    };
    WebPlatformTransport.prototype.handleClientUnload = function (event) {
        var data = event.data.glue42core;
        var clientId = data === null || data === void 0 ? void 0 : data.data.clientId;
        if (!clientId) {
            this.logger.warn("cannot process grand child unload, because the provided id was not valid");
            return;
        }
        var foundChild = this.children.find(function (child) { return child.grandChildId === clientId; });
        if (!foundChild) {
            this.logger.warn("cannot process grand child unload, because this client is unaware of this grandchild");
            return;
        }
        this.logger.debug("handling grandchild unload for id: " + clientId);
        this.children = this.children.filter(function (child) { return child.grandChildId !== clientId; });
    };
    WebPlatformTransport.prototype.handlePlatformPing = function () {
        this.logger.error("cannot handle platform ping, because this is not a platform calls handling component");
    };
    WebPlatformTransport.prototype.notifyStatusChanged = function (status, reason) {
        this.iAmConnected = status;
        this.registry.execute("onConnectedChanged", status, reason);
    };
    WebPlatformTransport.prototype.checkMessageTypeValid = function (typeToValidate) {
        return typeof typeToValidate === "string" && !!this.messages[typeToValidate];
    };
    WebPlatformTransport.prototype.rejectConnectionRequest = function (source, origin, reason) {
        this.rejected = true;
        this.logger.error(reason);
        var rejection = {
            glue42core: {
                type: this.messages.connectionRejected.name
            }
        };
        source.postMessage(rejection, origin);
    };
    WebPlatformTransport.prototype.requestConnectionPermissionFromExt = function () {
        var _this = this;
        return this.waitForContentScript()
            .then(function () { return PromisePlus(function (resolve, reject) {
            _this.extConnectionResolve = resolve;
            _this.extConnectionReject = reject;
            var message = {
                glue42core: {
                    type: "extSetupRequest"
                }
            };
            _this.logger.debug("permission request to the extension content script was sent");
            window.postMessage(message, _this.defaultTargetString);
        }, _this.parentPingTimeout, "Cannot initialize glue, because this app was not opened or created by a Glue Client and the request for extension connection timed out"); });
    };
    WebPlatformTransport.prototype.handleExtConnectionResponse = function (event) {
        var _a;
        var data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.glue42core;
        if (!data.approved && this.extConnectionReject) {
            return this.extConnectionReject("Cannot initialize glue, because this app was not opened or created by a Glue Client and the request for extension connection was rejected");
        }
        if (this.extConnectionResolve) {
            this.extContentConnecting = true;
            this.logger.debug("The extension connection was approved, proceeding.");
            this.extConnectionResolve();
            delete this.extConnectionResolve;
        }
    };
    WebPlatformTransport.prototype.handleExtSetupRequest = function () {
        return;
    };
    WebPlatformTransport.prototype.handleGatewayDisconnect = function () {
        return;
    };
    WebPlatformTransport.prototype.handleGatewayInternalConnect = function () {
        return;
    };
    WebPlatformTransport.prototype.waitForContentScript = function () {
        var _a;
        var contentReady = !!((_a = window.glue42ext) === null || _a === void 0 ? void 0 : _a.content);
        if (contentReady) {
            return Promise.resolve();
        }
        return PromisePlus(function (resolve) {
            window.addEventListener("Glue42EXTReady", function () {
                resolve();
            });
        }, this.connectionRequestTimeout, "The content script was available, but was never heard to be ready");
    };
    return WebPlatformTransport;
}());

var waitForInvocations = function (invocations, callback) {
    var left = invocations;
    return function () {
        left--;
        if (left === 0) {
            callback();
        }
    };
};

var AsyncSequelizer = (function () {
    function AsyncSequelizer(minSequenceInterval) {
        if (minSequenceInterval === void 0) { minSequenceInterval = 0; }
        this.minSequenceInterval = minSequenceInterval;
        this.queue = [];
        this.isExecutingQueue = false;
    }
    AsyncSequelizer.prototype.enqueue = function (action) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.queue.push({ action: action, resolve: resolve, reject: reject });
            _this.executeQueue();
        });
    };
    AsyncSequelizer.prototype.executeQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var operation, actionResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isExecutingQueue) {
                            return [2];
                        }
                        this.isExecutingQueue = true;
                        _a.label = 1;
                    case 1:
                        if (!this.queue.length) return [3, 7];
                        operation = this.queue.shift();
                        if (!operation) {
                            this.isExecutingQueue = false;
                            return [2];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4, operation.action()];
                    case 3:
                        actionResult = _a.sent();
                        operation.resolve(actionResult);
                        return [3, 5];
                    case 4:
                        error_1 = _a.sent();
                        operation.reject(error_1);
                        return [3, 5];
                    case 5: return [4, this.intervalBreak()];
                    case 6:
                        _a.sent();
                        return [3, 1];
                    case 7:
                        this.isExecutingQueue = false;
                        return [2];
                }
            });
        });
    };
    AsyncSequelizer.prototype.intervalBreak = function () {
        var _this = this;
        return new Promise(function (res) { return setTimeout(res, _this.minSequenceInterval); });
    };
    return AsyncSequelizer;
}());

var Connection = (function () {
    function Connection(settings, logger) {
        this.settings = settings;
        this.logger = logger;
        this.messageHandlers = {};
        this.ids = 1;
        this.registry = lib$2();
        this._connected = false;
        this.isTrace = false;
        this._swapTransport = false;
        this._switchInProgress = false;
        this._transportSubscriptions = [];
        this._sequelizer = new AsyncSequelizer();
        settings = settings || {};
        settings.reconnectAttempts = settings.reconnectAttempts || 10;
        settings.reconnectInterval = settings.reconnectInterval || 1000;
        if (settings.inproc) {
            this.transport = new InProcTransport(settings.inproc, logger.subLogger("inMemory"));
        }
        else if (settings.sharedWorker) {
            this.transport = new SharedWorkerTransport(settings.sharedWorker, logger.subLogger("shared-worker"));
        }
        else if (settings.webPlatform) {
            this.transport = new WebPlatformTransport(settings.webPlatform, logger.subLogger("web-platform"), settings.identity);
        }
        else if (settings.ws !== undefined) {
            this.transport = new WS(settings, logger.subLogger("ws"));
        }
        else {
            throw new Error("No connection information specified");
        }
        this.isTrace = logger.canPublish("trace");
        logger.debug("starting with " + this.transport.name() + " transport");
        this.protocol = new GW3ProtocolImpl(this, settings, logger.subLogger("protocol"));
        var unsubConnectionChanged = this.transport.onConnectedChanged(this.handleConnectionChanged.bind(this));
        var unsubOnMessage = this.transport.onMessage(this.handleTransportMessage.bind(this));
        this._transportSubscriptions.push(unsubConnectionChanged);
        this._transportSubscriptions.push(unsubOnMessage);
        this._defaultTransport = this.transport;
    }
    Object.defineProperty(Connection.prototype, "protocolVersion", {
        get: function () {
            var _a;
            return (_a = this.protocol) === null || _a === void 0 ? void 0 : _a.protocolVersion;
        },
        enumerable: true,
        configurable: true
    });
    Connection.prototype.switchTransport = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, this._sequelizer.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
                        var switchTargetTransport, verifyPromise, isSwitchSuccess;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!settings || typeof settings !== "object") {
                                        throw new Error("Cannot switch transports, because the settings are missing or invalid.");
                                    }
                                    if (typeof settings.type === "undefined") {
                                        throw new Error("Cannot switch the transport, because the type is not defined");
                                    }
                                    this.logger.trace("Starting transport switch with settings: " + JSON.stringify(settings));
                                    switchTargetTransport = settings.type === "secondary" ? this.getNewSecondaryTransport(settings) : this._defaultTransport;
                                    this._targetTransport = switchTargetTransport;
                                    this._targetAuth = settings.type === "secondary" ? this.getNewSecondaryAuth(settings) : this._defaultAuth;
                                    verifyPromise = this.verifyConnection();
                                    this._swapTransport = true;
                                    this._switchInProgress = true;
                                    this.logger.trace("The new transport has been set, closing the current transport");
                                    return [4, this.transport.close()];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4, verifyPromise];
                                case 3:
                                    _a.sent();
                                    isSwitchSuccess = this.transport === switchTargetTransport;
                                    this.logger.info("The reconnection after the switch was completed. Was the switch a success: " + isSwitchSuccess);
                                    this._switchInProgress = false;
                                    return [2, { success: isSwitchSuccess }];
                                case 4:
                                    _a.sent();
                                    this.logger.info("The reconnection after the switch timed out, reverting back to the default transport.");
                                    this.switchTransport({ type: "default" });
                                    this._switchInProgress = false;
                                    return [2, { success: false }];
                                case 5: return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    Connection.prototype.onLibReAnnounced = function (callback) {
        return this.registry.add("libReAnnounced", callback);
    };
    Connection.prototype.setLibReAnnounced = function (lib) {
        this.registry.execute("libReAnnounced", lib);
    };
    Connection.prototype.send = function (message, options) {
        if (this.transport.sendObject &&
            this.transport.isObjectBasedTransport) {
            var msg = this.protocol.createObjectMessage(message);
            if (this.isTrace) {
                this.logger.trace(">> " + JSON.stringify(msg));
            }
            return this.transport.sendObject(msg, options);
        }
        else {
            var strMessage = this.protocol.createStringMessage(message);
            if (this.isTrace) {
                this.logger.trace(">> " + strMessage);
            }
            return this.transport.send(strMessage, options);
        }
    };
    Connection.prototype.on = function (type, messageHandler) {
        type = type.toLowerCase();
        if (this.messageHandlers[type] === undefined) {
            this.messageHandlers[type] = {};
        }
        var id = this.ids++;
        this.messageHandlers[type][id] = messageHandler;
        return {
            type: type,
            id: id,
        };
    };
    Connection.prototype.off = function (info) {
        delete this.messageHandlers[info.type.toLowerCase()][info.id];
    };
    Object.defineProperty(Connection.prototype, "isConnected", {
        get: function () {
            return this.protocol.isLoggedIn;
        },
        enumerable: true,
        configurable: true
    });
    Connection.prototype.connected = function (callback) {
        var _this = this;
        return this.protocol.loggedIn(function () {
            var currentServer = _this.transport.name();
            callback(currentServer);
        });
    };
    Connection.prototype.disconnected = function (callback) {
        return this.registry.add("disconnected", callback);
    };
    Connection.prototype.login = function (authRequest, reconnect) {
        return __awaiter(this, void 0, void 0, function () {
            var newAuth, identity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._defaultAuth) {
                            this._defaultAuth = authRequest;
                        }
                        if (this._swapTransport) {
                            this.logger.trace("Detected a transport swap, swapping transports");
                            newAuth = this.transportSwap();
                            authRequest = newAuth !== null && newAuth !== void 0 ? newAuth : authRequest;
                        }
                        this.logger.trace("Starting login for transport: " + this.transport.name() + " and auth " + JSON.stringify(authRequest));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4, this.transport.open()];
                    case 2:
                        _a.sent();
                        this.logger.trace("Transport: " + this.transport.name() + " opened, logging in");
                        timer("connection").mark("transport-opened");
                        return [4, this.protocol.login(authRequest, reconnect)];
                    case 3:
                        identity = _a.sent();
                        this.logger.trace("Logged in with identity: " + JSON.stringify(identity));
                        timer("connection").mark("protocol-logged-in");
                        return [2, identity];
                    case 4:
                        error_2 = _a.sent();
                        if (this._switchInProgress) {
                            this.logger.trace("An error while logging in after a transport swap, preparing a default swap.");
                            this.prepareDefaultSwap();
                        }
                        throw new Error(error_2);
                    case 5: return [2];
                }
            });
        });
    };
    Connection.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.protocol.logout()];
                    case 1:
                        _a.sent();
                        return [4, this.transport.close()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Connection.prototype.loggedIn = function (callback) {
        return this.protocol.loggedIn(callback);
    };
    Connection.prototype.domain = function (domain, successMessages, errorMessages) {
        return this.protocol.domain(domain, this.logger.subLogger("domain=" + domain), successMessages, errorMessages);
    };
    Connection.prototype.authToken = function () {
        return this.protocol.authToken();
    };
    Connection.prototype.reconnect = function () {
        return this.transport.reconnect();
    };
    Connection.prototype.distributeMessage = function (message, type) {
        var _this = this;
        var handlers = this.messageHandlers[type.toLowerCase()];
        if (handlers !== undefined) {
            Object.keys(handlers).forEach(function (handlerId) {
                var handler = handlers[handlerId];
                if (handler !== undefined) {
                    try {
                        handler(message);
                    }
                    catch (error) {
                        try {
                            _this.logger.error("Message handler failed with " + error.stack, error);
                        }
                        catch (loggerError) {
                            console.log("Message handler failed", error);
                        }
                    }
                }
            });
        }
    };
    Connection.prototype.handleConnectionChanged = function (connected) {
        if (this._connected === connected) {
            return;
        }
        this._connected = connected;
        if (connected) {
            if (this.settings.replaySpecs && this.settings.replaySpecs.length) {
                this.replayer = new MessageReplayerImpl(this.settings.replaySpecs);
                this.replayer.init(this);
            }
            this.registry.execute("connected");
        }
        else {
            this.registry.execute("disconnected");
        }
    };
    Connection.prototype.handleTransportMessage = function (msg) {
        var msgObj;
        if (typeof msg === "string") {
            msgObj = this.protocol.processStringMessage(msg);
        }
        else {
            msgObj = this.protocol.processObjectMessage(msg);
        }
        if (this.isTrace) {
            this.logger.trace("<< " + JSON.stringify(msgObj));
        }
        this.distributeMessage(msgObj.msg, msgObj.msgType);
    };
    Connection.prototype.verifyConnection = function () {
        var _this = this;
        return PromisePlus(function (resolve) {
            var unsub;
            var ready = waitForInvocations(2, function () {
                if (unsub) {
                    unsub();
                }
                resolve();
            });
            unsub = _this.onLibReAnnounced(function (lib) {
                if (lib.name === "interop") {
                    return ready();
                }
                if (lib.name === "contexts") {
                    return ready();
                }
            });
        }, 10000, "Transport switch timed out waiting for all libraries to be re-announced");
    };
    Connection.prototype.getNewSecondaryTransport = function (settings) {
        var _a;
        if (!((_a = settings.transportConfig) === null || _a === void 0 ? void 0 : _a.url)) {
            throw new Error("Missing secondary transport URL.");
        }
        return new WS(Object.assign({}, this.settings, { ws: settings.transportConfig.url, reconnectAttempts: 1 }), this.logger.subLogger("ws-secondary"));
    };
    Connection.prototype.getNewSecondaryAuth = function (settings) {
        var _a;
        if (!((_a = settings.transportConfig) === null || _a === void 0 ? void 0 : _a.auth)) {
            throw new Error("Missing secondary transport auth information.");
        }
        return settings.transportConfig.auth;
    };
    Connection.prototype.transportSwap = function () {
        this._swapTransport = false;
        if (!this._targetTransport || !this._targetAuth) {
            this.logger.warn("Error while switching transports - either the target transport or auth is not defined: transport defined -> " + !!this._defaultTransport + ", auth defined -> " + !!this._targetAuth + ". Staying on the current one.");
            return;
        }
        this._transportSubscriptions.forEach(function (unsub) { return unsub(); });
        this._transportSubscriptions = [];
        this.transport = this._targetTransport;
        var unsubConnectionChanged = this.transport.onConnectedChanged(this.handleConnectionChanged.bind(this));
        var unsubOnMessage = this.transport.onMessage(this.handleTransportMessage.bind(this));
        this._transportSubscriptions.push(unsubConnectionChanged);
        this._transportSubscriptions.push(unsubOnMessage);
        return this._targetAuth;
    };
    Connection.prototype.prepareDefaultSwap = function () {
        var _this = this;
        this._transportSubscriptions.forEach(function (unsub) { return unsub(); });
        this._transportSubscriptions = [];
        this.transport.close().catch(function (error) { return _this.logger.warn("Error closing the " + _this.transport.name() + " transport after a failed connection attempt: " + JSON.stringify(error)); });
        this._targetTransport = this._defaultTransport;
        this._targetAuth = this._defaultAuth;
        this._swapTransport = true;
    };
    return Connection;
}());

var order = ["trace", "debug", "info", "warn", "error", "off"];
var Logger$1 = (function () {
    function Logger(name, parent, logFn) {
        this.name = name;
        this.parent = parent;
        this.subLoggers = [];
        this.logFn = console;
        this.customLogFn = false;
        this.name = name;
        if (parent) {
            this.path = parent.path + "." + name;
        }
        else {
            this.path = name;
        }
        this.loggerFullName = "[" + this.path + "]";
        this.includeTimeAndLevel = !logFn;
        if (logFn) {
            this.logFn = logFn;
            this.customLogFn = true;
        }
    }
    Logger.prototype.subLogger = function (name) {
        var existingSub = this.subLoggers.filter(function (subLogger) {
            return subLogger.name === name;
        })[0];
        if (existingSub !== undefined) {
            return existingSub;
        }
        Object.keys(this).forEach(function (key) {
            if (key === name) {
                throw new Error("This sub logger name is not allowed.");
            }
        });
        var sub = new Logger(name, this, this.customLogFn ? this.logFn : undefined);
        this.subLoggers.push(sub);
        return sub;
    };
    Logger.prototype.publishLevel = function (level) {
        var _a;
        if (level) {
            this._publishLevel = level;
        }
        return this._publishLevel || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.publishLevel());
    };
    Logger.prototype.consoleLevel = function (level) {
        var _a;
        if (level) {
            this._consoleLevel = level;
        }
        return this._consoleLevel || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.consoleLevel());
    };
    Logger.prototype.log = function (message, level, error) {
        this.publishMessage(level || "info", message, error);
    };
    Logger.prototype.trace = function (message) {
        this.log(message, "trace");
    };
    Logger.prototype.debug = function (message) {
        this.log(message, "debug");
    };
    Logger.prototype.info = function (message) {
        this.log(message, "info");
    };
    Logger.prototype.warn = function (message) {
        this.log(message, "warn");
    };
    Logger.prototype.error = function (message, err) {
        this.log(message, "error");
    };
    Logger.prototype.canPublish = function (level, compareWith) {
        var levelIdx = order.indexOf(level);
        var restrictionIdx = order.indexOf(compareWith || this.consoleLevel() || "trace");
        return levelIdx >= restrictionIdx;
    };
    Logger.prototype.publishMessage = function (level, message, error) {
        var loggerName = this.loggerFullName;
        if (level === "error" && !error) {
            var e = new Error();
            if (e.stack) {
                message =
                    message +
                        "\n" +
                        e.stack
                            .split("\n")
                            .slice(3)
                            .join("\n");
            }
        }
        if (this.canPublish(level, this.publishLevel())) {
            var interop = Logger.Interop;
            if (interop) {
                try {
                    if (interop.methods({ name: Logger.InteropMethodName }).length > 0) {
                        interop.invoke(Logger.InteropMethodName, {
                            msg: "" + message,
                            logger: loggerName,
                            level: level
                        });
                    }
                }
                catch (_a) {
                }
            }
        }
        if (this.canPublish(level)) {
            var prefix = "";
            if (this.includeTimeAndLevel) {
                var date = new Date();
                var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
                prefix = "[" + time + "] [" + level + "] ";
            }
            var toPrint = "" + prefix + loggerName + ": " + message;
            switch (level) {
                case "trace":
                    this.logFn.debug(toPrint);
                    break;
                case "debug":
                    if (this.logFn.debug) {
                        this.logFn.debug(toPrint);
                    }
                    else {
                        this.logFn.log(toPrint);
                    }
                    break;
                case "info":
                    this.logFn.info(toPrint);
                    break;
                case "warn":
                    this.logFn.warn(toPrint);
                    break;
                case "error":
                    this.logFn.error(toPrint, error);
                    break;
            }
        }
    };
    Logger.InteropMethodName = "T42.AppLogger.Log";
    return Logger;
}());

var GW_MESSAGE_CREATE_CONTEXT = "create-context";
var GW_MESSAGE_ACTIVITY_CREATED = "created";
var GW_MESSAGE_ACTIVITY_DESTROYED = "destroyed";
var GW_MESSAGE_CONTEXT_CREATED = "context-created";
var GW_MESSAGE_CONTEXT_ADDED = "context-added";
var GW_MESSAGE_SUBSCRIBE_CONTEXT = "subscribe-context";
var GW_MESSAGE_SUBSCRIBED_CONTEXT = "subscribed-context";
var GW_MESSAGE_UNSUBSCRIBE_CONTEXT = "unsubscribe-context";
var GW_MESSAGE_DESTROY_CONTEXT = "destroy-context";
var GW_MESSAGE_CONTEXT_DESTROYED = "context-destroyed";
var GW_MESSAGE_UPDATE_CONTEXT = "update-context";
var GW_MESSAGE_CONTEXT_UPDATED = "context-updated";
var GW_MESSAGE_JOINED_ACTIVITY = "joined";

var ContextMessageReplaySpec = {
    get name() {
        return "context";
    },
    get types() {
        return [
            GW_MESSAGE_CREATE_CONTEXT,
            GW_MESSAGE_ACTIVITY_CREATED,
            GW_MESSAGE_ACTIVITY_DESTROYED,
            GW_MESSAGE_CONTEXT_CREATED,
            GW_MESSAGE_CONTEXT_ADDED,
            GW_MESSAGE_SUBSCRIBE_CONTEXT,
            GW_MESSAGE_SUBSCRIBED_CONTEXT,
            GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
            GW_MESSAGE_DESTROY_CONTEXT,
            GW_MESSAGE_CONTEXT_DESTROYED,
            GW_MESSAGE_UPDATE_CONTEXT,
            GW_MESSAGE_CONTEXT_UPDATED,
            GW_MESSAGE_JOINED_ACTIVITY
        ];
    }
};

var version$2 = "5.7.5";

function prepareConfig$1 (configuration, ext, glue42gd) {
    var _a, _b, _c, _d;
    var nodeStartingContext;
    if (Utils$1.isNode()) {
        var startingContextString = process.env._GD_STARTING_CONTEXT_;
        if (startingContextString) {
            try {
                nodeStartingContext = JSON.parse(startingContextString);
            }
            catch (_e) {
            }
        }
    }
    function getConnection() {
        var _a, _b, _c, _d, _e, _f;
        var gwConfig = configuration.gateway;
        var protocolVersion = (_a = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.protocolVersion) !== null && _a !== void 0 ? _a : 3;
        var reconnectInterval = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectInterval;
        var reconnectAttempts = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.reconnectAttempts;
        var defaultWs = "ws://localhost:8385";
        var ws = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.ws;
        var sharedWorker = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.sharedWorker;
        var inproc = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.inproc;
        var webPlatform = (_b = gwConfig === null || gwConfig === void 0 ? void 0 : gwConfig.webPlatform) !== null && _b !== void 0 ? _b : undefined;
        if (glue42gd) {
            ws = glue42gd.gwURL;
        }
        if (Utils$1.isNode() && nodeStartingContext && nodeStartingContext.gwURL) {
            ws = nodeStartingContext.gwURL;
        }
        if (!ws && !sharedWorker && !inproc) {
            ws = defaultWs;
        }
        var instanceId;
        var windowId;
        var pid;
        var environment;
        var region;
        var appName = getApplication();
        var uniqueAppName = appName;
        if (typeof glue42gd !== "undefined") {
            windowId = glue42gd.windowId;
            pid = glue42gd.pid;
            if (glue42gd.env) {
                environment = glue42gd.env.env;
                region = glue42gd.env.region;
            }
            uniqueAppName = (_c = glue42gd.application) !== null && _c !== void 0 ? _c : "glue-app";
            instanceId = glue42gd.appInstanceId;
        }
        else if (Utils$1.isNode()) {
            pid = process.pid;
            if (nodeStartingContext) {
                environment = nodeStartingContext.env;
                region = nodeStartingContext.region;
                instanceId = nodeStartingContext.instanceId;
            }
        }
        else if (typeof (window === null || window === void 0 ? void 0 : window.glue42electron) !== "undefined") {
            windowId = window === null || window === void 0 ? void 0 : window.glue42electron.instanceId;
            pid = window === null || window === void 0 ? void 0 : window.glue42electron.pid;
            environment = window === null || window === void 0 ? void 0 : window.glue42electron.env;
            region = window === null || window === void 0 ? void 0 : window.glue42electron.region;
            uniqueAppName = (_d = window === null || window === void 0 ? void 0 : window.glue42electron.application) !== null && _d !== void 0 ? _d : "glue-app";
            instanceId = window === null || window === void 0 ? void 0 : window.glue42electron.instanceId;
        }
        else ;
        var replaySpecs = (_f = (_e = configuration.gateway) === null || _e === void 0 ? void 0 : _e.replaySpecs) !== null && _f !== void 0 ? _f : [];
        replaySpecs.push(ContextMessageReplaySpec);
        var identity = {
            application: uniqueAppName,
            applicationName: appName,
            windowId: windowId,
            instance: instanceId,
            process: pid,
            region: region,
            environment: environment,
            api: ext.version || version$2
        };
        if (configuration.identity) {
            identity = Object.assign(identity, configuration.identity);
        }
        return {
            identity: identity,
            reconnectInterval: reconnectInterval,
            ws: ws,
            sharedWorker: sharedWorker,
            webPlatform: webPlatform,
            inproc: inproc,
            protocolVersion: protocolVersion,
            reconnectAttempts: reconnectAttempts,
            replaySpecs: replaySpecs,
        };
    }
    function getContexts() {
        if (typeof configuration.contexts === "undefined") {
            return { reAnnounceKnownContexts: true };
        }
        if (typeof configuration.contexts === "boolean" && configuration.contexts) {
            return { reAnnounceKnownContexts: true };
        }
        if (typeof configuration.contexts === "object") {
            return Object.assign({}, { reAnnounceKnownContexts: true }, configuration.contexts);
        }
        return false;
    }
    function getApplication() {
        if (configuration.application) {
            return configuration.application;
        }
        if (glue42gd) {
            return glue42gd.applicationName;
        }
        if (typeof window !== "undefined" && typeof window.glue42electron !== "undefined") {
            return window.glue42electron.application;
        }
        var uid = shortid$1();
        if (Utils$1.isNode()) {
            if (nodeStartingContext) {
                return nodeStartingContext.applicationConfig.name;
            }
            return "NodeJS" + uid;
        }
        if (typeof window !== "undefined" && typeof document !== "undefined") {
            return document.title + (" (" + uid + ")");
        }
        return uid;
    }
    function getAuth() {
        var _a, _b, _c;
        if (typeof configuration.auth === "string") {
            return {
                token: configuration.auth
            };
        }
        if (configuration.auth) {
            return configuration.auth;
        }
        if (Utils$1.isNode() && nodeStartingContext && nodeStartingContext.gwToken) {
            return {
                gatewayToken: nodeStartingContext.gwToken
            };
        }
        if (((_a = configuration.gateway) === null || _a === void 0 ? void 0 : _a.webPlatform) || ((_b = configuration.gateway) === null || _b === void 0 ? void 0 : _b.inproc) || ((_c = configuration.gateway) === null || _c === void 0 ? void 0 : _c.sharedWorker)) {
            return {
                username: "glue42", password: "glue42"
            };
        }
    }
    function getLogger() {
        var _a, _b;
        var config = configuration.logger;
        var defaultLevel = "warn";
        if (!config) {
            config = defaultLevel;
        }
        var gdConsoleLevel;
        if (glue42gd) {
            gdConsoleLevel = glue42gd.consoleLogLevel;
        }
        if (typeof config === "string") {
            return { console: gdConsoleLevel !== null && gdConsoleLevel !== void 0 ? gdConsoleLevel : config, publish: defaultLevel };
        }
        return {
            console: (_a = gdConsoleLevel !== null && gdConsoleLevel !== void 0 ? gdConsoleLevel : config.console) !== null && _a !== void 0 ? _a : defaultLevel,
            publish: (_b = config.publish) !== null && _b !== void 0 ? _b : defaultLevel
        };
    }
    var connection = getConnection();
    var application = getApplication();
    if (typeof window !== "undefined") {
        var windowAsAny = window;
        var containerApplication = windowAsAny.htmlContainer ?
            windowAsAny.htmlContainer.containerName + "." + windowAsAny.htmlContainer.application : (_a = windowAsAny === null || windowAsAny === void 0 ? void 0 : windowAsAny.glue42gd) === null || _a === void 0 ? void 0 : _a.application;
        if (containerApplication) {
            application = containerApplication;
        }
    }
    return {
        bus: (_b = configuration.bus) !== null && _b !== void 0 ? _b : false,
        application: application,
        auth: getAuth(),
        logger: getLogger(),
        connection: connection,
        metrics: (_c = configuration.metrics) !== null && _c !== void 0 ? _c : true,
        contexts: getContexts(),
        version: ext.version || version$2,
        libs: (_d = ext.libs) !== null && _d !== void 0 ? _d : [],
        customLogger: configuration.customLogger
    };
}

var GW3ContextData = (function () {
    function GW3ContextData(contextId, name, isAnnounced, activityId) {
        this.updateCallbacks = {};
        this.contextId = contextId;
        this.name = name;
        this.isAnnounced = isAnnounced;
        this.activityId = activityId;
        this.context = {};
    }
    GW3ContextData.prototype.hasCallbacks = function () {
        return Object.keys(this.updateCallbacks).length > 0;
    };
    GW3ContextData.prototype.getState = function () {
        if (this.isAnnounced && this.hasCallbacks()) {
            return 3;
        }
        if (this.isAnnounced) {
            return 2;
        }
        if (this.hasCallbacks()) {
            return 1;
        }
        return 0;
    };
    return GW3ContextData;
}());

function applyContextDelta(context, delta, logger) {
    try {
        if (logger === null || logger === void 0 ? void 0 : logger.canPublish("trace")) {
            logger === null || logger === void 0 ? void 0 : logger.trace("applying context delta " + JSON.stringify(delta) + " on context " + JSON.stringify(context));
        }
        if (!delta) {
            return context;
        }
        if (delta.reset) {
            context = __assign({}, delta.reset);
            return context;
        }
        context = deepClone(context, undefined);
        if (delta.commands) {
            for (var _i = 0, _a = delta.commands; _i < _a.length; _i++) {
                var command = _a[_i];
                if (command.type === "remove") {
                    deletePath(context, command.path);
                }
                else if (command.type === "set") {
                    setValueToPath(context, command.value, command.path);
                }
            }
            return context;
        }
        var added_1 = delta.added;
        var updated_1 = delta.updated;
        var removed = delta.removed;
        if (added_1) {
            Object.keys(added_1).forEach(function (key) {
                context[key] = added_1[key];
            });
        }
        if (updated_1) {
            Object.keys(updated_1).forEach(function (key) {
                mergeObjectsProperties(key, context, updated_1);
            });
        }
        if (removed) {
            removed.forEach(function (key) {
                delete context[key];
            });
        }
        return context;
    }
    catch (e) {
        logger === null || logger === void 0 ? void 0 : logger.error("error applying context delta " + JSON.stringify(delta) + " on context " + JSON.stringify(context), e);
        return context;
    }
}
function deepClone(obj, hash) {
    hash = hash || new WeakMap();
    if (Object(obj) !== obj) {
        return obj;
    }
    if (obj instanceof Set) {
        return new Set(obj);
    }
    if (hash.has(obj)) {
        return hash.get(obj);
    }
    var result = obj instanceof Date ? new Date(obj)
        : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
            : obj.constructor ? new obj.constructor()
                : Object.create(null);
    hash.set(obj, result);
    if (obj instanceof Map) {
        Array.from(obj, function (_a) {
            var key = _a[0], val = _a[1];
            return result.set(key, deepClone(val, hash));
        });
    }
    return Object.assign.apply(Object, __spreadArrays([result], Object.keys(obj).map(function (key) {
        var _a;
        return (_a = {}, _a[key] = deepClone(obj[key], hash), _a);
    })));
}
var mergeObjectsProperties = function (key, what, withWhat) {
    var right = withWhat[key];
    if (right === undefined) {
        return what;
    }
    var left = what[key];
    if (!left || !right) {
        what[key] = right;
        return what;
    }
    if (typeof left === "string" ||
        typeof left === "number" ||
        typeof left === "boolean" ||
        typeof right === "string" ||
        typeof right === "number" ||
        typeof right === "boolean" ||
        Array.isArray(left) ||
        Array.isArray(right)) {
        what[key] = right;
        return what;
    }
    what[key] = Object.assign({}, left, right);
    return what;
};
function deepEqual(x, y) {
    if (x === y) {
        return true;
    }
    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false;
    }
    if (x.constructor !== y.constructor) {
        return false;
    }
    for (var p in x) {
        if (!x.hasOwnProperty(p)) {
            continue;
        }
        if (!y.hasOwnProperty(p)) {
            return false;
        }
        if (x[p] === y[p]) {
            continue;
        }
        if (typeof (x[p]) !== "object") {
            return false;
        }
        if (!deepEqual(x[p], y[p])) {
            return false;
        }
    }
    for (var p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
}
function setValueToPath(obj, value, path) {
    var pathArr = path.split(".");
    var i;
    for (i = 0; i < pathArr.length - 1; i++) {
        if (!obj[pathArr[i]]) {
            obj[pathArr[i]] = {};
        }
        if (typeof obj[pathArr[i]] !== "object") {
            obj[pathArr[i]] = {};
        }
        obj = obj[pathArr[i]];
    }
    obj[pathArr[i]] = value;
}
function isSubset(superObj, subObj) {
    return Object.keys(subObj).every(function (ele) {
        if (typeof subObj[ele] === "object") {
            return isSubset((superObj === null || superObj === void 0 ? void 0 : superObj[ele]) || {}, subObj[ele] || {});
        }
        return subObj[ele] === (superObj === null || superObj === void 0 ? void 0 : superObj[ele]);
    });
}
function deletePath(obj, path) {
    var pathArr = path.split(".");
    var i;
    for (i = 0; i < pathArr.length - 1; i++) {
        if (!obj[pathArr[i]]) {
            return;
        }
        obj = obj[pathArr[i]];
    }
    delete obj[pathArr[i]];
}

var GW3Bridge$1 = (function () {
    function GW3Bridge(config) {
        var _this = this;
        var _a;
        this._contextNameToData = {};
        this._gw3Subscriptions = [];
        this._nextCallbackSubscriptionNumber = 0;
        this._contextNameToId = {};
        this._contextIdToName = {};
        this._protocolVersion = undefined;
        this._contextsTempCache = {};
        this._contextsSubscriptionsCache = [];
        this._connection = config.connection;
        this._logger = config.logger;
        this._trackAllContexts = config.trackAllContexts;
        this._reAnnounceKnownContexts = config.reAnnounceKnownContexts;
        this._gw3Session = this._connection.domain("global", [
            GW_MESSAGE_CONTEXT_CREATED,
            GW_MESSAGE_SUBSCRIBED_CONTEXT,
            GW_MESSAGE_CONTEXT_DESTROYED,
            GW_MESSAGE_CONTEXT_UPDATED,
        ]);
        this._gw3Session.disconnected(this.resetState.bind(this));
        this._gw3Session.onJoined(function (wasReconnect) {
            if (!wasReconnect) {
                return;
            }
            if (!_this._reAnnounceKnownContexts) {
                return _this._connection.setLibReAnnounced({ name: "contexts" });
            }
            _this.reInitiateState().then(function () { return _this._connection.setLibReAnnounced({ name: "contexts" }); });
        });
        this.subscribeToContextCreatedMessages();
        this.subscribeToContextUpdatedMessages();
        this.subscribeToContextDestroyedMessages();
        (_a = this._connection.replayer) === null || _a === void 0 ? void 0 : _a.drain(ContextMessageReplaySpec.name, function (message) {
            var type = message.type;
            if (!type) {
                return;
            }
            if (type === GW_MESSAGE_CONTEXT_CREATED ||
                type === GW_MESSAGE_CONTEXT_ADDED ||
                type === GW_MESSAGE_ACTIVITY_CREATED) {
                _this.handleContextCreatedMessage(message);
            }
            else if (type === GW_MESSAGE_SUBSCRIBED_CONTEXT ||
                type === GW_MESSAGE_CONTEXT_UPDATED ||
                type === GW_MESSAGE_JOINED_ACTIVITY) {
                _this.handleContextUpdatedMessage(message);
            }
            else if (type === GW_MESSAGE_CONTEXT_DESTROYED ||
                type === GW_MESSAGE_ACTIVITY_DESTROYED) {
                _this.handleContextDestroyedMessage(message);
            }
        });
    }
    Object.defineProperty(GW3Bridge.prototype, "protocolVersion", {
        get: function () {
            var _a;
            if (!this._protocolVersion) {
                var contextsDomainInfo = this._connection.availableDomains.find(function (d) { return d.uri === "context"; });
                this._protocolVersion = (_a = contextsDomainInfo === null || contextsDomainInfo === void 0 ? void 0 : contextsDomainInfo.version) !== null && _a !== void 0 ? _a : 1;
            }
            return this._protocolVersion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GW3Bridge.prototype, "setPathSupported", {
        get: function () {
            return this.protocolVersion >= 2;
        },
        enumerable: true,
        configurable: true
    });
    GW3Bridge.prototype.dispose = function () {
        for (var _i = 0, _a = this._gw3Subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            this._connection.off(sub);
        }
        this._gw3Subscriptions.length = 0;
        for (var contextName in this._contextNameToData) {
            if (this._contextNameToId.hasOwnProperty(contextName)) {
                delete this._contextNameToData[contextName];
            }
        }
    };
    GW3Bridge.prototype.createContext = function (name, data) {
        var _this = this;
        return this._gw3Session
            .send({
            type: GW_MESSAGE_CREATE_CONTEXT,
            domain: "global",
            name: name,
            data: data,
            lifetime: "retained",
        })
            .then(function (createContextMsg) {
            _this._contextNameToId[name] = createContextMsg.context_id;
            _this._contextIdToName[createContextMsg.context_id] = name;
            var contextData = _this._contextNameToData[name] || new GW3ContextData(createContextMsg.context_id, name, true, undefined);
            contextData.isAnnounced = true;
            contextData.name = name;
            contextData.contextId = createContextMsg.context_id;
            contextData.context = createContextMsg.data || data;
            contextData.hasReceivedSnapshot = true;
            _this._contextNameToData[name] = contextData;
            return createContextMsg.context_id;
        });
    };
    GW3Bridge.prototype.all = function () {
        var _this = this;
        return Object.keys(this._contextNameToData)
            .filter(function (name) { return _this._contextNameToData[name].isAnnounced; });
    };
    GW3Bridge.prototype.update = function (name, delta) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var contextData, currentContext, calculatedDelta;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contextData = this._contextNameToData[name];
                        if (!contextData || !contextData.isAnnounced) {
                            return [2, this.createContext(name, delta)];
                        }
                        currentContext = contextData.context;
                        if (!!contextData.hasCallbacks()) return [3, 2];
                        return [4, this.get(contextData.name)];
                    case 1:
                        currentContext = _b.sent();
                        _b.label = 2;
                    case 2:
                        calculatedDelta = this.protocolVersion === 2 ?
                            this.calculateContextDeltaV2(currentContext, delta) :
                            this.calculateContextDeltaV1(currentContext, delta);
                        if (!Object.keys(calculatedDelta.added).length
                            && !Object.keys(calculatedDelta.updated).length
                            && !calculatedDelta.removed.length
                            && !((_a = calculatedDelta.commands) === null || _a === void 0 ? void 0 : _a.length)) {
                            return [2, Promise.resolve()];
                        }
                        return [2, this._gw3Session
                                .send({
                                type: GW_MESSAGE_UPDATE_CONTEXT,
                                domain: "global",
                                context_id: contextData.contextId,
                                delta: calculatedDelta,
                            }, {}, { skipPeerId: false })
                                .then(function (gwResponse) {
                                _this.handleUpdated(contextData, calculatedDelta, {
                                    updaterId: gwResponse.peer_id
                                });
                            })];
                }
            });
        });
    };
    GW3Bridge.prototype.set = function (name, data) {
        var _this = this;
        var contextData = this._contextNameToData[name];
        if (!contextData || !contextData.isAnnounced) {
            return this.createContext(name, data);
        }
        return this._gw3Session
            .send({
            type: GW_MESSAGE_UPDATE_CONTEXT,
            domain: "global",
            context_id: contextData.contextId,
            delta: { reset: data },
        }, {}, { skipPeerId: false })
            .then(function (gwResponse) {
            _this.handleUpdated(contextData, { reset: data, added: {}, removed: [], updated: {} }, { updaterId: gwResponse.peer_id });
        });
    };
    GW3Bridge.prototype.setPath = function (name, path, value) {
        if (!this.setPathSupported) {
            return Promise.reject("glue.contexts.setPath operation is not supported, use Glue42 3.10 or later");
        }
        return this.setPaths(name, [{ path: path, value: value }]);
    };
    GW3Bridge.prototype.setPaths = function (name, pathValues) {
        var _this = this;
        if (!this.setPathSupported) {
            return Promise.reject("glue.contexts.setPaths operation is not supported, use Glue42 3.10 or later");
        }
        var contextData = this._contextNameToData[name];
        if (!contextData || !contextData.isAnnounced) {
            var obj = {};
            for (var _i = 0, pathValues_1 = pathValues; _i < pathValues_1.length; _i++) {
                var pathValue = pathValues_1[_i];
                setValueToPath(obj, pathValue.value, pathValue.path);
            }
            return this.createContext(name, obj);
        }
        var commands = [];
        for (var _a = 0, pathValues_2 = pathValues; _a < pathValues_2.length; _a++) {
            var pathValue = pathValues_2[_a];
            if (pathValue.value === null) {
                commands.push({ type: "remove", path: pathValue.path });
            }
            else {
                commands.push({ type: "set", path: pathValue.path, value: pathValue.value });
            }
        }
        return this._gw3Session
            .send({
            type: GW_MESSAGE_UPDATE_CONTEXT,
            domain: "global",
            context_id: contextData.contextId,
            delta: { commands: commands }
        }, {}, { skipPeerId: false })
            .then(function (gwResponse) {
            _this.handleUpdated(contextData, { added: {}, removed: [], updated: {}, commands: commands }, { updaterId: gwResponse.peer_id });
        });
    };
    GW3Bridge.prototype.get = function (name) {
        var _this = this;
        var _a;
        var contextData = this._contextNameToData[name];
        if (!contextData || !contextData.isAnnounced) {
            return Promise.resolve({});
        }
        if (contextData && (!contextData.hasCallbacks() || !contextData.hasReceivedSnapshot)) {
            return new Promise(function (resolve) {
                _this.subscribe(name, function (data, _d, _r, un) {
                    _this.unsubscribe(un);
                    resolve(data);
                });
            });
        }
        var context = (_a = contextData === null || contextData === void 0 ? void 0 : contextData.context) !== null && _a !== void 0 ? _a : {};
        return Promise.resolve(context);
    };
    GW3Bridge.prototype.subscribe = function (name, callback, subscriptionKey) {
        var _this = this;
        var thisCallbackSubscriptionNumber = typeof subscriptionKey === "undefined" ? this._nextCallbackSubscriptionNumber : subscriptionKey;
        if (typeof subscriptionKey === "undefined") {
            this._nextCallbackSubscriptionNumber += 1;
        }
        if (this._contextsSubscriptionsCache.every(function (subscription) { return subscription.subKey !== _this._nextCallbackSubscriptionNumber; })) {
            this._contextsSubscriptionsCache.push({ contextName: name, subKey: thisCallbackSubscriptionNumber, callback: callback });
        }
        var contextData = this._contextNameToData[name];
        if (!contextData ||
            !contextData.isAnnounced) {
            contextData = contextData || new GW3ContextData(undefined, name, false, undefined);
            this._contextNameToData[name] = contextData;
            contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;
            return Promise.resolve(thisCallbackSubscriptionNumber);
        }
        var hadCallbacks = contextData.hasCallbacks();
        contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;
        if (!hadCallbacks) {
            if (!contextData.joinedActivity) {
                if (contextData.context && contextData.sentExplicitSubscription) {
                    if (contextData.hasReceivedSnapshot) {
                        var clone = deepClone(contextData.context);
                        callback(clone, clone, [], thisCallbackSubscriptionNumber);
                    }
                    return Promise.resolve(thisCallbackSubscriptionNumber);
                }
                return this.sendSubscribe(contextData)
                    .then(function () { return thisCallbackSubscriptionNumber; });
            }
            else {
                if (contextData.hasReceivedSnapshot) {
                    var clone = deepClone(contextData.context);
                    callback(clone, clone, [], thisCallbackSubscriptionNumber);
                }
                return Promise.resolve(thisCallbackSubscriptionNumber);
            }
        }
        else {
            if (contextData.hasReceivedSnapshot) {
                var clone = deepClone(contextData.context);
                callback(clone, clone, [], thisCallbackSubscriptionNumber);
            }
            return Promise.resolve(thisCallbackSubscriptionNumber);
        }
    };
    GW3Bridge.prototype.unsubscribe = function (subscriptionKey) {
        this._contextsSubscriptionsCache = this._contextsSubscriptionsCache.filter(function (subscription) { return subscription.subKey !== subscriptionKey; });
        for (var _i = 0, _a = Object.keys(this._contextNameToData); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var contextData = this._contextNameToData[name_1];
            if (!contextData) {
                return;
            }
            var hadCallbacks = contextData.hasCallbacks();
            delete contextData.updateCallbacks[subscriptionKey];
            if (contextData.isAnnounced &&
                hadCallbacks &&
                !contextData.hasCallbacks() &&
                contextData.sentExplicitSubscription) {
                this.sendUnsubscribe(contextData);
            }
            if (!contextData.isAnnounced &&
                !contextData.hasCallbacks()) {
                delete this._contextNameToData[name_1];
            }
        }
    };
    GW3Bridge.prototype.destroy = function (name) {
        var contextData = this._contextNameToData[name];
        if (!contextData) {
            return Promise.reject("context with " + name + " does not exist");
        }
        return this._gw3Session
            .send({
            type: GW_MESSAGE_DESTROY_CONTEXT,
            domain: "global",
            context_id: contextData.contextId,
        }).then(function (_) { return undefined; });
    };
    GW3Bridge.prototype.handleUpdated = function (contextData, delta, extraData) {
        var oldContext = contextData.context;
        contextData.context = applyContextDelta(contextData.context, delta, this._logger);
        contextData.hasReceivedSnapshot = true;
        if (this._contextNameToData[contextData.name] === contextData &&
            !deepEqual(oldContext, contextData.context)) {
            this.invokeUpdateCallbacks(contextData, delta, extraData);
        }
    };
    GW3Bridge.prototype.subscribeToContextCreatedMessages = function () {
        var createdMessageTypes = [
            GW_MESSAGE_CONTEXT_ADDED,
            GW_MESSAGE_CONTEXT_CREATED,
            GW_MESSAGE_ACTIVITY_CREATED,
        ];
        for (var _i = 0, createdMessageTypes_1 = createdMessageTypes; _i < createdMessageTypes_1.length; _i++) {
            var createdMessageType = createdMessageTypes_1[_i];
            var sub = this._connection.on(createdMessageType, this.handleContextCreatedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    };
    GW3Bridge.prototype.handleContextCreatedMessage = function (contextCreatedMsg) {
        var _this = this;
        var createdMessageType = contextCreatedMsg.type;
        if (createdMessageType === GW_MESSAGE_ACTIVITY_CREATED) {
            this._contextNameToId[contextCreatedMsg.activity_id] = contextCreatedMsg.context_id;
            this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.activity_id;
        }
        else if (createdMessageType === GW_MESSAGE_CONTEXT_ADDED) {
            this._contextNameToId[contextCreatedMsg.name] = contextCreatedMsg.context_id;
            this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.name;
        }
        else ;
        var name = this._contextIdToName[contextCreatedMsg.context_id];
        if (!name) {
            throw new Error("Received created event for context with unknown name: " + contextCreatedMsg.context_id);
        }
        if (!this._contextNameToId[name]) {
            throw new Error("Received created event for context with unknown id: " + contextCreatedMsg.context_id);
        }
        var contextData = this._contextNameToData[name];
        if (contextData) {
            if (contextData.isAnnounced) {
                return;
            }
            else {
                if (!contextData.hasCallbacks()) {
                    throw new Error("Assertion failure: contextData.hasCallbacks()");
                }
                contextData.isAnnounced = true;
                contextData.contextId = contextCreatedMsg.context_id;
                contextData.activityId = contextCreatedMsg.activity_id;
                if (!contextData.sentExplicitSubscription) {
                    this.sendSubscribe(contextData);
                }
            }
        }
        else {
            this._contextNameToData[name] = contextData =
                new GW3ContextData(contextCreatedMsg.context_id, name, true, contextCreatedMsg.activity_id);
            if (this._trackAllContexts) {
                this.subscribe(name, function () { }).then(function (subKey) { return _this._systemContextsSubKey = subKey; });
            }
        }
    };
    GW3Bridge.prototype.subscribeToContextUpdatedMessages = function () {
        var updatedMessageTypes = [
            GW_MESSAGE_CONTEXT_UPDATED,
            GW_MESSAGE_SUBSCRIBED_CONTEXT,
            GW_MESSAGE_JOINED_ACTIVITY,
        ];
        for (var _i = 0, updatedMessageTypes_1 = updatedMessageTypes; _i < updatedMessageTypes_1.length; _i++) {
            var updatedMessageType = updatedMessageTypes_1[_i];
            var sub = this._connection.on(updatedMessageType, this.handleContextUpdatedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    };
    GW3Bridge.prototype.handleContextUpdatedMessage = function (contextUpdatedMsg) {
        var updatedMessageType = contextUpdatedMsg.type;
        var contextId = contextUpdatedMsg.context_id;
        var contextData = this._contextNameToData[this._contextIdToName[contextId]];
        var justSeen = !contextData || !contextData.isAnnounced;
        if (updatedMessageType === GW_MESSAGE_JOINED_ACTIVITY) {
            if (!contextData) {
                contextData = new GW3ContextData(contextId, contextUpdatedMsg.activity_id, true, contextUpdatedMsg.activity_id);
                this._contextNameToData[contextUpdatedMsg.activity_id] = contextData;
                this._contextIdToName[contextId] = contextUpdatedMsg.activity_id;
                this._contextNameToId[contextUpdatedMsg.activity_id] = contextId;
            }
            else {
                contextData.contextId = contextId;
                contextData.isAnnounced = true;
                contextData.activityId = contextUpdatedMsg.activity_id;
            }
            contextData.joinedActivity = true;
        }
        else {
            if (!contextData || !contextData.isAnnounced) {
                if (updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                    contextData = contextData || new GW3ContextData(contextId, contextUpdatedMsg.name, true, undefined);
                    contextData.sentExplicitSubscription = true;
                    this._contextNameToData[contextUpdatedMsg.name] = contextData;
                    this._contextIdToName[contextId] = contextUpdatedMsg.name;
                    this._contextNameToId[contextUpdatedMsg.name] = contextId;
                }
                else {
                    this._logger.error("Received 'update' for unknown context: " + contextId);
                }
                return;
            }
        }
        var oldContext = contextData.context;
        contextData.hasReceivedSnapshot = true;
        if (updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
            contextData.context = contextUpdatedMsg.data || {};
        }
        else if (updatedMessageType === GW_MESSAGE_JOINED_ACTIVITY) {
            contextData.context = contextUpdatedMsg.context_snapshot || {};
        }
        else if (updatedMessageType === GW_MESSAGE_CONTEXT_UPDATED) {
            contextData.context = applyContextDelta(contextData.context, contextUpdatedMsg.delta, this._logger);
        }
        else {
            throw new Error("Unrecognized context update message " + updatedMessageType);
        }
        if (justSeen ||
            !deepEqual(contextData.context, oldContext) ||
            updatedMessageType === GW_MESSAGE_SUBSCRIBED_CONTEXT) {
            this.invokeUpdateCallbacks(contextData, contextUpdatedMsg.delta, { updaterId: contextUpdatedMsg.updater_id });
        }
    };
    GW3Bridge.prototype.invokeUpdateCallbacks = function (contextData, delta, extraData) {
        delta = delta || { added: {}, updated: {}, reset: {}, removed: [] };
        if (delta.commands) {
            delta.added = delta.updated = delta.reset = {};
            delta.removed = [];
            for (var _i = 0, _a = delta.commands; _i < _a.length; _i++) {
                var command = _a[_i];
                if (command.type === "remove") {
                    if (command.path.indexOf(".") === -1) {
                        delta.removed.push(command.path);
                    }
                    setValueToPath(delta.updated, null, command.path);
                }
                else if (command.type === "set") {
                    setValueToPath(delta.updated, command.value, command.path);
                }
            }
        }
        for (var updateCallbackIndex in contextData.updateCallbacks) {
            if (contextData.updateCallbacks.hasOwnProperty(updateCallbackIndex)) {
                try {
                    var updateCallback = contextData.updateCallbacks[updateCallbackIndex];
                    updateCallback(deepClone(contextData.context), Object.assign({}, delta.added || {}, delta.updated || {}, delta.reset || {}), delta.removed, parseInt(updateCallbackIndex, 10), extraData);
                }
                catch (err) {
                    this._logger.debug("callback error: " + JSON.stringify(err));
                }
            }
        }
    };
    GW3Bridge.prototype.subscribeToContextDestroyedMessages = function () {
        var destroyedMessageTypes = [
            GW_MESSAGE_CONTEXT_DESTROYED,
            GW_MESSAGE_ACTIVITY_DESTROYED,
        ];
        for (var _i = 0, destroyedMessageTypes_1 = destroyedMessageTypes; _i < destroyedMessageTypes_1.length; _i++) {
            var destroyedMessageType = destroyedMessageTypes_1[_i];
            var sub = this._connection.on(destroyedMessageType, this.handleContextDestroyedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    };
    GW3Bridge.prototype.handleContextDestroyedMessage = function (destroyedMsg) {
        var destroyedMessageType = destroyedMsg.type;
        var contextId;
        var name;
        if (destroyedMessageType === GW_MESSAGE_ACTIVITY_DESTROYED) {
            name = destroyedMsg.activity_id;
            contextId = this._contextNameToId[name];
            if (!contextId) {
                this._logger.error("Received 'destroyed' for unknown activity: " + destroyedMsg.activity_id);
                return;
            }
        }
        else {
            contextId = destroyedMsg.context_id;
            name = this._contextIdToName[contextId];
            if (!name) {
                this._logger.error("Received 'destroyed' for unknown context: " + destroyedMsg.context_id);
                return;
            }
        }
        delete this._contextIdToName[contextId];
        delete this._contextNameToId[name];
        var contextData = this._contextNameToData[name];
        delete this._contextNameToData[name];
        if (!contextData || !contextData.isAnnounced) {
            this._logger.error("Received 'destroyed' for unknown context: " + contextId);
            return;
        }
    };
    GW3Bridge.prototype.sendSubscribe = function (contextData) {
        contextData.sentExplicitSubscription = true;
        return this._gw3Session
            .send({
            type: GW_MESSAGE_SUBSCRIBE_CONTEXT,
            domain: "global",
            context_id: contextData.contextId,
        }).then(function (_) { return undefined; });
    };
    GW3Bridge.prototype.sendUnsubscribe = function (contextData) {
        contextData.sentExplicitSubscription = false;
        return this._gw3Session
            .send({
            type: GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
            domain: "global",
            context_id: contextData.contextId,
        }).then(function (_) { return undefined; });
    };
    GW3Bridge.prototype.calculateContextDeltaV1 = function (from, to) {
        var delta = { added: {}, updated: {}, removed: [], reset: undefined };
        if (from) {
            for (var _i = 0, _a = Object.keys(from); _i < _a.length; _i++) {
                var x = _a[_i];
                if (Object.keys(to).indexOf(x) !== -1
                    && to[x] !== null
                    && !deepEqual(from[x], to[x])) {
                    delta.updated[x] = to[x];
                }
            }
        }
        for (var _b = 0, _c = Object.keys(to); _b < _c.length; _b++) {
            var x = _c[_b];
            if (!from || (Object.keys(from).indexOf(x) === -1)) {
                if (to[x] !== null) {
                    delta.added[x] = to[x];
                }
            }
            else if (to[x] === null) {
                delta.removed.push(x);
            }
        }
        return delta;
    };
    GW3Bridge.prototype.calculateContextDeltaV2 = function (from, to) {
        var _a, _b;
        var delta = { added: {}, updated: {}, removed: [], reset: undefined, commands: [] };
        for (var _i = 0, _c = Object.keys(to); _i < _c.length; _i++) {
            var x = _c[_i];
            if (to[x] !== null) {
                var fromX = from ? from[x] : null;
                if (!deepEqual(fromX, to[x])) {
                    (_a = delta.commands) === null || _a === void 0 ? void 0 : _a.push({ type: "set", path: x, value: to[x] });
                }
            }
            else {
                (_b = delta.commands) === null || _b === void 0 ? void 0 : _b.push({ type: "remove", path: x });
            }
        }
        return delta;
    };
    GW3Bridge.prototype.resetState = function () {
        var _this = this;
        for (var _i = 0, _a = this._gw3Subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            this._connection.off(sub);
        }
        if (this._systemContextsSubKey) {
            this.unsubscribe(this._systemContextsSubKey);
            delete this._systemContextsSubKey;
        }
        this._gw3Subscriptions = [];
        this._contextNameToId = {};
        this._contextIdToName = {};
        delete this._protocolVersion;
        this._contextsTempCache = Object.keys(this._contextNameToData).reduce(function (cacheSoFar, ctxName) {
            cacheSoFar[ctxName] = _this._contextNameToData[ctxName].context;
            return cacheSoFar;
        }, {});
        this._contextNameToData = {};
    };
    GW3Bridge.prototype.reInitiateState = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, _i, ctxName, lastKnownData;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.subscribeToContextCreatedMessages();
                        this.subscribeToContextUpdatedMessages();
                        this.subscribeToContextDestroyedMessages();
                        (_a = this._connection.replayer) === null || _a === void 0 ? void 0 : _a.drain(ContextMessageReplaySpec.name, function (message) {
                            var type = message.type;
                            if (!type) {
                                return;
                            }
                            if (type === GW_MESSAGE_CONTEXT_CREATED ||
                                type === GW_MESSAGE_CONTEXT_ADDED ||
                                type === GW_MESSAGE_ACTIVITY_CREATED) {
                                _this.handleContextCreatedMessage(message);
                            }
                            else if (type === GW_MESSAGE_SUBSCRIBED_CONTEXT ||
                                type === GW_MESSAGE_CONTEXT_UPDATED ||
                                type === GW_MESSAGE_JOINED_ACTIVITY) {
                                _this.handleContextUpdatedMessage(message);
                            }
                            else if (type === GW_MESSAGE_CONTEXT_DESTROYED ||
                                type === GW_MESSAGE_ACTIVITY_DESTROYED) {
                                _this.handleContextDestroyedMessage(message);
                            }
                        });
                        return [4, Promise.all(this._contextsSubscriptionsCache.map(function (subscription) { return _this.subscribe(subscription.contextName, subscription.callback, subscription.subKey); }))];
                    case 1:
                        _e.sent();
                        return [4, this.flushQueue()];
                    case 2:
                        _e.sent();
                        _b = [];
                        for (_c in this._contextsTempCache)
                            _b.push(_c);
                        _i = 0;
                        _e.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3, 6];
                        ctxName = _b[_i];
                        if (typeof this._contextsTempCache[ctxName] !== "object" || Object.keys(this._contextsTempCache[ctxName]).length === 0) {
                            return [3, 5];
                        }
                        lastKnownData = this._contextsTempCache[ctxName];
                        this._logger.info("Re-announcing known context: " + ctxName);
                        return [4, this.update(ctxName, lastKnownData)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3, 3];
                    case 6:
                        this._contextsTempCache = {};
                        this._logger.info("Contexts are re-announced");
                        return [2];
                }
            });
        });
    };
    GW3Bridge.prototype.flushQueue = function () {
        return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 0); });
    };
    return GW3Bridge;
}());

var ContextsModule = (function () {
    function ContextsModule(config) {
        this._bridge = new GW3Bridge$1(config);
    }
    ContextsModule.prototype.all = function () {
        return this._bridge.all();
    };
    ContextsModule.prototype.update = function (name, data) {
        this.checkName(name);
        this.checkData(data);
        return this._bridge.update(name, data);
    };
    ContextsModule.prototype.set = function (name, data) {
        this.checkName(name);
        this.checkData(data);
        return this._bridge.set(name, data);
    };
    ContextsModule.prototype.setPath = function (name, path, data) {
        this.checkName(name);
        this.checkPath(path);
        var isTopLevelPath = path === "";
        if (isTopLevelPath) {
            this.checkData(data);
            return this.set(name, data);
        }
        return this._bridge.setPath(name, path, data);
    };
    ContextsModule.prototype.setPaths = function (name, paths) {
        this.checkName(name);
        if (!Array.isArray(paths)) {
            throw new Error("Please provide the paths as an array of PathValues!");
        }
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var _a = paths_1[_i], path = _a.path, value = _a.value;
            this.checkPath(path);
            var isTopLevelPath = path === "";
            if (isTopLevelPath) {
                this.checkData(value);
            }
        }
        return this._bridge.setPaths(name, paths);
    };
    ContextsModule.prototype.subscribe = function (name, callback) {
        var _this = this;
        this.checkName(name);
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        return this._bridge
            .subscribe(name, function (data, delta, removed, key, extraData) { return callback(data, delta, removed, function () { return _this._bridge.unsubscribe(key); }, extraData); })
            .then(function (key) {
            return function () {
                _this._bridge.unsubscribe(key);
            };
        });
    };
    ContextsModule.prototype.get = function (name) {
        this.checkName(name);
        return this._bridge.get(name);
    };
    ContextsModule.prototype.ready = function () {
        return Promise.resolve(this);
    };
    ContextsModule.prototype.destroy = function (name) {
        this.checkName(name);
        return this._bridge.destroy(name);
    };
    Object.defineProperty(ContextsModule.prototype, "setPathSupported", {
        get: function () {
            return this._bridge.setPathSupported;
        },
        enumerable: true,
        configurable: true
    });
    ContextsModule.prototype.checkName = function (name) {
        if (typeof name !== "string" || name === "") {
            throw new Error("Please provide the name as a non-empty string!");
        }
    };
    ContextsModule.prototype.checkPath = function (path) {
        if (typeof path !== "string") {
            throw new Error("Please provide the path as a dot delimited string!");
        }
    };
    ContextsModule.prototype.checkData = function (data) {
        if (typeof data !== "object") {
            throw new Error("Please provide the data as an object!");
        }
    };
    return ContextsModule;
}());

function promisify$2 (promise, successCallback, errorCallback) {
    if (typeof successCallback !== "function" && typeof errorCallback !== "function") {
        return promise;
    }
    if (typeof successCallback !== "function") {
        successCallback = function () { };
    }
    else if (typeof errorCallback !== "function") {
        errorCallback = function () { };
    }
    return promise.then(successCallback, errorCallback);
}

function rejectAfter(ms, promise, error) {
    if (ms === void 0) { ms = 0; }
    var timeout;
    var clearTimeoutIfThere = function () {
        if (timeout) {
            clearTimeout(timeout);
        }
    };
    promise
        .then(function () {
        clearTimeoutIfThere();
    })
        .catch(function () {
        clearTimeoutIfThere();
    });
    return new Promise(function (resolve, reject) {
        timeout = setTimeout(function () { return reject(error); }, ms);
    });
}

var InvokeStatus;
(function (InvokeStatus) {
    InvokeStatus[InvokeStatus["Success"] = 0] = "Success";
    InvokeStatus[InvokeStatus["Error"] = 1] = "Error";
})(InvokeStatus || (InvokeStatus = {}));
var Client = (function () {
    function Client(protocol, repo, instance, configuration) {
        this.protocol = protocol;
        this.repo = repo;
        this.instance = instance;
        this.configuration = configuration;
    }
    Client.prototype.subscribe = function (method, options, successCallback, errorCallback, existingSub) {
        var _this = this;
        var callProtocolSubscribe = function (targetServers, stream, successProxy, errorProxy) {
            var _a;
            options.methodResponseTimeout = (_a = options.methodResponseTimeout) !== null && _a !== void 0 ? _a : options.waitTimeoutMs;
            _this.protocol.client.subscribe(stream, options, targetServers, successProxy, errorProxy, existingSub);
        };
        var promise = new Promise(function (resolve, reject) {
            var successProxy = function (sub) {
                resolve(sub);
            };
            var errorProxy = function (err) {
                reject(err);
            };
            if (!method) {
                reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
                return;
            }
            var methodDef;
            if (typeof method === "string") {
                methodDef = { name: method };
            }
            else {
                methodDef = method;
            }
            if (!methodDef.name) {
                reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
                return;
            }
            if (options === undefined) {
                options = {};
            }
            var target = options.target;
            if (target === undefined) {
                target = "best";
            }
            if (typeof target === "string" && target !== "all" && target !== "best") {
                reject(new Error("\"" + target + "\" is not a valid target. Valid targets are \"all\", \"best\", or an instance."));
                return;
            }
            if (options.methodResponseTimeout === undefined) {
                options.methodResponseTimeout = options.method_response_timeout;
                if (options.methodResponseTimeout === undefined) {
                    options.methodResponseTimeout = _this.configuration.methodResponseTimeout;
                }
            }
            if (options.waitTimeoutMs === undefined) {
                options.waitTimeoutMs = options.wait_for_method_timeout;
                if (options.waitTimeoutMs === undefined) {
                    options.waitTimeoutMs = _this.configuration.waitTimeoutMs;
                }
            }
            var delayStep = 500;
            var delayTillNow = 0;
            var currentServers = _this.getServerMethodsByFilterAndTarget(methodDef, target);
            if (currentServers.length > 0) {
                callProtocolSubscribe(currentServers, currentServers[0].methods[0], successProxy, errorProxy);
            }
            else {
                var retry_1 = function () {
                    if (!target || !(options.waitTimeoutMs)) {
                        return;
                    }
                    delayTillNow += delayStep;
                    currentServers = _this.getServerMethodsByFilterAndTarget(methodDef, target);
                    if (currentServers.length > 0) {
                        var streamInfo = currentServers[0].methods[0];
                        callProtocolSubscribe(currentServers, streamInfo, successProxy, errorProxy);
                    }
                    else if (delayTillNow >= options.waitTimeoutMs) {
                        var def = typeof method === "string" ? { name: method } : method;
                        callProtocolSubscribe(currentServers, def, successProxy, errorProxy);
                    }
                    else {
                        setTimeout(retry_1, delayStep);
                    }
                };
                setTimeout(retry_1, delayStep);
            }
        });
        return promisify$2(promise, successCallback, errorCallback);
    };
    Client.prototype.servers = function (methodFilter) {
        var filterCopy = methodFilter === undefined
            ? undefined
            : __assign({}, methodFilter);
        return this.getServers(filterCopy).map(function (serverMethodMap) {
            return serverMethodMap.server.instance;
        });
    };
    Client.prototype.methods = function (methodFilter) {
        if (typeof methodFilter === "string") {
            methodFilter = { name: methodFilter };
        }
        else {
            methodFilter = __assign({}, methodFilter);
        }
        return this.getMethods(methodFilter);
    };
    Client.prototype.methodsForInstance = function (instance) {
        return this.getMethodsForInstance(instance);
    };
    Client.prototype.methodAdded = function (callback) {
        return this.repo.onMethodAdded(callback);
    };
    Client.prototype.methodRemoved = function (callback) {
        return this.repo.onMethodRemoved(callback);
    };
    Client.prototype.serverAdded = function (callback) {
        return this.repo.onServerAdded(callback);
    };
    Client.prototype.serverRemoved = function (callback) {
        return this.repo.onServerRemoved(function (server, reason) {
            callback(server, reason);
        });
    };
    Client.prototype.serverMethodAdded = function (callback) {
        return this.repo.onServerMethodAdded(function (server, method) {
            callback({ server: server, method: method });
        });
    };
    Client.prototype.serverMethodRemoved = function (callback) {
        return this.repo.onServerMethodRemoved(function (server, method) {
            callback({ server: server, method: method });
        });
    };
    Client.prototype.invoke = function (methodFilter, argumentObj, target, additionalOptions, success, error) {
        return __awaiter(this, void 0, void 0, function () {
            var getInvokePromise;
            var _this = this;
            return __generator(this, function (_a) {
                getInvokePromise = function () { return __awaiter(_this, void 0, void 0, function () {
                    var methodDefinition, serversMethodMap, method, errorObj, timeout, additionalOptionsCopy, invokePromises, invocationMessages, results, allRejected;
                    var _this = this;
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (typeof methodFilter === "string") {
                                    methodDefinition = { name: methodFilter };
                                }
                                else {
                                    methodDefinition = __assign({}, methodFilter);
                                }
                                if (!methodDefinition.name) {
                                    return [2, Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.")];
                                }
                                if (!argumentObj) {
                                    argumentObj = {};
                                }
                                if (!target) {
                                    target = "best";
                                }
                                if (typeof target === "string" && target !== "all" && target !== "best" && target !== "skipMine") {
                                    return [2, Promise.reject(new Error("\"" + target + "\" is not a valid target. Valid targets are \"all\" and \"best\"."))];
                                }
                                if (!additionalOptions) {
                                    additionalOptions = {};
                                }
                                if (additionalOptions.methodResponseTimeoutMs === undefined) {
                                    additionalOptions.methodResponseTimeoutMs = additionalOptions.method_response_timeout;
                                    if (additionalOptions.methodResponseTimeoutMs === undefined) {
                                        additionalOptions.methodResponseTimeoutMs = this.configuration.methodResponseTimeout;
                                    }
                                }
                                if (additionalOptions.waitTimeoutMs === undefined) {
                                    additionalOptions.waitTimeoutMs = additionalOptions.wait_for_method_timeout;
                                    if (additionalOptions.waitTimeoutMs === undefined) {
                                        additionalOptions.waitTimeoutMs = this.configuration.waitTimeoutMs;
                                    }
                                }
                                if (additionalOptions.waitTimeoutMs !== undefined && typeof additionalOptions.waitTimeoutMs !== "number") {
                                    return [2, Promise.reject(new Error("\"" + additionalOptions.waitTimeoutMs + "\" is not a valid number for \"waitTimeoutMs\" "))];
                                }
                                if (typeof argumentObj !== "object") {
                                    return [2, Promise.reject(new Error("The method arguments must be an object. method: " + methodDefinition.name))];
                                }
                                serversMethodMap = this.getServerMethodsByFilterAndTarget(methodDefinition, target);
                                if (!(serversMethodMap.length === 0)) return [3, 4];
                                _d.label = 1;
                            case 1:
                                _d.trys.push([1, 3, , 4]);
                                return [4, this.tryToAwaitForMethods(methodDefinition, target, additionalOptions)];
                            case 2:
                                serversMethodMap = _d.sent();
                                return [3, 4];
                            case 3:
                                _d.sent();
                                method = __assign(__assign({}, methodDefinition), { getServers: function () { return []; }, supportsStreaming: false, objectTypes: (_a = methodDefinition.objectTypes) !== null && _a !== void 0 ? _a : [], flags: (_c = (_b = methodDefinition.flags) === null || _b === void 0 ? void 0 : _b.metadata) !== null && _c !== void 0 ? _c : {} });
                                errorObj = {
                                    method: method,
                                    called_with: argumentObj,
                                    message: "Can not find a method matching " + JSON.stringify(methodFilter) + " with server filter " + JSON.stringify(target),
                                    executed_by: undefined,
                                    returned: undefined,
                                    status: undefined,
                                };
                                return [2, Promise.reject(errorObj)];
                            case 4:
                                timeout = additionalOptions.methodResponseTimeoutMs;
                                additionalOptionsCopy = additionalOptions;
                                invokePromises = serversMethodMap.map(function (serversMethodPair) {
                                    var invId = shortid$1();
                                    var method = serversMethodPair.methods[0];
                                    var server = serversMethodPair.server;
                                    var invokePromise = _this.protocol.client.invoke(invId, method, argumentObj, server, additionalOptionsCopy);
                                    return Promise.race([
                                        invokePromise,
                                        rejectAfter(timeout, invokePromise, {
                                            invocationId: invId,
                                            message: "Invocation timeout (" + timeout + " ms) reached for method name: " + (method === null || method === void 0 ? void 0 : method.name) + ", target instance: " + JSON.stringify(server.instance) + ", options: " + JSON.stringify(additionalOptionsCopy),
                                            status: InvokeStatus.Error,
                                        })
                                    ]);
                                });
                                return [4, Promise.all(invokePromises)];
                            case 5:
                                invocationMessages = _d.sent();
                                results = this.getInvocationResultObj(invocationMessages, methodDefinition, argumentObj);
                                allRejected = invocationMessages.every(function (result) { return result.status === InvokeStatus.Error; });
                                if (allRejected) {
                                    return [2, Promise.reject(results)];
                                }
                                return [2, results];
                        }
                    });
                }); };
                return [2, promisify$2(getInvokePromise(), success, error)];
            });
        });
    };
    Client.prototype.getInvocationResultObj = function (invocationResults, method, calledWith) {
        var all_return_values = invocationResults
            .filter(function (invokeMessage) { return invokeMessage.status === InvokeStatus.Success; })
            .reduce(function (allValues, currentValue) {
            allValues = __spreadArrays(allValues, [
                {
                    executed_by: currentValue.instance,
                    returned: currentValue.result,
                    called_with: calledWith,
                    method: method,
                    message: currentValue.message,
                    status: currentValue.status,
                }
            ]);
            return allValues;
        }, []);
        var all_errors = invocationResults
            .filter(function (invokeMessage) { return invokeMessage.status === InvokeStatus.Error; })
            .reduce(function (allErrors, currError) {
            allErrors = __spreadArrays(allErrors, [
                {
                    executed_by: currError.instance,
                    called_with: calledWith,
                    name: method.name,
                    message: currError.message,
                }
            ]);
            return allErrors;
        }, []);
        var invResult = invocationResults[0];
        var result = {
            method: method,
            called_with: calledWith,
            returned: invResult.result,
            executed_by: invResult.instance,
            all_return_values: all_return_values,
            all_errors: all_errors,
            message: invResult.message,
            status: invResult.status
        };
        return result;
    };
    Client.prototype.tryToAwaitForMethods = function (methodDefinition, target, additionalOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (additionalOptions.waitTimeoutMs === 0) {
                reject();
                return;
            }
            var delayStep = 500;
            var delayTillNow = 0;
            var retry = function () {
                delayTillNow += delayStep;
                var serversMethodMap = _this.getServerMethodsByFilterAndTarget(methodDefinition, target);
                if (serversMethodMap.length > 0) {
                    clearInterval(interval);
                    resolve(serversMethodMap);
                }
                else if (delayTillNow >= (additionalOptions.waitTimeoutMs || 10000)) {
                    clearInterval(interval);
                    reject();
                    return;
                }
            };
            var interval = setInterval(retry, delayStep);
        });
    };
    Client.prototype.filterByTarget = function (target, serverMethodMap) {
        var _this = this;
        if (typeof target === "string") {
            if (target === "all") {
                return __spreadArrays(serverMethodMap);
            }
            else if (target === "best") {
                var localMachine = serverMethodMap
                    .find(function (s) { return s.server.instance.isLocal; });
                if (localMachine) {
                    return [localMachine];
                }
                if (serverMethodMap[0] !== undefined) {
                    return [serverMethodMap[0]];
                }
            }
            else if (target === "skipMine") {
                return serverMethodMap.filter(function (_a) {
                    var server = _a.server;
                    return server.instance.peerId !== _this.instance.peerId;
                });
            }
        }
        else {
            var targetArray = void 0;
            if (!Array.isArray(target)) {
                targetArray = [target];
            }
            else {
                targetArray = target;
            }
            var allServersMatching = targetArray.reduce(function (matches, filter) {
                var myMatches = serverMethodMap.filter(function (serverMethodPair) {
                    return _this.instanceMatch(filter, serverMethodPair.server.instance);
                });
                return matches.concat(myMatches);
            }, []);
            return allServersMatching;
        }
        return [];
    };
    Client.prototype.instanceMatch = function (instanceFilter, instanceDefinition) {
        return this.containsProps(instanceFilter, instanceDefinition);
    };
    Client.prototype.methodMatch = function (methodFilter, methodDefinition) {
        return this.containsProps(methodFilter, methodDefinition);
    };
    Client.prototype.containsProps = function (filter, repoMethod) {
        var filterProps = Object.keys(filter)
            .filter(function (prop) {
            return filter[prop] !== undefined
                && filter[prop] !== null
                && typeof filter[prop] !== "function"
                && prop !== "object_types"
                && prop !== "display_name"
                && prop !== "id"
                && prop !== "gatewayId"
                && prop !== "identifier"
                && prop[0] !== "_";
        });
        return filterProps.every(function (prop) {
            var isMatch;
            var filterValue = filter[prop];
            var repoMethodValue = repoMethod[prop];
            switch (prop) {
                case "objectTypes":
                    isMatch = (filterValue || []).every(function (filterValueEl) {
                        return (repoMethodValue || []).includes(filterValueEl);
                    });
                    break;
                case "flags":
                    isMatch = isSubset(repoMethodValue || {}, filterValue || {});
                    break;
                default:
                    isMatch = String(filterValue).toLowerCase() === String(repoMethodValue).toLowerCase();
            }
            return isMatch;
        });
    };
    Client.prototype.getMethods = function (methodFilter) {
        var _this = this;
        if (methodFilter === undefined) {
            return this.repo.getMethods();
        }
        var methods = this.repo.getMethods().filter(function (method) {
            return _this.methodMatch(methodFilter, method);
        });
        return methods;
    };
    Client.prototype.getMethodsForInstance = function (instanceFilter) {
        var _this = this;
        var allServers = this.repo.getServers();
        var matchingServers = allServers.filter(function (server) {
            return _this.instanceMatch(instanceFilter, server.instance);
        });
        if (matchingServers.length === 0) {
            return [];
        }
        var resultMethodsObject = {};
        if (matchingServers.length === 1) {
            resultMethodsObject = matchingServers[0].methods;
        }
        else {
            matchingServers.forEach(function (server) {
                Object.keys(server.methods).forEach(function (methodKey) {
                    var method = server.methods[methodKey];
                    resultMethodsObject[method.identifier] = method;
                });
            });
        }
        return Object.keys(resultMethodsObject)
            .map(function (key) {
            return resultMethodsObject[key];
        });
    };
    Client.prototype.getServers = function (methodFilter) {
        var _this = this;
        var servers = this.repo.getServers();
        if (methodFilter === undefined) {
            return servers.map(function (server) {
                return { server: server, methods: [] };
            });
        }
        return servers.reduce(function (prev, current) {
            var methodsForServer = Object.values(current.methods);
            var matchingMethods = methodsForServer.filter(function (method) {
                return _this.methodMatch(methodFilter, method);
            });
            if (matchingMethods.length > 0) {
                prev.push({ server: current, methods: matchingMethods });
            }
            return prev;
        }, []);
    };
    Client.prototype.getServerMethodsByFilterAndTarget = function (methodFilter, target) {
        var serversMethodMap = this.getServers(methodFilter);
        return this.filterByTarget(target, serversMethodMap);
    };
    return Client;
}());

var ServerSubscription = (function () {
    function ServerSubscription(protocol, repoMethod, subscription) {
        this.protocol = protocol;
        this.repoMethod = repoMethod;
        this.subscription = subscription;
    }
    Object.defineProperty(ServerSubscription.prototype, "stream", {
        get: function () {
            if (!this.repoMethod.stream) {
                throw new Error("no stream");
            }
            return this.repoMethod.stream;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerSubscription.prototype, "arguments", {
        get: function () { return this.subscription.arguments || {}; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerSubscription.prototype, "branchKey", {
        get: function () { return this.subscription.branchKey; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerSubscription.prototype, "instance", {
        get: function () {
            if (!this.subscription.instance) {
                throw new Error("no instance");
            }
            return this.subscription.instance;
        },
        enumerable: true,
        configurable: true
    });
    ServerSubscription.prototype.close = function () {
        this.protocol.server.closeSingleSubscription(this.repoMethod, this.subscription);
    };
    ServerSubscription.prototype.push = function (data) {
        this.protocol.server.pushDataToSingle(this.repoMethod, this.subscription, data);
    };
    return ServerSubscription;
}());

var Request = (function () {
    function Request(protocol, repoMethod, requestContext) {
        this.protocol = protocol;
        this.repoMethod = repoMethod;
        this.requestContext = requestContext;
        this.arguments = requestContext.arguments;
        this.instance = requestContext.instance;
    }
    Request.prototype.accept = function () {
        this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, "");
    };
    Request.prototype.acceptOnBranch = function (branch) {
        this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, branch);
    };
    Request.prototype.reject = function (reason) {
        this.protocol.server.rejectRequest(this.requestContext, this.repoMethod, reason);
    };
    return Request;
}());

var ServerStreaming = (function () {
    function ServerStreaming(protocol, server) {
        var _this = this;
        this.protocol = protocol;
        this.server = server;
        protocol.server.onSubRequest(function (rc, rm) { return _this.handleSubRequest(rc, rm); });
        protocol.server.onSubAdded(function (sub, rm) { return _this.handleSubAdded(sub, rm); });
        protocol.server.onSubRemoved(function (sub, rm) { return _this.handleSubRemoved(sub, rm); });
    }
    ServerStreaming.prototype.handleSubRequest = function (requestContext, repoMethod) {
        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionRequestHandler === "function")) {
            return;
        }
        var request = new Request(this.protocol, repoMethod, requestContext);
        repoMethod.streamCallbacks.subscriptionRequestHandler(request);
    };
    ServerStreaming.prototype.handleSubAdded = function (subscription, repoMethod) {
        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionAddedHandler === "function")) {
            return;
        }
        var sub = new ServerSubscription(this.protocol, repoMethod, subscription);
        repoMethod.streamCallbacks.subscriptionAddedHandler(sub);
    };
    ServerStreaming.prototype.handleSubRemoved = function (subscription, repoMethod) {
        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionRemovedHandler === "function")) {
            return;
        }
        var sub = new ServerSubscription(this.protocol, repoMethod, subscription);
        repoMethod.streamCallbacks.subscriptionRemovedHandler(sub);
    };
    return ServerStreaming;
}());

var ServerBranch = (function () {
    function ServerBranch(key, protocol, repoMethod) {
        this.key = key;
        this.protocol = protocol;
        this.repoMethod = repoMethod;
    }
    ServerBranch.prototype.subscriptions = function () {
        var _this = this;
        var subList = this.protocol.server.getSubscriptionList(this.repoMethod, this.key);
        return subList.map(function (sub) {
            return new ServerSubscription(_this.protocol, _this.repoMethod, sub);
        });
    };
    ServerBranch.prototype.close = function () {
        this.protocol.server.closeAllSubscriptions(this.repoMethod, this.key);
    };
    ServerBranch.prototype.push = function (data) {
        this.protocol.server.pushData(this.repoMethod, data, [this.key]);
    };
    return ServerBranch;
}());

var ServerStream = (function () {
    function ServerStream(_protocol, _repoMethod, _server) {
        this._protocol = _protocol;
        this._repoMethod = _repoMethod;
        this._server = _server;
        this.name = this._repoMethod.definition.name;
    }
    ServerStream.prototype.branches = function (key) {
        var _this = this;
        var bList = this._protocol.server.getBranchList(this._repoMethod);
        if (key) {
            if (bList.indexOf(key) > -1) {
                return new ServerBranch(key, this._protocol, this._repoMethod);
            }
            return undefined;
        }
        else {
            return bList.map(function (branchKey) {
                return new ServerBranch(branchKey, _this._protocol, _this._repoMethod);
            });
        }
    };
    ServerStream.prototype.branch = function (key) {
        return this.branches(key);
    };
    ServerStream.prototype.subscriptions = function () {
        var _this = this;
        var subList = this._protocol.server.getSubscriptionList(this._repoMethod);
        return subList.map(function (sub) {
            return new ServerSubscription(_this._protocol, _this._repoMethod, sub);
        });
    };
    Object.defineProperty(ServerStream.prototype, "definition", {
        get: function () {
            var _a;
            var def2 = this._repoMethod.definition;
            return {
                accepts: def2.accepts,
                description: def2.description,
                displayName: def2.displayName,
                name: def2.name,
                objectTypes: def2.objectTypes,
                returns: def2.returns,
                supportsStreaming: def2.supportsStreaming,
                flags: (_a = def2.flags) === null || _a === void 0 ? void 0 : _a.metadata,
            };
        },
        enumerable: true,
        configurable: true
    });
    ServerStream.prototype.close = function () {
        this._protocol.server.closeAllSubscriptions(this._repoMethod);
        this._server.unregister(this._repoMethod.definition, true);
    };
    ServerStream.prototype.push = function (data, branches) {
        if (typeof branches !== "string" && !Array.isArray(branches) && branches !== undefined) {
            throw new Error("invalid branches should be string or string array");
        }
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }
        this._protocol.server.pushData(this._repoMethod, data, branches);
    };
    ServerStream.prototype.updateRepoMethod = function (repoMethod) {
        this._repoMethod = repoMethod;
    };
    return ServerStream;
}());

var Server = (function () {
    function Server(protocol, serverRepository) {
        this.protocol = protocol;
        this.serverRepository = serverRepository;
        this.invocations = 0;
        this.currentlyUnregistering = {};
        this.streaming = new ServerStreaming(protocol, this);
        this.protocol.server.onInvoked(this.onMethodInvoked.bind(this));
    }
    Server.prototype.createStream = function (streamDef, callbacks, successCallback, errorCallback, existingStream) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            if (!streamDef) {
                reject("The stream name must be unique! Please, provide either a unique string for a stream name to \u201Cglue.interop.createStream()\u201D or a \u201CmethodDefinition\u201D object with a unique \u201Cname\u201D property for the stream.");
                return;
            }
            var streamMethodDefinition;
            if (typeof streamDef === "string") {
                streamMethodDefinition = { name: "" + streamDef };
            }
            else {
                streamMethodDefinition = __assign({}, streamDef);
            }
            if (!streamMethodDefinition.name) {
                return reject("The \u201Cname\u201D property is required for the \u201CstreamDefinition\u201D object and must be unique. Stream definition: " + JSON.stringify(streamMethodDefinition));
            }
            var nameAlreadyExists = _this.serverRepository.getList()
                .some(function (serverMethod) { return serverMethod.definition.name === streamMethodDefinition.name; });
            if (nameAlreadyExists) {
                return reject("A stream with the name \"" + streamMethodDefinition.name + "\" already exists! Please, provide a unique name for the stream.");
            }
            streamMethodDefinition.supportsStreaming = true;
            if (!callbacks) {
                callbacks = {};
            }
            if (typeof callbacks.subscriptionRequestHandler !== "function") {
                callbacks.subscriptionRequestHandler = function (request) {
                    request.accept();
                };
            }
            var repoMethod = _this.serverRepository.add({
                definition: streamMethodDefinition,
                streamCallbacks: callbacks,
                protocolState: {},
            });
            _this.protocol.server.createStream(repoMethod)
                .then(function () {
                var streamUserObject;
                if (existingStream) {
                    streamUserObject = existingStream;
                    existingStream.updateRepoMethod(repoMethod);
                }
                else {
                    streamUserObject = new ServerStream(_this.protocol, repoMethod, _this);
                }
                repoMethod.stream = streamUserObject;
                resolve(streamUserObject);
            })
                .catch(function (err) {
                if (repoMethod.repoId) {
                    _this.serverRepository.remove(repoMethod.repoId);
                }
                reject(err);
            });
        });
        return promisify$2(promise, successCallback, errorCallback);
    };
    Server.prototype.register = function (methodDefinition, callback) {
        var _this = this;
        if (!methodDefinition) {
            return Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
        }
        if (typeof callback !== "function") {
            return Promise.reject("The second parameter must be a callback function. Method: " + (typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name));
        }
        var wrappedCallbackFunction = function (context, resultCallback) { return __awaiter(_this, void 0, void 0, function () {
            var result, resultValue, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        result = callback(context.args, context.instance);
                        if (!(result && typeof result.then === "function")) return [3, 2];
                        return [4, result];
                    case 1:
                        resultValue = _a.sent();
                        resultCallback(undefined, resultValue);
                        return [3, 3];
                    case 2:
                        resultCallback(undefined, result);
                        _a.label = 3;
                    case 3: return [3, 5];
                    case 4:
                        e_1 = _a.sent();
                        if (!e_1) {
                            e_1 = "";
                        }
                        resultCallback(e_1, e_1);
                        return [3, 5];
                    case 5: return [2];
                }
            });
        }); };
        wrappedCallbackFunction.userCallback = callback;
        return this.registerCore(methodDefinition, wrappedCallbackFunction);
    };
    Server.prototype.registerAsync = function (methodDefinition, callback) {
        if (!methodDefinition) {
            return Promise.reject("Method definition is required. Please, provide either a unique string for a method name or a \u201CmethodDefinition\u201D object with a required \u201Cname\u201D property.");
        }
        if (typeof callback !== "function") {
            return Promise.reject("The second parameter must be a callback function. Method: " + (typeof methodDefinition === "string" ? methodDefinition : methodDefinition.name));
        }
        var wrappedCallback = function (context, resultCallback) {
            try {
                var resultCalled_1 = false;
                var success = function (result) {
                    if (!resultCalled_1) {
                        resultCallback(undefined, result);
                    }
                    resultCalled_1 = true;
                };
                var error = function (e) {
                    if (!resultCalled_1) {
                        if (!e) {
                            e = "";
                        }
                        resultCallback(e, e);
                    }
                    resultCalled_1 = true;
                };
                var methodResult = callback(context.args, context.instance, success, error);
                if (methodResult && typeof methodResult.then === "function") {
                    methodResult
                        .then(success)
                        .catch(error);
                }
            }
            catch (e) {
                resultCallback(e, undefined);
            }
        };
        wrappedCallback.userCallbackAsync = callback;
        return this.registerCore(methodDefinition, wrappedCallback);
    };
    Server.prototype.unregister = function (methodFilter, forStream) {
        if (forStream === void 0) { forStream = false; }
        return __awaiter(this, void 0, void 0, function () {
            var methodDefinition, methodToBeRemoved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (methodFilter === undefined) {
                            return [2, Promise.reject("Please, provide either a unique string for a name or an object containing a \u201Cname\u201D property.")];
                        }
                        if (!(typeof methodFilter === "function")) return [3, 2];
                        return [4, this.unregisterWithPredicate(methodFilter, forStream)];
                    case 1:
                        _a.sent();
                        return [2];
                    case 2:
                        if (typeof methodFilter === "string") {
                            methodDefinition = { name: methodFilter };
                        }
                        else {
                            methodDefinition = methodFilter;
                        }
                        if (methodDefinition.name === undefined) {
                            return [2, Promise.reject("Method name is required. Cannot find a method if the method name is undefined!")];
                        }
                        methodToBeRemoved = this.serverRepository.getList().find(function (serverMethod) {
                            return serverMethod.definition.name === methodDefinition.name
                                && (serverMethod.definition.supportsStreaming || false) === forStream;
                        });
                        if (!methodToBeRemoved) {
                            return [2, Promise.reject("Method with a name \"" + methodDefinition.name + "\" does not exist or is not registered by your application!")];
                        }
                        return [4, this.removeMethodsOrStreams([methodToBeRemoved])];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Server.prototype.unregisterWithPredicate = function (filterPredicate, forStream) {
        return __awaiter(this, void 0, void 0, function () {
            var methodsOrStreamsToRemove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        methodsOrStreamsToRemove = this.serverRepository.getList()
                            .filter(function (sm) { return filterPredicate(sm.definition); })
                            .filter(function (serverMethod) {
                            return (serverMethod.definition.supportsStreaming || false) === forStream;
                        });
                        if (!methodsOrStreamsToRemove || methodsOrStreamsToRemove.length === 0) {
                            return [2, Promise.reject("Could not find a " + (forStream ? "stream" : "method") + " matching the specified condition!")];
                        }
                        return [4, this.removeMethodsOrStreams(methodsOrStreamsToRemove)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Server.prototype.removeMethodsOrStreams = function (methodsToRemove) {
        var _this = this;
        var methodUnregPromises = [];
        methodsToRemove.forEach(function (method) {
            var promise = _this.protocol.server.unregister(method)
                .then(function () {
                if (method.repoId) {
                    _this.serverRepository.remove(method.repoId);
                }
            });
            methodUnregPromises.push(promise);
            _this.addAsCurrentlyUnregistering(method.definition.name, promise);
        });
        return Promise.all(methodUnregPromises);
    };
    Server.prototype.addAsCurrentlyUnregistering = function (methodName, promise) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout;
            var _this = this;
            return __generator(this, function (_a) {
                timeout = new Promise(function (resolve) { return setTimeout(resolve, 5000); });
                this.currentlyUnregistering[methodName] = Promise.race([promise, timeout]).then(function () {
                    delete _this.currentlyUnregistering[methodName];
                });
                return [2];
            });
        });
    };
    Server.prototype.registerCore = function (method, theFunction) {
        return __awaiter(this, void 0, void 0, function () {
            var methodDefinition, unregisterInProgress, nameAlreadyExists, repoMethod;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof method === "string") {
                            methodDefinition = { name: "" + method };
                        }
                        else {
                            methodDefinition = __assign({}, method);
                        }
                        if (!methodDefinition.name) {
                            return [2, Promise.reject("Please, provide a (unique) string value for the \u201Cname\u201D property in the \u201CmethodDefinition\u201D object: " + JSON.stringify(method))];
                        }
                        unregisterInProgress = this.currentlyUnregistering[methodDefinition.name];
                        if (!unregisterInProgress) return [3, 2];
                        return [4, unregisterInProgress];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        nameAlreadyExists = this.serverRepository.getList()
                            .some(function (serverMethod) { return serverMethod.definition.name === methodDefinition.name; });
                        if (nameAlreadyExists) {
                            return [2, Promise.reject("A method with the name \"" + methodDefinition.name + "\" already exists! Please, provide a unique name for the method.")];
                        }
                        if (methodDefinition.supportsStreaming) {
                            return [2, Promise.reject("When you create methods with \u201Cglue.interop.register()\u201D or \u201Cglue.interop.registerAsync()\u201D the property \u201CsupportsStreaming\u201D cannot be \u201Ctrue\u201D. If you want \u201C" + methodDefinition.name + "\u201D to be a stream, please use the \u201Cglue.interop.createStream()\u201D method.")];
                        }
                        repoMethod = this.serverRepository.add({
                            definition: methodDefinition,
                            theFunction: theFunction,
                            protocolState: {},
                        });
                        return [2, this.protocol.server.register(repoMethod)
                                .catch(function (err) {
                                if (repoMethod === null || repoMethod === void 0 ? void 0 : repoMethod.repoId) {
                                    _this.serverRepository.remove(repoMethod.repoId);
                                }
                                throw err;
                            })];
                }
            });
        });
    };
    Server.prototype.onMethodInvoked = function (methodToExecute, invocationId, invocationArgs) {
        var _this = this;
        if (!methodToExecute || !methodToExecute.theFunction) {
            return;
        }
        methodToExecute.theFunction(invocationArgs, function (err, result) {
            if (err !== undefined && err !== null) {
                if (err.message && typeof err.message === "string") {
                    err = err.message;
                }
                else if (typeof err !== "string") {
                    try {
                        err = JSON.stringify(err);
                    }
                    catch (unStrException) {
                        err = "un-stringifyable error in onMethodInvoked! Top level prop names: " + Object.keys(err);
                    }
                }
            }
            if (!result) {
                result = {};
            }
            else if (typeof result !== "object" || Array.isArray(result)) {
                result = { _value: result };
            }
            _this.protocol.server.methodInvocationResult(methodToExecute, invocationId, err, result);
        });
    };
    return Server;
}());

var InstanceWrapper = (function () {
    function InstanceWrapper(API, instance, connection) {
        var _this = this;
        this.wrapped = {};
        this.wrapped.getMethods = function () {
            return API.methodsForInstance(this);
        };
        this.wrapped.getStreams = function () {
            return API.methodsForInstance(this).filter(function (m) { return m.supportsStreaming; });
        };
        if (instance) {
            this.refreshWrappedObject(instance);
        }
        if (connection) {
            connection.loggedIn(function () {
                _this.refresh(connection);
            });
            this.refresh(connection);
        }
    }
    InstanceWrapper.prototype.unwrap = function () {
        return this.wrapped;
    };
    InstanceWrapper.prototype.refresh = function (connection) {
        if (!connection) {
            return;
        }
        var resolvedIdentity = connection === null || connection === void 0 ? void 0 : connection.resolvedIdentity;
        var instance = Object.assign({}, resolvedIdentity !== null && resolvedIdentity !== void 0 ? resolvedIdentity : {}, { peerId: connection === null || connection === void 0 ? void 0 : connection.peerId });
        this.refreshWrappedObject(instance);
    };
    InstanceWrapper.prototype.refreshWrappedObject = function (resolvedIdentity) {
        var _this = this;
        var _a, _b, _c, _d;
        Object.keys(resolvedIdentity).forEach(function (key) {
            _this.wrapped[key] = resolvedIdentity[key];
        });
        this.wrapped.user = resolvedIdentity.user;
        this.wrapped.instance = resolvedIdentity.instance;
        this.wrapped.application = (_a = resolvedIdentity.application) !== null && _a !== void 0 ? _a : shortid$1();
        this.wrapped.applicationName = resolvedIdentity.applicationName;
        this.wrapped.pid = (_c = (_b = resolvedIdentity.pid) !== null && _b !== void 0 ? _b : resolvedIdentity.process) !== null && _c !== void 0 ? _c : Math.floor(Math.random() * 10000000000);
        this.wrapped.machine = resolvedIdentity.machine;
        this.wrapped.environment = resolvedIdentity.environment;
        this.wrapped.region = resolvedIdentity.region;
        this.wrapped.windowId = resolvedIdentity.windowId;
        this.wrapped.isLocal = (_d = resolvedIdentity.isLocal) !== null && _d !== void 0 ? _d : true;
        this.wrapped.api = resolvedIdentity.api;
        this.wrapped.service = resolvedIdentity.service;
        this.wrapped.peerId = resolvedIdentity.peerId;
    };
    return InstanceWrapper;
}());

var hideMethodSystemFlags = function (method) {
    return __assign(__assign({}, method), { flags: method.flags.metadata || {} });
};
var ClientRepository = (function () {
    function ClientRepository(logger, API) {
        this.logger = logger;
        this.API = API;
        this.servers = {};
        this.methodsCount = {};
        this.callbacks = lib$2();
        var peerId = this.API.instance.peerId;
        this.myServer = {
            id: peerId,
            methods: {},
            instance: this.API.instance,
            wrapper: this.API.unwrappedInstance,
        };
        this.servers[peerId] = this.myServer;
    }
    ClientRepository.prototype.addServer = function (info, serverId) {
        this.logger.debug("adding server " + serverId);
        var current = this.servers[serverId];
        if (current) {
            return current.id;
        }
        var wrapper = new InstanceWrapper(this.API, info);
        var serverEntry = {
            id: serverId,
            methods: {},
            instance: wrapper.unwrap(),
            wrapper: wrapper,
        };
        this.servers[serverId] = serverEntry;
        this.callbacks.execute("onServerAdded", serverEntry.instance);
        return serverId;
    };
    ClientRepository.prototype.removeServerById = function (id, reason) {
        var _this = this;
        var server = this.servers[id];
        if (!server) {
            this.logger.warn("not aware of server " + id + ", my state " + JSON.stringify(Object.keys(this.servers)));
            return;
        }
        else {
            this.logger.debug("removing server " + id);
        }
        Object.keys(server.methods).forEach(function (methodId) {
            _this.removeServerMethod(id, methodId);
        });
        delete this.servers[id];
        this.callbacks.execute("onServerRemoved", server.instance, reason);
    };
    ClientRepository.prototype.addServerMethod = function (serverId, method) {
        var _a;
        var server = this.servers[serverId];
        if (!server) {
            throw new Error("server does not exists");
        }
        if (server.methods[method.id]) {
            return;
        }
        var identifier = this.createMethodIdentifier(method);
        var that = this;
        var methodDefinition = {
            identifier: identifier,
            gatewayId: method.id,
            name: method.name,
            displayName: method.display_name,
            description: method.description,
            version: method.version,
            objectTypes: method.object_types || [],
            accepts: method.input_signature,
            returns: method.result_signature,
            supportsStreaming: typeof method.flags !== "undefined" ? method.flags.streaming : false,
            flags: (_a = method.flags) !== null && _a !== void 0 ? _a : {},
            getServers: function () {
                return that.getServersByMethod(identifier);
            }
        };
        methodDefinition.object_types = methodDefinition.objectTypes;
        methodDefinition.display_name = methodDefinition.displayName;
        methodDefinition.version = methodDefinition.version;
        server.methods[method.id] = methodDefinition;
        var clientMethodDefinition = hideMethodSystemFlags(methodDefinition);
        if (!this.methodsCount[identifier]) {
            this.methodsCount[identifier] = 0;
            this.callbacks.execute("onMethodAdded", clientMethodDefinition);
        }
        this.methodsCount[identifier] = this.methodsCount[identifier] + 1;
        this.callbacks.execute("onServerMethodAdded", server.instance, clientMethodDefinition);
        return methodDefinition;
    };
    ClientRepository.prototype.removeServerMethod = function (serverId, methodId) {
        var server = this.servers[serverId];
        if (!server) {
            throw new Error("server does not exists");
        }
        var method = server.methods[methodId];
        delete server.methods[methodId];
        var clientMethodDefinition = hideMethodSystemFlags(method);
        this.methodsCount[method.identifier] = this.methodsCount[method.identifier] - 1;
        if (this.methodsCount[method.identifier] === 0) {
            this.callbacks.execute("onMethodRemoved", clientMethodDefinition);
        }
        this.callbacks.execute("onServerMethodRemoved", server.instance, clientMethodDefinition);
    };
    ClientRepository.prototype.getMethods = function () {
        return this.extractMethodsFromServers(Object.values(this.servers)).map(hideMethodSystemFlags);
    };
    ClientRepository.prototype.getServers = function () {
        return Object.values(this.servers).map(this.hideServerMethodSystemFlags);
    };
    ClientRepository.prototype.onServerAdded = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onServerAdded", callback);
        var serversWithMethodsToReplay = this.getServers().map(function (s) { return s.instance; });
        return this.returnUnsubWithDelayedReplay(unsubscribeFunc, serversWithMethodsToReplay, callback);
    };
    ClientRepository.prototype.onMethodAdded = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onMethodAdded", callback);
        var methodsToReplay = this.getMethods();
        return this.returnUnsubWithDelayedReplay(unsubscribeFunc, methodsToReplay, callback);
    };
    ClientRepository.prototype.onServerMethodAdded = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onServerMethodAdded", callback);
        var unsubCalled = false;
        var servers = this.getServers();
        setTimeout(function () {
            servers.forEach(function (server) {
                var methods = server.methods;
                Object.keys(methods).forEach(function (methodId) {
                    if (!unsubCalled) {
                        callback(server.instance, methods[methodId]);
                    }
                });
            });
        }, 0);
        return function () {
            unsubCalled = true;
            unsubscribeFunc();
        };
    };
    ClientRepository.prototype.onMethodRemoved = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onMethodRemoved", callback);
        return unsubscribeFunc;
    };
    ClientRepository.prototype.onServerRemoved = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onServerRemoved", callback);
        return unsubscribeFunc;
    };
    ClientRepository.prototype.onServerMethodRemoved = function (callback) {
        var unsubscribeFunc = this.callbacks.add("onServerMethodRemoved", callback);
        return unsubscribeFunc;
    };
    ClientRepository.prototype.getServerById = function (id) {
        return this.hideServerMethodSystemFlags(this.servers[id]);
    };
    ClientRepository.prototype.reset = function () {
        var _a;
        var _this = this;
        Object.keys(this.servers).forEach(function (key) {
            _this.removeServerById(key, "reset");
        });
        this.servers = (_a = {},
            _a[this.myServer.id] = this.myServer,
            _a);
        this.methodsCount = {};
    };
    ClientRepository.prototype.createMethodIdentifier = function (methodInfo) {
        var _a, _b;
        var accepts = (_a = methodInfo.input_signature) !== null && _a !== void 0 ? _a : "";
        var returns = (_b = methodInfo.result_signature) !== null && _b !== void 0 ? _b : "";
        return (methodInfo.name + accepts + returns).toLowerCase();
    };
    ClientRepository.prototype.getServersByMethod = function (identifier) {
        var allServers = [];
        Object.values(this.servers).forEach(function (server) {
            Object.values(server.methods).forEach(function (method) {
                if (method.identifier === identifier) {
                    allServers.push(server.instance);
                }
            });
        });
        return allServers;
    };
    ClientRepository.prototype.returnUnsubWithDelayedReplay = function (unsubscribeFunc, collectionToReplay, callback) {
        var unsubCalled = false;
        setTimeout(function () {
            collectionToReplay.forEach(function (item) {
                if (!unsubCalled) {
                    callback(item);
                }
            });
        }, 0);
        return function () {
            unsubCalled = true;
            unsubscribeFunc();
        };
    };
    ClientRepository.prototype.hideServerMethodSystemFlags = function (server) {
        var clientMethods = {};
        Object.entries(server.methods).forEach(function (_a) {
            var name = _a[0], method = _a[1];
            clientMethods[name] = hideMethodSystemFlags(method);
        });
        return __assign(__assign({}, server), { methods: clientMethods });
    };
    ClientRepository.prototype.extractMethodsFromServers = function (servers) {
        var methods = Object.values(servers).reduce(function (clientMethods, server) {
            return __spreadArrays(clientMethods, Object.values(server.methods));
        }, []);
        return methods;
    };
    return ClientRepository;
}());

var ServerRepository = (function () {
    function ServerRepository() {
        this.nextId = 0;
        this.methods = [];
    }
    ServerRepository.prototype.add = function (method) {
        method.repoId = String(this.nextId);
        this.nextId += 1;
        this.methods.push(method);
        return method;
    };
    ServerRepository.prototype.remove = function (repoId) {
        if (typeof repoId !== "string") {
            return new TypeError("Expecting a string");
        }
        this.methods = this.methods.filter(function (m) {
            return m.repoId !== repoId;
        });
    };
    ServerRepository.prototype.getById = function (id) {
        if (typeof id !== "string") {
            return undefined;
        }
        return this.methods.find(function (m) {
            return m.repoId === id;
        });
    };
    ServerRepository.prototype.getList = function () {
        return this.methods.map(function (m) { return m; });
    };
    ServerRepository.prototype.length = function () {
        return this.methods.length;
    };
    ServerRepository.prototype.reset = function () {
        this.methods = [];
    };
    return ServerRepository;
}());

var SUBSCRIPTION_REQUEST = "onSubscriptionRequest";
var SUBSCRIPTION_ADDED = "onSubscriptionAdded";
var SUBSCRIPTION_REMOVED = "onSubscriptionRemoved";
var ServerStreaming$1 = (function () {
    function ServerStreaming(session, repository, serverRepository) {
        var _this = this;
        this.session = session;
        this.repository = repository;
        this.serverRepository = serverRepository;
        this.ERR_URI_SUBSCRIPTION_FAILED = "com.tick42.agm.errors.subscription.failure";
        this.callbacks = lib$2();
        this.nextStreamId = 0;
        session.on("add-interest", function (msg) {
            _this.handleAddInterest(msg);
        });
        session.on("remove-interest", function (msg) {
            _this.handleRemoveInterest(msg);
        });
    }
    ServerStreaming.prototype.acceptRequestOnBranch = function (requestContext, streamingMethod, branch) {
        if (typeof branch !== "string") {
            branch = "";
        }
        if (typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
            throw new TypeError("The streaming method is missing its subscriptions.");
        }
        if (!Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
            throw new TypeError("The streaming method is missing its branches.");
        }
        var streamId = this.getStreamId(streamingMethod, branch);
        var key = requestContext.msg.subscription_id;
        var subscription = {
            id: key,
            arguments: requestContext.arguments,
            instance: requestContext.instance,
            branchKey: branch,
            streamId: streamId,
            subscribeMsg: requestContext.msg,
        };
        streamingMethod.protocolState.subscriptionsMap[key] = subscription;
        this.session.sendFireAndForget({
            type: "accepted",
            subscription_id: key,
            stream_id: streamId,
        });
        this.callbacks.execute(SUBSCRIPTION_ADDED, subscription, streamingMethod);
    };
    ServerStreaming.prototype.rejectRequest = function (requestContext, streamingMethod, reason) {
        if (typeof reason !== "string") {
            reason = "";
        }
        this.sendSubscriptionFailed("Subscription rejected by user. " + reason, requestContext.msg.subscription_id);
    };
    ServerStreaming.prototype.pushData = function (streamingMethod, data, branches) {
        var _this = this;
        if (typeof streamingMethod !== "object" || !Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
            return;
        }
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }
        if (typeof branches === "string") {
            branches = [branches];
        }
        else if (!Array.isArray(branches) || branches.length <= 0) {
            branches = [];
        }
        var streamIdList = streamingMethod.protocolState.branchKeyToStreamIdMap
            .filter(function (br) {
            if (!branches || branches.length === 0) {
                return true;
            }
            return branches.indexOf(br.key) >= 0;
        }).map(function (br) {
            return br.streamId;
        });
        streamIdList.forEach(function (streamId) {
            var publishMessage = {
                type: "publish",
                stream_id: streamId,
                data: data,
            };
            _this.session.sendFireAndForget(publishMessage);
        });
    };
    ServerStreaming.prototype.pushDataToSingle = function (method, subscription, data) {
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }
        var postMessage = {
            type: "post",
            subscription_id: subscription.id,
            data: data,
        };
        this.session.sendFireAndForget(postMessage);
    };
    ServerStreaming.prototype.closeSingleSubscription = function (streamingMethod, subscription) {
        if (streamingMethod.protocolState.subscriptionsMap) {
            delete streamingMethod.protocolState.subscriptionsMap[subscription.id];
        }
        var dropSubscriptionMessage = {
            type: "drop-subscription",
            subscription_id: subscription.id,
            reason: "Server dropping a single subscription",
        };
        this.session.sendFireAndForget(dropSubscriptionMessage);
        subscription.instance;
        this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
    };
    ServerStreaming.prototype.closeMultipleSubscriptions = function (streamingMethod, branchKey) {
        var _this = this;
        if (typeof streamingMethod !== "object" || typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
            return;
        }
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return;
        }
        var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
        var subscriptionsToClose = Object.keys(subscriptionsMap)
            .map(function (key) {
            return subscriptionsMap[key];
        });
        if (typeof branchKey === "string") {
            subscriptionsToClose = subscriptionsToClose.filter(function (sub) {
                return sub.branchKey === branchKey;
            });
        }
        subscriptionsToClose.forEach(function (subscription) {
            delete subscriptionsMap[subscription.id];
            var drop = {
                type: "drop-subscription",
                subscription_id: subscription.id,
                reason: "Server dropping all subscriptions on stream_id: " + subscription.streamId,
            };
            _this.session.sendFireAndForget(drop);
        });
    };
    ServerStreaming.prototype.getSubscriptionList = function (streamingMethod, branchKey) {
        if (typeof streamingMethod !== "object") {
            return [];
        }
        var subscriptions = [];
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return [];
        }
        var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
        var allSubscriptions = Object.keys(subscriptionsMap)
            .map(function (key) {
            return subscriptionsMap[key];
        });
        if (typeof branchKey !== "string") {
            subscriptions = allSubscriptions;
        }
        else {
            subscriptions = allSubscriptions.filter(function (sub) {
                return sub.branchKey === branchKey;
            });
        }
        return subscriptions;
    };
    ServerStreaming.prototype.getBranchList = function (streamingMethod) {
        if (typeof streamingMethod !== "object") {
            return [];
        }
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return [];
        }
        var subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
        var allSubscriptions = Object.keys(subscriptionsMap)
            .map(function (key) {
            return subscriptionsMap[key];
        });
        var result = [];
        allSubscriptions.forEach(function (sub) {
            var branch = "";
            if (typeof sub === "object" && typeof sub.branchKey === "string") {
                branch = sub.branchKey;
            }
            if (result.indexOf(branch) === -1) {
                result.push(branch);
            }
        });
        return result;
    };
    ServerStreaming.prototype.onSubAdded = function (callback) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_ADDED, callback);
    };
    ServerStreaming.prototype.onSubRequest = function (callback) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REQUEST, callback);
    };
    ServerStreaming.prototype.onSubRemoved = function (callback) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REMOVED, callback);
    };
    ServerStreaming.prototype.handleRemoveInterest = function (msg) {
        var streamingMethod = this.serverRepository.getById(msg.method_id);
        if (typeof msg.subscription_id !== "string" ||
            typeof streamingMethod !== "object") {
            return;
        }
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return;
        }
        if (typeof streamingMethod.protocolState.subscriptionsMap[msg.subscription_id] !== "object") {
            return;
        }
        var subscription = streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];
        delete streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];
        this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
    };
    ServerStreaming.prototype.onSubscriptionLifetimeEvent = function (eventName, handlerFunc) {
        this.callbacks.add(eventName, handlerFunc);
    };
    ServerStreaming.prototype.getNextStreamId = function () {
        return this.nextStreamId++ + "";
    };
    ServerStreaming.prototype.handleAddInterest = function (msg) {
        var caller = this.repository.getServerById(msg.caller_id);
        var instance = caller.instance;
        var requestContext = {
            msg: msg,
            arguments: msg.arguments_kv || {},
            instance: instance,
        };
        var streamingMethod = this.serverRepository.getById(msg.method_id);
        if (streamingMethod === undefined) {
            var errorMsg = "No method with id " + msg.method_id + " on this server.";
            this.sendSubscriptionFailed(errorMsg, msg.subscription_id);
            return;
        }
        if (streamingMethod.protocolState.subscriptionsMap &&
            streamingMethod.protocolState.subscriptionsMap[msg.subscription_id]) {
            this.sendSubscriptionFailed("A subscription with id " + msg.subscription_id + " already exists.", msg.subscription_id);
            return;
        }
        this.callbacks.execute(SUBSCRIPTION_REQUEST, requestContext, streamingMethod);
    };
    ServerStreaming.prototype.sendSubscriptionFailed = function (reason, subscriptionId) {
        var errorMessage = {
            type: "error",
            reason_uri: this.ERR_URI_SUBSCRIPTION_FAILED,
            reason: reason,
            request_id: subscriptionId,
        };
        this.session.sendFireAndForget(errorMessage);
    };
    ServerStreaming.prototype.getStreamId = function (streamingMethod, branchKey) {
        if (typeof branchKey !== "string") {
            branchKey = "";
        }
        if (!streamingMethod.protocolState.branchKeyToStreamIdMap) {
            throw new Error("streaming " + streamingMethod.definition.name + " method without protocol state");
        }
        var needleBranch = streamingMethod.protocolState.branchKeyToStreamIdMap.filter(function (branch) {
            return branch.key === branchKey;
        })[0];
        var streamId = (needleBranch ? needleBranch.streamId : undefined);
        if (typeof streamId !== "string" || streamId === "") {
            streamId = this.getNextStreamId();
            streamingMethod.protocolState.branchKeyToStreamIdMap.push({ key: branchKey, streamId: streamId });
        }
        return streamId;
    };
    return ServerStreaming;
}());

var ServerProtocol = (function () {
    function ServerProtocol(session, clientRepository, serverRepository, logger) {
        var _this = this;
        this.session = session;
        this.clientRepository = clientRepository;
        this.serverRepository = serverRepository;
        this.logger = logger;
        this.callbacks = lib$2();
        this.streaming = new ServerStreaming$1(session, clientRepository, serverRepository);
        this.session.on("invoke", function (msg) { return _this.handleInvokeMessage(msg); });
    }
    ServerProtocol.prototype.createStream = function (repoMethod) {
        repoMethod.protocolState.subscriptionsMap = {};
        repoMethod.protocolState.branchKeyToStreamIdMap = [];
        return this.register(repoMethod, true);
    };
    ServerProtocol.prototype.register = function (repoMethod, isStreaming) {
        var _this = this;
        var _a;
        var methodDef = repoMethod.definition;
        var flags = Object.assign({}, { metadata: (_a = methodDef.flags) !== null && _a !== void 0 ? _a : {} }, { streaming: isStreaming || false });
        var registerMsg = {
            type: "register",
            methods: [{
                    id: repoMethod.repoId,
                    name: methodDef.name,
                    display_name: methodDef.displayName,
                    description: methodDef.description,
                    version: methodDef.version,
                    flags: flags,
                    object_types: methodDef.objectTypes || methodDef.object_types,
                    input_signature: methodDef.accepts,
                    result_signature: methodDef.returns,
                    restrictions: undefined,
                }],
        };
        return this.session.send(registerMsg, { methodId: repoMethod.repoId })
            .then(function () {
            _this.logger.debug("registered method " + repoMethod.definition.name + " with id " + repoMethod.repoId);
        })
            .catch(function (msg) {
            _this.logger.warn("failed to register method " + repoMethod.definition.name + " with id " + repoMethod.repoId + " - " + JSON.stringify(msg));
            throw msg;
        });
    };
    ServerProtocol.prototype.onInvoked = function (callback) {
        this.callbacks.add("onInvoked", callback);
    };
    ServerProtocol.prototype.methodInvocationResult = function (method, invocationId, err, result) {
        var msg;
        if (err || err === "") {
            msg = {
                type: "error",
                request_id: invocationId,
                reason_uri: "agm.errors.client_error",
                reason: err,
                context: result,
                peer_id: undefined,
            };
        }
        else {
            msg = {
                type: "yield",
                invocation_id: invocationId,
                peer_id: this.session.peerId,
                result: result,
                request_id: undefined,
            };
        }
        this.session.sendFireAndForget(msg);
    };
    ServerProtocol.prototype.unregister = function (method) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msg = {
                            type: "unregister",
                            methods: [method.repoId],
                        };
                        return [4, this.session.send(msg)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    ServerProtocol.prototype.getBranchList = function (method) {
        return this.streaming.getBranchList(method);
    };
    ServerProtocol.prototype.getSubscriptionList = function (method, branchKey) {
        return this.streaming.getSubscriptionList(method, branchKey);
    };
    ServerProtocol.prototype.closeAllSubscriptions = function (method, branchKey) {
        this.streaming.closeMultipleSubscriptions(method, branchKey);
    };
    ServerProtocol.prototype.pushData = function (method, data, branches) {
        this.streaming.pushData(method, data, branches);
    };
    ServerProtocol.prototype.pushDataToSingle = function (method, subscription, data) {
        this.streaming.pushDataToSingle(method, subscription, data);
    };
    ServerProtocol.prototype.closeSingleSubscription = function (method, subscription) {
        this.streaming.closeSingleSubscription(method, subscription);
    };
    ServerProtocol.prototype.acceptRequestOnBranch = function (requestContext, method, branch) {
        this.streaming.acceptRequestOnBranch(requestContext, method, branch);
    };
    ServerProtocol.prototype.rejectRequest = function (requestContext, method, reason) {
        this.streaming.rejectRequest(requestContext, method, reason);
    };
    ServerProtocol.prototype.onSubRequest = function (callback) {
        this.streaming.onSubRequest(callback);
    };
    ServerProtocol.prototype.onSubAdded = function (callback) {
        this.streaming.onSubAdded(callback);
    };
    ServerProtocol.prototype.onSubRemoved = function (callback) {
        this.streaming.onSubRemoved(callback);
    };
    ServerProtocol.prototype.handleInvokeMessage = function (msg) {
        var invocationId = msg.invocation_id;
        var callerId = msg.caller_id;
        var methodId = msg.method_id;
        var args = msg.arguments_kv;
        var methodList = this.serverRepository.getList();
        var method = methodList.filter(function (m) {
            return m.repoId === methodId;
        })[0];
        if (method === undefined) {
            return;
        }
        var client = this.clientRepository.getServerById(callerId).instance;
        var invocationArgs = { args: args, instance: client };
        this.callbacks.execute("onInvoked", method, invocationId, invocationArgs);
    };
    return ServerProtocol;
}());

var UserSubscription = (function () {
    function UserSubscription(repository, subscriptionData) {
        this.repository = repository;
        this.subscriptionData = subscriptionData;
    }
    Object.defineProperty(UserSubscription.prototype, "requestArguments", {
        get: function () {
            return this.subscriptionData.params.arguments || {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserSubscription.prototype, "servers", {
        get: function () {
            var _this = this;
            return this.subscriptionData.trackedServers
                .filter(function (pair) { return pair.subscriptionId; })
                .map(function (pair) { return _this.repository.getServerById(pair.serverId).instance; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserSubscription.prototype, "serverInstance", {
        get: function () {
            return this.servers[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserSubscription.prototype, "stream", {
        get: function () {
            return this.subscriptionData.method;
        },
        enumerable: true,
        configurable: true
    });
    UserSubscription.prototype.onData = function (dataCallback) {
        if (typeof dataCallback !== "function") {
            throw new TypeError("The data callback must be a function.");
        }
        this.subscriptionData.handlers.onData.push(dataCallback);
        if (this.subscriptionData.handlers.onData.length === 1 && this.subscriptionData.queued.data.length > 0) {
            this.subscriptionData.queued.data.forEach(function (dataItem) {
                dataCallback(dataItem);
            });
        }
    };
    UserSubscription.prototype.onClosed = function (closedCallback) {
        if (typeof closedCallback !== "function") {
            throw new TypeError("The callback must be a function.");
        }
        this.subscriptionData.handlers.onClosed.push(closedCallback);
    };
    UserSubscription.prototype.onFailed = function (callback) {
    };
    UserSubscription.prototype.onConnected = function (callback) {
        if (typeof callback !== "function") {
            throw new TypeError("The callback must be a function.");
        }
        this.subscriptionData.handlers.onConnected.push(callback);
    };
    UserSubscription.prototype.close = function () {
        this.subscriptionData.close();
    };
    UserSubscription.prototype.setNewSubscription = function (newSub) {
        this.subscriptionData = newSub;
    };
    return UserSubscription;
}());

var TimedCache = (function () {
    function TimedCache(config) {
        this.config = config;
        this.cache = [];
        this.timeoutIds = [];
    }
    TimedCache.prototype.add = function (element) {
        var _this = this;
        var id = shortid$1();
        this.cache.push({ id: id, element: element });
        var timeoutId = setTimeout(function () {
            var elementIdx = _this.cache.findIndex(function (entry) { return entry.id === id; });
            if (elementIdx < 0) {
                return;
            }
            _this.cache.splice(elementIdx, 1);
        }, this.config.ELEMENT_TTL_MS);
        this.timeoutIds.push(timeoutId);
    };
    TimedCache.prototype.flush = function () {
        var elements = this.cache.map(function (entry) { return entry.element; });
        this.timeoutIds.forEach(function (id) { return clearInterval(id); });
        this.cache = [];
        this.timeoutIds = [];
        return elements;
    };
    return TimedCache;
}());

var STATUS_AWAITING_ACCEPT = "awaitingAccept";
var STATUS_SUBSCRIBED = "subscribed";
var ERR_MSG_SUB_FAILED = "Subscription failed.";
var ERR_MSG_SUB_REJECTED = "Subscription rejected.";
var ON_CLOSE_MSG_SERVER_INIT = "ServerInitiated";
var ON_CLOSE_MSG_CLIENT_INIT = "ClientInitiated";
var ClientStreaming = (function () {
    function ClientStreaming(session, repository, logger) {
        var _this = this;
        this.session = session;
        this.repository = repository;
        this.logger = logger;
        this.subscriptionsList = {};
        this.timedCache = new TimedCache({ ELEMENT_TTL_MS: 10000 });
        this.subscriptionIdToLocalKeyMap = {};
        this.nextSubLocalKey = 0;
        this.handleErrorSubscribing = function (errorResponse) {
            var tag = errorResponse._tag;
            var subLocalKey = tag.subLocalKey;
            var pendingSub = _this.subscriptionsList[subLocalKey];
            if (typeof pendingSub !== "object") {
                return;
            }
            pendingSub.trackedServers = pendingSub.trackedServers.filter(function (server) {
                return server.serverId !== tag.serverId;
            });
            if (pendingSub.trackedServers.length <= 0) {
                clearTimeout(pendingSub.timeoutId);
                if (pendingSub.status === STATUS_AWAITING_ACCEPT) {
                    var reason = (typeof errorResponse.reason === "string" && errorResponse.reason !== "") ?
                        ' Publisher said "' + errorResponse.reason + '".' :
                        " No reason given.";
                    var callArgs = typeof pendingSub.params.arguments === "object" ?
                        JSON.stringify(pendingSub.params.arguments) :
                        "{}";
                    pendingSub.error({
                        message: ERR_MSG_SUB_REJECTED + reason + " Called with:" + callArgs,
                        called_with: pendingSub.params.arguments,
                        method: pendingSub.method,
                    });
                }
                else if (pendingSub.status === STATUS_SUBSCRIBED) {
                    _this.callOnClosedHandlers(pendingSub);
                }
                delete _this.subscriptionsList[subLocalKey];
            }
        };
        this.handleSubscribed = function (msg) {
            var subLocalKey = msg._tag.subLocalKey;
            var pendingSub = _this.subscriptionsList[subLocalKey];
            if (typeof pendingSub !== "object") {
                return;
            }
            var serverId = msg._tag.serverId;
            var acceptingServer = pendingSub.trackedServers
                .filter(function (server) {
                return server.serverId === serverId;
            })[0];
            if (typeof acceptingServer !== "object") {
                return;
            }
            acceptingServer.subscriptionId = msg.subscription_id;
            _this.subscriptionIdToLocalKeyMap[msg.subscription_id] = subLocalKey;
            var isFirstResponse = (pendingSub.status === STATUS_AWAITING_ACCEPT);
            pendingSub.status = STATUS_SUBSCRIBED;
            if (isFirstResponse) {
                var reconnect = false;
                var sub = pendingSub.subscription;
                if (sub) {
                    sub.setNewSubscription(pendingSub);
                    pendingSub.success(sub);
                    reconnect = true;
                }
                else {
                    sub = new UserSubscription(_this.repository, pendingSub);
                    pendingSub.subscription = sub;
                    pendingSub.success(sub);
                }
                for (var _i = 0, _a = pendingSub.handlers.onConnected; _i < _a.length; _i++) {
                    var handler = _a[_i];
                    try {
                        handler(sub.serverInstance, reconnect);
                    }
                    catch (e) {
                    }
                }
            }
        };
        this.handleEventData = function (msg) {
            var subLocalKey = _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
            if (typeof subLocalKey === "undefined") {
                return;
            }
            var subscription = _this.subscriptionsList[subLocalKey];
            if (typeof subscription !== "object") {
                return;
            }
            var trackedServersFound = subscription.trackedServers.filter(function (server) {
                return server.subscriptionId === msg.subscription_id;
            });
            if (trackedServersFound.length !== 1) {
                return;
            }
            var isPrivateData = msg.oob;
            var sendingServerId = trackedServersFound[0].serverId;
            var receivedStreamData = function () {
                return {
                    data: msg.data,
                    server: _this.repository.getServerById(sendingServerId).instance,
                    requestArguments: subscription.params.arguments,
                    message: undefined,
                    private: isPrivateData,
                };
            };
            var onDataHandlers = subscription.handlers.onData;
            var queuedData = subscription.queued.data;
            if (onDataHandlers.length > 0) {
                onDataHandlers.forEach(function (callback) {
                    if (typeof callback === "function") {
                        callback(receivedStreamData());
                    }
                });
            }
            else {
                queuedData.push(receivedStreamData());
            }
        };
        this.handleSubscriptionCancelled = function (msg) {
            var subLocalKey = _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
            if (typeof subLocalKey === "undefined") {
                return;
            }
            var subscription = _this.subscriptionsList[subLocalKey];
            if (typeof subscription !== "object") {
                return;
            }
            var expectedNewLength = subscription.trackedServers.length - 1;
            subscription.trackedServers = subscription.trackedServers.filter(function (server) {
                if (server.subscriptionId === msg.subscription_id) {
                    subscription.queued.closers.push(server.serverId);
                    return false;
                }
                else {
                    return true;
                }
            });
            if (subscription.trackedServers.length !== expectedNewLength) {
                return;
            }
            if (subscription.trackedServers.length <= 0) {
                _this.timedCache.add(subscription);
                clearTimeout(subscription.timeoutId);
                _this.callOnClosedHandlers(subscription);
                delete _this.subscriptionsList[subLocalKey];
            }
            delete _this.subscriptionIdToLocalKeyMap[msg.subscription_id];
        };
        session.on("subscribed", this.handleSubscribed);
        session.on("event", this.handleEventData);
        session.on("subscription-cancelled", this.handleSubscriptionCancelled);
    }
    ClientStreaming.prototype.subscribe = function (streamingMethod, params, targetServers, success, error, existingSub) {
        var _this = this;
        if (targetServers.length === 0) {
            error({
                method: streamingMethod,
                called_with: params.arguments,
                message: ERR_MSG_SUB_FAILED + " No available servers matched the target params.",
            });
            return;
        }
        var subLocalKey = this.getNextSubscriptionLocalKey();
        var pendingSub = this.registerSubscription(subLocalKey, streamingMethod, params, success, error, params.methodResponseTimeout || 10000, existingSub);
        if (typeof pendingSub !== "object") {
            error({
                method: streamingMethod,
                called_with: params.arguments,
                message: ERR_MSG_SUB_FAILED + " Unable to register the user callbacks.",
            });
            return;
        }
        targetServers.forEach(function (target) {
            var serverId = target.server.id;
            var method = target.methods.find(function (m) { return m.name === streamingMethod.name; });
            if (!method) {
                _this.logger.error("can not find method " + streamingMethod.name + " for target " + target.server.id);
                return;
            }
            pendingSub.trackedServers.push({
                serverId: serverId,
                subscriptionId: undefined,
            });
            var msg = {
                type: "subscribe",
                server_id: serverId,
                method_id: method.gatewayId,
                arguments_kv: params.arguments,
            };
            _this.session.send(msg, { serverId: serverId, subLocalKey: subLocalKey })
                .then(function (m) { return _this.handleSubscribed(m); })
                .catch(function (err) { return _this.handleErrorSubscribing(err); });
        });
    };
    ClientStreaming.prototype.drainSubscriptions = function () {
        var existing = Object.values(this.subscriptionsList);
        this.subscriptionsList = {};
        this.subscriptionIdToLocalKeyMap = {};
        return existing;
    };
    ClientStreaming.prototype.drainSubscriptionsCache = function () {
        return this.timedCache.flush();
    };
    ClientStreaming.prototype.getNextSubscriptionLocalKey = function () {
        var current = this.nextSubLocalKey;
        this.nextSubLocalKey += 1;
        return current;
    };
    ClientStreaming.prototype.registerSubscription = function (subLocalKey, method, params, success, error, timeout, existingSub) {
        var _this = this;
        var subsInfo = {
            localKey: subLocalKey,
            status: STATUS_AWAITING_ACCEPT,
            method: method,
            params: params,
            success: success,
            error: error,
            trackedServers: [],
            handlers: {
                onData: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onData) || [],
                onClosed: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onClosed) || [],
                onConnected: (existingSub === null || existingSub === void 0 ? void 0 : existingSub.handlers.onConnected) || [],
            },
            queued: {
                data: [],
                closers: [],
            },
            timeoutId: undefined,
            close: function () { return _this.closeSubscription(subLocalKey); },
            subscription: existingSub === null || existingSub === void 0 ? void 0 : existingSub.subscription
        };
        if (!existingSub) {
            if (params.onData) {
                subsInfo.handlers.onData.push(params.onData);
            }
            if (params.onClosed) {
                subsInfo.handlers.onClosed.push(params.onClosed);
            }
            if (params.onConnected) {
                subsInfo.handlers.onConnected.push(params.onConnected);
            }
        }
        this.subscriptionsList[subLocalKey] = subsInfo;
        subsInfo.timeoutId = setTimeout(function () {
            if (_this.subscriptionsList[subLocalKey] === undefined) {
                return;
            }
            var pendingSub = _this.subscriptionsList[subLocalKey];
            if (pendingSub.status === STATUS_AWAITING_ACCEPT) {
                error({
                    method: method,
                    called_with: params.arguments,
                    message: ERR_MSG_SUB_FAILED + " Subscription attempt timed out after " + timeout + " ms.",
                });
                delete _this.subscriptionsList[subLocalKey];
            }
            else if (pendingSub.status === STATUS_SUBSCRIBED && pendingSub.trackedServers.length > 0) {
                pendingSub.trackedServers = pendingSub.trackedServers.filter(function (server) {
                    return (typeof server.subscriptionId !== "undefined");
                });
                delete pendingSub.timeoutId;
                if (pendingSub.trackedServers.length <= 0) {
                    _this.callOnClosedHandlers(pendingSub);
                    delete _this.subscriptionsList[subLocalKey];
                }
            }
        }, timeout);
        return subsInfo;
    };
    ClientStreaming.prototype.callOnClosedHandlers = function (subscription, reason) {
        var closersCount = subscription.queued.closers.length;
        var closingServerId = (closersCount > 0) ? subscription.queued.closers[closersCount - 1] : null;
        var closingServer;
        if (closingServerId !== undefined && typeof closingServerId === "string") {
            closingServer = this.repository.getServerById(closingServerId).instance;
        }
        subscription.handlers.onClosed.forEach(function (callback) {
            if (typeof callback !== "function") {
                return;
            }
            callback({
                message: reason || ON_CLOSE_MSG_SERVER_INIT,
                requestArguments: subscription.params.arguments || {},
                server: closingServer,
                stream: subscription.method,
            });
        });
    };
    ClientStreaming.prototype.closeSubscription = function (subLocalKey) {
        var _this = this;
        var subscription = this.subscriptionsList[subLocalKey];
        if (typeof subscription !== "object") {
            return;
        }
        subscription.trackedServers.forEach(function (server) {
            if (typeof server.subscriptionId === "undefined") {
                return;
            }
            subscription.queued.closers.push(server.serverId);
            _this.session.sendFireAndForget({
                type: "unsubscribe",
                subscription_id: server.subscriptionId,
                reason_uri: "",
                reason: ON_CLOSE_MSG_CLIENT_INIT,
            });
            delete _this.subscriptionIdToLocalKeyMap[server.subscriptionId];
        });
        subscription.trackedServers = [];
        this.callOnClosedHandlers(subscription, ON_CLOSE_MSG_CLIENT_INIT);
        delete this.subscriptionsList[subLocalKey];
    };
    return ClientStreaming;
}());

var ClientProtocol = (function () {
    function ClientProtocol(session, repository, logger) {
        var _this = this;
        this.session = session;
        this.repository = repository;
        this.logger = logger;
        session.on("peer-added", function (msg) { return _this.handlePeerAdded(msg); });
        session.on("peer-removed", function (msg) { return _this.handlePeerRemoved(msg); });
        session.on("methods-added", function (msg) { return _this.handleMethodsAddedMessage(msg); });
        session.on("methods-removed", function (msg) { return _this.handleMethodsRemovedMessage(msg); });
        this.streaming = new ClientStreaming(session, repository, logger);
    }
    ClientProtocol.prototype.subscribe = function (stream, options, targetServers, success, error, existingSub) {
        this.streaming.subscribe(stream, options, targetServers, success, error, existingSub);
    };
    ClientProtocol.prototype.invoke = function (id, method, args, target) {
        var _this = this;
        var serverId = target.id;
        var methodId = method.gatewayId;
        var msg = {
            type: "call",
            server_id: serverId,
            method_id: methodId,
            arguments_kv: args,
        };
        return this.session.send(msg, { invocationId: id, serverId: serverId })
            .then(function (m) { return _this.handleResultMessage(m); })
            .catch(function (err) { return _this.handleInvocationError(err); });
    };
    ClientProtocol.prototype.drainSubscriptions = function () {
        return this.streaming.drainSubscriptions();
    };
    ClientProtocol.prototype.drainSubscriptionsCache = function () {
        return this.streaming.drainSubscriptionsCache();
    };
    ClientProtocol.prototype.handlePeerAdded = function (msg) {
        var newPeerId = msg.new_peer_id;
        var remoteId = msg.identity;
        var isLocal = msg.meta ? msg.meta.local : true;
        var pid = Number(remoteId.process);
        var serverInfo = {
            machine: remoteId.machine,
            pid: isNaN(pid) ? remoteId.process : pid,
            instance: remoteId.instance,
            application: remoteId.application,
            applicationName: remoteId.applicationName,
            environment: remoteId.environment,
            region: remoteId.region,
            user: remoteId.user,
            windowId: remoteId.windowId,
            peerId: newPeerId,
            api: remoteId.api,
            isLocal: isLocal
        };
        this.repository.addServer(serverInfo, newPeerId);
    };
    ClientProtocol.prototype.handlePeerRemoved = function (msg) {
        var removedPeerId = msg.removed_id;
        var reason = msg.reason;
        this.repository.removeServerById(removedPeerId, reason);
    };
    ClientProtocol.prototype.handleMethodsAddedMessage = function (msg) {
        var _this = this;
        var serverId = msg.server_id;
        var methods = msg.methods;
        methods.forEach(function (method) {
            _this.repository.addServerMethod(serverId, method);
        });
    };
    ClientProtocol.prototype.handleMethodsRemovedMessage = function (msg) {
        var _this = this;
        var serverId = msg.server_id;
        var methodIdList = msg.methods;
        var server = this.repository.getServerById(serverId);
        var serverMethodKeys = Object.keys(server.methods);
        serverMethodKeys.forEach(function (methodKey) {
            var method = server.methods[methodKey];
            if (methodIdList.indexOf(method.gatewayId) > -1) {
                _this.repository.removeServerMethod(serverId, methodKey);
            }
        });
    };
    ClientProtocol.prototype.handleResultMessage = function (msg) {
        var invocationId = msg._tag.invocationId;
        var result = msg.result;
        var serverId = msg._tag.serverId;
        var server = this.repository.getServerById(serverId);
        return {
            invocationId: invocationId,
            result: result,
            instance: server.instance,
            status: InvokeStatus.Success,
            message: ""
        };
    };
    ClientProtocol.prototype.handleInvocationError = function (msg) {
        this.logger.debug("handle invocation error " + JSON.stringify(msg));
        if ("_tag" in msg) {
            var invocationId = msg._tag.invocationId;
            var serverId = msg._tag.serverId;
            var server = this.repository.getServerById(serverId);
            var message = msg.reason;
            var context_1 = msg.context;
            return {
                invocationId: invocationId,
                result: context_1,
                instance: server.instance,
                status: InvokeStatus.Error,
                message: message
            };
        }
        else {
            return {
                invocationId: "",
                message: msg.message,
                status: InvokeStatus.Error,
                error: msg
            };
        }
    };
    return ClientProtocol;
}());

function gW3ProtocolFactory (instance, connection, clientRepository, serverRepository, libConfig, interop) {
    var logger = libConfig.logger.subLogger("gw3-protocol");
    var resolveReadyPromise;
    var readyPromise = new Promise(function (resolve) {
        resolveReadyPromise = resolve;
    });
    var session = connection.domain("agm", ["subscribed"]);
    var server = new ServerProtocol(session, clientRepository, serverRepository, logger.subLogger("server"));
    var client = new ClientProtocol(session, clientRepository, logger.subLogger("client"));
    function handleReconnect() {
        return __awaiter(this, void 0, void 0, function () {
            var reconnectionPromises, existingSubscriptions, _loop_1, _i, existingSubscriptions_1, sub, registeredMethods, _loop_2, _a, registeredMethods_1, method;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.info("reconnected - will replay registered methods and subscriptions");
                        client.drainSubscriptionsCache().forEach(function (sub) {
                            var methodInfo = sub.method;
                            var params = Object.assign({}, sub.params);
                            logger.info("trying to soft-re-subscribe to method " + methodInfo.name + ", with params: " + JSON.stringify(params));
                            interop.client.subscribe(methodInfo, params, undefined, undefined, sub).then(function () { return logger.info("soft-subscribing to method " + methodInfo.name + " DONE"); }).catch(function (error) { return logger.warn("subscribing to method " + methodInfo.name + " failed: " + JSON.stringify(error) + "}"); });
                        });
                        reconnectionPromises = [];
                        existingSubscriptions = client.drainSubscriptions();
                        _loop_1 = function (sub) {
                            var methodInfo = sub.method;
                            var params = Object.assign({}, sub.params);
                            logger.info("trying to re-subscribe to method " + methodInfo.name + ", with params: " + JSON.stringify(params));
                            reconnectionPromises.push(interop.client.subscribe(methodInfo, params, undefined, undefined, sub).then(function () { return logger.info("subscribing to method " + methodInfo.name + " DONE"); }));
                        };
                        for (_i = 0, existingSubscriptions_1 = existingSubscriptions; _i < existingSubscriptions_1.length; _i++) {
                            sub = existingSubscriptions_1[_i];
                            _loop_1(sub);
                        }
                        registeredMethods = serverRepository.getList();
                        serverRepository.reset();
                        _loop_2 = function (method) {
                            var def = method.definition;
                            logger.info("re-publishing method " + def.name);
                            if (method.stream) {
                                reconnectionPromises.push(interop.server.createStream(def, method.streamCallbacks, undefined, undefined, method.stream).then(function () { return logger.info("subscribing to method " + def.name + " DONE"); }));
                            }
                            else if (method.theFunction && method.theFunction.userCallback) {
                                reconnectionPromises.push(interop.register(def, method.theFunction.userCallback).then(function () { return logger.info("subscribing to method " + def.name + " DONE"); }));
                            }
                            else if (method.theFunction && method.theFunction.userCallbackAsync) {
                                reconnectionPromises.push(interop.registerAsync(def, method.theFunction.userCallbackAsync).then(function () { return logger.info("subscribing to method " + def.name + " DONE"); }));
                            }
                            logger.info("re-publishing method " + def.name + " DONE");
                        };
                        for (_a = 0, registeredMethods_1 = registeredMethods; _a < registeredMethods_1.length; _a++) {
                            method = registeredMethods_1[_a];
                            _loop_2(method);
                        }
                        return [4, Promise.all(reconnectionPromises)];
                    case 1:
                        _b.sent();
                        logger.info("Interop is re-announced");
                        return [2];
                }
            });
        });
    }
    function handleInitialJoin() {
        if (resolveReadyPromise) {
            resolveReadyPromise({
                client: client,
                server: server,
            });
            resolveReadyPromise = undefined;
        }
    }
    session.onJoined(function (reconnect) {
        clientRepository.addServer(instance, connection.peerId);
        if (reconnect) {
            handleReconnect().then(function () { return connection.setLibReAnnounced({ name: "interop" }); }).catch(function (error) { return logger.warn("Error while re-announcing interop: " + JSON.stringify(error)); });
        }
        else {
            handleInitialJoin();
        }
    });
    session.onLeft(function () {
        clientRepository.reset();
    });
    session.join();
    return readyPromise;
}

var Interop = (function () {
    function Interop(configuration) {
        var _this = this;
        if (typeof configuration === "undefined") {
            throw new Error("configuration is required");
        }
        if (typeof configuration.connection === "undefined") {
            throw new Error("configuration.connections is required");
        }
        var connection = configuration.connection;
        if (typeof configuration.methodResponseTimeout !== "number") {
            configuration.methodResponseTimeout = 30 * 1000;
        }
        if (typeof configuration.waitTimeoutMs !== "number") {
            configuration.waitTimeoutMs = 30 * 1000;
        }
        this.unwrappedInstance = new InstanceWrapper(this, undefined, connection);
        this.instance = this.unwrappedInstance.unwrap();
        this.clientRepository = new ClientRepository(configuration.logger.subLogger("cRep"), this);
        this.serverRepository = new ServerRepository();
        var protocolPromise;
        if (connection.protocolVersion === 3) {
            protocolPromise = gW3ProtocolFactory(this.instance, connection, this.clientRepository, this.serverRepository, configuration, this);
        }
        else {
            throw new Error("protocol " + connection.protocolVersion + " not supported");
        }
        this.readyPromise = protocolPromise.then(function (protocol) {
            _this.protocol = protocol;
            _this.client = new Client(_this.protocol, _this.clientRepository, _this.instance, configuration);
            _this.server = new Server(_this.protocol, _this.serverRepository);
            return _this;
        });
    }
    Interop.prototype.ready = function () {
        return this.readyPromise;
    };
    Interop.prototype.serverRemoved = function (callback) {
        return this.client.serverRemoved(callback);
    };
    Interop.prototype.serverAdded = function (callback) {
        return this.client.serverAdded(callback);
    };
    Interop.prototype.serverMethodRemoved = function (callback) {
        return this.client.serverMethodRemoved(callback);
    };
    Interop.prototype.serverMethodAdded = function (callback) {
        return this.client.serverMethodAdded(callback);
    };
    Interop.prototype.methodRemoved = function (callback) {
        return this.client.methodRemoved(callback);
    };
    Interop.prototype.methodAdded = function (callback) {
        return this.client.methodAdded(callback);
    };
    Interop.prototype.methodsForInstance = function (instance) {
        return this.client.methodsForInstance(instance);
    };
    Interop.prototype.methods = function (methodFilter) {
        return this.client.methods(methodFilter);
    };
    Interop.prototype.servers = function (methodFilter) {
        return this.client.servers(methodFilter);
    };
    Interop.prototype.subscribe = function (method, options, successCallback, errorCallback) {
        return this.client.subscribe(method, options, successCallback, errorCallback);
    };
    Interop.prototype.createStream = function (streamDef, callbacks, successCallback, errorCallback) {
        return this.server.createStream(streamDef, callbacks, successCallback, errorCallback);
    };
    Interop.prototype.unregister = function (methodFilter) {
        return this.server.unregister(methodFilter);
    };
    Interop.prototype.registerAsync = function (methodDefinition, callback) {
        return this.server.registerAsync(methodDefinition, callback);
    };
    Interop.prototype.register = function (methodDefinition, callback) {
        return this.server.register(methodDefinition, callback);
    };
    Interop.prototype.invoke = function (methodFilter, argumentObj, target, additionalOptions, success, error) {
        return this.client.invoke(methodFilter, argumentObj, target, additionalOptions, success, error);
    };
    Interop.prototype.waitForMethod = function (name) {
        var pw = new PromiseWrapper();
        var unsubscribe = this.client.methodAdded(function (m) {
            if (m.name === name) {
                unsubscribe();
                pw.resolve(m);
            }
        });
        return pw.promise;
    };
    return Interop;
}());

var successMessages = ["subscribed", "success"];
var MessageBus = (function () {
    function MessageBus(connection, logger) {
        var _this = this;
        this.publish = function (topic, data, options) {
            var _a = options || {}, routingKey = _a.routingKey, target = _a.target;
            var args = _this.removeEmptyValues({
                type: "publish",
                topic: topic,
                data: data,
                peer_id: _this.peerId,
                routing_key: routingKey,
                target_identity: target
            });
            _this.session.send(args);
        };
        this.subscribe = function (topic, callback, options) {
            return new Promise(function (resolve, reject) {
                var _a = options || {}, routingKey = _a.routingKey, target = _a.target;
                var args = _this.removeEmptyValues({
                    type: "subscribe",
                    topic: topic,
                    peer_id: _this.peerId,
                    routing_key: routingKey,
                    source: target
                });
                _this.session.send(args)
                    .then(function (response) {
                    var subscription_id = response.subscription_id;
                    _this.subscriptions.push({ subscription_id: subscription_id, topic: topic, callback: callback, source: target });
                    resolve({
                        unsubscribe: function () {
                            _this.session.send({ type: "unsubscribe", subscription_id: subscription_id, peer_id: _this.peerId });
                            _this.subscriptions = _this.subscriptions.filter(function (s) { return s.subscription_id !== subscription_id; });
                            return Promise.resolve();
                        }
                    });
                })
                    .catch(function (error) { return reject(error); });
            });
        };
        this.watchOnEvent = function () {
            _this.session.on("event", function (args) {
                var data = args.data, subscription_id = args.subscription_id;
                var source = args["publisher-identity"];
                var subscription = _this.subscriptions.find(function (s) { return s.subscription_id === subscription_id; });
                if (subscription) {
                    if (!subscription.source) {
                        subscription.callback(data, subscription.topic, source);
                    }
                    else {
                        if (_this.keysMatch(subscription.source, source)) {
                            subscription.callback(data, subscription.topic, source);
                        }
                    }
                }
            });
        };
        this.connection = connection;
        this.logger = logger;
        this.peerId = connection.peerId;
        this.subscriptions = [];
        this.session = connection.domain("bus", successMessages);
        this.readyPromise = this.session.join();
        this.readyPromise.then(function () {
            _this.watchOnEvent();
        });
    }
    MessageBus.prototype.ready = function () {
        return this.readyPromise;
    };
    MessageBus.prototype.removeEmptyValues = function (obj) {
        var cleaned = {};
        Object.keys(obj).forEach(function (key) {
            if (obj[key] !== undefined && obj[key] !== null) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    };
    MessageBus.prototype.keysMatch = function (obj1, obj2) {
        var keysObj1 = Object.keys(obj1);
        var allMatch = true;
        keysObj1.forEach(function (key) {
            if (obj1[key] !== obj2[key]) {
                allMatch = false;
            }
        });
        return allMatch;
    };
    return MessageBus;
}());

var GlueCore = function (userConfig, ext) {
    var gdVersion = Utils$1.getGDMajorVersion();
    var glue42gd;
    var preloadPromise = Promise.resolve();
    if (gdVersion) {
        if (gdVersion < 3) {
            throw new Error("GD v2 is not supported. Use v4 of the API to run in that context.");
        }
        else if (gdVersion >= 3) {
            glue42gd = window.glue42gd;
            preloadPromise = window.gdPreloadPromise || preloadPromise;
        }
    }
    var glueInitTimer = timer("glue");
    userConfig = userConfig || {};
    ext = ext || {};
    var internalConfig = prepareConfig$1(userConfig, ext, glue42gd);
    var _connection;
    var _interop;
    var _logger;
    var _metrics;
    var _contexts;
    var _bus;
    var _allowTrace;
    var libs = {};
    function registerLib(name, inner, t) {
        _allowTrace = _logger.canPublish("trace");
        if (_allowTrace) {
            _logger.trace("registering " + name + " module");
        }
        var done = function () {
            inner.initTime = t.stop();
            inner.initEndTime = t.endTime;
            inner.marks = t.marks;
            if (_allowTrace) {
                _logger.trace(name + " is ready - " + (t.endTime - t.startTime));
            }
        };
        inner.initStartTime = t.startTime;
        if (inner.ready) {
            inner.ready().then(function () {
                done();
            });
        }
        else {
            done();
        }
        if (!Array.isArray(name)) {
            name = [name];
        }
        name.forEach(function (n) {
            libs[n] = inner;
            GlueCore[n] = inner;
        });
    }
    function setupConnection() {
        var initTimer = timer("connection");
        _connection = new Connection(internalConfig.connection, _logger.subLogger("connection"));
        var authPromise = Promise.resolve(internalConfig.auth);
        if (internalConfig.connection && !internalConfig.auth) {
            if (glue42gd) {
                authPromise = glue42gd.getGWToken()
                    .then(function (token) {
                    return {
                        gatewayToken: token
                    };
                });
            }
            else if (typeof window !== "undefined" && (window === null || window === void 0 ? void 0 : window.glue42electron)) {
                if (typeof window.glue42electron.gwToken === "string") {
                    authPromise = Promise.resolve({
                        gatewayToken: window.glue42electron.gwToken
                    });
                }
            }
            else {
                authPromise = Promise.reject("You need to provide auth information");
            }
        }
        return authPromise
            .then(function (authConfig) {
            initTimer.mark("auth-promise-resolved");
            var authRequest;
            if (Object.prototype.toString.call(authConfig) === "[object Object]") {
                authRequest = authConfig;
            }
            else {
                throw new Error("Invalid auth object - " + JSON.stringify(authConfig));
            }
            return _connection.login(authRequest);
        })
            .then(function () {
            registerLib("connection", _connection, initTimer);
            return internalConfig;
        })
            .catch(function (e) {
            if (_connection) {
                _connection.logout();
            }
            throw e;
        });
    }
    function setupLogger() {
        var _a;
        var initTimer = timer("logger");
        _logger = new Logger$1("" + ((_a = internalConfig.connection.identity) === null || _a === void 0 ? void 0 : _a.application), undefined, internalConfig.customLogger);
        _logger.consoleLevel(internalConfig.logger.console);
        _logger.publishLevel(internalConfig.logger.publish);
        if (_logger.canPublish("debug")) {
            _logger.debug("initializing glue...");
        }
        registerLib("logger", _logger, initTimer);
        return Promise.resolve(undefined);
    }
    function setupMetrics() {
        var _a, _b, _c, _d, _e;
        var initTimer = timer("metrics");
        var config = internalConfig.metrics;
        var metricsPublishingEnabledFunc = glue42gd === null || glue42gd === void 0 ? void 0 : glue42gd.getMetricsPublishingEnabled;
        var identity = internalConfig.connection.identity;
        var canUpdateMetric = metricsPublishingEnabledFunc ? metricsPublishingEnabledFunc : function () { return true; };
        var disableAutoAppSystem = (_a = (typeof config !== "boolean" && config.disableAutoAppSystem)) !== null && _a !== void 0 ? _a : false;
        _metrics = metrics({
            connection: config ? _connection : undefined,
            logger: _logger.subLogger("metrics"),
            canUpdateMetric: canUpdateMetric,
            system: "Glue42",
            service: (_c = (_b = identity === null || identity === void 0 ? void 0 : identity.service) !== null && _b !== void 0 ? _b : glue42gd === null || glue42gd === void 0 ? void 0 : glue42gd.applicationName) !== null && _c !== void 0 ? _c : internalConfig.application,
            instance: (_e = (_d = identity === null || identity === void 0 ? void 0 : identity.instance) !== null && _d !== void 0 ? _d : identity === null || identity === void 0 ? void 0 : identity.windowId) !== null && _e !== void 0 ? _e : shortid$1(),
            disableAutoAppSystem: disableAutoAppSystem,
            pagePerformanceMetrics: typeof config !== "boolean" ? config === null || config === void 0 ? void 0 : config.pagePerformanceMetrics : undefined
        });
        registerLib("metrics", _metrics, initTimer);
        return Promise.resolve();
    }
    function setupInterop() {
        var initTimer = timer("interop");
        var agmConfig = {
            connection: _connection,
            logger: _logger.subLogger("interop"),
        };
        _interop = new Interop(agmConfig);
        Logger$1.Interop = _interop;
        registerLib(["interop", "agm"], _interop, initTimer);
        return Promise.resolve();
    }
    function setupContexts() {
        var hasActivities = (internalConfig.activities && _connection.protocolVersion === 3);
        var needsContexts = internalConfig.contexts || hasActivities;
        if (needsContexts) {
            var initTimer = timer("contexts");
            _contexts = new ContextsModule({
                connection: _connection,
                logger: _logger.subLogger("contexts"),
                trackAllContexts: typeof internalConfig.contexts === "object" ? internalConfig.contexts.trackAllContexts : false,
                reAnnounceKnownContexts: typeof internalConfig.contexts === "object" ? internalConfig.contexts.reAnnounceKnownContexts : false
            });
            registerLib("contexts", _contexts, initTimer);
            return _contexts;
        }
        else {
            var replayer = _connection.replayer;
            if (replayer) {
                replayer.drain(ContextMessageReplaySpec.name);
            }
        }
    }
    function setupBus() {
        return __awaiter(this, void 0, void 0, function () {
            var initTimer;
            return __generator(this, function (_a) {
                if (!internalConfig.bus) {
                    return [2, Promise.resolve()];
                }
                initTimer = timer("bus");
                _bus = new MessageBus(_connection, _logger.subLogger("bus"));
                registerLib("bus", _bus, initTimer);
                return [2, Promise.resolve()];
            });
        });
    }
    function setupExternalLibs(externalLibs) {
        try {
            externalLibs.forEach(function (lib) {
                setupExternalLib(lib.name, lib.create);
            });
            return Promise.resolve();
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    function setupExternalLib(name, createCallback) {
        var initTimer = timer(name);
        var lib = createCallback(libs);
        if (lib) {
            registerLib(name, lib, initTimer);
        }
    }
    function waitForLibs() {
        var libsReadyPromises = Object.keys(libs).map(function (key) {
            var lib = libs[key];
            return lib.ready ?
                lib.ready() : Promise.resolve();
        });
        return Promise.all(libsReadyPromises);
    }
    function constructGlueObject() {
        var feedbackFunc = function (feedbackInfo) {
            if (!_interop) {
                return;
            }
            _interop.invoke("T42.ACS.Feedback", feedbackInfo, "best");
        };
        var info = {
            coreVersion: version$2,
            version: internalConfig.version
        };
        glueInitTimer.stop();
        var glue = {
            feedback: feedbackFunc,
            info: info,
            logger: _logger,
            interop: _interop,
            agm: _interop,
            connection: _connection,
            metrics: _metrics,
            contexts: _contexts,
            bus: _bus,
            version: internalConfig.version,
            userConfig: userConfig,
            done: function () {
                _logger === null || _logger === void 0 ? void 0 : _logger.info("done called by user...");
                return _connection.logout();
            }
        };
        glue.performance = {
            get glueVer() {
                return internalConfig.version;
            },
            get glueConfig() {
                return JSON.stringify(userConfig);
            },
            get browser() {
                return window.performance.timing.toJSON();
            },
            get memory() {
                return window.performance.memory;
            },
            get initTimes() {
                var all = getAllTimers();
                return Object.keys(all).map(function (key) {
                    var t = all[key];
                    return {
                        name: key,
                        duration: t.endTime - t.startTime,
                        marks: t.marks,
                        startTime: t.startTime,
                        endTime: t.endTime
                    };
                });
            }
        };
        Object.keys(libs).forEach(function (key) {
            var lib = libs[key];
            glue[key] = lib;
        });
        glue.config = {};
        Object.keys(internalConfig).forEach(function (k) {
            glue.config[k] = internalConfig[k];
        });
        if (ext && ext.extOptions) {
            Object.keys(ext.extOptions).forEach(function (k) {
                glue.config[k] = ext === null || ext === void 0 ? void 0 : ext.extOptions[k];
            });
        }
        if (ext === null || ext === void 0 ? void 0 : ext.enrichGlue) {
            ext.enrichGlue(glue);
        }
        if (glue42gd && glue42gd.updatePerfData) {
            glue42gd.updatePerfData(glue.performance);
        }
        if (glue.agm) {
            var deprecatedDecorator = function (fn, wrong, proper) {
                return function () {
                    glue.logger.warn("glue.js - 'glue.agm." + wrong + "' method is deprecated, use 'glue.interop." + proper + "' instead.");
                    return fn.apply(glue.agm, arguments);
                };
            };
            var agmAny = glue.agm;
            agmAny.method_added = deprecatedDecorator(glue.agm.methodAdded, "method_added", "methodAdded");
            agmAny.method_removed = deprecatedDecorator(glue.agm.methodRemoved, "method_removed", "methodRemoved");
            agmAny.server_added = deprecatedDecorator(glue.agm.serverAdded, "server_added", "serverAdded");
            agmAny.server_method_aded = deprecatedDecorator(glue.agm.serverMethodAdded, "server_method_aded", "serverMethodAdded");
            agmAny.server_method_removed = deprecatedDecorator(glue.agm.serverMethodRemoved, "server_method_removed", "serverMethodRemoved");
        }
        return glue;
    }
    function registerInstanceIfNeeded() {
        return __awaiter(this, void 0, void 0, function () {
            var RegisterInstanceMethodName, isMethodAvailable, error_1, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        RegisterInstanceMethodName = "T42.ACS.RegisterInstance";
                        if (!(Utils$1.isNode() && typeof process.env._GD_STARTING_CONTEXT_ === "undefined" && typeof (userConfig === null || userConfig === void 0 ? void 0 : userConfig.application) !== "undefined")) return [3, 4];
                        isMethodAvailable = _interop.methods({ name: RegisterInstanceMethodName }).length > 0;
                        if (!isMethodAvailable) return [3, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, _interop.invoke(RegisterInstanceMethodName, { appName: userConfig === null || userConfig === void 0 ? void 0 : userConfig.application, pid: process.pid })];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        error_1 = _a.sent();
                        typedError = error_1;
                        _logger.error("Cannot register as an instance: " + JSON.stringify(typedError.message));
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    }
    return preloadPromise
        .then(setupLogger)
        .then(setupConnection)
        .then(function () { return Promise.all([setupMetrics(), setupInterop(), setupContexts(), setupBus()]); })
        .then(function () { return _interop.readyPromise; })
        .then(function () { return registerInstanceIfNeeded(); })
        .then(function () {
        return setupExternalLibs(internalConfig.libs || []);
    })
        .then(waitForLibs)
        .then(constructGlueObject)
        .catch(function (err) {
        return Promise.reject({
            err: err,
            libs: libs
        });
    });
};
if (typeof window !== "undefined") {
    window.GlueCore = GlueCore;
}
GlueCore.version = version$2;
GlueCore.default = GlueCore;

class ActivityEntity {
    constructor(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    _update(other) {
        if (other._id !== this._id) {
            throw Error("Can not update from entity with different id.");
        }
        this._updateCore(other);
    }
    _updateCore(other) {
        return;
    }
    _beforeDelete(other) {
        return;
    }
}

function isNumber(arg) {
    return typeof arg === "number";
}
function isString(arg) {
    return typeof arg === "string";
}
function isObject(arg) {
    return typeof arg === "object" && arg !== null;
}
function isArray(arg) {
    if (Array.isArray) {
        return Array.isArray(arg);
    }
    return toString.call(arg) === "[object Array]";
}
function isUndefined(arg) {
    return typeof arg === "undefined";
}
function isUndefinedOrNull(arg) {
    return arg === null || typeof arg === "undefined";
}
function isNullOrWhiteSpace(str) {
    return (typeof str !== "string" || !str || str.length === 0 || /^\s*$/.test(str));
}
function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === "[object Boolean]";
}
function isFunction(arg) {
    return !!(arg && arg.constructor && arg.call && arg.apply);
}
function some(array, predicate) {
    for (let index = 0; index < array.length; index++) {
        if (predicate(array[index], index)) {
            return true;
        }
    }
    return false;
}
function ifNotUndefined(what, doWithIt) {
    if (typeof what !== "undefined") {
        doWithIt(what);
    }
}
function promisify$1(promise, successCallback, errorCallback) {
    if (typeof successCallback !== "function" && typeof errorCallback !== "function") {
        return promise;
    }
    if (typeof successCallback !== "function") {
        successCallback = () => { return; };
    }
    else if (typeof errorCallback !== "function") {
        errorCallback = () => { return; };
    }
    promise.then(successCallback, errorCallback);
}

class ActivityType extends ActivityEntity {
    constructor(name, ownerWindow, helperWindows, description) {
        super(name);
        this._name = name;
        this._description = description;
        this._ownerWindow = ownerWindow;
        this._helperWindows = helperWindows || [];
    }
    get name() {
        return this._name;
    }
    get description() {
        return this._description;
    }
    get helperWindows() {
        return this._helperWindows.map((hw) => this.covertToWindowDef(hw));
    }
    get ownerWindow() {
        return this.covertToWindowDef(this._ownerWindow);
    }
    initiate(context, callback, configuration) {
        return this._manager.initiate(this._name, context, callback, configuration);
    }
    _updateCore(other) {
        super._updateCore(other);
        ifNotUndefined(other._description, (x) => this._description = x);
        ifNotUndefined(other._ownerWindow, (x) => this._ownerWindow = x);
        ifNotUndefined(other._helperWindows, (x) => this._helperWindows = x);
    }
    covertToWindowDef(windowType) {
        var _a, _b;
        return {
            type: (_a = windowType === null || windowType === void 0 ? void 0 : windowType.id) === null || _a === void 0 ? void 0 : _a.type,
            name: (_b = windowType === null || windowType === void 0 ? void 0 : windowType.id) === null || _b === void 0 ? void 0 : _b.name
        };
    }
}

class WindowType extends ActivityEntity {
    constructor(name, appByWindowTypeGetter) {
        super(name);
        this._name = name;
        this._appByWindowTypeGetter = appByWindowTypeGetter;
    }
    get name() {
        return this._name;
    }
    get config() {
        return this._appByWindowTypeGetter(this._name);
    }
    get windows() {
        return this._manager.getWindows({ type: this._name });
    }
    create(activity, configuration) {
        const definition = Object.assign({ type: this.name, name: this.name, isIndependent: false }, configuration);
        return this._manager.createWindow(activity, definition);
    }
}

class EntityEvent {
    constructor(entitiy, context) {
        this.entity = entitiy;
        this.context = context;
    }
}
class EntityEventContext {
    constructor(eventType) {
        this.type = eventType;
    }
}
class ActivityStatusChangeEventContext extends EntityEventContext {
    constructor(newStatus, oldStatus) {
        super(EntityEventType.StatusChange);
        this.newStatus = newStatus;
        this.oldStatus = oldStatus;
    }
}
class ActivityContextChangedEventContext extends EntityEventContext {
    constructor(context, updated, removed) {
        super(EntityEventType.ActivityContextChange);
        this.context = typeof context === "string" ? JSON.parse(context) : context;
        this.updated = updated;
        this.removed = removed;
    }
}
class EntityEventType {
}
EntityEventType.Added = "added";
EntityEventType.Removed = "removed";
EntityEventType.Updated = "updated";
EntityEventType.Closed = "closed";
EntityEventType.StatusChange = "statusChange";
EntityEventType.ActivityContextChange = "activityContextUpdate";
EntityEventType.ActivityWindowEvent = "activityWindowEvent";
EntityEventType.ActivityWindowJoinedActivity = "joined";
EntityEventType.ActivityWindowLeftActivity = "left";
class ActivityState {
}
ActivityState.Created = "created";
ActivityState.Started = "started";
ActivityState.Destroyed = "destroyed";

class ActivityAGM {
    constructor(activity) {
        this._activity = activity;
    }
    register(definition, handler) {
        this._ensureHasAgm();
        ActivityAGM.AGM.register(definition, handler);
    }
    servers() {
        this._ensureHasAgm();
        if (isUndefinedOrNull(this._activity)) {
            return [];
        }
        return this._activity.windows.map((w) => {
            return w.instance;
        });
    }
    methods() {
        this._ensureHasAgm();
        if (isUndefinedOrNull(this._activity)) {
            return [];
        }
        const windows = this._activity.windows;
        const methodNames = [];
        const methods = [];
        windows.forEach((window) => {
            const windowMethods = this.methodsForWindow(window);
            windowMethods.forEach((currentWindowMethod) => {
                if (methodNames.indexOf(currentWindowMethod.name) === -1) {
                    methodNames.push(currentWindowMethod.name);
                    methods.push(currentWindowMethod);
                }
            });
        });
        return methods;
    }
    methodsForWindow(window) {
        this._ensureHasAgm();
        if (!window.instance) {
            return [];
        }
        return ActivityAGM.AGM.methodsForInstance(window.instance);
    }
    invoke(methodName, arg, target, options, success, error) {
        this._ensureHasAgm();
        const activityServers = this.servers();
        if (isUndefinedOrNull(target)) {
            target = "activity.all";
        }
        if (isString(target)) {
            if (target === "activity.all") ;
            else if (target === "activity.best") {
                const potentialTargets = activityServers.filter((server) => {
                    const methods = ActivityAGM.AGM.methodsForInstance(server);
                    return methods.filter((m) => {
                        return m.name === methodName;
                    }).length > 0;
                });
                if (potentialTargets.length > 0) {
                    [potentialTargets[0]];
                }
            }
            else if (target === "all" || target === "best") {
                return promisify$1(ActivityAGM.AGM.invoke(methodName, arg, target, options), success, error);
            }
            else {
                throw new Error("Invalid invoke target " + target);
            }
        }
        else if (isArray(target)) {
            if (target.length >= 0) {
                const firstElem = target[0];
                if (this._isInstance(firstElem)) {
                    target.map((instance) => instance);
                }
                else if (this._isActivityWindow(firstElem)) {
                    target.map((win) => win.instance);
                }
                else {
                    throw new Error("Unknown target object");
                }
            }
        }
        else {
            if (this._isInstance(target)) ;
            else if (this._isActivityWindow(target)) {
                [target.instance];
            }
            else {
                throw new Error("Unknown target object");
            }
        }
        throw new Error("Not implemented");
    }
    unregister(definition) {
        this._ensureHasAgm();
        return ActivityAGM.AGM.unregister(definition);
    }
    createStream(methodDefinition, subscriptionAddedHandler, subscriptionRemovedHandler) {
        this._ensureHasAgm();
        ActivityAGM.AGM.createStream(methodDefinition, {
            subscriptionAddedHandler,
            subscriptionRemovedHandler,
            subscriptionRequestHandler: undefined
        });
    }
    subscribe(methodDefinition, parameters, target) {
        this._ensureHasAgm();
        return ActivityAGM.AGM.subscribe(methodDefinition, parameters);
    }
    _ensureHasAgm() {
        if (isUndefinedOrNull(ActivityAGM.AGM)) {
            throw new Error("Agm should be configured to be used in activity");
        }
    }
    _isInstance(obj) {
        return obj.application !== undefined;
    }
    _isActivityWindow(obj) {
        return obj.instance !== undefined;
    }
}

class AttachedActivityDescriptor {
    constructor(manager, ownerActivityId, state) {
        this._manager = manager;
        this._ownerActivityId = ownerActivityId;
        this._state = state;
    }
    get ownerId() {
        return this._state.ownerId;
    }
    get windowIds() {
        return this._state.windowIds;
    }
    get frameColor() {
        return this._state.frameColor;
    }
    get context() {
        return this._state.context;
    }
    get tag() {
        return this._state.tag;
    }
    detach(descriptor) {
        descriptor = descriptor || {};
        const merged = {};
        Object.keys(this._state).forEach((prop) => {
            merged[prop] = this._state[prop];
        });
        merged.context = descriptor.context || merged.context;
        merged.frameColor = descriptor.frameColor || merged.frameColor;
        return this._manager.detachActivities(this._ownerActivityId, merged);
    }
}

const nextTick = (cb) => {
    setTimeout(cb, 0);
};
function nodeify(promise, callback) {
    if (!isFunction(callback)) {
        return promise;
    }
    promise.then((resp) => {
        nextTick(() => {
            callback(null, resp);
        });
    }, (err) => {
        nextTick(() => {
            callback(err, null);
        });
    });
}

class Activity extends ActivityEntity {
    constructor(id, actType, status, context, ownerId) {
        super(id);
        this._id = id;
        this._actType = actType;
        this._status = status;
        this._context = context;
        this._ownerId = ownerId;
        this._agm = new ActivityAGM(this);
    }
    get type() {
        if (this._manager) {
            return this._manager.getActivityType(this._actType);
        }
        return undefined;
    }
    get context() {
        return this._context;
    }
    get status() {
        return this._status;
    }
    get owner() {
        if (!this._ownerId) {
            return null;
        }
        return this._manager.getWindows({ id: this._ownerId })[0];
    }
    get windows() {
        return this._manager.getWindows({ activityId: this._id });
    }
    get agm() {
        return this._agm;
    }
    addWindow(window, callback) {
        return this._manager.addWindowToActivity(this, window, callback);
    }
    createWindow(windowType, callback) {
        return this._manager.createWindow(this, windowType, callback);
    }
    createStackedWindows(windowTypes, timeout, callback) {
        return this._manager.createStackedWindows(this, windowTypes, timeout, callback);
    }
    leave(window, callback) {
        return this._manager.leaveWindowFromActivity(this, window, callback);
    }
    getWindowsByType(windowType) {
        const filter = { activityId: this._id, type: windowType };
        return this._manager.getWindows(filter);
    }
    setContext(context, callback) {
        return this._manager.setActivityContext(this, context, callback);
    }
    updateContext(context, callback) {
        return this._manager.updateActivityContext(this, context, callback);
    }
    onStatusChange(handler) {
        return this._manager.subscribeActivityEvents((a, ns, os) => {
            if (a.id === this.id) {
                handler(a, ns, os);
            }
        });
    }
    onWindowEvent(handler) {
        return this._manager.subscribeWindowEvents((a, w, e) => {
            if (a.id === this.id) {
                handler(a, w, e);
            }
        });
    }
    onContextChanged(handler) {
        this._manager.subscribeActivityContextChanged((act, context, updated, removed) => {
            if (act.id === this.id) {
                handler(context, updated, removed, act);
            }
        });
        try {
            handler(this.context, this.context, [], this);
        }
        catch (e) {
            return;
        }
    }
    stop() {
        this._manager.stopActivity(this);
    }
    clone(options) {
        return this._manager.clone(this, options);
    }
    attach(activity, tag) {
        let activityId;
        if (typeof activity === "string") {
            activityId = activity;
        }
        else {
            activityId = activity.id;
        }
        return this._manager.attachActivities(activityId, this.id, tag);
    }
    onActivityAttached(callback) {
        this._manager.subscribeActivitiesAttached((newActId, oldActId, descriptor) => {
            if (newActId !== this._id) {
                return;
            }
            callback(descriptor);
        });
    }
    onDetached(callback) {
        this._manager.subscribeActivitiesDetached((newAct, originalActivity, state) => {
            if (originalActivity.id !== this._id) {
                return;
            }
            callback(newAct, state);
        });
    }
    _updateCore(other) {
        super._updateCore(other);
        ifNotUndefined(other._actType, (x) => this._actType = x);
        ifNotUndefined(other._context, (x) => this._context = x);
        ifNotUndefined(other._ownerId, (x) => this._ownerId = x);
        if (other._status && (!this._status || (this._status.state !== other._status.state))) {
            this._status = other._status;
        }
    }
    _updateDescriptors(allStates) {
        this._attached = allStates.map((s) => {
            return new AttachedActivityDescriptor(this._manager, this._id, s);
        });
    }
    get attached() {
        return this._attached;
    }
    setFrameColor(color, callback) {
        const promise = new Promise((resolve, reject) => {
            let callbacksToWait = this.windows.length;
            if (callbacksToWait === 0) {
                resolve(this);
            }
            this.windows.forEach((w) => {
                w.underlyingWindow.setFrameColor(color, () => {
                    callbacksToWait--;
                    if (callbacksToWait <= 0) {
                        resolve(this);
                    }
                });
            });
            setTimeout(() => {
                if (callbacksToWait > 0) {
                    reject(this.id + " - timed out waiting for setFrameColor with" + color);
                }
            }, 5000);
        });
        return nodeify(promise, callback);
    }
    getFrameColor() {
        if (!this.windows || this.windows.length === 0) {
            return "";
        }
        return this.windows[0].underlyingWindow.frameColor;
    }
}

class LogLevel {
}
LogLevel.Trace = "trace";
LogLevel.Debug = "debug";
LogLevel.Info = "info";
LogLevel.Warn = "warn";
LogLevel.Error = "error";
class Logger {
    constructor(name) {
        this._name = name;
        if (!isUndefinedOrNull(Logger.GlueLogger)) {
            this._glueLogger = Logger.GlueLogger.subLogger(name);
        }
    }
    static GetNamed(name) {
        return new Logger(name);
    }
    static Get(owner) {
        return new Logger(Logger.GetTypeName(owner));
    }
    trace(message) {
        if (!isUndefinedOrNull(this._glueLogger)) {
            this._glueLogger.trace(message);
        }
        else {
            if (Logger.Level === LogLevel.Trace) {
                console.info(this._getMessage(message, LogLevel.Trace));
            }
        }
    }
    debug(message) {
        if (!isUndefinedOrNull(this._glueLogger)) {
            this._glueLogger.debug(message);
        }
        else {
            if (Logger.Level === LogLevel.Debug ||
                Logger.Level === LogLevel.Trace) {
                console.info(this._getMessage(message, LogLevel.Debug));
            }
        }
    }
    info(message) {
        if (!isUndefinedOrNull(this._glueLogger)) {
            this._glueLogger.info(message);
        }
        else {
            if (Logger.Level === LogLevel.Debug ||
                Logger.Level === LogLevel.Trace ||
                Logger.Level === LogLevel.Info) {
                console.info(this._getMessage(message, LogLevel.Info));
            }
        }
    }
    warn(message) {
        if (!isUndefinedOrNull(this._glueLogger)) {
            this._glueLogger.warn(message);
        }
        else {
            if (Logger.Level === LogLevel.Debug ||
                Logger.Level === LogLevel.Trace ||
                Logger.Level === LogLevel.Info ||
                Logger.Level === LogLevel.Warn) {
                console.info(this._getMessage(message, LogLevel.Info));
            }
        }
    }
    error(message) {
        if (!isUndefinedOrNull(this._glueLogger)) {
            this._glueLogger.error(message);
        }
        else {
            console.error(this._getMessage(message, LogLevel.Error));
            console.trace();
        }
    }
    _getMessage(message, level) {
        return "[" + level + "] " + this._name + " - " + message;
    }
    static GetTypeName(object) {
        const funcNameRegex = /function (.{1,})\(/;
        const results = (funcNameRegex).exec(object.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }
}
Logger.Level = LogLevel.Info;

class ActivityWindow extends ActivityEntity {
    constructor(id, name, type, activityId, instance, isIndependent, windowGetter, hcWindowId) {
        super(id);
        this._logger = Logger.Get("window");
        this._type = type;
        this._activityId = activityId;
        this._name = name;
        this._instance = instance;
        this._isIndependent = isIndependent;
        this._windowGetter = windowGetter;
        this._hcWindowId = hcWindowId;
    }
    getBounds() {
        return this._manager.getWindowBounds(this.id);
    }
    get name() {
        return this._name;
    }
    get isIndependent() {
        return this._isIndependent;
    }
    get type() {
        if (this._manager) {
            return this._manager.getWindowType(this._type);
        }
        return undefined;
    }
    get activity() {
        if (isUndefined(this._activityId)) {
            return undefined;
        }
        return this._manager.getActivityById(this._activityId);
    }
    get isOwner() {
        const act = this.activity;
        if (isUndefined(act)) {
            return false;
        }
        return act.owner.id === this.id;
    }
    setVisible(isVisible, callback) {
        return this._manager.setWindowVisibility(this.id, isVisible);
    }
    activate(focus) {
        return this._manager.activateWindow(this.id, focus);
    }
    setBounds(bounds, callback) {
        return this._manager.setWindowBounds(this.id, bounds, callback);
    }
    close() {
        return this._manager.closeWindow(this.id);
    }
    get instance() {
        return this._instance;
    }
    get underlyingWindow() {
        const window = this._windowGetter();
        if (!window) {
            return {
                id: this._hcWindowId
            };
        }
        return window;
    }
    onActivityJoined(callback) {
        this._subscribeForActivityWindowEvent(EntityEventType.ActivityWindowJoinedActivity, callback);
    }
    onActivityRemoved(callback) {
        this._subscribeForActivityWindowEvent(EntityEventType.ActivityWindowLeftActivity, callback);
    }
    _updateCore(other) {
        ifNotUndefined(other._activityId, (x) => this._activityId = x);
        ifNotUndefined(other._isIndependent, (x) => this._isIndependent = x);
        ifNotUndefined(other._hcWindowId, (x) => this._hcWindowId = x);
        ifNotUndefined(other._type, (x) => this._type = x);
        ifNotUndefined(other._name, (x) => this._name = x);
        if (!isUndefinedOrNull(other._instance)) {
            this._instance = other._instance;
        }
    }
    _subscribeForActivityWindowEvent(eventName, callback) {
        this._manager.subscribeWindowEvents((activity, window, event) => {
            if (window.id !== this.id) {
                return;
            }
            if (event === eventName) {
                callback(activity);
            }
        });
    }
    _beforeDelete(other) {
        this._hcWindowId = other._hcWindowId;
    }
}

class ActivityStatus {
    constructor(state, message, time) {
        this.state = state;
        this.message = message;
        this.time = time;
    }
    getState() {
        return this.state;
    }
    getMessage() {
        return this.message;
    }
    getTime() {
        return this.time;
    }
}

const gwMmessageError = "error";
const gwMessageAddActivityTypes = "add-types";
const gwMmessageActivityTypesAdded = "types-added";
const gwMessageRemoveActivityTypes = "remove-types";
const gwMessageActivityTypesRemoved = "types-removed";
const gwMessageActivityCreated = "created";
const gwMessageActivityDestroyed = "destroyed";
const gwMessageActivityInitiated = "initiated";
const gwMmessageJoinActivity = "join-activity";
const gwMessageJoinedActivity = "joined";
const gwMessageActivityJoined = "activity-joined";
const gwMessageLeaveActivity = "leave-activity";
const gwMessageActivityLeft = "left";
const gwNmessageMergeActivities = "merge";
const gwMessageSplitActivities = "split";
const gwMessageOwnerChanged = "owner-changed";
const gwMessageAddPeerFactories = "add-peer-factories";
const gwMessagePeerFactoriesAdded = "peer-factories-added";
const gwMessageRemovePeerFactories = "remove-peer-factories";
const gwMessagePeerFactoriesRemoved = "peer-factories-removed";
const gwMessageCreateActivity = "create";
const gwMessageCreatePeer = "create-peer";
const gwMessagePeerRequested = "peer-requested";
const gwMessageReady = "ready";
const gwMessagePeerCreated = "peer-created";
const gwMessageDestroyActivity = "destroy";
const gwMessageDisposePeer = "dispose-peer";
const gwMessageDestroyPeer = "destroy-peer";
class GW3Bridge {
    constructor(config) {
        this._activityChangeCallbacks = [];
        this._activityTypeStatusChangeCallbacks = [];
        this._activityWindowChangeCallbacks = [];
        this._windowTypeStatusChangeCallbacks = [];
        this._peerIdAndFactoryIdToPeerType = {};
        this._peerFactoriesRegisteredByUs = {};
        this._gw3Subscriptions = [];
        this._contextSubscriptions = {};
        this._activityTypesInitiatedFromMe = {};
        this._config = config;
        this._connection = config.connection;
        this._logger = config.logger;
        this._contexts = config.contexts;
        this._windows = config.windows;
        this._sessionJoinedPromise = new Promise((resolve) => {
            this._sessionJoinedPromiseResolve = resolve;
        });
        this._activityJoinedPromise = new Promise((resolve) => {
            this._activityJoinedPromiseResolve = resolve;
        });
        if (!this._config.activityId) {
            this._activityJoinedPromiseResolve({});
        }
        this._gw3Session = this._connection.domain("activity", ["joined", "initiated", "peer-created", "token"]);
        if (typeof window !== "undefined") {
            const glue42gd = window.glue42gd;
            if (glue42gd && glue42gd.activityInfo) {
                if (typeof glue42gd.addRefreshHandler === "function") {
                    glue42gd.addRefreshHandler((success, error) => {
                        this._gw3Session
                            .send({
                            type: "reload"
                        })
                            .then((msg) => {
                            if (!msg.token) {
                                error("Expected gateway token for refreshing.");
                                return;
                            }
                            try {
                                glue42gd.setGWToken(msg.token);
                            }
                            catch (e) {
                                error(e.message || e);
                                return;
                            }
                            success();
                        }, error);
                    });
                }
                if (glue42gd && typeof glue42gd.addWillNavigateHandler === "function") {
                    glue42gd.addWillNavigateHandler((success, error) => {
                        this._gw3Session
                            .send({
                            type: "reload"
                        })
                            .then((msg) => {
                            if (!msg.token) {
                                error("Expected gateway token for refreshing.");
                                return;
                            }
                            try {
                                glue42gd.setGWToken(msg.token);
                            }
                            catch (e) {
                                error(e.message || e);
                                return;
                            }
                            success();
                        }, error);
                    });
                }
            }
        }
    }
    static activityTypeGwMessageEntityToActivityType(entity, description) {
        const nameToWindowType = (windowName) => new WindowType(windowName, undefined);
        return new ActivityType(entity.name, entity.owner_type && nameToWindowType(entity.owner_type), entity.helper_types && entity.helper_types.map(nameToWindowType), description);
    }
    static peerFactoryGwMessageEntityToWindowType(entity) {
        return new WindowType(entity.peer_type, (_) => undefined);
    }
    static activityGwMessageToActivity(msg, status) {
        const ownerId = msg.owner !== undefined ? msg.owner.peer_id : msg.owner_id;
        return new Activity(msg.activity_id, msg.activity_type, status, msg.context_snapshot, ownerId);
    }
    static activityToActivityStatusChangeEvent(act) {
        return new EntityEvent(act, new ActivityStatusChangeEventContext(act.status, undefined));
    }
    get bridgeType() {
        return "GW3";
    }
    init() {
        this.forwardActivityTypeMessagesToStatusEventHandlers();
        this.subscribe(gwMessageActivityCreated, this.handleActivityCreatedMessage);
        this.subscribe(gwMessageActivityDestroyed, this.handleActivityDestroyedMessage);
        this.forwardActivityMessagesToStatusEventHandlers();
        this.forwardActivityCreatedAndJoinedActivityToActivityWindowEventHandlers();
        this.forwardPeerFactoryMessagesToStatusEventHandlers();
        this.forwardPeerFactoryMessagesToPeerFactoryRequests();
        this.subscribe(gwMessagePeerFactoriesAdded, this.handlePeerFactoriesAdded);
        this.subscribe(gwMessagePeerFactoriesRemoved, this.handlePeerFactoriesRemoved);
        this.forwardActivityWindowMessagesToEventHandlers();
        this.subscribe(gwMessageDisposePeer, () => {
            if (this._config.disposeRequestHandling === "dispose") {
                this.dispose();
                return;
            }
            if (this._config.disposeRequestHandling === "exit") {
                if (this._windows && typeof this._windows.my() !== "undefined") {
                    this._windows.my().close();
                    return;
                }
                if (typeof window !== "undefined" && typeof window.close === "function") {
                    window.close();
                    return;
                }
                if (typeof process !== "undefined" && typeof process.exit === "function") {
                    process.exit();
                    return;
                }
            }
        });
        this._gw3Session.onJoined(() => {
            if (this._config.mode === "trackMyOnly" ||
                this._config.mode === "trackMyTypeAndInitiatedFromMe") {
                this._sessionJoinedPromiseResolve(this);
            }
            else {
                this._gw3Session
                    .send({
                    type: "subscribe",
                    activity_types: (this._config.mode === "trackAll" ? [] :
                        this._config.mode === "trackTypes" ? this._config.typesToTrack : [])
                })
                    .then(() => {
                    this._sessionJoinedPromiseResolve(this);
                });
            }
        });
        this._gw3Session.join();
    }
    dispose() {
        this._gw3Subscriptions.forEach((sub) => sub && this._connection.off(sub));
        this._gw3Subscriptions.length = 0;
    }
    ready() {
        return Promise.all([this._sessionJoinedPromise, this._activityJoinedPromise]);
    }
    initReady() {
        return this._sessionJoinedPromise;
    }
    onActivityTypeStatusChange(callback) {
        this._activityTypeStatusChangeCallbacks.push(callback);
    }
    registerActivityType(activityTypeName, ownerWindow, helperWindows, config, description) {
        const entity = {};
        entity.name = activityTypeName;
        const toActivityPeerConfig = (windowDefinition) => ({ type: windowDefinition.type, name: windowDefinition.name, configuration: windowDefinition });
        entity.owner_type = toActivityPeerConfig(ownerWindow);
        entity.helper_types = helperWindows.map(toActivityPeerConfig);
        return this._gw3Session
            .send({
            type: gwMessageAddActivityTypes,
            types: [entity]
        })
            .then(() => {
            const activityType = GW3Bridge.activityTypeGwMessageEntityToActivityType(entity, description);
            this.invokeCallbacks(this._activityTypeStatusChangeCallbacks, new EntityEvent(activityType, new EntityEventContext(EntityEventType.Added)), gwMessageAddActivityTypes);
            return activityType;
        });
    }
    unregisterActivityType(activityTypeName) {
        return this._gw3Session
            .send({
            type: gwMessageRemoveActivityTypes,
            types: [activityTypeName]
        })
            .then(() => {
            const activityType = new ActivityType(activityTypeName, undefined, undefined, undefined);
            this.invokeCallbacks(this._activityTypeStatusChangeCallbacks, new EntityEvent(activityType, new EntityEventContext(EntityEventType.Removed)), gwMessageAddActivityTypes);
        });
    }
    onWindowTypeStatusChange(callback) {
        this._windowTypeStatusChangeCallbacks.push(callback);
    }
    registerWindowFactory(windowType, factory, parameters) {
        if (this._peerFactoriesRegisteredByUs[windowType]) {
            return Promise.reject(new Error(`Factory for windowType ${windowType} already registered.`));
        }
        this._peerFactoriesRegisteredByUs[windowType] = factory;
        const entity = {
            id: windowType,
            peer_type: windowType,
            configuration: parameters
        };
        return this._gw3Session.send({
            type: gwMessageAddPeerFactories,
            factories: [entity]
        })
            .then(() => {
            this.invokeCallbacks(this._windowTypeStatusChangeCallbacks, new EntityEvent(GW3Bridge.peerFactoryGwMessageEntityToWindowType(entity), new EntityEventContext(EntityEventType.Added)), gwMessageAddPeerFactories);
        })
            .catch(() => {
            delete this._peerFactoriesRegisteredByUs[windowType];
        });
    }
    unregisterWindowFactory(windowType) {
        const factory = this._peerFactoriesRegisteredByUs[windowType];
        if (!factory) {
            return Promise.reject(new Error(`Factory for windowType ${windowType} not registered.`));
        }
        delete this._peerFactoriesRegisteredByUs[windowType];
        return this._gw3Session.send({
            type: gwMessageRemovePeerFactories,
            factory_ids: [windowType]
        }).then(() => {
            this.invokeCallbacks(this._windowTypeStatusChangeCallbacks, new EntityEvent(new WindowType(windowType, undefined), new EntityEventContext(EntityEventType.Removed)), gwMessageAddPeerFactories);
        });
    }
    onActivityStatusChange(callback) {
        this._activityChangeCallbacks.push(callback);
    }
    initiateActivity(activityType, context, configuration) {
        const initiateMsg = {
            type: gwMessageCreateActivity,
            activity_type: activityType,
            initial_context: context,
        };
        if (this.isOverrideTypeDefinition(configuration)) {
            initiateMsg.types_override = {
                owner_type: { type: configuration.owner.type, name: configuration.owner.name, configuration: configuration.owner },
                helper_types: configuration.helpers && configuration.helpers.map((wd) => ({ type: wd.type, name: wd.name, configuration: wd }))
            };
        }
        else {
            initiateMsg.configuration = configuration && configuration.map((wd) => ({ type: wd.type, name: wd.name, configuration: wd }));
        }
        return this.sendCreateAndMapResultingMessagesToPromise(initiateMsg, gwMessageActivityInitiated, (msg, requestId) => msg.request_id === requestId, gwMessageActivityCreated, (msg, requestId, initMsg) => msg.activity_id === initMsg.activity_id, gwMessageActivityDestroyed, (msg, requestId, initMsg) => msg.activity_id === initMsg.activity_id, (msg) => msg.activity_id, null).then((id) => {
            if (this._config.mode === "trackMyTypeAndInitiatedFromMe") {
                if (!this._activityTypesInitiatedFromMe[activityType]) {
                    this._activityTypesInitiatedFromMe[activityType] = true;
                    return this._gw3Session
                        .send({
                        type: "subscribe",
                        activity_types: [activityType]
                    })
                        .then(() => {
                        return id;
                    });
                }
            }
            return id;
        });
    }
    stopActivity(activity) {
        return this._gw3Session.send({
            type: gwMessageDestroyActivity,
            activity_id: activity.id,
            reason_uri: "com.tick42.glue.activity.constants.destroyReason.general",
            reason: "Destroying activity"
        }).then((_) => true);
    }
    updateActivityContext(activity, context, fullReplace, removedKeys) {
        if (fullReplace) {
            return this._contexts.set(activity.id, context);
        }
        else {
            removedKeys = removedKeys || [];
            for (const x of removedKeys) {
                context[x] = null;
            }
            return this._contexts.update(activity.id, context);
        }
    }
    announceWindow(windowType, activityWindowId) {
        throw new Error("Invalid operation 'announceWindow' for GW3 protocol");
    }
    registerWindow(type, name, independent) {
        let shouldSendReady = typeof this._connection.gatewayToken !== "undefined";
        const peerId = this._connection.peerId;
        if (typeof window !== "undefined") {
            const glue42gd = window.glue42gd;
            if (glue42gd) {
                shouldSendReady = typeof glue42gd.activityInfo !== "undefined";
            }
        }
        if (shouldSendReady) {
            this._gw3Session.send({
                type: gwMessageReady,
            });
        }
        this.invokeCallbacks(this._activityWindowChangeCallbacks, new EntityEvent(new ActivityWindow(peerId, name, type, undefined, this.getAgmInstance(peerId), independent, this.generateWindowGetter(peerId), undefined), new EntityEventContext(EntityEventType.Added)), "register window");
        return Promise.resolve(peerId);
    }
    onActivityWindowChange(callback) {
        this._activityWindowChangeCallbacks.push(callback);
    }
    createWindow(activityId, windowDefinition) {
        if (!windowDefinition.layout) {
            if (windowDefinition.left || windowDefinition.width || windowDefinition.height || windowDefinition.top) {
                windowDefinition.layout = {
                    mode: "pixels",
                    cellSize: 1,
                };
            }
        }
        const joinPeer = (id) => {
            if (!activityId) {
                return;
            }
            return this.joinActivity(activityId, id, windowDefinition.name)
                .then(() => {
                return id;
            });
        };
        return this.sendCreateAndMapResultingMessagesToPromise({
            type: gwMessageCreatePeer,
            peer_type: windowDefinition.type,
            peer_name: windowDefinition.name || windowDefinition.type,
            configuration: windowDefinition,
            activity_id: activityId,
        }, undefined, undefined, gwMessagePeerCreated, (msg, requestId) => msg.request_id === requestId, undefined, undefined, (msg) => msg.created_id, joinPeer)
            .then(joinPeer);
    }
    closeWindow(id) {
        return this._gw3Session.send({
            type: gwMessageDestroyPeer,
            destroy_peer_id: id
        }).then((_) => undefined);
    }
    getAnnouncementInfo() {
        let activityId = this._config.activityId || (this._config.announcementInfo && this._config.announcementInfo.activityId);
        let activityWindowType = (this._config.announcementInfo && this._config.announcementInfo.activityWindowType);
        let activityWindowIndependent = (this._config.announcementInfo && this._config.announcementInfo.activityWindowIndependent);
        let activityWindowName = (this._config.announcementInfo && this._config.announcementInfo.activityWindowName);
        if (typeof window !== "undefined" &&
            typeof window.location !== "undefined" &&
            window.location.search &&
            typeof URLSearchParams === "function") {
            const searchParams = new URLSearchParams(location.search.slice(1));
            activityWindowType = activityWindowType || searchParams.get("t42PeerType");
            activityWindowType = activityWindowType || searchParams.get("t42ActivityWindowType");
            if (typeof activityWindowIndependent === "undefined") {
                activityWindowIndependent = searchParams.get("t42ActivityWindowIndependent");
            }
            activityWindowName = activityWindowName || searchParams.get("t42ActivityWindowName");
            activityId = activityId || searchParams.get("t42ActivityId");
        }
        activityWindowType = activityWindowType || "unknown";
        activityWindowIndependent = activityWindowIndependent || false;
        activityWindowName = activityWindowName || this._connection.peerId;
        return {
            activityWindowId: undefined,
            activityId,
            activityWindowType,
            activityWindowIndependent,
            activityWindowName,
        };
    }
    joinActivity(activityId, windowId, name) {
        const maybeName = (name && { name }) || {};
        return this._gw3Session.send({
            type: gwMmessageJoinActivity,
            target_id: windowId,
            activity_id: activityId,
            ...maybeName
        }).then(() => {
            this.invokeCallbacks(this._activityWindowChangeCallbacks, new EntityEvent(new ActivityWindow(windowId, undefined, undefined, activityId, this.getAgmInstance(windowId), undefined, this.generateWindowGetter(windowId), undefined), new EntityEventContext(EntityEventType.ActivityWindowJoinedActivity)), "activity joined - ActivityWindow");
            this.invokeCallbacks(this._activityChangeCallbacks, new EntityEvent(new Activity(activityId, undefined, new ActivityStatus("created", undefined, undefined), undefined, undefined), new EntityEventContext(EntityEventType.Updated)), "activity joined - Activity");
        });
    }
    leaveActivity(activityId, windowId) {
        return this._gw3Session.send({
            type: gwMessageLeaveActivity,
            target_id: windowId,
            activity_id: activityId
        }).then(() => {
            this.invokeCallbacks(this._activityWindowChangeCallbacks, new EntityEvent(new ActivityWindow(windowId, undefined, undefined, null, this.getAgmInstance(windowId), undefined, this.generateWindowGetter(windowId), undefined), new EntityEventContext(EntityEventType.ActivityWindowLeftActivity)), "activity left - ActivityWindow");
            this.invokeCallbacks(this._activityChangeCallbacks, new EntityEvent(new Activity(activityId, undefined, new ActivityStatus("created", undefined, undefined), undefined, undefined), new EntityEventContext(EntityEventType.Updated)), "activity left - Activity");
        });
    }
    getActivityTypes() {
        return Promise.resolve([]);
    }
    getWindowTypes() {
        return Promise.resolve([]);
    }
    getActivities() {
        return Promise.resolve([]);
    }
    getActivityWindows() {
        return Promise.resolve([]);
    }
    createStackedWindows(id, windowDefinitions, timeout) {
        return undefined;
    }
    getWindowBounds(id) {
        return undefined;
    }
    setWindowBounds(id, bounds) {
        return undefined;
    }
    activateWindow(id, focus) {
        return undefined;
    }
    setWindowVisibility(id, visible) {
        return undefined;
    }
    cloneActivity(id, cloneOptions) {
        return undefined;
    }
    attachActivities(from, to, tag) {
        return this._gw3Session.send({
            type: gwNmessageMergeActivities,
            into: to,
            merge: from
        });
    }
    detachActivities(activityId, newActivityInfo) {
        return this._gw3Session.send({
            type: gwMessageSplitActivities,
            from: activityId,
        }).then(() => "");
    }
    onActivitiesAttached(callback) {
    }
    onActivitiesDetached(callback) {
    }
    onActivityAttachedDescriptorsRefreshed(callback) {
    }
    getAttachedDescriptors() {
        return Promise.resolve([]);
    }
    getRandomRequestId() {
        return this._connection.peerId + ":" + Math.floor(Math.random() * 1e9) + "";
    }
    forwardAddedAndRemovedMessagesToEventHandler(addedMessageType, removedMessageType, mapper, handlers) {
        const getGetEntityEvent = (isAdded) => (entity) => new EntityEvent(entity, new EntityEventContext(isAdded ?
            EntityEventType.Added :
            EntityEventType.Removed));
        let sub1;
        let sub2;
        sub1 = addedMessageType && this.forwardMessageToEventHandler(addedMessageType, (msg) => mapper(msg, true), getGetEntityEvent(true), handlers);
        sub2 = removedMessageType && this.forwardMessageToEventHandler(removedMessageType, (msg) => mapper(msg, false), getGetEntityEvent(false), handlers);
        return [sub1, sub2].filter((x) => x);
    }
    forwardMessageToEventHandler(messageType, mapper, getEntityEvent, handler) {
        return this.subscribe(messageType, (msg) => {
            mapper(msg)
                .forEach((ent) => handler.forEach((h) => h(getEntityEvent(ent, msg))));
        });
    }
    sendCreateAndMapResultingMessagesToPromise(msg, initiatedMessageType, initiatedMessageFilter, createdMessageType, createdMessageFilter, cancelledMessageType, cancelledMessageFilter, createdMessageToPromiseResolution, listenForRecreates) {
        const reqId = this.getRandomRequestId();
        let resolveCreatedPromise;
        let rejectCreatedPromise;
        const createdPromise = new Promise((resolve, reject) => {
            resolveCreatedPromise = resolve;
            rejectCreatedPromise = reject;
        });
        let initiatedMessageAck = null;
        let initiatedSubscription;
        let createdSubscription;
        let cancelledSubscription;
        let errorSubscription;
        const dropSubscriptions = () => {
            this.dropSubscription(initiatedSubscription);
            if (!listenForRecreates) {
                this.dropSubscription(createdSubscription);
            }
            this.dropSubscription(cancelledSubscription);
            this.dropSubscription(errorSubscription);
        };
        initiatedSubscription = initiatedMessageType &&
            this.subscribe(initiatedMessageType, (msg4) => {
                if (!initiatedMessageFilter(msg4, reqId)) {
                    return;
                }
                initiatedMessageAck = msg4;
                this.dropSubscription(initiatedSubscription);
            });
        let recreated = false;
        createdSubscription =
            this.subscribe(createdMessageType, (msg1) => {
                if (!createdMessageFilter(msg1, reqId, initiatedMessageAck)) {
                    return;
                }
                if (recreated) {
                    if (listenForRecreates) {
                        listenForRecreates(createdMessageToPromiseResolution(msg1));
                    }
                }
                else {
                    recreated = true;
                    resolveCreatedPromise(createdMessageToPromiseResolution(msg1));
                }
            });
        cancelledSubscription = cancelledMessageType &&
            this.subscribe(cancelledMessageType, (msg2) => {
                if (!cancelledMessageFilter(msg2, reqId, initiatedMessageAck)) {
                    return;
                }
                rejectCreatedPromise(msg2);
            });
        errorSubscription = cancelledMessageType &&
            this.subscribe(gwMmessageError, (msg3) => {
                if (msg3.request_id !== reqId) {
                    return;
                }
                rejectCreatedPromise(msg3);
            });
        msg.request_id = reqId;
        const toReturn = this._gw3Session
            .send(msg)
            .then(() => {
            return createdPromise;
        });
        toReturn.then(dropSubscriptions, dropSubscriptions);
        return toReturn;
    }
    peerFactoryIdAndOwnerIdToWindowType(factoryId, ownerId) {
        const peerType = this._peerIdAndFactoryIdToPeerType[ownerId + ":" + factoryId];
        if (!peerType) {
            return null;
        }
        else {
            return new WindowType(peerType, undefined);
        }
    }
    subscribe(messageType, handler) {
        const sub = this._connection.on(messageType, (msg) => handler.bind(this)(msg));
        this._gw3Subscriptions.push(sub);
        return sub;
    }
    dropSubscription(subscription) {
        if (subscription) {
            this._connection.off(subscription);
            delete this._gw3Subscriptions[this._gw3Subscriptions.indexOf(subscription)];
        }
    }
    invokeCallbacks(callbacks, event, description) {
        callbacks.forEach((cb) => {
            try {
                cb(event);
            }
            catch (err) {
                this._logger.error(`Error in ${description || event.context.type} callback: ` + JSON.stringify(err));
            }
        });
    }
    handleActivityCreatedMessage(msg) {
        if (!msg.context_id) {
            this._logger.error("Activity created with unknown context_id: " + msg.activity_id);
        }
        else {
            if (!this._contextSubscriptions[msg.activity_id]) {
                this.subscribeToContext(msg);
            }
        }
    }
    async subscribeToContext(msg) {
        const activityId = msg.activity_id;
        this._contextSubscriptions[activityId] =
            await this._contexts.subscribe(activityId, (data, updated, removed) => {
                const event = new EntityEvent(new Activity(activityId, undefined, undefined, data, undefined), new ActivityContextChangedEventContext(data, updated, removed));
                this.invokeCallbacks(this._activityChangeCallbacks, event, "context updated");
            });
    }
    handleActivityDestroyedMessage(msg) {
        const unsubscribeContext = this._contextSubscriptions[msg.activity_id];
        if (typeof unsubscribeContext === "function") {
            unsubscribeContext();
        }
        delete this._contextSubscriptions[msg.activity_id];
    }
    handlePeerFactoriesAdded(msg) {
        msg.factories.forEach((entity) => {
            this._peerIdAndFactoryIdToPeerType[msg.owner_id + ":" + entity.id] = entity.peer_type;
        });
    }
    handlePeerFactoriesRemoved(msg) {
        msg.factory_ids.forEach((factoryId) => {
            delete this._peerIdAndFactoryIdToPeerType[msg.owner_id + ":" + factoryId];
        });
    }
    forwardActivityTypeMessagesToStatusEventHandlers() {
        this.forwardAddedAndRemovedMessagesToEventHandler(gwMmessageActivityTypesAdded, gwMessageActivityTypesRemoved, (msg, isAdded) => isAdded
            ? msg.types.map((t) => GW3Bridge.activityTypeGwMessageEntityToActivityType(t, undefined))
            : msg.types.map((t) => new ActivityType(t.name, undefined, undefined, undefined)), this._activityTypeStatusChangeCallbacks);
    }
    forwardActivityCreatedAndJoinedActivityToActivityWindowEventHandlers() {
        for (const activityCreatedMessage of [gwMessageActivityCreated, gwMessageJoinedActivity, gwMessageOwnerChanged]) {
            this.forwardMessageToEventHandler(activityCreatedMessage, (msg) => ([msg.owner || { ...msg, type: msg.peer_type, name: msg.peer_name, peer_id: msg.owner_id }])
                .concat(msg.participants || [])
                .map((info) => new ActivityWindow(info.peer_id, info.name, info.type, msg.activity_id, this.getAgmInstance(info.peer_id), undefined, this.generateWindowGetter(info.peer_id), undefined)), (ent, msg) => new EntityEvent(ent, new EntityEventContext(EntityEventType.ActivityWindowJoinedActivity)), this._activityWindowChangeCallbacks);
        }
    }
    forwardActivityMessagesToStatusEventHandlers() {
        for (const createdMessage of [gwMessageActivityCreated, gwMessageJoinedActivity]) {
            this.forwardMessageToEventHandler(createdMessage, (msg) => [GW3Bridge.activityGwMessageToActivity(msg, new ActivityStatus("started", "", new Date()))], (ent, msg) => GW3Bridge.activityToActivityStatusChangeEvent(ent), this._activityChangeCallbacks);
        }
        this.forwardMessageToEventHandler(gwMessageActivityDestroyed, (msg) => [GW3Bridge.activityGwMessageToActivity(msg, new ActivityStatus("destroyed", msg.reason, new Date()))], (ent, msg) => GW3Bridge.activityToActivityStatusChangeEvent(ent), this._activityChangeCallbacks);
        this.forwardMessageToEventHandler(gwMessageActivityInitiated, (msg) => [GW3Bridge.activityGwMessageToActivity(msg, new ActivityStatus("created", "", new Date()))], (ent, msg) => GW3Bridge.activityToActivityStatusChangeEvent(ent), this._activityChangeCallbacks);
        this.forwardMessageToEventHandler(gwMessageOwnerChanged, (msg) => [GW3Bridge.activityGwMessageToActivity(msg, new ActivityStatus("created", "", new Date()))], (ent, msg) => GW3Bridge.activityToActivityStatusChangeEvent(ent), this._activityChangeCallbacks);
    }
    forwardPeerFactoryMessagesToStatusEventHandlers() {
        this.forwardAddedAndRemovedMessagesToEventHandler(gwMessagePeerFactoriesAdded, gwMessagePeerFactoriesRemoved, (msg, isAdded) => isAdded
            ? msg.factories.map(GW3Bridge.peerFactoryGwMessageEntityToWindowType)
            : msg.factory_ids.map((id) => this.peerFactoryIdAndOwnerIdToWindowType(id, msg.owner_id)).filter((x) => x != null), this._windowTypeStatusChangeCallbacks);
    }
    forwardPeerFactoryMessagesToPeerFactoryRequests() {
        this.subscribe(gwMessagePeerRequested, (msg) => {
            const factory = this._peerFactoriesRegisteredByUs[msg.peer_factory];
            if (!factory) {
                this._gw3Session.send({
                    type: gwMmessageError,
                    request_id: msg.request_id,
                    reason: `Unknown peer factory ${msg.peer_factory}`
                });
                return;
            }
            try {
                const configuration = msg.configuration || {};
                configuration.gateway_token = configuration.gateway_token || msg.gateway_token;
                configuration.peer_factory = configuration.peer_factory || msg.peer_factory;
                const promise = factory({
                    activityId: msg.activity && msg.activity.id,
                    activityType: msg.activity && msg.activity.type,
                    type: msg.configuration && msg.configuration.type,
                    gwToken: configuration.gateway_token,
                    configuration
                });
                if (promise && promise.then && promise.catch) {
                    promise.catch((err) => this._gw3Session.send({
                        type: gwMmessageError,
                        request_id: msg.request_id,
                        reason: err && (err.message || JSON.stringify(err))
                    }));
                }
            }
            catch (err) {
                this._gw3Session.send({
                    type: gwMmessageError,
                    request_id: msg.request_id,
                    reason: err && (err.message || JSON.stringify(err))
                });
            }
        });
    }
    forwardActivityWindowMessagesToEventHandlers() {
        for (const joinedMessage of [gwMessageActivityJoined, gwMessageJoinedActivity]) {
            this.subscribe(joinedMessage, (msg) => {
                const joinedId = (joinedMessage === gwMessageActivityJoined) ? msg.joined_id : msg.peer_id;
                const joinedType = (joinedMessage === gwMessageActivityJoined) ? msg.joined_type : msg.peer_type;
                const joinedName = (joinedMessage === gwMessageActivityJoined) ? msg.joined_name : msg.peer_name;
                const entity = new ActivityWindow(joinedId, joinedName, joinedType, msg.activity_id, this.getAgmInstance(joinedId), undefined, this.generateWindowGetter(joinedId), undefined);
                if (!this._contextSubscriptions[msg.activity_id]) {
                    this.subscribeToContext(msg).then(() => {
                        if (joinedMessage === gwMessageJoinedActivity) {
                            this._activityJoinedPromiseResolve({});
                        }
                    });
                }
                else if (joinedMessage === gwMessageJoinedActivity) {
                    this._activityJoinedPromiseResolve({});
                }
                this.invokeCallbacks(this._activityWindowChangeCallbacks, new EntityEvent(entity, new EntityEventContext(EntityEventType.ActivityWindowJoinedActivity)), joinedMessage);
            });
        }
        this.subscribe(gwMessageActivityLeft, (msg) => {
            const entity = new ActivityWindow(msg.left_id, undefined, undefined, null, this.getAgmInstance(msg.left_id), undefined, this.generateWindowGetter(msg.left_id), undefined);
            this.invokeCallbacks(this._activityWindowChangeCallbacks, new EntityEvent(entity, new EntityEventContext(EntityEventType.ActivityWindowLeftActivity)), gwMessageActivityLeft);
        });
        this.forwardAddedAndRemovedMessagesToEventHandler(gwMessagePeerCreated, undefined, (msg) => [
            new ActivityWindow(msg.created_id, undefined, undefined, undefined, undefined, undefined, this.generateWindowGetter(msg.created_id), undefined)
        ], this._activityWindowChangeCallbacks);
    }
    getAgmInstance(id) {
        return this._config.agm.servers().find((s) => s.peerId === id || s.windowId === id);
    }
    generateWindowGetter(peerId) {
        return () => {
            const server = this.getAgmInstance(peerId);
            if (!server) {
                return;
            }
            const windowId = server.windowId;
            return this._config.windows.list().filter((w) => w.id === windowId)[0];
        };
    }
    isOverrideTypeDefinition(value) {
        if (typeof value === "undefined") {
            return false;
        }
        if (value.owner) {
            return true;
        }
        return false;
    }
}

class ActivityMy {
    constructor(manager, windows) {
        this._myAttached = [];
        this._myDetached = [];
        this._myAttachedTo = [];
        this._myDetachedFrom = [];
        this._myActivityFrameColorChanged = [];
        this._myActivityJoinedCallbacks = [];
        this._myActivityRemovedCallbacks = [];
        this._myContextUpdateCallbacks = [];
        this._logger = Logger.Get(this);
        this._m = manager;
        manager.ready()
            .then((am) => {
            am.subscribeActivityContextChanged(this._subscribeMyContextChanged.bind(this));
            am.subscribeWindowEvents(this._subscribeMyWindowEvent.bind(this));
            am.subscribeActivitiesAttached(this._subscribeActivitiesAttached.bind(this));
            am.subscribeActivitiesDetached(this._subscribeActivitiesDetached.bind(this));
            if (windows) {
                windows.onWindowFrameColorChanged(this._subscribeWindowFrameColorChanged.bind(this));
            }
        });
    }
    get window() {
        if (isUndefinedOrNull(this._w)) {
            const announcedWindows = this._m.announcedWindows;
            if (announcedWindows.length > 0) {
                this._w = announcedWindows[0];
            }
        }
        return this._w;
    }
    get activity() {
        const myWin = this.window;
        if (isUndefinedOrNull(myWin)) {
            return undefined;
        }
        return myWin.activity;
    }
    createWindow(windowType) {
        return this._m.createWindow(this.activity, windowType);
    }
    createStackedWindows(windowTypes, timeout) {
        return this._m.createStackedWindows(this.activity, windowTypes, timeout);
    }
    get context() {
        const activity = this.activity;
        if (isUndefined(activity)) {
            return {};
        }
        return activity.context;
    }
    updateContext(context, callback) {
        const activity = this.activity;
        if (isUndefined(activity)) {
            return new Promise((resolve, reject) => {
                reject("Not in activity");
            });
        }
        return activity.updateContext(context, callback);
    }
    setContext(context, callback) {
        const activity = this.activity;
        if (isUndefined(activity)) {
            return new Promise((resolve, reject) => {
                reject("Not in activity");
            });
        }
        return activity.setContext(context, callback);
    }
    onActivityJoined(callback) {
        this._myActivityJoinedCallbacks.push(callback);
        const myWin = this.window;
        if (!isUndefinedOrNull(myWin) && !isUndefinedOrNull(myWin.activity)) {
            callback(myWin.activity);
        }
    }
    onActivityLeft(callback) {
        this._myActivityRemovedCallbacks.push(callback);
    }
    onContextChanged(callback) {
        this._myContextUpdateCallbacks.push(callback);
        const myWin = this.window;
        if (isUndefinedOrNull(myWin)) {
            return;
        }
        const activity = myWin.activity;
        if (isUndefinedOrNull(activity)) {
            return;
        }
        callback(activity.context, activity.context, [], activity);
    }
    clone(options, callback) {
        const act = this.activity;
        return this._m.clone(act, options, callback);
    }
    attach(activity, tag) {
        let activityId;
        if (typeof activity === "string") {
            activityId = activity;
        }
        else {
            activityId = activity.id;
        }
        return this._m.attachActivities(activityId, this.activity.id, tag);
    }
    onActivityAttached(callback) {
        this._myAttached.push(callback);
    }
    onActivityDetached(callback) {
        this._myDetached.push(callback);
    }
    onAttachedToActivity(callback) {
        this._myAttachedTo.push(callback);
    }
    onDetachedFromActivity(callback) {
        this._myDetachedFrom.push(callback);
    }
    get attached() {
        if (!this.activity) {
            return [];
        }
        return this.activity.attached;
    }
    setFrameColor(color, callback) {
        if (this.activity) {
            return this.activity.setFrameColor(color, callback);
        }
        else {
            return Promise.resolve(null);
        }
    }
    getFrameColor() {
        if (this.activity) {
            return this.activity.getFrameColor();
        }
        return "";
    }
    onFrameColorChanged(callback) {
        this._myActivityFrameColorChanged.push(callback);
    }
    _subscribeMyContextChanged(activity, context, delta, removed) {
        const myWin = this.window;
        if (isUndefinedOrNull(myWin)) {
            return;
        }
        const myActivity = myWin.activity;
        if (isUndefinedOrNull(myActivity)) {
            return;
        }
        if (activity.id !== myActivity.id) {
            return;
        }
        this._notifyMyContextChanged(activity, context, delta, removed);
    }
    _subscribeMyWindowEvent(activity, window, event) {
        if (isUndefinedOrNull(this.window)) {
            return;
        }
        if (this.window.id !== window.id) {
            return;
        }
        if (event === EntityEventType.ActivityWindowJoinedActivity) {
            this._notifyMyWindowEvent(activity, this._myActivityJoinedCallbacks);
            this._notifyMyContextChanged(activity, activity.context, null, null);
        }
        else if (event === EntityEventType.ActivityWindowLeftActivity) {
            this._notifyMyWindowEvent(activity, this._myActivityRemovedCallbacks);
        }
    }
    _notifyMyWindowEvent(activity, callbackStore) {
        callbackStore.forEach((element) => {
            try {
                element(activity, event);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _notifyMyContextChanged(activity, context, delta, removed) {
        delta = delta || {};
        removed = removed || [];
        this._myContextUpdateCallbacks.forEach((element) => {
            try {
                element(context, delta, removed, activity);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _notifyAttached(state) {
        this._myAttached.forEach((cb) => {
            try {
                cb(state);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _notifyDetached(state) {
        this._myDetached.forEach((cb) => {
            try {
                cb(state);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _notifyAttachedTo(state) {
        this._myAttachedTo.forEach((cb) => {
            try {
                cb(this.activity, state);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _notifyDetachedFrom(detached, existing, state) {
        this._myDetachedFrom.forEach((cb) => {
            try {
                cb(detached, existing, state);
            }
            catch (e) {
                this._logger.warn("error in user callback " + e);
            }
        });
    }
    _subscribeActivitiesAttached(newAct, state) {
        const myWin = this.window;
        if (isUndefinedOrNull(myWin)) {
            return;
        }
        const myActivity = myWin.activity;
        if (isUndefinedOrNull(myActivity)) {
            return;
        }
        if (newAct.id !== myActivity.id) {
            return;
        }
        if (state.windowIds.indexOf(myWin.id) >= 0) {
            this._notifyAttachedTo(state);
            return;
        }
        this._notifyAttached(state);
    }
    _subscribeActivitiesDetached(newAct, oldAct, state) {
        const myWin = this.window;
        if (isUndefinedOrNull(myWin)) {
            return;
        }
        const myActivity = myWin.activity;
        if (isUndefinedOrNull(myActivity)) {
            return;
        }
        if (oldAct.id === myActivity.id) {
            this._notifyDetached(state);
        }
        if (newAct.id === myActivity.id) {
            this._notifyDetachedFrom(newAct, oldAct, state);
        }
    }
    _subscribeWindowFrameColorChanged(window) {
        const act = this.activity;
        if (!act) {
            return;
        }
        if (!act.owner) {
            return;
        }
        if (act.owner.underlyingWindow.id === window.id) {
            this._myActivityFrameColorChanged.forEach((callback) => {
                callback(window.frameColor);
            });
        }
    }
}

class ReadyMarker {
    constructor(name, signalsToWait) {
        this._logger = Logger.Get("ReadyMarker [" + name + "]");
        this._logger.debug("Initializing ready marker for '" + name + "' with " + signalsToWait + " signals to wait");
        if (signalsToWait <= 0) {
            throw new Error("Invalid signal number. Should be > 0");
        }
        this._signals = signalsToWait;
        this._callbacks = [];
        this._name = name;
    }
    setCallback(callback) {
        if (this.isSet()) {
            callback(undefined);
            return;
        }
        else if (this.isError()) {
            callback(this._error);
            return;
        }
        this._callbacks.push(callback);
    }
    signal(message) {
        this._logger.debug("Signaled - " + message + " - signals left " + (this._signals - 1));
        this._signals--;
        if (this._signals < 0) {
            throw new Error("Error in ready marker '" + this._name + " - signals are " + this._signals);
        }
        if (this.isSet()) {
            this._callbacks.forEach((callback) => {
                callback(undefined);
            });
        }
    }
    error(error) {
        this._error = error;
        this._callbacks.forEach((errorCallback) => {
            errorCallback(error);
        });
    }
    isSet() {
        if (this.isError()) {
            return false;
        }
        return this._signals === 0;
    }
    isError() {
        return !isUndefined(this._error);
    }
    getError() {
        return this._error;
    }
}

class EntityObservableCollection {
    constructor(processNew) {
        this._items = {};
        this._listeners = [];
        this._processNew = processNew;
    }
    addOne(item) {
        this.add([item]);
    }
    add(items) {
        items.forEach((element) => {
            this.process(new EntityEvent(element, new EntityEventContext(EntityEventType.Added)));
        });
    }
    process(event) {
        const context = event.context;
        const type = context.type;
        const entity = event.entity;
        if (type === EntityEventType.StatusChange &&
            !context.oldStatus) {
            const act = this._items[entity.id];
            if (act) {
                context.oldStatus = act.status;
            }
        }
        if (type === EntityEventType.StatusChange &&
            context.oldStatus &&
            context.newStatus &&
            context.oldStatus.state ===
                context.newStatus.state) {
            context.type = EntityEventType.Updated;
        }
        if (typeof htmlContainer === "undefined") {
            if (type === EntityEventType.ActivityWindowJoinedActivity &&
                this._items[entity.id] &&
                this._items[entity.id].activity) {
                context.type = EntityEventType.Updated;
            }
            if (type === EntityEventType.ActivityWindowLeftActivity &&
                this._items[entity.id] &&
                !this._items[entity.id].activity) {
                context.type = EntityEventType.Updated;
            }
        }
        const internalEntity = this._updateInternalCollections(entity, type, context);
        this._notifyListeners(internalEntity, context);
        return internalEntity;
    }
    get() {
        const result = [];
        for (const key in this._items) {
            if (this._items.hasOwnProperty(key)) {
                const element = this._items[key];
                result.push(element);
            }
        }
        return result;
    }
    getByName(name) {
        for (const key in this._items) {
            if (key === name) {
                return this._items[key];
            }
        }
        return undefined;
    }
    getOrWait(name) {
        return new Promise((resolve) => {
            const entityAddedHandler = (entity) => {
                if (entity.id !== name) {
                    return;
                }
                resolve(entity);
                this.unsubscribe(entityAddedHandler);
            };
            this.subscribe(entityAddedHandler);
            const window = this.getByName(name);
            if (window) {
                this.unsubscribe(entityAddedHandler);
                resolve(window);
                return;
            }
        });
    }
    subscribe(handler) {
        this._listeners.push(handler);
        Object.keys(this._items).forEach((key) => {
            const element = this._items[key];
            handler(element, new EntityEventContext(EntityEventType.Added.toString()));
        });
        return () => {
            this.unsubscribe(handler);
        };
    }
    unsubscribe(handler) {
        const index = this._listeners.indexOf(handler);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    _notifyListeners(entity, context) {
        this._listeners.forEach((listener) => {
            try {
                listener(entity, context);
            }
            catch (e) {
                return;
            }
        });
    }
    _updateInternalCollections(entity, type, context) {
        const entityAsAny = entity;
        const isActivityDestroy = (type === EntityEventType.StatusChange &&
            entityAsAny.status &&
            entityAsAny.status.state === ActivityState.Destroyed) ||
            (type === EntityEventType.StatusChange &&
                context &&
                context.newStatus &&
                context.newStatus.state === ActivityState.Destroyed);
        const isWindowClose = type === EntityEventType.Closed;
        const isTypeRemove = type === EntityEventType.Removed && typeof entityAsAny.isIndependent === "undefined";
        if (isTypeRemove || isWindowClose || isActivityDestroy) {
            const oldEntity = this._items[entity.id];
            delete this._items[entity.id];
            this._processNew(entity);
            if (oldEntity) {
                entity._beforeDelete(oldEntity);
            }
            return entity;
        }
        else {
            const key = entity.id;
            if (!this._items.hasOwnProperty(key)) {
                this._processNew(entity);
                this._items[entity.id] = entity;
            }
            else {
                this._items[entity.id]._update(entity);
            }
        }
        return this._items[entity.id];
    }
}

class ActivityManager {
    constructor(bridge, autoAnnounce, windows) {
        this._logger = Logger.Get("activityManager");
        this._announcedWindows = [];
        this._attachedCallbacks = [];
        this._detachedCallbacks = [];
        this._frameColorChangesCallbacks = [];
        this._windowHandlers = [];
        this._bridge = bridge;
        this._activityTypes = new EntityObservableCollection((e) => this._grabEntity(e));
        this._windowTypes = new EntityObservableCollection((e) => this._grabEntity(e));
        this._activities = new EntityObservableCollection((e) => this._grabEntity(e));
        this._windows = new EntityObservableCollection((e) => this._grabEntity(e));
        this._dataReadyMarker = new ReadyMarker("Activity Manager Data", ["GetActivityTypes", "GetWindowTypes", "GetActivities", "GetWindows"].length);
        this._descriptorsMarker = new ReadyMarker("Attached Activities Descriptors", ["GetDescriptors"].length);
        if (autoAnnounce) {
            this._readyMarker = new ReadyMarker("Activity Manager Announce", ["Announcement"].length);
            this._dataReadyMarker.setCallback((dataErr) => {
                if (dataErr) {
                    this._readyMarker.error(dataErr);
                }
                this._descriptorsMarker.setCallback((err) => {
                    if (err) {
                        this._readyMarker.error(err);
                    }
                    this._logger.debug("Auto announcing window");
                    this.announceWindow()
                        .then((w) => {
                        this._announcedWindows.push(w);
                        this._readyMarker.signal("Successfully announced window with id '" + w.id + "'");
                    })
                        .catch((errCatch) => {
                        this._logger.debug("Will not announce window - " + errCatch);
                        this._readyMarker.signal();
                    });
                });
                this.refreshDescriptors();
            });
        }
        else {
            this._readyMarker = this._dataReadyMarker;
        }
        this._bridge.onActivitiesAttached((e) => {
            this._handleActivitiesAttached(e);
        });
        this._bridge.onActivitiesDetached((e) => {
            this._handleActivitiesDetached(e);
        });
        this._bridge.onActivityAttachedDescriptorsRefreshed((e) => {
            this._handleActivityDescriptorsRefreshed(e);
        });
        if (windows) {
            windows.onWindowFrameColorChanged(this._handleWindowFrameColorChanged.bind(this));
        }
        this._bridge.init();
        this._subscribeForData();
        this._bridge
            .initReady()
            .then((aw) => {
            this._getInitialData();
        })
            .catch((error) => {
            console.log(error);
        });
    }
    get usingHc() {
        return this._bridge.bridgeType === "HC";
    }
    get announcedWindows() {
        return this._announcedWindows;
    }
    set announcedWindows(v) {
        throw new Error("not allowed");
    }
    ready(callback) {
        const promise = new Promise((resolve, reject) => {
            this._readyMarker.setCallback((err) => {
                if (!err) {
                    resolve(this);
                }
                else {
                    reject(this._readyMarker.getError());
                }
            });
        });
        return nodeify(Promise.all([this._bridge.ready(), promise]).then(() => this), callback);
    }
    getActivityTypes() {
        return this._activityTypes.get();
    }
    getActivityType(name) {
        return this._activityTypes.getByName(name);
    }
    registerActivityType(activityTypeName, ownerWindowType, helperWindowTypes, config, description, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(activityTypeName)) {
                reject("activityTypeName argument can not be undefined");
                return;
            }
            if (!isString(activityTypeName)) {
                reject("activityTypeName should be string");
                return;
            }
            const actType = this.getActivityType(activityTypeName);
            if (!isUndefinedOrNull(actType)) {
                reject("Activity type '" + activityTypeName + "' already exists");
                return;
            }
            let ownerDefinition;
            if (isUndefined(ownerWindowType)) {
                reject("Owner window type can not be undefined");
                return;
            }
            if (isString(ownerWindowType)) {
                ownerDefinition = { type: ownerWindowType, name: "", isIndependent: false, arguments: {} };
            }
            else {
                ownerDefinition = ownerWindowType;
            }
            const helperDefinitions = [];
            if (!isUndefined(helperWindowTypes) && isArray(helperWindowTypes)) {
                for (const index in helperWindowTypes) {
                    const item = helperWindowTypes[index];
                    if (isString(item)) {
                        const definition = {
                            type: item,
                            name: "",
                            isIndependent: false,
                            arguments: {},
                            relativeTo: "",
                            relativeDirection: "",
                            windowStyleAttributes: {}
                        };
                        helperDefinitions.push(definition);
                    }
                    else {
                        helperDefinitions.push(item);
                    }
                }
            }
            this._bridge
                .registerActivityType(activityTypeName, ownerDefinition, helperDefinitions, config, description)
                .then((activityType) => {
                this._grabEntity(activityType);
                resolve(activityType);
            })
                .catch((error) => {
                reject(error);
            });
        });
        return nodeify(promise, callback);
    }
    unregisterActivityType(type, callback) {
        const promise = new Promise((resolve, reject) => {
            const actType = this.getActivityType(type);
            if (isUndefined(actType)) {
                reject("Activity type '" + type + "' does not exists");
                return;
            }
            this._bridge.unregisterActivityType(type).then(() => resolve(actType), reject);
        });
        return nodeify(promise, callback);
    }
    initiate(activityType, context, callback, configuration) {
        const promise = new Promise((resolve, reject) => {
            const actType = this.getActivityType(activityType);
            if (isUndefined(actType)) {
                reject("Activity type '" + activityType + "' does not exists");
                return;
            }
            this._bridge
                .initiateActivity(activityType, context, configuration)
                .then((actId) => {
                this._activities
                    .getOrWait(actId)
                    .then((act) => {
                    resolve(act);
                })
                    .catch((err) => reject(err));
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    subscribeActivityTypeEvents(handler) {
        this._activityTypes.subscribe((at, context) => {
            handler(at, context.type);
        });
    }
    getWindowTypes() {
        return this._windowTypes.get();
    }
    getWindowType(name) {
        return this._windowTypes.getByName(name);
    }
    registerWindowFactory(windowType, factoryMethod, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(windowType)) {
                reject("no windowType specified");
                return;
            }
            if (isObject(windowType)) {
                windowType = windowType.getName();
            }
            else if (!isString(windowType)) {
                reject("windowType should be string or object that has getName method");
                return;
            }
            this._bridge
                .registerWindowFactory(windowType, factoryMethod)
                .then((v) => {
                resolve(v);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    unregisterWindowFactory(windowType, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(windowType)) {
                reject("no windowType specified");
                return;
            }
            if (!isString(windowType)) {
                reject("windowType should be a string");
                return;
            }
            this._bridge
                .unregisterWindowFactory(windowType)
                .then((v) => {
                resolve(v);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    getActivities(activityType) {
        let act = this._activities.get();
        act = act.filter((a) => a._ownerId);
        if (!activityType) {
            return act;
        }
        let types = activityType;
        if (isString(activityType)) {
            types = [activityType];
        }
        else if (activityType instanceof ActivityType) {
            types = [activityType.name];
        }
        else if (activityType instanceof Array) ;
        else {
            throw new Error("Invalid input argument 'activityType' = " + activityType);
        }
        return act.filter((at) => {
            const type = at.type;
            return some(types, (t) => {
                return type.id === t.id;
            });
        });
    }
    getActivityById(id) {
        return this._activities.getByName(id);
    }
    announceWindow(activityWindowId, windowType) {
        const promise = new Promise((resolve, reject) => {
            const announcementInfo = this._bridge.getAnnouncementInfo();
            if (isUndefined(activityWindowId)) {
                activityWindowId = announcementInfo.activityWindowId;
            }
            if (isUndefined(windowType)) {
                windowType = announcementInfo.activityWindowType;
            }
            if (isUndefinedOrNull(windowType)) {
                throw new Error("Can not announce - unknown windowType");
            }
            const activityId = announcementInfo && announcementInfo.activityId;
            if (isUndefinedOrNull(activityWindowId)) {
                this._logger.debug("Registering window with type:'" + windowType + "', name:'" + announcementInfo.activityWindowName + "', ind.:'" + announcementInfo.activityWindowIndependent + "'");
                this._bridge.registerWindow(windowType, announcementInfo.activityWindowName, announcementInfo.activityWindowIndependent)
                    .then(this._windows.getOrWait.bind(this._windows))
                    .then((w) => {
                    if (activityId) {
                        return this._activities.getOrWait(activityId).then((_) => w);
                    }
                    else {
                        return w;
                    }
                })
                    .then((w) => {
                    resolve(w);
                })
                    .catch((err) => {
                    this._logger.error(err);
                });
            }
            else {
                this._logger.debug("Announcing window with id '" + activityWindowId + "' and type '" + windowType + "'");
                const currentWindow = this._windows.getByName(activityWindowId);
                if (!isUndefinedOrNull(currentWindow)) {
                    this._logger.debug("Window with id '" + activityWindowId + "' already announced - reusing the window");
                    resolve(currentWindow);
                    return;
                }
                const windowEventHandler = (a, w, e) => {
                    if (activityWindowId === w.id) {
                        if (e === EntityEventType.ActivityWindowJoinedActivity) {
                            const activity = w.activity;
                            if (isUndefined(activity)) {
                                reject("UNDEFINED ACTIVITY");
                            }
                            this._logger.trace("Got joined event for id '" + activityWindowId + "'");
                            resolve(w);
                            this.unsubscribeWindowEvents(windowEventHandler);
                        }
                    }
                };
                this.subscribeWindowEvents(windowEventHandler);
                this._logger.trace("Waiting for joined event for id '" + activityWindowId + "'");
                this._bridge.announceWindow(windowType, activityWindowId);
            }
        });
        return promise;
    }
    subscribeWindowTypeEvents(handler) {
        this._windowTypes.subscribe((wt, context) => {
            handler(wt, context.type);
        });
    }
    subscribeActivityEvents(handler) {
        return this._activities.subscribe((act, context) => {
            if (context.type === EntityEventType.StatusChange) {
                const p = context;
                handler(act, p.newStatus, p.oldStatus);
            }
            if (context.type === EntityEventType.Removed ||
                (context.type === EntityEventType.StatusChange &&
                    context.newStatus.getState() === ActivityState.Destroyed)) {
                for (const window of this._windows.get()) {
                    if (window.activity && window.activity.id === act.id) {
                        this._windows.process(new EntityEvent(window, new EntityEventContext(EntityEventType.ActivityWindowLeftActivity)));
                    }
                }
            }
        });
    }
    subscribeWindowEvents(handler) {
        const wrappingHandler = (window, context) => {
            let eventType = context.type;
            if (eventType === EntityEventType.Added) {
                eventType = "opened";
            }
            handler(window.activity, window, eventType);
        };
        this._windowHandlers.push([handler, wrappingHandler]);
        return this._windows.subscribe(wrappingHandler);
    }
    unsubscribeWindowEvents(handler) {
        const found = this._windowHandlers.find((pair) => pair[0] === handler);
        if (found) {
            this._windowHandlers.splice(this._windowHandlers.indexOf(found), 1);
            this._windows.unsubscribe(found[1]);
        }
    }
    createWindow(activity, windowTypeOrConfiguration, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(windowTypeOrConfiguration)) {
                reject("windowType is undefined");
            }
            let windowDefinition;
            if (isString(windowTypeOrConfiguration)) {
                windowDefinition = { type: windowTypeOrConfiguration, name: "", isIndependent: false, arguments: {} };
            }
            else if (windowTypeOrConfiguration instanceof WindowType) {
                windowDefinition = {
                    type: windowTypeOrConfiguration.type || windowTypeOrConfiguration.id,
                    name: windowTypeOrConfiguration.name || windowTypeOrConfiguration.type || windowTypeOrConfiguration.id,
                    isIndependent: false
                };
            }
            else {
                const invalidKeys = ["url"];
                const filteredWindowTypeOrConfiguration = {};
                Object.keys(windowTypeOrConfiguration).forEach((key) => {
                    if (invalidKeys.indexOf(key) === -1) {
                        filteredWindowTypeOrConfiguration[key] = windowTypeOrConfiguration[key];
                    }
                });
                windowDefinition = filteredWindowTypeOrConfiguration;
            }
            let relativeToWindow;
            if (!isUndefinedOrNull(windowDefinition.relativeTo)) {
                relativeToWindow = windowDefinition.relativeTo;
                if (typeof relativeToWindow === "string") {
                    const windows = this.getWindows({ type: relativeToWindow });
                    if (!isUndefinedOrNull(windows) && windows.length > 0) {
                        windowDefinition.relativeTo = windows[0].id;
                    }
                }
                else if (!isUndefinedOrNull(relativeToWindow.type)) {
                    const windows = this.getWindows({ type: relativeToWindow.type });
                    if (!isUndefinedOrNull(windows) && windows.length > 0) {
                        windowDefinition.relativeTo = windows[0].id;
                    }
                }
                else if (!isUndefinedOrNull(relativeToWindow.windowId)) {
                    windowDefinition.relativeTo = relativeToWindow.windowId;
                }
            }
            this._bridge.createWindow(activity && activity.id, windowDefinition)
                .then((wid) => {
                this._logger.debug("Window created, waiting for window entity with id " + wid);
                const handler = (window, context) => {
                    if (window.id === wid && (!activity || window.activity)) {
                        this._logger.debug("Got entity window with id " + wid);
                        resolve(window);
                        this._windows.unsubscribe(handler);
                    }
                };
                this._windows.subscribe(handler);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    createStackedWindows(activity, relativeWindowTypes, timeout, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(activity)) {
                reject("activity is undefined");
            }
            if (isUndefinedOrNull(relativeWindowTypes)) {
                reject("relativeWindowTypes is undefined");
            }
            if (!Array.isArray(relativeWindowTypes)) {
                reject("relativeWindowTypes has to be an array");
            }
            if (isUndefinedOrNull(timeout)) {
                timeout = 20000;
            }
            const windowDefinitions = [];
            relativeWindowTypes.forEach((element) => {
                let windowDefinition;
                if (isString(element)) {
                    windowDefinition = { type: element, name: "", isIndependent: false, arguments: {} };
                }
                else {
                    windowDefinition = element;
                }
                windowDefinition.stackedWindow = true;
                windowDefinition.timeout = timeout;
                let relativeToWindow;
                if (!isUndefinedOrNull(windowDefinition.relativeTo)) {
                    relativeToWindow = windowDefinition.relativeTo;
                    if (!isUndefinedOrNull(relativeToWindow.type)) {
                        windowDefinition.relativeTo = relativeToWindow.type;
                    }
                    else if (!isUndefinedOrNull(relativeToWindow.windowId)) {
                        const windows = this.getWindows({ id: relativeToWindow.windowId });
                        if (!isUndefinedOrNull(windows) && windows.length > 0) {
                            windowDefinition.relativeTo = windows[0].type.name;
                        }
                    }
                }
                windowDefinitions.push(windowDefinition);
            });
            const tasks = [];
            windowDefinitions.forEach((wd) => tasks.push(this.createWindow(activity, wd)));
            Promise.all(tasks).then(resolve).catch(reject);
        });
        return nodeify(promise, callback);
    }
    addWindowToActivity(activity, window, callback) {
        const toReturn = this._bridge.joinActivity(activity.id, window.id)
            .then(() => window);
        nodeify(toReturn, callback);
        return toReturn;
    }
    leaveWindowFromActivity(activity, window, callback) {
        const toReturn = this._bridge.leaveActivity(activity.id, window.id)
            .then(() => window);
        nodeify(toReturn, callback);
        return toReturn;
    }
    setActivityContext(activity, context, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(activity)) {
                reject("activity can not be null");
            }
            this._bridge
                .updateActivityContext(activity, context, true)
                .then((_) => {
                resolve(activity);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    updateActivityContext(activity, context, callback) {
        const promise = new Promise((resolve, reject) => {
            if (isUndefinedOrNull(activity)) {
                reject("activity can not be null");
            }
            const removedKeys = [];
            for (const key in context) {
                if (context.hasOwnProperty(key) && context[key] === null) {
                    removedKeys.push(key);
                }
            }
            for (const removedKey of removedKeys) {
                delete context[removedKey];
            }
            this._bridge
                .updateActivityContext(activity, context, false, removedKeys)
                .then((_) => {
                resolve(activity);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    subscribeActivityContextChanged(handler) {
        this._activities.subscribe((act, context) => {
            if (context.type === EntityEventType.ActivityContextChange) {
                const updateContext = context;
                handler(act, updateContext.context, updateContext.updated, updateContext.removed);
            }
        });
    }
    stopActivity(activity, callback) {
        const promise = this._bridge.stopActivity(activity);
        return nodeify(promise, callback);
    }
    getWindows(filter) {
        if (isUndefined(filter)) {
            return this._windows.get();
        }
        if (!isUndefined(filter.id)) {
            return [this._windows.getByName(filter.id)];
        }
        const allWindows = this._windows.get();
        return allWindows.filter((w) => {
            if (!isUndefined(filter.type) && w.type.id !== filter.type) {
                return false;
            }
            if (!isUndefined(filter.name) && w.name !== filter.name) {
                return false;
            }
            if (!isUndefined(filter.activityId)) {
                if (isUndefinedOrNull(w.activity)) {
                    return false;
                }
                if (w.activity.id !== filter.activityId) {
                    return false;
                }
            }
            return true;
        });
    }
    getWindowBounds(id) {
        return this._bridge.getWindowBounds(id);
    }
    setWindowBounds(id, bounds, callback) {
        const promise = new Promise((resolve, reject) => {
            this._bridge.setWindowBounds(id, bounds)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
        return nodeify(promise, callback);
    }
    closeWindow(id) {
        return this._bridge.closeWindow(id);
    }
    activateWindow(id, focus) {
        return this._bridge.activateWindow(id, focus);
    }
    setWindowVisibility(id, visible) {
        return this._bridge.setWindowVisibility(id, visible);
    }
    clone(activity, cloneOptions, callback) {
        const promise = new Promise((resolve, reject) => {
            if (!activity) {
                reject("activity can not be null");
            }
            this._bridge.cloneActivity(activity.id, cloneOptions)
                .then((activityId) => {
                this._activities
                    .getOrWait(activityId)
                    .then((act) => {
                    resolve(act);
                })
                    .catch((err) => reject(err));
            })
                .catch((err) => reject(err));
        });
        return nodeify(promise, callback);
    }
    attachActivities(from, to, tag, callback) {
        tag = tag || {};
        const promise = new Promise((resolve, reject) => {
            const fromActivity = this._activities.getByName(from);
            if (!fromActivity) {
                reject("can not find activity with id " + from);
                return;
            }
            const toActivity = this._activities.getByName(to);
            if (!toActivity) {
                reject("can not find activity with id " + to);
                return;
            }
            return this._bridge.attachActivities(from, to, tag)
                .then((data) => {
                const newActId = data.to;
                const state = data.descriptor;
                const allStates = data.descriptors;
                this._activities.getOrWait(newActId).then((act) => {
                    act._updateDescriptors(allStates);
                    const stateWrapped = act.attached.filter((u) => u.ownerId === state.ownerId)[0];
                    resolve(stateWrapped);
                });
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    detachActivities(activityId, descriptor, callback) {
        const promise = new Promise((resolve, reject) => {
            return this._bridge.detachActivities(activityId, descriptor)
                .then(() => {
                const oldActId = undefined;
                const newActId = undefined;
                const descriptors = undefined;
                this._activities
                    .getOrWait(oldActId)
                    .then((oldAct) => {
                    oldAct._updateDescriptors(descriptors);
                    this._activities
                        .getOrWait(newActId)
                        .then((newAct) => {
                        resolve(newAct);
                    });
                })
                    .catch((err) => reject(err));
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    subscribeActivitiesAttached(callback) {
        this._attachedCallbacks.push(callback);
    }
    subscribeActivitiesDetached(callback) {
        this._detachedCallbacks.push(callback);
    }
    subscribeActivityFrameColorChanged(callback) {
        this._frameColorChangesCallbacks.push(callback);
    }
    _grabEntity(entity) {
        entity._manager = this;
    }
    _getInitialData() {
        this._logger.debug("Request initial data...");
        this._bridge.getActivityTypes()
            .then((at) => {
            this._activityTypes.add(at);
            this._dataReadyMarker.signal("Got act types");
        })
            .catch((error) => {
            this._logger.error(error);
            this._dataReadyMarker.error("Can not initialize ActivityManager - error getting activity types -" + error);
        });
        this._bridge.getWindowTypes()
            .then((wt) => {
            this._windowTypes.add(wt);
            this._dataReadyMarker.signal("Got window types");
        })
            .catch((error) => {
            this._logger.error(error);
            this._dataReadyMarker.error("Can not initialize ActivityManager - error getting window types  " + error);
        });
        this._bridge.getActivities()
            .then((ac) => {
            this._activities.add(ac);
            this._dataReadyMarker.signal("Got activities");
        })
            .catch((error) => {
            this._logger.error(error);
            this._dataReadyMarker.error("Can not initialize ActivityManager - error getting activity instances -" + error);
        });
        this._bridge.getActivityWindows()
            .then((aw) => {
            this._windows.add(aw);
            this._dataReadyMarker.signal("Got windows");
        })
            .catch((error) => {
            this._logger.error(error);
            this._dataReadyMarker.error("Can not initialize ActivityManager - error getting activity windows -" + error);
        });
    }
    _subscribeForData() {
        this._logger.debug("Subscribe for data...");
        this._bridge.onActivityTypeStatusChange((event) => {
            this._activityTypes.process(event);
        });
        this._bridge.onWindowTypeStatusChange((event) => {
            this._windowTypes.process(event);
        });
        this._bridge.onActivityWindowChange((event) => {
            this._windows.process(event);
        });
        this._bridge.onActivityStatusChange((event) => {
            this._activities.process(event);
        });
    }
    _handleActivitiesAttached(data) {
        const newActId = data.to;
        const descriptor = data.descriptor;
        const descriptors = data.descriptors;
        this._activities.getOrWait(newActId).then((act) => {
            act._updateDescriptors(descriptors);
            const descriptorAsObjectFromAPI = act.attached.filter((u) => u.ownerId === descriptor.ownerId)[0];
            this._attachedCallbacks.forEach((callback) => {
                try {
                    callback(act, descriptorAsObjectFromAPI);
                }
                catch (err) {
                    return;
                }
            });
        });
    }
    _handleActivitiesDetached(data) {
        const oldActId = data.oldActivityId;
        const newActId = data.newActivityId;
        const descriptors = data.descriptors;
        const descriptor = data.descriptor;
        this._activities.getOrWait(oldActId).then((oldAct) => {
            oldAct._updateDescriptors(descriptors);
            this._activities.getOrWait(newActId).then((newAct) => {
                this._detachedCallbacks.forEach((callback) => {
                    try {
                        callback(newAct, oldAct, descriptor);
                    }
                    catch (err) {
                        return;
                    }
                });
            });
        });
    }
    _handleActivityDescriptorsRefreshed(data) {
        const id = data.id;
        const descriptors = data.descriptors;
        const act = this._activities.getByName(id);
        if (act) {
            act._updateDescriptors(descriptors);
        }
    }
    refreshDescriptors() {
        this._bridge.getAttachedDescriptors()
            .then((map) => {
            if (map) {
                Object.keys(map).forEach((key) => {
                    const actId = key;
                    const descriptors = map[key];
                    const act = this._activities.getByName(actId);
                    if (act) {
                        act._updateDescriptors(descriptors);
                    }
                });
            }
            this._descriptorsMarker.signal("Successfully got descriptors");
        })
            .catch((err) => {
            this._descriptorsMarker.error("failed to get descriptors - " + err);
        });
    }
    _handleWindowFrameColorChanged(win) {
        if (!win.activityId) {
            return;
        }
        const act = this._activities.getByName(win.activityId);
        if (!act) {
            return;
        }
        if (!act.owner) {
            return;
        }
        if (act.owner.underlyingWindow.id !== win.id) {
            return;
        }
        this._frameColorChangesCallbacks.forEach((callback) => {
            try {
                callback(act, win.frameColor);
            }
            catch (e) {
                return;
            }
        });
    }
}

class ActivityManagementAPI {
    constructor(manager, my) {
        this._m = manager;
        this._my = my;
        this.activityTypes = {
            get: this._getActivityTypesWrapper.bind(this),
            register: this._m.registerActivityType.bind(this._m),
            unregister: this._m.unregisterActivityType.bind(this._m),
            subscribe: this._m.subscribeActivityTypeEvents.bind(this._m),
            unsubscribe: undefined,
            initiate: this._m.initiate.bind(this._m)
        };
        this.windowTypes = {
            get: this._getWindowTypesWrapper.bind(this),
            registerFactory: this._m.registerWindowFactory.bind(this._m),
            unregisterFactory: this._m.unregisterWindowFactory.bind(this._m),
            subscribe: this._m.subscribeWindowTypeEvents.bind(this._m),
            unsubscribe: undefined
        };
        this.windows = {
            get: this._m.getWindows.bind(this._m),
            subscribe: this._m.subscribeWindowEvents.bind(this._m),
            announce: this._m.announceWindow.bind(this._m),
            unsubscribe: undefined,
            create: this._m.createWindow.bind(this._m)
        };
        this.instances = {
            get: this._m.getActivities.bind(this._m),
            subscribe: this._m.subscribeActivityEvents.bind(this._m),
            unsubscribe: undefined
        };
    }
    onAttached(callback) {
        this._m.subscribeActivitiesAttached(callback);
    }
    onDetached(callback) {
        this._m.subscribeActivitiesDetached(callback);
    }
    onActivityFrameColorChanged(callback) {
        this._m.subscribeActivityFrameColorChanged(callback);
    }
    _getActivityTypesWrapper(name) {
        if (isUndefined(name)) {
            return this._m.getActivityTypes();
        }
        return this._m.getActivityType(name);
    }
    _getWindowTypesWrapper(name) {
        if (isUndefined(name)) {
            return this._m.getWindowTypes();
        }
        return this._m.getWindowType(name);
    }
}

class ActivityAPI {
    constructor(manager, my) {
        this._mgr = manager;
        this._my = my;
        this.all = new ActivityManagementAPI(manager, my);
    }
    ready(callback) {
        const promise = new Promise((resolve, reject) => {
            this._mgr.ready()
                .then(() => {
                resolve(this);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return nodeify(promise, callback);
    }
    get my() {
        return this._my;
    }
    get aware() {
        return this._my.window !== undefined;
    }
    get inActivity() {
        return this.aware && this._my.activity !== undefined;
    }
    get agm() {
        if (!this.aware) {
            return undefined;
        }
        if (!this.inActivity) {
            return new ActivityAGM(null);
        }
        return this._my.activity.agm;
    }
    getAvailableFrameColors() {
        return [];
    }
}

class ActivityModule {
    constructor(config) {
        if (!config) {
            throw new Error("config can not be null");
        }
        if (!isUndefined(config.logLevel)) {
            Logger.Level = config.logLevel;
        }
        if (!isUndefinedOrNull(config.logger)) {
            Logger.GlueLogger = config.logger;
        }
        let bridge;
        this._isUsingHCImplementation = config.gdMajorVersion === 2;
        this._isUsingGW3Implementation = ActivityModule.checkIsUsingGW3Implementation(config.connection);
        if (this._isUsingHCImplementation) {
            throw new Error("GD2 not supported");
        }
        else if (this._isUsingGW3Implementation) {
            bridge = new GW3Bridge(config);
        }
        else {
            throw new Error("Unable to instantiate activity bridge implementation");
        }
        if (!bridge) {
            throw new Error("A bridge to native activity is needed to create activity lib.");
        }
        ActivityAGM.AGM = config.agm;
        const activityManager = new ActivityManager(bridge, !config.disableAutoAnnounce, config.windows);
        const my = new ActivityMy(activityManager, config.windows);
        this._api = new ActivityAPI(activityManager, my);
        this._readyPromise = activityManager.ready().then((_) => this);
    }
    static checkIsUsingGW3Implementation(connection) {
        return connection.protocolVersion === 3;
    }
    get api() {
        return this._api;
    }
    set api(value) {
        this._api = value;
    }
    get isUsingHCImplementation() {
        return this._isUsingHCImplementation;
    }
    get isUsingGW3Implementation() {
        return this._isUsingGW3Implementation;
    }
    ready(callback) {
        return nodeify(this._readyPromise, callback);
    }
}

const ShutdownMethodName = "T42.ACS.Shutdown";
const OnGDShutdownMethodName = "T42.ACS.OnGDShutdown";
const RestartMethodName = "T42.ACS.Restart";
const GetConfigurationRegionMethodName = "T42.ACS.GetConfigurationRegion";
const SetConfigurationRegionMethodName = "T42.ACS.SetConfigurationRegion";
const GetUserMethodName = "T42.ACS.GetUser";
const GetBranchesMethodName = "T42.ACS.GetBranches";
const GetCurrentBranchMethodName = "T42.ACS.GetCurrentBranch";
const SetCurrentBranchMethodName = "T42.ACS.SetCurrentBranch";
const GetFunctionalEntitlementMethodName = "T42.ACS.GetFunctionalEntitlement";
const CanIMethodName = "T42.ACS.CanI";
const StartApplicationMethodName = "T42.ACS.StartApplication";
const StopApplicationMethodName = "T42.ACS.StopApplication";
const ActivateApplicationMethodName = "T42.ACS.ActivateApplication";
const OnEventMethodName = "T42.ACS.OnEvent";
const GetApplicationsMethodName = "T42.ACS.GetApplications";

function createRegistry(options) {
    if (options && options.errorHandling
        && typeof options.errorHandling !== "function"
        && options.errorHandling !== "log"
        && options.errorHandling !== "silent"
        && options.errorHandling !== "throw") {
        throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
    }
    var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
    var callbacks = {};
    function add(key, callback, replayArgumentsArr) {
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey) {
            callbacksForKey = [];
            callbacks[key] = callbacksForKey;
        }
        callbacksForKey.push(callback);
        if (replayArgumentsArr) {
            setTimeout(function () {
                replayArgumentsArr.forEach(function (replayArgument) {
                    var _a;
                    if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                        try {
                            if (Array.isArray(replayArgument)) {
                                callback.apply(undefined, replayArgument);
                            }
                            else {
                                callback.apply(undefined, [replayArgument]);
                            }
                        }
                        catch (err) {
                            _handleError(err, key);
                        }
                    }
                });
            }, 0);
        }
        return function () {
            var allForKey = callbacks[key];
            if (!allForKey) {
                return;
            }
            allForKey = allForKey.reduce(function (acc, element, index) {
                if (!(element === callback && acc.length === index)) {
                    acc.push(element);
                }
                return acc;
            }, []);
            if (allForKey.length === 0) {
                delete callbacks[key];
            }
            else {
                callbacks[key] = allForKey;
            }
        };
    }
    function execute(key) {
        var argumentsArr = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argumentsArr[_i - 1] = arguments[_i];
        }
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey || callbacksForKey.length === 0) {
            return [];
        }
        var results = [];
        callbacksForKey.forEach(function (callback) {
            try {
                var result = callback.apply(undefined, argumentsArr);
                results.push(result);
            }
            catch (err) {
                results.push(undefined);
                _handleError(err, key);
            }
        });
        return results;
    }
    function _handleError(exceptionArtifact, key) {
        var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
        if (_userErrorHandler) {
            _userErrorHandler(errParam);
            return;
        }
        var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
        if (options) {
            switch (options.errorHandling) {
                case "log":
                    return console.error(msg);
                case "silent":
                    return;
                case "throw":
                    throw new Error(msg);
            }
        }
        console.error(msg);
    }
    function clear() {
        callbacks = {};
    }
    function clearKey(key) {
        var callbacksForKey = callbacks[key];
        if (!callbacksForKey) {
            return;
        }
        delete callbacks[key];
    }
    return {
        add: add,
        execute: execute,
        clear: clear,
        clearKey: clearKey
    };
}
createRegistry.default = createRegistry;
var lib$1 = createRegistry;

function objectValues(source) {
    if (!source) {
        return [];
    }
    return Object.keys(source).map((key) => source[key]);
}
function objectClone(obj) {
    let result;
    try {
        result = JSON.parse(JSON.stringify(obj || {}));
    }
    catch (error) {
        result = {};
    }
    return result;
}

class ApplicationImpl {
    constructor(_appManager, _name, _agm) {
        this._appManager = _appManager;
        this._name = _name;
        this._agm = _agm;
        this._registry = lib$1();
        _appManager.onInstanceStarted((instance) => {
            if (instance.application && instance.application.name !== this._name) {
                return;
            }
            this._registry.execute("instanceStarted", instance);
        });
        _appManager.onInstanceStopped((instance) => {
            if (instance.application && instance.application.name !== this._name) {
                return;
            }
            this._registry.execute("instanceStopped", instance);
        });
        _appManager.onAppRemoved((app) => {
            if (app.name !== this._name) {
                return;
            }
            this._registry.execute("appRemoved", app);
        });
        _appManager.onAppChanged((app) => {
            if (app.name !== this._name) {
                return;
            }
            this._registry.execute("appChanged", app);
        });
        _appManager.onAppAvailable((app) => {
            if (app.name !== this._name) {
                return;
            }
            this._props.IsReady = true;
            this._registry.execute("appAvailable", app);
        });
        _appManager.onAppUnavailable((app) => {
            if (app.name !== this._name) {
                return;
            }
            this._props.IsReady = false;
            this._registry.execute("appUnavailable", app);
        });
    }
    get name() { return this._name; }
    get title() { return this._props.Title; }
    get version() { return this._props.Version; }
    get autoStart() { return this._props.AutoStart; }
    get isShell() { return this._props.IsShell; }
    get caption() { return this._props.Caption; }
    get hidden() { return this._props.IsHidden; }
    get container() { return this._props.ApplicationName; }
    get activityType() { return this._props.ActivityType; }
    get activityWindowType() { return this._props.ActivityWindowType; }
    get windowSettings() {
        if (!this._props.Arguments) {
            return {};
        }
        return objectClone(this._props.Arguments);
    }
    get allowMultiple() { return this._props.AllowMultiple; }
    get available() { return this._props.IsReady || true; }
    get icon() { return this._props.Icon; }
    get iconURL() { return this._props.IconUrl; }
    get sortOrder() { return this._props.SortOrder; }
    get userProperties() {
        if (!this._props.UserProperties) {
            return {};
        }
        return objectClone(this._props.UserProperties);
    }
    get keywords() {
        if (!this._props.Keywords) {
            return [];
        }
        return this._props.Keywords;
    }
    get isActivity() {
        return this._props.ActivityType !== undefined && this._props.ActivityType !== "";
    }
    get configuration() {
        return {
            autoStart: this._props.AutoStart,
            caption: this._props.Caption,
            hidden: this._props.IsHidden,
            container: this._props.ApplicationName,
            activityType: this._props.ActivityType,
            allowMultiple: this._props.AllowMultiple
        };
    }
    get instances() {
        return this._appManager.instances().filter((instance) => instance.application.name === this._name);
    }
    get type() {
        return this._props.Type;
    }
    get mode() {
        if (!this._props) {
            return "unknown";
        }
        if (this._props.Mode && typeof this._props.Mode === "string") {
            return this._props.Mode.toLowerCase();
        }
        if (this.isActivity) {
            return "unknown";
        }
        if (this._props.Arguments && this._props.Arguments.mode && typeof this._props.Arguments.mode === "string") {
            return this._props.Arguments.mode.toLowerCase();
        }
        let styleAttributes = this._props.WindowStyleAttributes;
        if (styleAttributes) {
            styleAttributes = styleAttributes.split(" ").join("");
            const searchFor = "mode:\"";
            const modeIndex = styleAttributes.indexOf(searchFor);
            if (modeIndex !== -1) {
                const startModeIndex = modeIndex + searchFor.length;
                const stopModeIndex = styleAttributes.indexOf("\"", startModeIndex);
                const style = styleAttributes.substr(startModeIndex, stopModeIndex - startModeIndex);
                if (style && typeof style === "string") {
                    return style.toLowerCase();
                }
            }
        }
        return "flat";
    }
    updateFromProps(props) {
        if (!this._props) {
            this._props = { Name: props.Name };
        }
        Object.keys(props).forEach((key) => {
            this._props[key] = props[key];
        });
    }
    start(context, options) {
        return new Promise(async (resolve, reject) => {
            var _a;
            const name = this._name;
            let startTimeout = 60000;
            if (isUndefinedOrNull(context)) {
                context = {};
            }
            else if (typeof context !== "object") {
                return reject(new Error(`Invalid "context" parameter - must be an object.`));
            }
            if (isUndefinedOrNull(options)) {
                options = {};
            }
            else if (typeof options !== "object") {
                return reject(new Error(`Invalid "options" parameter - must be an object.`));
            }
            let waitForAGMInstance = (_a = options.waitForAGMReady) !== null && _a !== void 0 ? _a : true;
            const waitForApplicationInstance = (id) => {
                let unsub;
                const timeout = setTimeout(() => {
                    if (unsub) {
                        unsub();
                    }
                    reject(`timed out while waiting for instance id ${id} for app ${this.name}`);
                }, startTimeout);
                const waitFunc = (i) => {
                    if (i.id !== id) {
                        return;
                    }
                    if (unsub) {
                        unsub();
                        unsub = undefined;
                    }
                    clearTimeout(timeout);
                    resolve(i);
                };
                if (waitForAGMInstance) {
                    unsub = this._appManager.onInstanceAgmServerReady(waitFunc);
                }
                else {
                    unsub = this._appManager.onInstanceStarted(waitFunc);
                }
            };
            const result = await this._agm.invoke(StartApplicationMethodName, {
                Name: name,
                Context: context,
                Options: options
            }, "best", {
                methodResponseTimeoutMs: startTimeout
            });
            const acsResult = result.returned;
            if (typeof acsResult.timeout !== "undefined") {
                startTimeout = acsResult.timeout * 1000;
            }
            if (typeof acsResult.waitForInterop !== "undefined" && typeof options.waitForAGMReady === "undefined") {
                waitForAGMInstance = acsResult.waitForInterop;
            }
            if (acsResult && acsResult.Id) {
                if (this._appManager.mode === "startOnly") {
                    const instance = this._appManager.handleInstanceStarted({
                        ActivityId: undefined,
                        IsActivityOwner: undefined,
                        Context: undefined,
                        Title: undefined,
                        AgmServers: undefined,
                        Id: acsResult.Id,
                        Name: acsResult.Name,
                    });
                    resolve(instance);
                }
                else {
                    waitForApplicationInstance(acsResult.Id);
                }
            }
            else {
                resolve(undefined);
            }
        });
    }
    onInstanceStarted(callback) {
        return this._registry.add("instanceStarted", callback);
    }
    onInstanceStopped(callback) {
        return this._registry.add("instanceStopped", callback);
    }
    onAvailable(callback) {
        if (this._props.IsReady) {
            setTimeout(() => {
                this._registry.execute("appAvailable", this);
            }, 0);
        }
        return this._registry.add("appAvailable", callback);
    }
    onUnavailable(callback) {
        if (this._props.IsReady === false) {
            setTimeout(() => {
                this._registry.execute("appUnavailable", this);
            }, 0);
        }
        return this._registry.add("appUnavailable", callback);
    }
    onChanged(callback) {
        this._registry.add("appChanged", callback);
    }
    onRemoved(callback) {
        this._registry.add("appRemoved", callback);
    }
}

class InstanceImpl {
    constructor(_id, _appName, _appManager, _agm, _activities, _windows, startFailed) {
        this._id = _id;
        this._appName = _appName;
        this._appManager = _appManager;
        this._agm = _agm;
        this._activities = _activities;
        this._windows = _windows;
        this._registry = lib$1();
        if (startFailed) {
            return;
        }
        this._unsubscribeInstanceStopped = this._appManager.onInstanceStopped((instance) => {
            if (instance.id !== this._id) {
                return;
            }
            this._registry.execute("stopped", instance);
        });
        this._unsubscribeInstanceAgmServerReady = this._appManager.onInstanceAgmServerReady((instance) => {
            if (instance.id !== this._id) {
                return;
            }
            this._registry.execute("agmReady", instance);
        });
    }
    get id() { return this._id; }
    get application() { return this._appManager.application(this._appName); }
    get activity() {
        if (!this._activities) {
            throw new Error("This method requires glue.activities library to be enabled.");
        }
        return this._activities.all.instances.get()
            .filter((activityInstance) => activityInstance.id === this._activityId)[0];
    }
    get isActivityOwner() { return this._isActivityOwner; }
    get activityInstances() {
        return this._appManager.instances().filter((i) => i.application.type !== "activity" &&
            i.activityId &&
            i.activityId === this._activityId);
    }
    get activityOwnerInstance() {
        if (!this._activityId) {
            return undefined;
        }
        return this.activityInstances.filter((inst) => { var _a; return (_a = inst) === null || _a === void 0 ? void 0 : _a.isActivityOwner; })[0];
    }
    get window() {
        if (!this._windows) {
            throw new Error("This method requires glue.windows library to be enabled.");
        }
        let win = this._windows.list().filter((w) => w.id === this._id)[0];
        if (!win && this._activities && this.activity && this.activityOwnerInstance) {
            win = this.activityOwnerInstance.window;
        }
        return win;
    }
    get context() {
        var _a, _b, _c;
        return (_c = (_a = this._startUpContext) !== null && _a !== void 0 ? _a : (_b = this.window) === null || _b === void 0 ? void 0 : _b.context) !== null && _c !== void 0 ? _c : {};
    }
    get title() { return this._title; }
    get isActivityInstance() { return this._isActivityInstance; }
    get activityId() { return this._activityId; }
    get inActivity() { return this._inActivity; }
    get isSingleWindowApp() { return !this._inActivity; }
    get agm() {
        return this._agmInstance;
    }
    onAgmReady(callback) {
        if (this._agmInstance) {
            setTimeout(() => {
                this._registry.execute("agmReady", this);
            }, 0);
        }
        return this._registry.add("agmReady", callback);
    }
    onStopped(callback) {
        return this._registry.add("stopped", callback);
    }
    getWindow() {
        return new Promise((resolve, reject) => {
            const result = this.window;
            if (result) {
                resolve(result);
                return;
            }
            const done = (error, window) => {
                if (error) {
                    reject(error);
                }
                if (window) {
                    resolve(window);
                }
                setTimeout(() => {
                    clearTimeout(timeout);
                    unsub();
                }, 0);
            };
            const timeout = setTimeout(() => {
                done(new Error(`can not find a window with id ${this._id}`));
            }, 30000);
            const unsub = this._windows.onWindowAdded((w) => {
                if (w.id === this._id) {
                    done(undefined, w);
                }
            });
        });
    }
    updateFromProps(props) {
        this._startUpContext = props.Context;
        this._title = props.Title;
        this._isActivityInstance = false;
        if (props.ActivityId && props.ActivityId !== "") {
            this._activityId = props.ActivityId;
            this._isActivityInstance = true;
        }
        this._isActivityOwner = props.IsActivityOwner;
        if (!this._activityId && this._startUpContext && this._startUpContext.activityId) {
            this._activityId = this._startUpContext.activityId;
        }
        this._inActivity = Boolean(this._activityId);
        this.updateAgmInstanceFromProps(props);
    }
    updateAgmInstanceFromProps(props) {
        if (!props.AgmServers) {
            return;
        }
        const agmInstances = props.AgmServers;
        if (agmInstances && agmInstances.length > 0 && !isUndefinedOrNull(agmInstances[0])) {
            this._agmInstance = agmInstances[0];
        }
    }
    stop() {
        return new Promise((resolve, reject) => {
            const unsubscribe = this._appManager.onInstanceStopped((instance) => {
                if (instance.id === this._id) {
                    unsubscribe();
                    resolve();
                }
            });
            this._agm.invoke(StopApplicationMethodName, {
                Name: this._appName,
                Id: this._id
            })
                .then(() => {
                if (this._appManager.mode === "startOnly") {
                    this._appManager.handleInstanceStopped({
                        Name: this._appName,
                        Id: this.id,
                        Context: undefined,
                        Title: undefined,
                        ActivityId: undefined,
                        IsActivityOwner: undefined,
                        AgmServers: undefined
                    });
                    resolve();
                }
            })
                .catch((err) => reject(err));
        });
    }
    activate() {
        return this._agm.invoke(ActivateApplicationMethodName, { Name: this._appName, Id: this._id });
    }
    done() {
        this._registry.clear();
        this._unsubscribeInstanceAgmServerReady();
        this._unsubscribeInstanceStopped();
    }
    getContext() {
        return Promise.resolve(this.context);
    }
}

class AppManagerImpl {
    constructor(mode, _agm, _activities, _windows, _logger, _gdMajorVersion) {
        this.mode = mode;
        this._agm = _agm;
        this._activities = _activities;
        this._windows = _windows;
        this._logger = _logger;
        this._gdMajorVersion = _gdMajorVersion;
        this._apps = {};
        this._instances = [];
        this._registry = lib$1();
        this.application = (name) => {
            if (typeof name !== "string") {
                throw new Error(`"name" must be string`);
            }
            return this._apps[name];
        };
        this.applications = () => {
            return Object.keys(this._apps).map((k) => this._apps[k]);
        };
        this.instances = () => {
            return this._instances;
        };
        this.getMyInstance = () => {
            const glue42gd = typeof window !== "undefined" && window.glue42gd;
            if (glue42gd) {
                if (this._gdMajorVersion >= 3) {
                    const instanceId = glue42gd.appInstanceId;
                    return this._instances.find((i) => i.id === instanceId);
                }
            }
            else {
                const instanceId = this._agm.instance.instance;
                return this._instances.find((i) => i.id === instanceId);
            }
            return undefined;
        };
        this.handleAppAdded = (props) => {
            const id = this._getAppId(props);
            this._logger.trace(`adding app ${id}`);
            this._apps[id] = new ApplicationImpl(this, id, this._agm);
            const app = this._updateAppFromProps(props);
            this._registry.execute("appAdded", app);
            this._registry.execute("appAvailable", app);
        };
        this.handleAppUpdated = (props) => {
            const app = this._updateAppFromProps(props);
            this._registry.execute("appChanged", app);
        };
        this.handleAppRemoved = (props) => {
            const id = this._getAppId(props);
            this._logger.trace(`removing app ${id}`);
            const app = this.application(id);
            this._instances = this._instances.filter((i) => i.application.name !== app.name);
            delete this._apps[id];
            this._registry.execute("appRemoved", app);
        };
        this.handleAppReady = (props) => {
            const id = this._getAppId(props);
            const app = this._getAppOrThrow(id);
            app.updateFromProps(props);
            if (app.available) {
                this._registry.execute("appAvailable", app);
            }
            else {
                this._registry.execute("appUnavailable", app);
            }
        };
        this.handleInstanceStarted = (props) => {
            this._logger.trace(`started app ${props.Name} ${props.Id}`);
            const id = this._getInstanceId(props);
            const appName = this._getInstanceAppName(props);
            const instance = new InstanceImpl(id, appName, this, this._agm, this._activities, this._windows);
            this._updateInstanceFromProps(instance, props);
            this._instances.push(instance);
            this._registry.execute("instanceStarted", instance);
            return instance;
        };
        this.handleInstanceStopped = (props) => {
            this._logger.trace(`failed to start app ${props.Name} ${props.Id}`);
            const id = this._getInstanceId(props);
            const appName = this._getInstanceAppName(props);
            const instance = this._getInstanceOrThrow(id, appName);
            this._instances = this._instances.filter((i) => !this._matchInstance(i, id, appName));
            this._registry.execute("instanceStopped", instance);
            instance.done();
        };
        this.handleInstanceAgmServerReady = (props) => {
            const id = this._getInstanceId(props);
            const appName = this._getInstanceAppName(props);
            const instance = this._getInstanceOrThrow(id, appName);
            instance.updateAgmInstanceFromProps(props);
            this._registry.execute("instanceAgmServerReady", instance);
        };
        this.handleInstanceStartFailed = (props) => {
            const id = this._getInstanceId(props);
            const appName = this._getInstanceAppName(props);
            const startFailed = true;
            const instance = new InstanceImpl(id, appName, undefined, undefined, undefined, undefined, startFailed);
            this._updateInstanceFromProps(instance, props);
            this._registry.execute("instanceStartFailed", instance);
        };
        this.handleInstanceUpdated = (props) => {
            const id = this._getInstanceId(props);
            const app = this._getInstanceAppName(props);
            const instance = this._getInstanceOrThrow(id, app);
            this._updateInstanceFromProps(instance, props);
        };
        this.onInstanceStarted = (callback) => {
            return this._registry.add("instanceStarted", callback, this._instances);
        };
        this.onInstanceStartFailed = (callback) => {
            return this._registry.add("instanceStartFailed", callback);
        };
        this.onInstanceStopped = (callback) => {
            return this._registry.add("instanceStopped", callback);
        };
        this.onInstanceUpdated = (callback) => {
            return this._registry.add("instanceChanged", callback);
        };
        this.onInstanceAgmServerReady = (callback) => {
            return this._registry.add("instanceAgmServerReady", callback);
        };
        this.onAppAdded = (callback) => {
            return this._registry.add("appAdded", callback, Object.values(this._apps));
        };
        this.onAppRemoved = (callback) => {
            return this._registry.add("appRemoved", callback);
        };
        this.onAppAvailable = (callback) => {
            return this._registry.add("appAvailable", callback);
        };
        this.onAppUnavailable = (callback) => {
            return this._registry.add("appUnavailable", callback);
        };
        this.onAppChanged = (callback) => {
            return this._registry.add("appChanged", callback);
        };
    }
    _getAppOrThrow(id) {
        const result = this.application(id);
        if (!result) {
            throw Error(`app with id ${id} not found`);
        }
        return result;
    }
    _getAppId(props) {
        return props.Name;
    }
    _matchInstance(instance, id, appName) {
        return instance.id === id && instance.application.name === appName;
    }
    _getInstanceByIdAndName(id, appName) {
        return this._instances.filter((i) => this._matchInstance(i, id, appName))[0];
    }
    _getInstanceOrThrow(id, appName) {
        const result = this._getInstanceByIdAndName(id, appName);
        if (!result) {
            throw Error(`instance with id ${id} not found`);
        }
        return result;
    }
    _getInstanceId(props) {
        return props.Id;
    }
    _getInstanceAppName(props) {
        return props.Name;
    }
    _updateAppFromProps(props) {
        const id = this._getAppId(props);
        this._logger.trace(`updating app with  + ${id}, ${props}`);
        const app = this._getAppOrThrow(id);
        app.updateFromProps(props);
        return app;
    }
    _updateInstanceFromProps(instance, props) {
        this._logger.trace("updating instance with " + this._getInstanceId(props) + " for app " + this._getInstanceAppName(props));
        instance.updateFromProps(props);
    }
}

function promisify(promise, successCallback, errorCallback) {
    const isFunction = (arg) => {
        return !!(arg && arg.constructor && arg.call && arg.apply);
    };
    if (!isFunction(successCallback) && !isFunction(errorCallback)) {
        return promise;
    }
    if (!isFunction(successCallback)) {
        successCallback = () => {
        };
    }
    else if (!isFunction(errorCallback)) {
        errorCallback = () => {
        };
    }
    return promise.then(successCallback, errorCallback);
}
class EntitlementsImpl {
    constructor(_agm) {
        this._agm = _agm;
        this._registry = lib$1();
        this._isMethodRegistered = false;
        this.handleBranchModified = (branch) => {
            this._registry.execute("branchChanged", branch);
        };
        this.handleBranchesModified = (branches) => {
            this._registry.execute("branchesChanged", branches);
        };
        this.getRegion = (success, error) => {
            return promisify(this._agmInvoke(GetConfigurationRegionMethodName, (e) => e.returned.Region), success, error);
        };
        this.getBranches = (success, error) => {
            const promise = this._agmInvoke(GetBranchesMethodName, (e) => {
                const obj = e.returned.Branches;
                return Object.keys(obj).map((key) => obj[key]);
            });
            return promisify(promise, success, error);
        };
        this.getCurrentBranch = (success, error) => {
            const promise = this._agmInvoke(GetCurrentBranchMethodName, (e) => e.returned.Branch, undefined);
            return promisify(promise, success, error);
        };
        this.setRegion = (region, success, error) => {
            const promise = this._agmInvoke(SetConfigurationRegionMethodName, (e) => e.returned.ResultMessage, { Region: region });
            return promisify(promise, success, error);
        };
        this.setCurrentBranch = (branch, success, error) => {
            const promise = this._agmInvoke(SetCurrentBranchMethodName, (e) => e.returned.ResultMessage, { Branch: branch });
            return promisify(promise, success, error);
        };
        this.currentUser = (success, error) => {
            const promise = this._agmInvoke(GetUserMethodName);
            return promisify(promise, success, error);
        };
        this.getFunctionalEntitlement = (funct, success, error) => {
            const promise = this._agmInvoke(GetFunctionalEntitlementMethodName, (e) => e.returned.Entitlement, { Function: funct });
            return promisify(promise, success, error);
        };
        this.getFunctionalEntitlementBranch = (funct, branch, success, error) => {
            const promise = this._agmInvoke(GetFunctionalEntitlementMethodName, (e) => e.returned.Entitlement, { Function: funct, Branch: branch });
            return promisify(promise, success, error);
        };
        this.canI = (func, success, error) => {
            const promise = this._agmInvoke(CanIMethodName, (e) => e.returned.Result, { Function: func });
            return promisify(promise, success, error);
        };
        this.canIBranch = (func, branch, success, error) => {
            const promise = this._agmInvoke(CanIMethodName, (e) => e.returned.Result, { Function: func, Branch: branch });
            return promisify(promise, success, error);
        };
        this.onBranchesChanged = (callback) => {
            return this._registry.add("branchesChanged", callback);
        };
        this.onBranchChanged = (callback) => {
            return this._registry.add("branchChanged", callback);
        };
        this.exit = (options) => {
            return this._agmInvoke(ShutdownMethodName, null, options);
        };
        this.onShuttingDown = (callback) => {
            this.registerMethod();
            return this._registry.add("onShuttingDown", callback);
        };
        this.restart = (options) => {
            return this._agmInvoke(RestartMethodName, null, options);
        };
        this._agmInvoke = (method, transformFunction, args) => {
            args = args || {};
            return new Promise((resolve, reject) => {
                const errHandler = (error) => reject(error);
                this._agm.invoke(method, args)
                    .then((result) => {
                    if (!transformFunction) {
                        transformFunction = (d) => d.returned;
                    }
                    resolve(transformFunction(result));
                })
                    .catch(errHandler);
            });
        };
    }
    registerMethod() {
        if (!this._isMethodRegistered) {
            this._agm.register(OnGDShutdownMethodName, async (args) => {
                try {
                    const results = await Promise.all(this._registry.execute("onShuttingDown", args));
                    const prevent = results.some((r) => r.prevent);
                    return { prevent };
                }
                catch (error) {
                }
            });
            this._isMethodRegistered = true;
        }
    }
}

function snapshot(agm, appManager) {
    return new Promise((resolve, reject) => {
        agm.invoke(GetApplicationsMethodName, { skipIcon: true })
            .then((response) => {
            const data = response.returned;
            if (!data) {
                resolve();
            }
            const applications = data.applications;
            if (!applications) {
                resolve();
            }
            objectValues(applications).map((item) => appManager.handleAppAdded(item));
            resolve();
        })
            .catch((err) => reject(`Error getting application snapshot: ${err.message}`));
    });
}

const OnBranchChangedEvent = "OnBranchChanged";
const OnBranchesModifiedEvent = "OnBranchesModified";
const OnApplicationAddedEvent = "OnApplicationAdded";
const OnApplicationRemovedEvent = "OnApplicationRemoved";
const OnApplicationChangedEvent = "OnApplicationChanged";
const OnApplicationReadyEvent = "OnApplicationReady";
const OnApplicationStartedEvent = "OnApplicationStarted";
const OnApplicationAgmServerReadyEvent = "OnApplicationAgmServerReady";
const OnApplicationUpdatedEvent = "OnApplicationUpdated";
const OnApplicationStoppedEvent = "OnApplicationStopped";
const OnApplicationStartFailedEvent = "OnApplicationStartFailed";

function createDataSubscription(agm, applications, entitlements, skipIcons) {
    let subscription;
    let initiated = false;
    const start = () => {
        let resolveFunc;
        let rejectFunc;
        const resultPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
            rejectFunc = reject;
        });
        agm.subscribe(OnEventMethodName, { arguments: { skipIcon: skipIcons }, waitTimeoutMs: 10000 })
            .then((s) => {
            subscription = s;
            subscription.onData((streamData) => {
                const events = streamData.data;
                const onApplicationAddedEventArgs = objectValues(events[OnApplicationAddedEvent]);
                onApplicationAddedEventArgs.map((item) => applications.handleAppAdded(item));
                objectValues(events[OnApplicationChangedEvent])
                    .map((item) => applications.handleAppUpdated(item));
                objectValues(events[OnApplicationRemovedEvent])
                    .map((item) => applications.handleAppRemoved(item));
                objectValues(events[OnApplicationReadyEvent])
                    .map((item) => applications.handleAppReady(item));
                const onApplicationStartedEventArgs = objectValues(events[OnApplicationStartedEvent]);
                onApplicationStartedEventArgs.map((item) => applications.handleInstanceStarted(item));
                objectValues(events[OnApplicationStartFailedEvent])
                    .map((item) => applications.handleInstanceStartFailed(item));
                objectValues(events[OnApplicationStoppedEvent])
                    .map((item) => applications.handleInstanceStopped(item));
                objectValues(events[OnApplicationUpdatedEvent])
                    .map((item) => applications.handleInstanceUpdated(item));
                objectValues(events[OnApplicationAgmServerReadyEvent])
                    .map((item) => applications.handleInstanceAgmServerReady(item));
                objectValues(events[OnBranchChangedEvent])
                    .map((item) => entitlements.handleBranchModified(item));
                objectValues(events[OnBranchesModifiedEvent])
                    .map((item) => entitlements.handleBranchesModified(item));
                if (!initiated) {
                    initiated = true;
                    const hasMyAppInSnapShot = onApplicationAddedEventArgs.some((a) => a.Name === agm.instance.application);
                    const hasMyInstanceInSnapShot = onApplicationStartedEventArgs.some((i) => i.Id === agm.instance.instance);
                    if (hasMyAppInSnapShot) {
                        if (hasMyInstanceInSnapShot) {
                            resolveFunc();
                        }
                        else {
                            const un = applications.onInstanceStarted((i) => {
                                if (i.id === agm.instance.instance) {
                                    un();
                                    resolveFunc();
                                }
                            });
                        }
                    }
                    else {
                        resolveFunc();
                    }
                }
            });
            subscription.onFailed((err) => rejectFunc(err));
        })
            .catch((err) => { var _a; return rejectFunc(`Error subscribing for ${OnEventMethodName} stream. Err: ${(_a = err.message) !== null && _a !== void 0 ? _a : err}`); });
        return resultPromise;
    };
    const stop = () => {
        if (subscription) {
            subscription.close();
        }
    };
    return {
        start,
        stop
    };
}

const InMemoryStoreCommandMethodName = "T42.ACS.InMemoryStoreCommand";
class InMemoryStore {
    constructor(interop) {
        this.interop = interop;
    }
    import(apps, mode) {
        if (!apps || !Array.isArray(apps)) {
            return Promise.reject("invalid apps argument - should be an array of application definitions");
        }
        if (mode && mode !== "replace" && mode !== "merge") {
            return Promise.reject("invalid mode argument - should be 'replace' or 'merge'");
        }
        mode = mode !== null && mode !== void 0 ? mode : "replace";
        const command = {
            command: "import",
            args: {
                apps,
                mode
            }
        };
        return this.interop.invoke(InMemoryStoreCommandMethodName, command)
            .then((r) => r.returned);
    }
    export() {
        return this.interop.invoke(InMemoryStoreCommandMethodName, { command: "export" })
            .then((r) => r.returned.apps);
    }
    remove(app) {
        if (!app || typeof app !== "string") {
            return Promise.reject("invalid app name, should be a string value");
        }
        const command = {
            command: "remove",
            args: {
                apps: [app]
            }
        };
        return this.interop.invoke(InMemoryStoreCommandMethodName, command).then((r) => r.returned);
    }
    clear() {
        const command = {
            command: "clear"
        };
        return this.interop.invoke(InMemoryStoreCommandMethodName, command).then((r) => r.returned);
    }
    createAppDef(name, url) {
        if (!url) {
            url = "https://google.com";
        }
        return {
            name,
            type: "window",
            title: name,
            details: {
                url
            }
        };
    }
}

var AppManagerFactory = (config) => {
    if (!config) {
        throw Error("config not set");
    }
    if (!config.agm) {
        throw Error("config.agm is missing");
    }
    const START_ONLY = "startOnly";
    const SKIP_ICONS = "skipIcons";
    const FULL = "full";
    const mode = config.mode || START_ONLY;
    if (mode !== START_ONLY && mode !== SKIP_ICONS && mode !== FULL) {
        throw new Error(`Invalid mode for appManager lib - ${mode} is not supported`);
    }
    const activities = config.activities;
    const agm = config.agm;
    const logger = config.logger;
    const windows = config.windows;
    const appManager = new AppManagerImpl(mode, agm, activities, windows, logger.subLogger("applications"), config.gdMajorVersion);
    const entitlements = new EntitlementsImpl(agm);
    let readyPromise;
    if (mode === START_ONLY) {
        readyPromise = snapshot(agm, appManager);
    }
    else {
        const subscription = createDataSubscription(agm, appManager, entitlements, mode === SKIP_ICONS);
        readyPromise = subscription.start();
    }
    const api = {
        ready: () => readyPromise,
        applications: appManager.applications,
        application: appManager.application,
        onAppAdded: appManager.onAppAdded,
        onAppRemoved: appManager.onAppRemoved,
        onAppChanged: appManager.onAppChanged,
        onAppAvailable: appManager.onAppAvailable,
        onAppUnavailable: appManager.onAppUnavailable,
        instances: appManager.instances,
        get myInstance() {
            return appManager.getMyInstance();
        },
        onInstanceStarted: appManager.onInstanceStarted,
        onInstanceStopped: appManager.onInstanceStopped,
        onInstanceUpdated: appManager.onInstanceUpdated,
        onInstanceStartFailed: appManager.onInstanceStartFailed,
        getRegion: entitlements.getRegion,
        getBranches: entitlements.getBranches,
        getCurrentBranch: entitlements.getCurrentBranch,
        getFunctionalEntitlement: entitlements.getFunctionalEntitlement,
        getFunctionalEntitlementBranch: entitlements.getFunctionalEntitlementBranch,
        setCurrentBranch: entitlements.setCurrentBranch,
        setRegion: entitlements.setRegion,
        currentUser: entitlements.currentUser,
        canI: entitlements.canI,
        canIBranch: entitlements.canIBranch,
        onBranchesChanged: entitlements.onBranchesChanged,
        exit: entitlements.exit,
        restart: entitlements.restart,
        onShuttingDown: entitlements.onShuttingDown,
        inMemory: new InMemoryStore(agm)
    };
    return api;
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

// Found this seed-based random generator somewhere
// Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

var seed = 1;

/**
 * return a random number based on a seed
 * @param seed
 * @returns {number}
 */
function getNextValue() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed/(233280.0);
}

function setSeed$1(_seed_) {
    seed = _seed_;
}

var randomFromSeed = {
    nextValue: getNextValue,
    seed: setSeed$1
};

var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
var alphabet;
var previousSeed;

var shuffled;

function reset() {
    shuffled = false;
}

function setCharacters(_alphabet_) {
    if (!_alphabet_) {
        if (alphabet !== ORIGINAL) {
            alphabet = ORIGINAL;
            reset();
        }
        return;
    }

    if (_alphabet_ === alphabet) {
        return;
    }

    if (_alphabet_.length !== ORIGINAL.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
    }

    var unique = _alphabet_.split('').filter(function(item, ind, arr){
       return ind !== arr.lastIndexOf(item);
    });

    if (unique.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
    }

    alphabet = _alphabet_;
    reset();
}

function characters(_alphabet_) {
    setCharacters(_alphabet_);
    return alphabet;
}

function setSeed(seed) {
    randomFromSeed.seed(seed);
    if (previousSeed !== seed) {
        reset();
        previousSeed = seed;
    }
}

function shuffle() {
    if (!alphabet) {
        setCharacters(ORIGINAL);
    }

    var sourceArray = alphabet.split('');
    var targetArray = [];
    var r = randomFromSeed.nextValue();
    var characterIndex;

    while (sourceArray.length > 0) {
        r = randomFromSeed.nextValue();
        characterIndex = Math.floor(r * sourceArray.length);
        targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
    }
    return targetArray.join('');
}

function getShuffled() {
    if (shuffled) {
        return shuffled;
    }
    shuffled = shuffle();
    return shuffled;
}

/**
 * lookup shuffled letter
 * @param index
 * @returns {string}
 */
function lookup(index) {
    var alphabetShuffled = getShuffled();
    return alphabetShuffled[index];
}

var alphabet_1 = {
    characters: characters,
    seed: setSeed,
    lookup: lookup,
    shuffled: getShuffled
};

var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

function randomByte() {
    if (!crypto || !crypto.getRandomValues) {
        return Math.floor(Math.random() * 256) & 0x30;
    }
    var dest = new Uint8Array(1);
    crypto.getRandomValues(dest);
    return dest[0] & 0x30;
}

var randomByteBrowser = randomByte;

function encode(lookup, number) {
    var loopCounter = 0;
    var done;

    var str = '';

    while (!done) {
        str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | randomByteBrowser() );
        done = number < (Math.pow(16, loopCounter + 1 ) );
        loopCounter++;
    }
    return str;
}

var encode_1 = encode;

/**
 * Decode the id to get the version and worker
 * Mainly for debugging and testing.
 * @param id - the shortid-generated id.
 */
function decode(id) {
    var characters = alphabet_1.shuffled();
    return {
        version: characters.indexOf(id.substr(0, 1)) & 0x0f,
        worker: characters.indexOf(id.substr(1, 1)) & 0x0f
    };
}

var decode_1 = decode;

// Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
// This number should be updated every year or so to keep the generated id short.
// To regenerate `new Date() - 0` and bump the version. Always bump the version!
var REDUCE_TIME = 1459707606518;

// don't change unless we change the algos or REDUCE_TIME
// must be an integer and less than 16
var version$1 = 6;

// Counter is used when shortid is called multiple times in one second.
var counter;

// Remember the last time shortid was called in case counter is needed.
var previousSeconds;

/**
 * Generate unique id
 * Returns string id
 */
function build(clusterWorkerId) {

    var str = '';

    var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

    if (seconds === previousSeconds) {
        counter++;
    } else {
        counter = 0;
        previousSeconds = seconds;
    }

    str = str + encode_1(alphabet_1.lookup, version$1);
    str = str + encode_1(alphabet_1.lookup, clusterWorkerId);
    if (counter > 0) {
        str = str + encode_1(alphabet_1.lookup, counter);
    }
    str = str + encode_1(alphabet_1.lookup, seconds);

    return str;
}

var build_1 = build;

function isShortId(id) {
    if (!id || typeof id !== 'string' || id.length < 6 ) {
        return false;
    }

    var characters = alphabet_1.characters();
    var len = id.length;
    for(var i = 0; i < len;i++) {
        if (characters.indexOf(id[i]) === -1) {
            return false;
        }
    }
    return true;
}

var isValid = isShortId;

var lib = createCommonjsModule(function (module) {







// if you are using cluster or multiple servers use this to make each instance
// has a unique value for worker
// Note: I don't know if this is automatically set when using third
// party cluster solutions such as pm2.
var clusterWorkerId = 0;

/**
 * Set the seed.
 * Highly recommended if you don't want people to try to figure out your id schema.
 * exposed as shortid.seed(int)
 * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
 */
function seed(seedValue) {
    alphabet_1.seed(seedValue);
    return module.exports;
}

/**
 * Set the cluster worker or machine id
 * exposed as shortid.worker(int)
 * @param workerId worker must be positive integer.  Number less than 16 is recommended.
 * returns shortid module so it can be chained.
 */
function worker(workerId) {
    clusterWorkerId = workerId;
    return module.exports;
}

/**
 *
 * sets new characters to use in the alphabet
 * returns the shuffled alphabet
 */
function characters(newCharacters) {
    if (newCharacters !== undefined) {
        alphabet_1.characters(newCharacters);
    }

    return alphabet_1.shuffled();
}

/**
 * Generate unique id
 * Returns string id
 */
function generate() {
  return build_1(clusterWorkerId);
}

// Export all other functions as properties of the generate function
module.exports = generate;
module.exports.generate = generate;
module.exports.seed = seed;
module.exports.worker = worker;
module.exports.characters = characters;
module.exports.decode = decode_1;
module.exports.isValid = isValid;
});
lib.generate;
lib.seed;
lib.worker;
lib.characters;
lib.decode;
lib.isValid;

var shortid = lib;

const T42JumpListAction = "T42.JumpList.Action";
class JumpListManager {
    constructor() {
        this._groupActionCallbacks = new Map();
        this._registered = false;
    }
    init(executor, agm, logger) {
        this._executor = executor;
        this._agm = agm;
        this._logger = logger;
        this.registerCallbackMethod();
    }
    setEnabled(windowId, enabled) {
        const settings = {
            enabled
        };
        return this._executor.updateJumpList(windowId, settings);
    }
    createCategory(windowId, title, actions) {
        this.validateActions(title, actions);
        const settings = {
            category: {
                title,
                operation: "create",
                actions: this.toUpdateActions(windowId, "create", title, actions)
            }
        };
        return this._executor.updateJumpList(windowId, settings);
    }
    removeCategory(windowId, title) {
        const settings = {
            category: {
                title,
                operation: "remove",
                actions: []
            }
        };
        this.manageActionCallback(windowId, settings.category.operation, title);
        return this._executor.updateJumpList(windowId, settings);
    }
    createActions(windowId, categoryTitle, actions) {
        this.validateActions(categoryTitle, actions);
        const settings = {
            category: {
                title: categoryTitle,
                operation: "update",
                actions: this.toUpdateActions(windowId, "create", categoryTitle, actions)
            }
        };
        return this._executor.updateJumpList(windowId, settings);
    }
    removeActions(windowId, categoryTitle, actions) {
        const settings = {
            category: {
                title: categoryTitle,
                operation: "update",
                actions: this.toUpdateActions(windowId, "remove", categoryTitle, actions)
            }
        };
        return this._executor.updateJumpList(windowId, settings);
    }
    async getActions(windowId, catgoryTitle) {
        const actions = [];
        const configuration = await this.getJumpListSettings(windowId);
        const currentCategory = configuration.categories.find((category) => category.title === catgoryTitle);
        if (currentCategory) {
            currentCategory.actions.forEach((action) => {
                const actionCallback = this.getActionCallback(action.callbackId);
                if (actionCallback) {
                    action.callback = actionCallback.callback;
                }
                actions.push({
                    icon: action.icon,
                    callback: action.callback,
                    singleInstanceTitle: action.singleInstanceTitle,
                    multiInstanceTitle: action.multiInstanceTitle
                });
            });
        }
        return Promise.resolve(actions);
    }
    getJumpListSettings(windowId) {
        return this._executor.getJumpList(windowId);
    }
    toUpdateActions(windowId, operation, categoryTitle, actions) {
        return actions.map((action) => {
            const updateAction = {
                icon: action.icon,
                callback: action.callback,
                callbackId: shortid.generate(),
                singleInstanceTitle: action.singleInstanceTitle,
                multiInstanceTitle: action.multiInstanceTitle,
                operation
            };
            this.manageActionCallback(windowId, operation, categoryTitle, updateAction);
            return updateAction;
        });
    }
    manageActionCallback(windowId, operation, categoryTitle, updateAction) {
        const groupCallbacksKey = `${categoryTitle}-${windowId}`;
        if (operation === "create") {
            if (!this._groupActionCallbacks.has(groupCallbacksKey)) {
                this._groupActionCallbacks.set(groupCallbacksKey, []);
            }
            const categoryActionCallbacks = this._groupActionCallbacks.get(groupCallbacksKey);
            categoryActionCallbacks.push({
                callbackId: updateAction.callbackId,
                callback: updateAction.callback
            });
        }
        else if (operation === "remove") {
            if (updateAction) {
                let categoryActionCallbacks = this._groupActionCallbacks.get(groupCallbacksKey);
                categoryActionCallbacks = categoryActionCallbacks.filter((accCal) => accCal.callbackId !== updateAction.callbackId);
                if (categoryActionCallbacks.length === 0) {
                    this._groupActionCallbacks.delete(groupCallbacksKey);
                }
                else {
                    this._groupActionCallbacks.set(groupCallbacksKey, categoryActionCallbacks);
                }
            }
            else {
                this._groupActionCallbacks.delete(groupCallbacksKey);
            }
        }
    }
    registerCallbackMethod() {
        if (this._registered) {
            return;
        }
        this._registered = true;
        try {
            this._agm.register(T42JumpListAction, (args, caller) => {
                const actionCallback = this.getActionCallback(args.callbackId);
                if (actionCallback) {
                    try {
                        actionCallback.callback();
                    }
                    catch (e) {
                        this._logger.error("Unable to execute user callback for jump list action!", e);
                    }
                }
            });
        }
        catch (e) {
            this._logger.error(`Unable to register method ${T42JumpListAction} for invoking jump list action callbacks!`, e);
            return Promise.reject(e);
        }
    }
    getActionCallback(callbackId) {
        let callbackAction;
        [...this._groupActionCallbacks.values()].forEach((callbacks) => {
            const callback = callbacks.find((cal) => cal.callbackId === callbackId);
            if (callback) {
                callbackAction = callback;
            }
        });
        return callbackAction;
    }
    validateActions(category, actions) {
        if (!(actions && actions.length > 0)) {
            throw new Error(`Category '${category}' doesn't contain any actions!`);
        }
        actions.forEach((action) => {
            if (!action.singleInstanceTitle) {
                throw new Error(`Category '${category}' contains an action with undefined singleInstanceTitle!`);
            }
            if (!action.multiInstanceTitle) {
                throw new Error(`Category '${category}' contains an action with undefined multiInstanceTitle!`);
            }
            if (!action.callback) {
                throw new Error(`Category '${category}' contains an action with undefined callback function!`);
            }
        });
    }
}
var jumpListManager = new JumpListManager();

class WindowStore {
    constructor() {
        this.waitForTimeoutInMilliseconds = 60000;
        this._windows = {};
        this._pendingWindows = {};
        this._pendingWindowsStates = {};
        this._registry = lib$1();
    }
    init(logger) {
        this._logger = logger;
    }
    get(id) {
        return this._windows[id] || this._pendingWindows[id];
    }
    getIfReady(id) {
        return this._windows[id];
    }
    get list() {
        return this._windows;
    }
    add(window) {
        const isExist = this._pendingWindows[window.API.id] ? true : false;
        if (isExist) {
            this._logger.error(`trying to add window with id ${window.API.id} from windowStore, which already exists`);
            return;
        }
        const remote = window.API.windowType === "remote";
        this._pendingWindows[window.API.id] = window;
        this._pendingWindowsStates[window.API.id] = {
            ready: false,
            urlChanged: remote,
        };
        this._registry.execute("on-added", window);
    }
    remove(window) {
        delete this._windows[window.API.id];
        delete this._pendingWindows[window.API.id];
        delete this._pendingWindowsStates[window.API.id];
        this._registry.execute("on-removed", window);
    }
    setReadyState(windowId) {
        const targetWindowState = this._pendingWindowsStates[windowId];
        if (typeof targetWindowState === "undefined") {
            return;
        }
        targetWindowState.ready = true;
        if (targetWindowState.urlChanged) {
            this.markReadyToShow(windowId);
        }
    }
    setUrlChangedState(windowId) {
        const targetWindowState = this._pendingWindowsStates[windowId];
        if (typeof targetWindowState === "undefined") {
            return;
        }
        targetWindowState.urlChanged = true;
        if (targetWindowState.ready) {
            this.markReadyToShow(windowId);
        }
    }
    waitFor(id) {
        return new Promise((resolve, reject) => {
            let un;
            const timeout = setTimeout(() => {
                un();
                reject("waitFor timed out.");
            }, this.waitForTimeoutInMilliseconds);
            const win = this._windows[id];
            if (win) {
                clearTimeout(timeout);
                resolve(win);
            }
            else {
                un = this.onReadyWindow((w) => {
                    if (w.API.id !== id) {
                        return;
                    }
                    clearTimeout(timeout);
                    un();
                    resolve(w);
                });
            }
        });
    }
    onReadyWindow(callback) {
        return this._registry.add("on-ready", callback);
    }
    onAdded(callback) {
        return this._registry.add("on-added", callback);
    }
    onRemoved(callback) {
        return this._registry.add("on-removed", callback);
    }
    markReadyToShow(windowId) {
        if (this._pendingWindows[windowId]) {
            this._windows[windowId] = this._pendingWindows[windowId];
            delete this._pendingWindows[windowId];
            delete this._pendingWindowsStates[windowId];
        }
        this._registry.execute("on-ready", this._windows[windowId]);
    }
}
var windowStore = new WindowStore();

class Utils {
    static getGDMajorVersion() {
        if (typeof window === "undefined") {
            return -1;
        }
        if (!window.glueDesktop) {
            return -1;
        }
        if (!window.glueDesktop.version) {
            return -1;
        }
        const ver = Number(window.glueDesktop.version.substr(0, 1));
        return isNaN(ver) ? -1 : ver;
    }
    static callbackifyPromise(action, successCallback, errorCallback) {
        const fail = (error) => {
            let msg = error;
            if (error instanceof Error) {
                msg = error.message;
            }
            if (typeof errorCallback === "function") {
                errorCallback(msg);
                return;
            }
            return Promise.reject(msg);
        };
        try {
            return action()
                .then((result) => {
                if (typeof successCallback === "function") {
                    successCallback(result);
                }
                return result;
            })
                .catch((error) => {
                return fail(error);
            });
        }
        catch (err) {
            return fail(err);
        }
    }
    static getMonitor(bounds, displays) {
        const monitorsSortedByOverlap = displays.map((m) => {
            const { left, top, workingAreaWidth: width, workingAreaHeight: height } = m;
            const overlap = this.calculateTotalOverlap({ left, top, width, height }, bounds);
            return {
                monitor: m,
                totalOverlap: overlap
            };
        }).sort((a, b) => b.totalOverlap - a.totalOverlap);
        return monitorsSortedByOverlap[0].monitor;
    }
    static getDisplayCenterOfScreen(a, currentDisplay, primaryDisplay) {
        const physicalWidth = a.width / currentDisplay.scaleFactor;
        const physicalHeight = a.height / currentDisplay.scaleFactor;
        const physicalDisplayLeft = currentDisplay.workArea.left / primaryDisplay.scaleFactor;
        const physicalDisplayTop = currentDisplay.workArea.top / primaryDisplay.scaleFactor;
        const physicalDisplayWidth = currentDisplay.workArea.width / currentDisplay.scaleFactor;
        const physicalDisplayHeight = currentDisplay.workArea.height / currentDisplay.scaleFactor;
        const physicalHOffset = Math.max((physicalDisplayWidth - physicalWidth) / 2, 0);
        const physicalVOffset = Math.max((physicalDisplayHeight - physicalHeight) / 2, 0);
        const centeredPhysicalLeft = Math.floor(physicalDisplayLeft + physicalHOffset);
        const centeredPhysicalTop = Math.floor(physicalDisplayTop + physicalVOffset);
        const left = centeredPhysicalLeft * primaryDisplay.scaleFactor;
        const top = centeredPhysicalTop * primaryDisplay.scaleFactor;
        return {
            left,
            top,
            width: a.width,
            height: a.height
        };
    }
    static isNode() {
        if (typeof Utils._isNode !== "undefined") {
            return Utils._isNode;
        }
        if (typeof window !== "undefined") {
            Utils._isNode = false;
            return false;
        }
        try {
            Utils._isNode = Object.prototype.toString.call(global.process) === "[object process]";
        }
        catch (e) {
            Utils._isNode = false;
        }
        return Utils._isNode;
    }
    static calculateTotalOverlap(r1, r2) {
        const r1x = r1.left;
        const r1y = r1.top;
        const r1xMax = r1x + r1.width;
        const r1yMax = r1y + r1.height;
        const r2x = r2.left;
        const r2y = r2.top;
        const r2xMax = r2x + r2.width;
        const r2yMax = r2y + r2.height;
        const xOverlap = Math.max(0, Math.min(r1xMax, r2xMax) - Math.max(r1x, r2x));
        const yOverlap = Math.max(0, Math.min(r1yMax, r2yMax) - Math.max(r1y, r2y));
        return xOverlap * yOverlap;
    }
}

class JumpListActions {
    constructor(windowId, configuration) {
        this.windowId = windowId;
        this._categoryTitle = configuration.title;
    }
    list() {
        return jumpListManager.getActions(this.windowId, this._categoryTitle);
    }
    create(actions) {
        return jumpListManager.createActions(this.windowId, this._categoryTitle, actions);
    }
    remove(actions) {
        return jumpListManager.removeActions(this.windowId, this._categoryTitle, actions);
    }
}

class JumpListCategories {
    constructor(windowId) {
        this.windowId = windowId;
    }
    list() {
        return this.getCategories();
    }
    create(title, actions) {
        return jumpListManager.createCategory(this.windowId, title, actions);
    }
    remove(title) {
        return jumpListManager.removeCategory(this.windowId, title);
    }
    async find(title) {
        const categories = await this.getCategories();
        return categories.find((cat) => cat.title === title);
    }
    async getCategories() {
        const result = [];
        const configuration = await jumpListManager.getJumpListSettings(this.windowId);
        configuration.categories.forEach((category) => {
            result.push({
                title: category.title,
                actions: new JumpListActions(this.windowId, category)
            });
        });
        return result;
    }
}

class JumpList {
    constructor(windowId) {
        this.windowId = windowId;
        this._categories = new JumpListCategories(windowId);
    }
    get categories() {
        return this._categories;
    }
    async isEnabled() {
        const configuration = await jumpListManager.getJumpListSettings(this.windowId);
        return configuration.enabled;
    }
    setEnabled(enabled) {
        return jumpListManager.setEnabled(this.windowId, enabled);
    }
}

var windowFactory = (id, options, executor, logger, appManagerGetter, displayAPIGetter, channelsAPIGetter, agm) => {
    var _a, _b, _c, _d;
    const _registry = lib$1();
    const _logger = logger.subLogger(`window ${id}`);
    const getChannels = () => {
        const channels = channelsAPIGetter();
        if (!channels) {
            throw new Error(`To use this method you need to enable channels API - set the channels property to true when initializing the Glue42 library`);
        }
        return channels;
    };
    let resultWindow;
    const _id = id;
    const _name = options.name;
    const _mode = options.mode;
    let _bounds = options.bounds;
    let _url = options.url;
    let _title = options.title;
    let _context = (_a = options.context) !== null && _a !== void 0 ? _a : {};
    let _frameColor = options.frameColor;
    let _focus = options.focus;
    let _neighbours = (_b = options.neighbours) !== null && _b !== void 0 ? _b : {};
    let _groupId = options.groupId;
    let _isGroupHeaderVisible = options.isGroupHeaderVisible;
    let _isTabHeaderVisible = options.isTabHeaderVisible;
    let _isTabSelected = (_c = options.isTabSelected) !== null && _c !== void 0 ? _c : false;
    let _settings = options.settings;
    const _applicationName = options.applicationName;
    let _isVisible = options.isVisible;
    let _isSticky = options.isSticky;
    let _isCollapsed = options.isCollapsed;
    let _windowState = options.state;
    let _tabGroupId = options.tabGroupId;
    let _tabIndex = options.tabIndex;
    let _frameId = options.frameId;
    let _isLocked = options.isLocked;
    let _group;
    let _frameButtons = (_d = options.frameButtons) !== null && _d !== void 0 ? _d : [];
    let _zoomFactor = options.zoomFactor;
    let _placementSettings = options.placementSettings;
    const _jumpList = new JumpList(id);
    function close(success, error) {
        return Utils.callbackifyPromise(() => {
            if (!id) {
                throw new Error("The window is already closed.");
            }
            return executor.close(resultWindow);
        }, success, error);
    }
    function navigate(newUrl, optionsOrCallback, error) {
        if (typeof optionsOrCallback === "function") {
            return Utils.callbackifyPromise(() => {
                if (isNullOrWhiteSpace(newUrl)) {
                    throw new Error("The new URL must be a non-empty string.");
                }
                return executor.navigate(resultWindow, newUrl);
            }, optionsOrCallback, error);
        }
        if (isNullOrWhiteSpace(newUrl)) {
            throw new Error("The new URL must be a non-empty string.");
        }
        return executor.navigate(resultWindow, newUrl, optionsOrCallback);
    }
    function setStyle(style, success, error) {
        return Utils.callbackifyPromise(() => {
            if (!style || Object.keys(style).length === 0 || Object.keys(style).every((key) => !key)) {
                throw new Error("Invalid style arguments: " + JSON.stringify(style));
            }
            if (style && style.focus !== undefined) {
                if (typeof style.focus !== "boolean") {
                    throw new Error("Focus must be a boolean value. Currently, only `focus: true` is supported.");
                }
                else if (style.focus === false) {
                    _logger.warn("`focus: false` is not supported!");
                }
            }
            if (style && style.hidden !== undefined && typeof style.hidden !== "boolean") {
                throw new Error("The `hidden` property must hold a boolean value.");
            }
            for (const prop of ["minHeight", "maxHeight", "minWidth", "maxWidth"]) {
                const styleAsAny = style;
                const value = styleAsAny[prop];
                if (prop in style) {
                    if (isUndefinedOrNull(value)) {
                        delete styleAsAny[prop];
                        continue;
                    }
                    if (!isNumber(styleAsAny[prop])) {
                        throw new Error(`"${prop}" must be a number`);
                    }
                }
            }
            return executor.setStyle(resultWindow, style);
        }, success, error);
    }
    function resetButtons(buttons, success, error) {
        return Utils.callbackifyPromise(() => executor.resetButtons(resultWindow, buttons), success, error);
    }
    function setOnTop(onTop, success, error) {
        return Utils.callbackifyPromise(() => {
            if (typeof onTop !== "boolean") {
                throw new Error("`onTop` must hold a boolean value.");
            }
            return executor.setOnTop(resultWindow, onTop);
        }, success, error);
    }
    function setSizeConstraints(constraints, success, error) {
        return Utils.callbackifyPromise(() => {
            if (!constraints || Object.keys(constraints).every((value) => value === undefined)) {
                throw new Error("The properties of `constraints` cannot be null or undefined.");
            }
            return executor.setSizeConstraints(resultWindow, constraints);
        }, success, error);
    }
    function setTitle(newTitle, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isUndefinedOrNull(newTitle)) {
                throw new Error("`newTitle` must not be null or undefined.");
            }
            if (newTitle === _title) {
                return Promise.resolve(resultWindow);
            }
            return executor.setTitle(resultWindow, newTitle);
        }, success, error);
    }
    function setSticky(isSticky, success, error) {
        return Utils.callbackifyPromise(() => {
            if (typeof isSticky !== "boolean") {
                throw new Error("`isSticky` must hold a boolean value.");
            }
            return executor.setSticky(resultWindow, isSticky);
        }, success, error);
    }
    function moveResize(bounds, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isUndefinedOrNull(bounds)) {
                throw new Error("The properties of `bounds` cannot be null or undefined.");
            }
            return executor.moveResize(resultWindow, bounds);
        }, success, error);
    }
    function addFrameButton(buttonInfo, success, error) {
        return Utils.callbackifyPromise(() => {
            if (typeof buttonInfo === "undefined" || Object.keys(buttonInfo).length === 0) {
                throw new Error("Button info is not available.");
            }
            if (isNullOrWhiteSpace(buttonInfo.buttonId)) {
                throw new Error("`buttonId` must not be null or undefined.");
            }
            if (isNullOrWhiteSpace(buttonInfo.imageBase64)) {
                throw new Error("`imageBase64` must not be null or undefined.");
            }
            return executor.addFrameButton(resultWindow, buttonInfo);
        }, success, error);
    }
    function removeFrameButton(buttonId, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isNullOrWhiteSpace(buttonId)) {
                throw new Error("`buttonId` must not be null or undefined.");
            }
            return executor.removeFrameButton(resultWindow, buttonId);
        }, success, error);
    }
    function activate(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_focus) {
                return Promise.resolve(resultWindow);
            }
            return executor.activate(resultWindow);
        }, success, error);
    }
    function focus(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_focus) {
                return Promise.resolve(resultWindow);
            }
            return executor.focus(resultWindow);
        }, success, error);
    }
    function maximizeRestore(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.maximizeRestore(resultWindow);
        }, success, error);
    }
    function maximize(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_windowState === "maximized") {
                return Promise.resolve(resultWindow);
            }
            return executor.maximize(resultWindow);
        }, success, error);
    }
    function restore(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_windowState === "normal") {
                return Promise.resolve(resultWindow);
            }
            return executor.restore(resultWindow);
        }, success, error);
    }
    function minimize(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_windowState === "minimized") {
                return Promise.resolve(resultWindow);
            }
            return executor.minimize(resultWindow);
        }, success, error);
    }
    function collapse(success, error) {
        return Utils.callbackifyPromise(() => {
            if (_isCollapsed) {
                return Promise.resolve(resultWindow);
            }
            return executor.collapse(resultWindow);
        }, success, error);
    }
    function expand(success, error) {
        return Utils.callbackifyPromise(() => {
            if (!_isCollapsed) {
                return Promise.resolve(resultWindow);
            }
            return executor.expand(resultWindow);
        }, success, error);
    }
    function toggleCollapse(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.toggleCollapse(resultWindow);
        }, success, error);
    }
    function snap(target, direction, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isUndefinedOrNull(target)) {
                throw new Error(`A target window is not specified - ${target}`);
            }
            if (typeof target === "string") {
                const win = windowStore.get(target);
                if (!win) {
                    throw new Error(`Invalid "target" parameter or no such window. Invoked with: ${target}`);
                }
                target = win.API;
            }
            return executor.snap(resultWindow, target, direction);
        }, success, error);
    }
    function attachTab(tab, opt, success, error) {
        return Utils.callbackifyPromise(() => {
            var _a;
            const errorMessage = `Invalid "tab" parameter - must be an object with an "id" property or a string. Invoked for source window with ID:`;
            if (isUndefinedOrNull(tab)) {
                throw new Error(errorMessage + tab);
            }
            let sourceWindow;
            if (typeof tab === "string") {
                sourceWindow = (_a = windowStore.get(tab)) === null || _a === void 0 ? void 0 : _a.API;
                if (isUndefinedOrNull(sourceWindow)) {
                    throw new Error(errorMessage + sourceWindow);
                }
            }
            else if (!isUndefinedOrNull(tab.id)) {
                sourceWindow = tab;
            }
            else {
                throw new Error(errorMessage);
            }
            const attachOptions = {};
            if (!isUndefinedOrNull(opt)) {
                if (typeof opt === "number") {
                    attachOptions.index = opt;
                }
                else {
                    attachOptions.selected = opt.selected;
                    attachOptions.index = opt.index;
                }
            }
            return executor.attachTab(resultWindow, sourceWindow, attachOptions);
        }, success, error);
    }
    function detachTab(opt = {}, success, error) {
        return Utils.callbackifyPromise(() => {
            const argsForSend = {};
            function isDetachRelative(o) {
                return o.relativeTo !== undefined;
            }
            if (isDetachRelative(opt)) {
                if (typeof opt.relativeTo === "string") {
                    argsForSend.relativeTo = opt.relativeTo;
                }
                else if (!isUndefinedOrNull(opt.relativeTo.id)) {
                    argsForSend.relativeTo = opt.relativeTo.id;
                }
                if (!isUndefinedOrNull(opt.relativeDirection)) {
                    argsForSend.relativeDirection = opt.relativeDirection;
                }
                if (!isUndefinedOrNull(opt.width)) {
                    argsForSend.width = opt.width;
                }
                if (!isUndefinedOrNull(opt.height)) {
                    argsForSend.height = opt.height;
                }
            }
            else {
                if (!isUndefinedOrNull(opt.bounds)) {
                    argsForSend.bounds = opt.bounds;
                }
            }
            if (!isUndefinedOrNull(opt.hideTabHeader)) {
                argsForSend.hideTabHeader = opt.hideTabHeader;
            }
            return executor.detachTab(resultWindow, argsForSend);
        }, success, error);
    }
    function setVisible(toBeVisible, success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.setVisible(resultWindow, toBeVisible);
        }, success, error);
    }
    async function center(display) {
        const displayAPI = displayAPIGetter();
        const primaryDisplay = await displayAPI.getPrimary();
        const resultDisplay = await resultWindow.getDisplay();
        return moveResize(Utils.getDisplayCenterOfScreen(resultWindow.bounds, display || resultDisplay, primaryDisplay));
    }
    function showLoader(loader) {
        return executor.showLoader(resultWindow, loader);
    }
    function hideLoader() {
        return executor.hideLoader(resultWindow);
    }
    function updateContext(context, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isUndefinedOrNull(context)) {
                throw new Error(`"context" must not be null or undefined.`);
            }
            return executor.updateContext(resultWindow, context, false);
        }, success, error);
    }
    function lock(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.lock(resultWindow);
        }, success, error);
    }
    function unlock(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.unlock(resultWindow);
        }, success, error);
    }
    function getIcon(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.getIcon(resultWindow);
        }, success, error);
    }
    function setIcon(base64Image, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isNullOrWhiteSpace(base64Image)) {
                throw new Error(`"base64Image" must be a non-empty string.`);
            }
            return executor.setIcon(resultWindow, base64Image);
        }, success, error);
    }
    function setFrameColor(frameColor, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isNullOrWhiteSpace(frameColor)) {
                throw new Error(`"frameColor" must be a non-empty string`);
            }
            return executor.setFrameColor(resultWindow, frameColor);
        }, success, error);
    }
    function setTabHeaderVisible(toBeTabHeaderVisible, success, error) {
        return Utils.callbackifyPromise(() => {
            if (typeof toBeTabHeaderVisible !== "boolean") {
                throw new Error(`"toBeTabHeaderVisible" must hold a boolean value.`);
            }
            return executor.setTabHeaderVisible(resultWindow, toBeTabHeaderVisible);
        }, success, error);
    }
    async function setTabTooltip(tooltip) {
        if (isNullOrWhiteSpace(tooltip)) {
            throw new Error(`"${tooltip}" must not be null or undefined`);
        }
        return executor.setTabTooltip(resultWindow, tooltip);
    }
    function showPopup(config) {
        return executor.showPopup(resultWindow, config);
    }
    function createFlydown(config) {
        return executor.createFlydown(resultWindow.id, config);
    }
    function setModalState(isModal) {
        return executor.setModalState(resultWindow.id, isModal || false);
    }
    function zoomIn(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.zoomIn(resultWindow);
        }, success, error);
    }
    function zoomOut(success, error) {
        return Utils.callbackifyPromise(() => {
            return executor.zoomOut(resultWindow);
        }, success, error);
    }
    function setZoomFactor(zoomFactor, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isNaN(zoomFactor)) {
                throw new Error(`zoomFactor is not a number`);
            }
            return executor.setZoomFactor(resultWindow, zoomFactor);
        }, success, error);
    }
    function showDevTools() {
        return executor.showDevTools(resultWindow);
    }
    function capture(captureOptions) {
        return executor.capture(resultWindow, captureOptions);
    }
    function flash(suppliedOptions, mode) {
        const flashOptions = {
            shouldFlash: true,
            mode: "auto"
        };
        if (typeof suppliedOptions === "boolean") {
            flashOptions.shouldFlash = suppliedOptions;
        }
        if (typeof mode !== "undefined") {
            flashOptions.mode = mode;
        }
        return executor.flash(resultWindow, flashOptions);
    }
    function print(printOptions) {
        return executor.print(resultWindow, printOptions);
    }
    function printToPDF(printToPDFOptions) {
        return executor.printToPDF(resultWindow, printToPDFOptions);
    }
    function ungroup(ungroupOptions) {
        return new Promise((resolve, reject) => {
            const unGroupChanged = onGroupChanged((win, newGroup, oldGroup) => {
                if (id === win.id) {
                    unGroupChanged();
                    resolve(resultWindow);
                }
            });
            executor.ungroup(resultWindow, ungroupOptions)
                .catch((e) => {
                unGroupChanged();
                reject(e);
            });
        });
    }
    function place(placementSettings) {
        return executor.place(resultWindow, placementSettings);
    }
    function refresh(ignoreCache) {
        return executor.refresh(resultWindow, ignoreCache);
    }
    function download(url, opts) {
        return executor.download(resultWindow, url, opts);
    }
    function configure(settings) {
        return executor.configureWindow(resultWindow, settings);
    }
    function onTitleChanged(callback) {
        return onEventCore("onTitleChanged", callback, [resultWindow.title, resultWindow]);
    }
    function onClose(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback should be a function");
        }
        if (id === undefined) {
            callback(resultWindow);
        }
        return _registry.add("onClose", callback);
    }
    function onUrlChanged(callback) {
        return onEventCore("onUrlChanged", callback);
    }
    function onFrameButtonAdded(callback) {
        return onEventCore("onFrameButtonAdded", callback);
    }
    function onFrameButtonRemoved(callback) {
        return onEventCore("onFrameButtonRemoved", callback);
    }
    function onFrameButtonClicked(callback) {
        return onEventCore("onFrameButtonClicked", callback);
    }
    function onCollapsed(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback should be a function");
        }
        if (_isCollapsed) {
            callback(resultWindow);
        }
        return _registry.add("collapsed", callback);
    }
    function onExpanded(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback should be a function");
        }
        if (!_isCollapsed) {
            callback(resultWindow);
        }
        return _registry.add("expanded", callback);
    }
    function onMaximized(callback) {
        if (_windowState === "maximized") {
            return onEventCore("maximized", callback, [resultWindow]);
        }
        else {
            return onEventCore("maximized", callback);
        }
    }
    function onMinimized(callback) {
        if (_windowState === "minimized") {
            return onEventCore("minimized", callback, [resultWindow]);
        }
        else {
            return onEventCore("minimized", callback);
        }
    }
    function onNormal(callback) {
        if (_windowState === "normal") {
            return onEventCore("normal", callback, [resultWindow]);
        }
        else {
            return onEventCore("normal", callback);
        }
    }
    function onAttached(callback) {
        return onEventCore("attached", callback);
    }
    function onDetached(callback) {
        return onEventCore("detached", callback);
    }
    function onVisibilityChanged(callback) {
        return onEventCore("visibility-changed", callback);
    }
    function onContextUpdated(callback) {
        return onEventCore("context-updated", callback);
    }
    function onLockingChanged(callback) {
        return onEventCore("lock-changed", callback);
    }
    function onBoundsChanged(callback) {
        return onEventCore("bounds-changed", callback);
    }
    function onFocusChanged(callback) {
        return onEventCore("focus-changed", callback);
    }
    function onStickyChanged(callback) {
        return onEventCore("sticky-changed", callback);
    }
    function onFrameColorChanged(callback) {
        return onEventCore("frame-color-changed", callback);
    }
    function onTabHeaderVisibilityChanged(callback) {
        return onEventCore("tab-header-visibility-changed", callback);
    }
    function onWindowAttached(callback) {
        return onEventCore("window-attached", callback);
    }
    function onWindowDetached(callback) {
        return onEventCore("window-detached", callback);
    }
    function onGroupChanged(callback) {
        return onEventCore("group-changed", callback);
    }
    function onTabSelectionChanged(callback) {
        return onEventCore("tab-selection-changed", callback);
    }
    function onClosing(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback must be a function");
        }
        const callbackWrap = (success, error) => {
            const promise = callback();
            if (promise && promise.then) {
                promise.then(success).catch(error);
            }
            else {
                success();
            }
        };
        return executor.onClosing(callbackWrap, id);
    }
    function onRefreshing(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback must be a function");
        }
        const callbackWrap = (success, error, prevent) => {
            const promise = callback(prevent);
            if (promise && promise.then) {
                promise.then(success).catch(error);
            }
            else {
                success();
            }
        };
        return executor.onRefreshing(callbackWrap, id);
    }
    function onZoomFactorChanged(callback) {
        return onEventCore("zoom-factor-changed", callback);
    }
    function onPlacementSettingsChanged(callback) {
        return onEventCore("placementSettingsChanged", callback);
    }
    function onNeighboursChanged(callback) {
        return onEventCore("neighbours-changed", callback);
    }
    function onEventCore(key, callback, replayArguments) {
        if (!isFunction(callback)) {
            throw new Error("callback must be a function");
        }
        return _registry.add(key, callback, replayArguments);
    }
    function onNavigating(callback) {
        if (!isFunction(callback)) {
            throw new Error("callback must be a function");
        }
        const callbackWrap = (success, error, prevent, args) => {
            const promise = callback(args);
            if (promise && promise.then) {
                promise.then(success).catch(error);
            }
            else {
                success();
            }
        };
        return executor.onNavigating(callbackWrap, id);
    }
    function goBack() {
        return executor.goBack(resultWindow);
    }
    function goForward() {
        return executor.goForward(resultWindow);
    }
    function handleUpdate(updated) {
        _url = updated.url;
        _title = updated.title;
        _context = updated.context || {};
        _bounds = updated.bounds;
        _frameColor = updated.frameColor;
        _focus = updated.focus;
        _neighbours = updated.neighbours || {};
        _groupId = updated.groupId;
        _isGroupHeaderVisible = updated.isGroupHeaderVisible;
        _isTabHeaderVisible = updated.isTabHeaderVisible;
        _isTabSelected = updated.isTabSelected;
        _settings = updated.settings;
        _isVisible = updated.isVisible;
        _isSticky = updated.isSticky;
        _isCollapsed = updated.isCollapsed;
        _windowState = updated.state;
        _tabGroupId = updated.tabGroupId;
        _frameId = updated.frameId;
        _isLocked = updated.isLocked;
        _zoomFactor = updated.zoomFactor;
        _placementSettings = updated.placementSettings;
    }
    function handleTitleChanged(newTitle) {
        _title = newTitle;
        executor.finished
            .finally(() => {
            _registry.execute("onTitleChanged", newTitle, resultWindow);
        });
    }
    function handleUrlChanged(newUrl) {
        _url = newUrl;
        _registry.execute("onUrlChanged", newUrl, resultWindow);
    }
    function handleVisibilityChanged(isVisible) {
        if (isVisible === _isVisible) {
            return;
        }
        _isVisible = isVisible;
        _registry.execute("visibility-changed", resultWindow);
    }
    function handleWindowSettingsChanged(settings) {
        _settings = settings;
        _registry.execute("settings-changed", resultWindow);
    }
    function handleContextUpdated(context) {
        _context = context;
        _registry.execute("context-updated", _context, resultWindow);
    }
    function handleWindowClose() {
        if (id === undefined) {
            return;
        }
        _registry.execute("onClose", resultWindow);
        id = undefined;
    }
    function handleFrameButtonAdded(frameButton) {
        const buttonObj = ["buttonId", "imageBase64", "order", "tooltip"].reduce((memo, k) => {
            memo[k] = frameButton[k];
            return memo;
        }, {});
        const frameButtonsIds = _frameButtons.map((btn) => {
            return btn.buttonId;
        });
        if (frameButtonsIds.indexOf(frameButton.buttonId) === -1) {
            _frameButtons.push(buttonObj);
        }
        _registry.execute("onFrameButtonAdded", buttonObj, resultWindow);
    }
    function handleFrameButtonRemoved(frameButtonId) {
        let button;
        _frameButtons = _frameButtons.reduce((memo, btn) => {
            if (btn.buttonId === frameButtonId) {
                button = btn;
            }
            else {
                memo.push(btn);
            }
            return memo;
        }, []);
        if (button !== undefined) {
            _registry.execute("onFrameButtonRemoved", button, resultWindow);
        }
    }
    function handleFrameButtonClicked(frameButton) {
        const button = _frameButtons.filter((btn) => {
            return btn.buttonId === frameButton.buttonId;
        });
        if (button.length > 0) {
            _registry.execute("onFrameButtonClicked", button[0], resultWindow);
        }
    }
    async function handleWindowChangeState(state) {
        if (state === "collapsed") {
            _isCollapsed = true;
        }
        else if (state === "expanded") {
            _isCollapsed = false;
        }
        else {
            _windowState = state;
        }
        await executor.finished;
        _registry.execute(state, resultWindow);
    }
    function handleFrameIsLockedChanged(isLocked) {
        _isLocked = isLocked;
        _registry.execute("lock-changed", resultWindow);
    }
    function handleBoundsChanged(bounds) {
        if (_bounds.top === bounds.top && _bounds.left === bounds.left && _bounds.width === bounds.width && _bounds.height === bounds.height) {
            return;
        }
        _bounds = bounds;
        _registry.execute("bounds-changed", resultWindow);
    }
    function handleFocusChanged(isFocused) {
        _focus = isFocused;
        _registry.execute("focus-changed", resultWindow);
    }
    function handleIsStickyChanged(isSticky) {
        _isSticky = isSticky;
        _registry.execute("sticky-changed", isSticky, resultWindow);
    }
    function handleFrameColorChanged(frameColor) {
        _frameColor = frameColor;
        _registry.execute("frame-color-changed", resultWindow);
    }
    function handleFrameAttached(tabGroupId, frameId, isTabHeaderVisible) {
        _tabGroupId = tabGroupId;
        _frameId = frameId;
        _isTabHeaderVisible = isTabHeaderVisible;
        _registry.execute("frame-attached", resultWindow);
    }
    function handleCompositionChanged(state) {
        _neighbours = state.neighbors || {};
        _tabIndex = state.index;
        _registry.execute("neighbours-changed", _neighbours, resultWindow);
    }
    function handleGroupHeaderVisibilityChanged(isGroupHeaderVisible) {
        _isGroupHeaderVisible = isGroupHeaderVisible;
    }
    function handleTabHeaderVisibilityChanged(isTabHeaderVisible) {
        if (_isTabHeaderVisible !== isTabHeaderVisible) {
            _isTabHeaderVisible = isTabHeaderVisible;
            _registry.execute("tab-header-visibility-changed", resultWindow);
        }
    }
    async function handleFrameSelectionChanged(newWindow, prevWindow) {
        let selectedWindow;
        if (newWindow === id) {
            _isTabSelected = true;
            selectedWindow = resultWindow;
        }
        else {
            _isTabSelected = false;
            selectedWindow = windowStore.get(newWindow) ? windowStore.get(newWindow).API : undefined;
        }
        const previousWindow = windowStore.get(prevWindow) ? windowStore.get(prevWindow).API : undefined;
        await executor.finished;
        _registry.execute("tab-selection-changed", selectedWindow, previousWindow, resultWindow);
    }
    async function handleAttached(newTabGroupId, newFrameId, tabHeaderVisible, isLocked, winsToBeNotified) {
        _tabGroupId = newTabGroupId;
        _isTabHeaderVisible = tabHeaderVisible;
        _frameId = newFrameId;
        if (typeof isLocked !== "undefined") {
            _isLocked = isLocked;
        }
        await executor.finished;
        winsToBeNotified.forEach((w) => {
            w.Events.handleWindowAttached(resultWindow);
        });
        _registry.execute("attached", resultWindow);
    }
    function handleWindowAttached(win) {
        _registry.execute("window-attached", win);
    }
    async function handleDetached(isLocked, winsToBeNotified) {
        _tabGroupId = undefined;
        _isTabSelected = false;
        if (typeof isLocked !== "undefined") {
            _isLocked = isLocked;
        }
        await executor.finished;
        winsToBeNotified.forEach((w) => {
            w.Events.handleWindowDetached(resultWindow);
        });
        _registry.execute("detached", resultWindow);
    }
    function handleWindowDetached(win) {
        _registry.execute("window-detached", win);
    }
    function handleZoomFactorChanged(zoomFactor) {
        _zoomFactor = zoomFactor;
        _registry.execute("zoom-factor-changed", resultWindow);
    }
    function handlePlacementSettingsChanged(placementSettings) {
        let promise;
        const copy = placementSettings;
        if (!copy.display) {
            promise = Promise.resolve(undefined);
        }
        else {
            const displayAPI = displayAPIGetter();
            if (!displayAPI) {
                promise = Promise.resolve(undefined);
            }
            else {
                const index = copy.display - 1;
                promise = new Promise((resolve, reject) => {
                    displayAPI.all().then((displays) => {
                        const display = displays.find((d) => d.index === index);
                        resolve(display);
                    }).catch(reject);
                });
            }
        }
        promise.then((d) => {
            copy.display = d;
            _placementSettings = copy;
            _registry.execute("placementSettingsChanged", resultWindow);
        });
    }
    function handleGroupChanged(newGroup, oldGroup) {
        _group = newGroup;
        _groupId = newGroup === null || newGroup === void 0 ? void 0 : newGroup.id;
        if (!isUndefinedOrNull(newGroup) && !isUndefinedOrNull(oldGroup)) {
            _registry.execute("group-changed", resultWindow, newGroup, oldGroup);
        }
    }
    function getAllTabs() {
        const allWindows = windowStore.list;
        if (_mode.toLowerCase() !== "tab") {
            return [];
        }
        const tabs = Object.keys(allWindows).reduce((memo, win) => {
            const window = allWindows[win];
            if (window
                && window.API.tabGroupId
                && typeof window.API.tabGroupId !== "undefined"
                && typeof resultWindow.tabGroupId !== "undefined"
                && window.API.tabGroupId === resultWindow.tabGroupId) {
                memo.push(window.API);
            }
            return memo;
        }, []);
        return tabs.sort((w1, w2) => {
            if (w1.tabIndex !== w2.tabIndex) {
                if (w1.tabIndex === -1) {
                    return Number.MAX_SAFE_INTEGER;
                }
                if (w2.tabIndex === -1) {
                    return Number.MIN_SAFE_INTEGER;
                }
            }
            return w1.tabIndex - w2.tabIndex;
        });
    }
    function mapWindowIdsToWindowObjects(windowIdArr) {
        return windowIdArr.reduce((memo, winId) => {
            const window = windowStore.get(winId);
            if (window) {
                memo.push(window.API);
            }
            return memo;
        }, []);
    }
    function getNeighboursByDirection(direction) {
        const windowIds = _neighbours[direction];
        if (typeof windowIds !== "undefined") {
            return mapWindowIdsToWindowObjects(windowIds);
        }
    }
    function getApplicationName() {
        var _a;
        if (_applicationName) {
            return _applicationName;
        }
        if (_context._APPLICATION_NAME) {
            return _context._APPLICATION_NAME;
        }
        if (_context && _context._t42 && _context._t42.application) {
            return _context._t42.application;
        }
        const info = getWindowInfo();
        if (info && info.applicationName) {
            return info.applicationName;
        }
        const appManager = appManagerGetter();
        if (appManager) {
            const instance = appManager.instances().find((i) => id === i.id);
            if (instance) {
                return (_a = instance.application) === null || _a === void 0 ? void 0 : _a.name;
            }
        }
        return undefined;
    }
    function getWindowInfo() {
        if (typeof window !== "undefined" && window.glue42gd && window.glue42gd.getWindowInfo) {
            const info = window.glue42gd.getWindowInfo(id);
            if (!info) {
                return undefined;
            }
            else {
                return info;
            }
        }
    }
    resultWindow = {
        get id() {
            return _id;
        },
        get name() {
            return _name;
        },
        get application() {
            const appManager = appManagerGetter();
            const appName = getApplicationName();
            if (appName && appManager) {
                return appManager.application(appName);
            }
        },
        get hostInstance() {
            return executor.hostInstance;
        },
        get agmInstance() {
            if (typeof window !== "undefined" && window.glue42gd) {
                return agm.servers().find((s) => s.windowId === this.id);
            }
            const appName = getApplicationName();
            return appName ? { application: appName } : undefined;
        },
        get url() {
            return _url;
        },
        get title() {
            return _title;
        },
        get windowStyleAttributes() {
            return _settings;
        },
        get settings() {
            return _settings;
        },
        get tabGroupId() {
            return _mode.toLowerCase() === "tab" ? _tabGroupId : undefined;
        },
        get tabIndex() {
            return _mode.toLowerCase() === "tab" ? _tabIndex : undefined;
        },
        get frameId() {
            return _frameId;
        },
        get frameButtons() {
            return _frameButtons;
        },
        get mode() {
            return _mode;
        },
        get state() {
            return _windowState;
        },
        get isCollapsed() {
            return _isCollapsed;
        },
        get isVisible() {
            return _isVisible;
        },
        get isLocked() {
            return _isLocked;
        },
        get context() {
            return _context;
        },
        get bounds() {
            return _bounds;
        },
        get minHeight() {
            return _settings.minHeight;
        },
        get maxHeight() {
            return _settings.maxHeight;
        },
        get minWidth() {
            return _settings.minWidth;
        },
        get maxWidth() {
            return _settings.maxWidth;
        },
        get isFocused() {
            return _focus;
        },
        get frameColor() {
            return _frameColor;
        },
        get opened() {
            return resultWindow.id !== undefined;
        },
        get group() {
            return _group;
        },
        get groupId() {
            return _groupId;
        },
        get isSticky() {
            return _isSticky;
        },
        get topNeighbours() {
            return getNeighboursByDirection("top");
        },
        get leftNeighbours() {
            return getNeighboursByDirection("left");
        },
        get rightNeighbours() {
            return getNeighboursByDirection("right");
        },
        get bottomNeighbours() {
            return getNeighboursByDirection("bottom");
        },
        get isGroupHeaderVisible() {
            return _isGroupHeaderVisible;
        },
        get activityId() {
            if (_context._t42) {
                return _context._t42.activityId;
            }
            const info = getWindowInfo();
            if (!info) {
                return undefined;
            }
            return info.activityId;
        },
        get activityWindowId() {
            if (_context._t42) {
                return _context._t42.activityWindowId;
            }
            const info = getWindowInfo();
            if (!info) {
                return undefined;
            }
            return info.activityWindowId;
        },
        get windowType() {
            return options.windowType || "electron";
        },
        get zoomFactor() {
            return _zoomFactor;
        },
        get screen() {
            if (typeof window !== "undefined" && window.glue42gd) {
                return Utils.getMonitor(resultWindow.bounds, window.glue42gd.monitors);
            }
            return undefined;
        },
        get placementSettings() {
            return Object.assign({}, _placementSettings);
        },
        get jumpList() {
            return _jumpList;
        },
        maximize,
        restore,
        minimize,
        maximizeRestore,
        collapse,
        expand,
        toggleCollapse,
        focus,
        activate,
        moveResize,
        setTitle,
        setStyle,
        setOnTop,
        resetButtons,
        setSizeConstraints,
        navigate,
        addFrameButton,
        removeFrameButton,
        setVisible,
        show: () => setVisible(true),
        hide: () => setVisible(false),
        center,
        close,
        snap,
        showLoader,
        hideLoader,
        updateContext,
        lock,
        unlock,
        getIcon,
        setIcon,
        setFrameColor,
        setTabTooltip,
        attachTab,
        detachTab,
        setTabHeaderVisible,
        showPopup,
        createFlydown,
        setModalState,
        setZoomFactor,
        zoomIn,
        zoomOut,
        showDevTools,
        capture,
        flash,
        setSticky,
        print,
        printToPDF,
        place,
        ungroup,
        refresh,
        goBack,
        goForward,
        download,
        configure,
        getChannel: async () => {
            var _a;
            const wins = await getChannels().getWindowsWithChannels({ windowIds: [_id] });
            return (_a = wins[0]) === null || _a === void 0 ? void 0 : _a.channel;
        },
        onClose,
        onUrlChanged,
        onTitleChanged,
        onFrameButtonAdded,
        onFrameButtonRemoved,
        onFrameButtonClicked,
        onCollapsed,
        onExpanded,
        onMinimized,
        onMaximized,
        onNormal,
        onAttached,
        onDetached,
        onVisibilityChanged,
        onContextUpdated,
        onLockingChanged,
        onBoundsChanged,
        onFrameColorChanged,
        onFocusChanged,
        onStickyChanged,
        onGroupChanged,
        onWindowAttached,
        onWindowDetached,
        onTabSelectionChanged,
        onTabHeaderVisibilityChanged,
        onClosing,
        onRefreshing,
        onZoomFactorChanged,
        onPlacementSettingsChanged,
        onNeighboursChanged,
        onNavigating,
        get tabs() {
            return getAllTabs();
        },
        get isTabHeaderVisible() {
            return _isTabHeaderVisible;
        },
        get isTabSelected() {
            return _isTabSelected;
        },
        getURL() {
            return Promise.resolve(_url);
        },
        getTitle() {
            return Promise.resolve(_title);
        },
        getBounds() {
            return Promise.resolve(_bounds);
        },
        getContext() {
            return Promise.resolve(_context);
        },
        setContext(context) {
            if (isUndefinedOrNull(context)) {
                throw new Error(`"context" must not be null or undefined, set to empty object if you want to clear it out.`);
            }
            return executor.updateContext(resultWindow, context, true);
        },
        getDisplay() {
            const displayAPI = displayAPIGetter();
            return displayAPI.getByWindowId(id);
        },
        resizeTo(width, height) {
            return moveResize({ width, height });
        },
        moveTo(top, left) {
            return moveResize({ top, left });
        },
        async getParentWindow() {
            var _a;
            const myParentId = _settings.parentInstanceId;
            if (!myParentId) {
                return undefined;
            }
            return (_a = windowStore.list[myParentId]) === null || _a === void 0 ? void 0 : _a.API;
        },
        async getChildWindows() {
            return Object.keys(windowStore.list)
                .map((key) => windowStore.list[key].API)
                .filter((w) => {
                const parentId = w.settings.parentInstanceId;
                return parentId === id;
            });
        },
        joinChannel: (name) => {
            return getChannels().join(name, id);
        },
        leaveChannel: () => {
            return getChannels().leave(id);
        }
    };
    const events = {
        handleUpdate,
        handleWindowClose,
        handleWindowChangeState,
        handleTitleChanged,
        handleVisibilityChanged,
        handleUrlChanged,
        handleWindowSettingsChanged,
        handleContextUpdated,
        handleFrameIsLockedChanged,
        handleBoundsChanged,
        handleFocusChanged,
        handleFrameButtonAdded,
        handleFrameButtonRemoved,
        handleFrameButtonClicked,
        handleFrameColorChanged,
        handleFrameAttached,
        handleFrameSelectionChanged,
        handleCompositionChanged,
        handleGroupHeaderVisibilityChanged,
        handleTabHeaderVisibilityChanged,
        handleGroupChanged,
        handleAttached,
        handleDetached,
        handleWindowAttached,
        handleWindowDetached,
        handleZoomFactorChanged,
        handleIsStickyChanged,
        handlePlacementSettingsChanged
    };
    return {
        API: resultWindow,
        Events: events
    };
};

class GDExecutor {
    constructor() {
        this._registry = lib$1();
        this._finished = Promise.resolve();
        this.unsubCallbacks = {};
    }
    get hostInstance() {
        return this.agmTarget;
    }
    get finished() {
        return this._finished;
    }
    init(agm, instance) {
        this.agm = agm;
        this.agmTarget = instance;
        this._registry.add("event", (data) => {
            if (data.type === "Closed") {
                const keys = Object.keys(this.unsubCallbacks);
                keys.forEach((key) => {
                    const isSameWindow = key.startsWith(data.windowId);
                    if (isSameWindow) {
                        delete this.unsubCallbacks[key];
                    }
                });
            }
        });
    }
    handleEvent(data) {
        this._registry.execute("event", data);
    }
    async open(options) {
        let finishedResolve;
        this._finished = new Promise((resolve) => {
            finishedResolve = resolve;
        });
        try {
            const result = await this.agm.invoke("T42.Wnd.Create", options, this.agmTarget);
            if (result.returned === undefined) {
                throw new Error("failed to execute T42.Wnd.Create - unknown reason");
            }
            const id = result.returned.id;
            const win = await windowStore.waitFor(id);
            setTimeout(() => {
                if (win.API.windowType === "electron") {
                    win.Events.handleUrlChanged(win.API.url);
                }
            }, 0);
            return win.API;
        }
        catch (error) {
            throw error;
        }
        finally {
            finishedResolve();
        }
    }
    async close(w) {
        await this.execute("close", { windowId: w.id }, `Closed`);
        return w;
    }
    async navigate(w, newUrl, urlLoadOptions) {
        await this.execute("navigate", { windowId: w.id, options: { url: newUrl, urlLoadOptions } }, "UrlChanged");
        return w;
    }
    async setStyle(w, style) {
        var _a;
        const stylePromises = [];
        const wait = (promise) => stylePromises.push(promise);
        if (!isUndefinedOrNull(style.focus) && !w.isFocused) {
            wait(w.focus());
        }
        if (!isUndefinedOrNull(style.hidden)) {
            const toBeVisible = !style.hidden;
            wait(w.setVisible(toBeVisible));
        }
        if (!isUndefinedOrNull(style.onTop)) {
            wait(w.setOnTop(style.onTop));
        }
        if (!isNullOrWhiteSpace(style.tabTooltip) || !isNullOrWhiteSpace(style.tabToolTip)) {
            const toolTip = (_a = style.tabTooltip) !== null && _a !== void 0 ? _a : style.tabToolTip;
            wait(w.setTabTooltip(toolTip));
        }
        if (!isNullOrWhiteSpace(style.tabTitle)) {
            wait(this.execute("setTabTitle", { windowId: w.id, options: { tabTitle: style.tabTitle } }));
        }
        const { maxWidth, maxHeight, minWidth, minHeight, allowClose, allowCollapse, allowLockUnlock, allowMaximize, allowMinimize } = style;
        wait(w.setSizeConstraints({ maxWidth, maxHeight, minWidth, minHeight }));
        wait(w.resetButtons({ allowClose, allowCollapse, allowLockUnlock, allowMaximize, allowMinimize }));
        await Promise.all(stylePromises);
        return w;
    }
    async setSizeConstraints(w, constraints) {
        await this.execute("setSizeConstraints", { windowId: w.id, options: constraints });
        return w;
    }
    async setTabTooltip(w, tabTooltip) {
        await this.execute("setTabTooltip", { windowId: w.id, options: { tabTooltip } });
        return w;
    }
    async resetButtons(w, buttonsConfig) {
        await this.execute("resetButtons", { windowId: w.id, options: buttonsConfig });
        return w;
    }
    async setOnTop(w, onTop) {
        await this.execute("setOnTop", { windowId: w.id, options: { onTop } });
        return w;
    }
    async setTitle(w, newTitle) {
        const options = {
            windowId: w.id,
            options: {
                title: newTitle
            }
        };
        await this.execute("setTitle", options, "TitleChanged");
        return w;
    }
    async setSticky(w, isSticky) {
        const options = {
            windowId: w.id,
            options: {
                isSticky
            }
        };
        await this.execute("setSticky", options);
        return w;
    }
    async moveResize(w, bounds) {
        if (typeof window !== "undefined" && window.glueDesktop.versionNum < 31200) {
            return new Promise(async (res, rej) => {
                const resolveImmediately = this.areBoundsEqual(bounds, w);
                let isDone = false;
                const done = () => {
                    if (isDone) {
                        return;
                    }
                    isDone = true;
                    if (unsubscribeBoundsChanged) {
                        unsubscribeBoundsChanged();
                        unsubscribeBoundsChanged = undefined;
                    }
                    res(w);
                    if (resolveTimeout) {
                        clearTimeout(resolveTimeout);
                        resolveTimeout = undefined;
                    }
                };
                let resolveTimeout;
                let unsubscribeBoundsChanged;
                if (!resolveImmediately) {
                    unsubscribeBoundsChanged = w.onBoundsChanged((win) => {
                        if (!this.areBoundsEqual(bounds, win)) {
                            return;
                        }
                        done();
                    });
                }
                try {
                    await this.execute("moveResize", { windowId: w.id, options: { bounds } });
                }
                catch (error) {
                    rej(error);
                    return;
                }
                if (resolveImmediately) {
                    done();
                    return;
                }
                resolveTimeout = setTimeout(() => {
                    done();
                }, 1000);
            });
        }
        else {
            await this.execute("moveResize", { windowId: w.id, options: { bounds } });
        }
        return w;
    }
    async addFrameButton(w, buttonInfo) {
        await this.execute("addButton", { windowId: w.id, options: buttonInfo }, "ButtonAdded");
        return w;
    }
    async removeFrameButton(w, buttonId) {
        await this.execute("removeButton", { windowId: w.id, options: buttonId }, "ButtonRemoved");
        return w;
    }
    async activate(w) {
        let un;
        try {
            const done = new Promise((resolve, reject) => {
                un = w.onFocusChanged(() => {
                    resolve();
                });
            });
            await Promise.all([this.execute("activate", { windowId: w.id }, "FocusChanged"), done]);
            return w;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (un) {
                un();
            }
        }
    }
    async focus(w) {
        let un;
        try {
            const done = new Promise((resolve, reject) => {
                un = w.onFocusChanged(() => {
                    resolve();
                });
            });
            await Promise.all([this.execute("focus", { windowId: w.id }, "FocusChanged"), done]);
            return w;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (un) {
                un();
            }
        }
    }
    async maximizeRestore(w) {
        await this.execute("maximizeRestore", { windowId: w.id }, "StateChanged");
        return w;
    }
    async maximize(w) {
        await this.execute("maximize", { windowId: w.id }, "StateChanged");
        return w;
    }
    async restore(w) {
        await this.execute("restore", { windowId: w.id }, "StateChanged");
        return w;
    }
    async minimize(w) {
        await this.execute("minimize", { windowId: w.id }, "StateChanged");
        return w;
    }
    async collapse(w) {
        await this.execute("collapse", { windowId: w.id }, "StateChanged");
        return w;
    }
    async expand(w) {
        await this.execute("expand", { windowId: w.id }, "StateChanged");
        return w;
    }
    async toggleCollapse(w) {
        await this.execute("toggleCollapse", { windowId: w.id }, "StateChanged");
        return w;
    }
    async snap(w, targetWindow, direction) {
        const args = {
            targetWindowId: targetWindow.id
        };
        if (direction) {
            args.snappingEdge = direction;
        }
        await this.execute("snap", { windowId: w.id, options: args }, "CompositionChanged", `CompositionChanged-${targetWindow.id}`);
        return w;
    }
    async attachTab(w, sourceWindow, options) {
        await this.execute("attachTab", {
            windowId: w.id,
            options: {
                index: options,
                sourceWindowId: sourceWindow.id,
                targetWindowId: w.id,
            }
        }, `WindowFrameAdded-${sourceWindow.id}`, `WindowFrameRemoved-${sourceWindow.id}`);
        return w;
    }
    async detachTab(w, options) {
        const eventKeys = ["WindowFrameRemoved", `WindowFrameAdded`];
        if (!isUndefinedOrNull(options === null || options === void 0 ? void 0 : options.relativeTo)) {
            eventKeys.push(`CompositionChanged`);
            eventKeys.push(`CompositionChanged-${options.relativeTo}`);
        }
        else {
            eventKeys.push("BoundsChanged");
        }
        await this.execute("detachTab", { windowId: w.id, options }, ...eventKeys);
        return w;
    }
    async setVisible(w, toBeVisible = true) {
        let command;
        if (toBeVisible) {
            command = "show";
        }
        else {
            command = "hide";
        }
        await this.execute(command, { windowId: w.id }, "VisibilityChanged");
        return w;
    }
    async showLoader(w, loader) {
        await this.execute("showLoadingAnimation", { windowId: w.id, options: loader });
        return w;
    }
    async hideLoader(w) {
        await this.execute("hideLoadingAnimation", { windowId: w.id });
        return w;
    }
    async updateContext(w, context, replace) {
        let un;
        try {
            const contextWithoutUndefinedValues = this.swapUndefinedToNull(context);
            const done = new Promise((resolve, reject) => {
                un = w.onContextUpdated(() => {
                    resolve();
                });
            });
            await Promise.all([this.execute("updateContext", {
                    windowId: w.id, context: contextWithoutUndefinedValues, replace
                }), done]);
            return w;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (un) {
                un();
            }
        }
    }
    async lock(w) {
        await this.execute("lockUnlock", { windowId: w.id, options: { lock: true } }, "FrameIsLockedChanged");
        return w;
    }
    async unlock(w) {
        await this.execute("lockUnlock", { windowId: w.id, options: { lock: false } }, "FrameIsLockedChanged");
        return w;
    }
    async getIcon(w) {
        const result = await this.execute("getIcon", {
            windowId: w.id,
            options: {}
        });
        return result.icon;
    }
    async setIcon(w, base64Image) {
        await this.execute("setIcon", {
            windowId: w.id,
            options: {
                dataURL: base64Image
            }
        });
        return w;
    }
    async setFrameColor(w, frameColor) {
        await this.execute("setFrameColor", { windowId: w.id, options: { frameColor } }, "FrameColorChanged");
        return w;
    }
    async setTabHeaderVisible(w, toBeTabHeaderVisible) {
        await this.execute("setTabHeaderVisible", {
            windowId: w.id,
            options: {
                toShow: toBeTabHeaderVisible
            }
        }, "TabHeaderVisibilityChanged");
        return w;
    }
    async showPopup(targetWindow, options) {
        if (!options) {
            throw new Error("The options object is not valid!");
        }
        const optionsCopy = { ...options };
        if (!optionsCopy.targetLocation) {
            optionsCopy.targetLocation = "bottom";
        }
        const reformatedOptions = {
            ...optionsCopy,
            popupBounds: optionsCopy.size,
            targetId: targetWindow.id,
            popupId: optionsCopy.windowId
        };
        await this.execute("showPopupWindow", {
            windowId: targetWindow.id,
            options: reformatedOptions
        });
        return targetWindow;
    }
    async createFlydown(windowId, options) {
        if (!options) {
            throw new Error("The options object is not valid!");
        }
        const optionsCopy = { ...options };
        if (!optionsCopy.horizontalOffset) {
            optionsCopy.horizontalOffset = 0;
        }
        if (!optionsCopy.verticalOffset) {
            optionsCopy.verticalOffset = 0;
        }
        const fullOptions = this.reformatFlydownOptions(windowId, optionsCopy);
        return this.execute("setFlydownArea", { windowId, options: fullOptions }).then(() => {
            const zoneIds = fullOptions.zones.map((z) => z.id);
            fullOptions.zones.forEach((z) => {
                let callback = typeof (z.flydownSize) === "function" ?
                    z.flydownSize : () => z.flydownSize;
                if (options.size instanceof Function && z.flydownSize) {
                    callback = async (data, cancel) => {
                        let result;
                        if (options.size instanceof Function) {
                            result = await options.size(data, cancel);
                        }
                        if (z.flydownSize instanceof Function && z.flydownSize !== options.size) {
                            return await z.flydownSize(data, cancel) || result;
                        }
                        return result || z.flydownSize;
                    };
                }
                this._registry.clearKey(`${fullOptions.targetId}_${z.id}`);
                this._registry.add(`${fullOptions.targetId}_${z.id}`, callback);
            });
            return {
                destroy: () => this.clearFlydownArea(fullOptions.targetId, zoneIds),
                options: optionsCopy
            };
        });
    }
    async setModalState(windowId, isModal) {
        return this.execute("setModalState", { windowId, options: { isModal } });
    }
    async handleFlydownBoundsRequested(targetId, data) {
        const cancelCallback = () => data.cancel = true;
        const callbackData = {
            zoneId: data.flydownId,
            flydownWindowBounds: data.flydownWindowBounds,
            flydownWindowId: data.flydownWindowId,
        };
        const responses = await Promise.all(this._registry.execute(`${targetId}_${data.flydownId}`, callbackData, cancelCallback));
        if (responses.length === 1) {
            const defaultResponse = { height: 0, width: 0, top: 0, left: 0 };
            const response = typeof (responses[0]) === "object" && !Array.isArray(responses[0]) ? responses[0] : defaultResponse;
            const responseOptions = { ...data, flydownWindowBounds: response };
            return responseOptions;
        }
    }
    async handleOnEventRequested(callbackId, args) {
        var _a;
        const callbacks = (_a = this.unsubCallbacks[callbackId]) !== null && _a !== void 0 ? _a : [];
        let prevented = false;
        await Promise.all(callbacks.map((cb) => {
            return new Promise((resolve, reject) => {
                cb(() => {
                    resolve();
                }, () => {
                    reject();
                }, () => {
                    prevented = true;
                }, args);
            });
        }));
        return { prevented };
    }
    async zoomIn(window) {
        await this.execute("zoomIn", {
            windowId: window.id,
        });
        return window;
    }
    async zoomOut(window) {
        await this.execute("zoomOut", {
            windowId: window.id,
        });
        return window;
    }
    async setZoomFactor(window, zoomFactor) {
        await this.execute("setZoomFactor", {
            windowId: window.id,
            options: {
                zoomFactor
            }
        });
        return window;
    }
    async showDevTools(window) {
        await this.execute("showDevTools", {
            windowId: window.id,
        });
        return window;
    }
    async capture(window, options) {
        const base64screenshot = (await this.execute("captureScreenshot", { windowId: window.id, options: { ...options } })).data;
        return base64screenshot;
    }
    async captureGroup(windowIds, options) {
        const base64screenshot = (await this.execute("captureGroupScreenshot", { windowId: windowIds[0], options: { groupWindowIds: windowIds, ...options } })).data;
        return base64screenshot;
    }
    async flash(resultWindow, options) {
        await this.execute("flash", { windowId: resultWindow.id, options: { ...options } });
        return resultWindow;
    }
    async configure(windowId, options) {
        return this.execute("configure", { windowId, options: { ...options } });
    }
    async print(resultWindow, options) {
        await this.execute("print", { windowId: resultWindow.id, options: { ...options } });
        return resultWindow;
    }
    async printToPDF(resultWindow, options) {
        const filePath = (await this.execute("printToPDF", { windowId: resultWindow.id, options: { ...options } })).filePath;
        return filePath;
    }
    async place(window, options) {
        const copy = { ...options };
        if (!options.display || options.display === "current") {
            copy.display = await window.getDisplay();
        }
        copy.display = copy.display.index + 1;
        return this.execute("place", { windowId: window.id, options: { ...copy } });
    }
    async refresh(resultWindow, ignoreCache) {
        await this.execute("refresh", { windowId: resultWindow.id, options: { ignoreCache } });
        return resultWindow;
    }
    async download(resultWindow, url, options = {}) {
        options.enableDownloadBar = !options.silent;
        const result = await this.execute("downloadURL", { windowId: resultWindow.id, options: { url, options } });
        return {
            url,
            path: result.fullPath,
            size: result.fileSize,
        };
    }
    async configureWindow(resultWindow, options) {
        await this.execute("configureWindow", { windowId: resultWindow.id, options });
        return resultWindow;
    }
    async execute(command, options, ...eventKeys) {
        const params = {
            ...options,
            command,
        };
        let finishedResolve;
        this._finished = new Promise((resolve) => {
            finishedResolve = resolve;
        });
        try {
            if (typeof window !== "undefined" && window.glueDesktop.versionNum < 31200) {
                return await this.executeWithoutToken(params, ...eventKeys);
            }
            else {
                return await this.executeWithToken(params);
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            finishedResolve();
        }
    }
    async ungroup(w, options) {
        const args = {
            windowId: w.id,
            options
        };
        await this.execute("ungroup", args);
        return w;
    }
    async updateJumpList(windowId, options) {
        const args = {
            windowId,
            options
        };
        await this.execute("updateJumplist", args);
    }
    async getJumpList(windowId) {
        const args = {
            windowId,
        };
        const result = await this.execute("getJumplist", args);
        return result;
    }
    onClosing(callback, id) {
        const glue42gd = typeof window !== "undefined" && window.glue42gd;
        if (glue42gd) {
            return glue42gd.addCloseHandler(callback, id);
        }
        else {
            return this.nodeHandlers(callback, id, "OnClosing");
        }
    }
    onRefreshing(callback, id) {
        const glue42gd = typeof window !== "undefined" && window.glue42gd;
        if (glue42gd) {
            return glue42gd.addRefreshHandler(callback, id);
        }
        else {
            return this.nodeHandlers(callback, id, "OnRefreshing");
        }
    }
    onNavigating(callback, id) {
        const glue42gd = typeof window !== "undefined" && window.glue42gd;
        if (glue42gd) {
            return glue42gd.addWillNavigateHandler(callback, id);
        }
        else {
            return this.nodeHandlers(callback, id, "OnNavigating");
        }
    }
    async goBack(resultWindow) {
        await this.execute("goBack", { windowId: resultWindow.id });
    }
    async goForward(resultWindow) {
        await this.execute("goForward", { windowId: resultWindow.id });
    }
    nodeHandlers(callback, winId, type) {
        const id = `${winId}-${type}`;
        const unsub = () => {
            if (this.unsubCallbacks[id]) {
                const callbacks = this.unsubCallbacks[id];
                this.unsubCallbacks[id] = callbacks.filter((cb) => cb !== callback);
            }
            const cbs = this.unsubCallbacks[id];
            if (cbs.length === 0) {
                this.execute(type, {
                    windowId: winId,
                    options: {
                        unsubscribe: true
                    }
                });
            }
        };
        if (this.unsubCallbacks[id]) {
            this.unsubCallbacks[id].push(callback);
            return unsub;
        }
        else {
            this.unsubCallbacks[id] = [callback];
        }
        const args = {
            windowId: winId
        };
        this.execute(type, args);
        return unsub;
    }
    reformatFlydownOptions(windowId, options) {
        const assignGeneralIfUnassigned = (zone, prop) => {
            if (options[prop] && (zone[prop] === undefined || zone[prop] === null)) {
                const valueFromOptions = options[prop];
                zone[prop] = valueFromOptions;
            }
        };
        const zones = options.zones.map((z) => {
            assignGeneralIfUnassigned(z, "windowId");
            assignGeneralIfUnassigned(z, "targetLocation");
            if (options.size && (z.flydownSize === undefined || z.flydownSize === null)) {
                z.flydownSize = options.size;
            }
            z.flydownBounds = z.flydownSize;
            z.flydownId = z.windowId;
            if (!z.targetLocation) {
                z.targetLocation = "bottom";
            }
            return z;
        });
        return {
            ...options,
            zones,
            targetId: windowId,
            flydownBounds: options.size,
            flydownActiveArea: options.activeArea
        };
    }
    clearFlydownArea(windowId, areaIds) {
        return this.execute("clearFlydownWindowArea", {
            windowId,
            options: {}
        }).then(() => {
            areaIds.forEach((id) => {
                this._registry.clearKey(`${windowId}_${id}`);
            });
        });
    }
    executeWithoutToken(params, ...eventKeys) {
        const uns = [];
        const executed = eventKeys === null || eventKeys === void 0 ? void 0 : eventKeys.filter((k) => !isUndefinedOrNull(k)).map((key) => {
            return new Promise((r) => {
                const [type, windowId = params.windowId] = key.split("-");
                uns.push(this._registry.add("event", (data) => {
                    if (data.type === type && data.windowId === windowId) {
                        r();
                    }
                }));
            });
        });
        const action = new Promise((resolve, reject) => {
            this.agm.invoke("T42.Wnd.Execute", params, this.agmTarget)
                .then((i) => {
                if (i.returned && i.returned.errorMsg) {
                    reject(i);
                }
                else {
                    resolve(i.returned);
                }
            })
                .catch((e) => reject(e));
        });
        return Promise.all([action, ...executed])
            .then((r) => {
            return r[0];
        })
            .finally(() => {
            uns.forEach((un) => un());
        });
    }
    async executeWithToken(options) {
        let un;
        try {
            const token = shortid.generate();
            const event = new Promise((r) => {
                un = this._registry.add("event", (data) => {
                    if (data.token === token) {
                        r();
                    }
                });
            });
            const execute = new Promise((resolve, reject) => {
                options.token = token;
                this.agm.invoke("T42.Wnd.Execute", options, this.agmTarget)
                    .then((i) => {
                    if (i.returned && i.returned.errorMsg) {
                        reject(i);
                    }
                    else {
                        resolve(i.returned);
                    }
                })
                    .catch((i) => {
                    reject(i);
                });
            });
            const result = await Promise.all([execute, event]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
        finally {
            if (un) {
                un();
            }
        }
    }
    areBoundsEqual(requested, w) {
        const current = w.bounds;
        const settings = w.settings;
        let height = requested.height;
        let width = requested.width;
        if (requested.height < settings.minHeight) {
            height = settings.minHeight;
        }
        if (requested.height > settings.maxHeight) {
            height = settings.maxHeight;
        }
        if (requested.width < settings.minWidth) {
            width = settings.minWidth;
        }
        if (requested.width > settings.maxWidth) {
            width = settings.maxWidth;
        }
        const areHeightsEqual = height ? current.height === height : true;
        const areWidthsEqual = width ? current.width === width : true;
        const areLeftsEqual = requested.left ? current.left === requested.left : true;
        const areTopsEqual = requested.top ? current.top === requested.top : true;
        return areHeightsEqual && areWidthsEqual && areLeftsEqual && areTopsEqual;
    }
    swapUndefinedToNull(context) {
        try {
            const copy = {};
            for (const key of Object.keys(context)) {
                let value = context[key];
                if (typeof value === "undefined") {
                    value = null;
                }
                copy[key] = value;
            }
            return copy;
        }
        catch {
            return context;
        }
    }
}
var executor = new GDExecutor();

function getWindowsByTabGroupId(windowId, tabGroupId) {
    const windows = windowStore.list;
    return Object.keys(windows).reduce((memo, id) => {
        const win = windows[id];
        if (win.API.tabGroupId === tabGroupId && win.API.id !== windowId) {
            memo.push(win);
        }
        return memo;
    }, []);
}

class GDEnvironment {
    constructor(agm, logger, appManagerGetter, displayAPIGetter, channelsAPIGetter, instance, wndId) {
        this._registry = lib$1();
        this._waitTimeout = 10000;
        this._agm = agm;
        this._logger = logger.subLogger("gd-env");
        this._agmInstance = this.normalizeInstance(instance);
        this._windowId = wndId;
        this._appManagerGetter = appManagerGetter;
        this._displayAPIGetter = displayAPIGetter;
        this._channelsAPIGetter = channelsAPIGetter;
    }
    init() {
        return new Promise((resolve, reject) => {
            if (typeof this._agmInstance === "undefined") {
                this._agmInstance = "best";
            }
            this._agm.registerAsync("T42.Wnd.OnEventWithResponse", (args, caller, success, err) => {
                this.respondToEvent(args).then(success).catch(err);
            });
            new Promise((streamResolve, streamReject) => {
                this._agm.subscribe("T42.Wnd.OnEvent", {
                    waitTimeoutMs: this._waitTimeout,
                    target: this._agmInstance,
                    onData: (streamData) => {
                        this.updateWindow(streamData.data, resolve);
                        executor.handleEvent(streamData.data);
                    },
                    onConnected: (instance) => {
                        this._agmInstance = this.normalizeInstance(instance);
                        executor.init(this._agm, this._agmInstance);
                    }
                }).catch((err) => {
                    reject("Can not subscribe for stream T42.Wnd.OnEvent. Err: " + err);
                });
            });
        });
    }
    get executor() {
        return executor;
    }
    open(name, url, options) {
        options = options || {};
        const copyOptions = { ...options };
        if (copyOptions.relativeTo !== undefined && typeof copyOptions.relativeTo !== "string") {
            copyOptions.relativeTo = copyOptions.relativeTo.id || "";
        }
        copyOptions.name = name;
        copyOptions.url = url;
        copyOptions.windowState = options.windowState || options.state;
        delete copyOptions.state;
        return this.executor.open(copyOptions);
    }
    createFlydown(windowId, options) {
        return this.executor.createFlydown(windowId, options);
    }
    async showPopup(windowId, options) {
        const window = windowStore.get(windowId);
        await this.executor.showPopup(window.API, options);
    }
    tabAttached(callback) {
        return this._registry.add("tab-attached", callback);
    }
    tabDetached(callback) {
        return this._registry.add("tab-detached", callback);
    }
    onWindowFrameColorChanged(callback) {
        return this._registry.add("frame-color-changed", callback);
    }
    onEvent(callback) {
        return this._registry.add("window-event", callback);
    }
    my() {
        return this._windowId;
    }
    execute(command, windowId, options) {
        return this._agm.invoke("T42.Wnd.Execute", {
            command,
            options,
            windowId,
        });
    }
    onCompositionChanged(callback) {
        return this._registry.add("composition-changed", callback);
    }
    onGroupHeaderVisibilityChanged(callback) {
        return this._registry.add("group-header-changed", callback);
    }
    onWindowGotFocus(callback) {
        return this._registry.add("got-focus", callback);
    }
    onWindowLostFocus(callback) {
        return this._registry.add("lost-focus", callback);
    }
    normalizeInstance(instance) {
        if (!instance) {
            return undefined;
        }
        return {
            application: instance.application,
            machine: instance.machine,
            user: instance.user,
        };
    }
    respondToEvent(args) {
        if (args.type === "ShowFlydownBoundsRequested") {
            return this.executor.handleFlydownBoundsRequested(args.data.windowId, args.data);
        }
        else if (args.type === "OnClosing" || args.type === "OnRefreshing" || args.type === "OnNavigating") {
            return this.executor.handleOnEventRequested(args.data.callbackId, args.data.args);
        }
        return Promise.reject(`There isn't a handler for ${args.type}`);
    }
    updateWindow(windowInfo, readyResolve) {
        const extendedStreamEvent = this.getExtendedStreamEvent(windowInfo);
        if (windowInfo.type === "Snapshot") {
            const windowInfoFullInfoEvent = windowInfo;
            windowInfoFullInfoEvent.windows.forEach((w) => {
                const existingWindow = windowStore.get(w.id);
                if (existingWindow) {
                    existingWindow.Events.handleUpdate(this.mapToWindowConstructorOptions(w));
                }
                else {
                    const win = this.createWindow(w.id, w);
                    windowStore.markReadyToShow(win.API.id);
                }
                this._registry.execute("window-event", extendedStreamEvent);
            });
            readyResolve(this);
            return;
        }
        if (windowInfo.type === "CommandExecuted") {
            this._registry.execute("window-event", extendedStreamEvent);
            return;
        }
        if (windowInfo.type === "Created") {
            const windowInfoCreatedEvent = windowInfo;
            const win = this.createWindow(windowInfoCreatedEvent.windowId, windowInfoCreatedEvent.data || {});
            windowStore.setReadyState(win.API.id);
            this._registry.execute("window-event", extendedStreamEvent);
            return;
        }
        const windowObjectAndEvents = windowStore.get(windowInfo.windowId);
        if (!windowObjectAndEvents) {
            this._logger.error(`received update for unknown window. Stream:', ${JSON.stringify(windowInfo, null, 4)}`);
            return;
        }
        const theWindow = windowObjectAndEvents.API;
        const theWindowEvents = windowObjectAndEvents.Events;
        if (windowInfo.type === "BoundsChanged") {
            const windowInfoBoundsChangedEvent = windowInfo;
            theWindowEvents.handleBoundsChanged(windowInfoBoundsChangedEvent.data);
        }
        if (windowInfo.type === "UrlChanged") {
            const windowInfoUrlChangedEvent = windowInfo;
            windowStore.setUrlChangedState(windowInfoUrlChangedEvent.windowId);
            theWindowEvents.handleUrlChanged(windowInfoUrlChangedEvent.data);
        }
        if (windowInfo.type === "TitleChanged") {
            const windowInfoTitleChanged = windowInfo;
            theWindowEvents.handleTitleChanged(windowInfoTitleChanged.data);
        }
        if (windowInfo.type === "IsStickyChanged") {
            const windowInfoIsStickyChangedChanged = windowInfo;
            theWindowEvents.handleIsStickyChanged(windowInfoIsStickyChangedChanged.data);
        }
        if (windowInfo.type === "VisibilityChanged") {
            theWindowEvents.handleVisibilityChanged(windowInfo.data);
        }
        if (windowInfo.type === "ContextChanged") {
            theWindowEvents.handleContextUpdated(windowInfo.data);
        }
        if (windowInfo.type === "StateChanged") {
            theWindowEvents.handleWindowChangeState(windowInfo.data);
        }
        if (windowInfo.type === "FrameColorChanged") {
            theWindowEvents.handleFrameColorChanged(windowInfo.data);
            this._registry.execute("frame-color-changed", theWindow);
        }
        if (windowInfo.type === "CompositionChanged") {
            const windowInfoCompositionChanged = windowInfo;
            theWindowEvents.handleCompositionChanged(windowInfoCompositionChanged.data);
            this._registry.execute("composition-changed", windowInfoCompositionChanged.data);
        }
        if (windowInfo.type === "GroupHeaderVisibilityChanged") {
            const info = windowInfo;
            theWindowEvents.handleGroupHeaderVisibilityChanged(info.data.groupHeaderVisible);
            this._registry.execute("group-header-changed", info.data);
        }
        if (windowInfo.type === "FocusChanged") {
            const windowInfoFocusChanged = windowInfo;
            this.focusChanged(theWindowEvents, theWindow, windowInfoFocusChanged.data);
        }
        if (windowInfo.type === "WindowFrameChanged") {
            theWindowEvents.handleFrameAttached(windowInfo.data.frameId, windowInfo.data.frameId, windowInfo.data.isTabHeaderVisible);
            this._registry.execute("frame-changed");
        }
        if (windowInfo.type === "WindowFrameAdded") {
            const winsToBeNotified = getWindowsByTabGroupId(theWindow.id, windowInfo.data.frameId);
            const data = windowInfo.data;
            theWindowEvents.handleAttached(data.frameId, data.frameId, data.isTabHeaderVisible, data.isLocked, winsToBeNotified)
                .then(async () => {
                if (winsToBeNotified.length > 0) {
                    await executor.finished;
                    this._registry.execute("tab-attached", theWindow, windowInfo.data.frameId, windowInfo.data.isTabHeaderVisible);
                }
            });
        }
        if (windowInfo.type === "WindowFrameRemoved") {
            const oldTabGroupId = theWindow.tabGroupId;
            const winsToBeNotified = getWindowsByTabGroupId(theWindow.id, oldTabGroupId);
            theWindowEvents.handleDetached(windowInfo.data.isLocked, winsToBeNotified)
                .then(async () => {
                if (winsToBeNotified.length > 0) {
                    await executor.finished;
                    this._registry.execute("tab-detached", theWindow, windowInfo.data.frameId, theWindow.tabGroupId);
                }
            });
        }
        if (windowInfo.type === "TabHeaderVisibilityChanged") {
            theWindowEvents.handleTabHeaderVisibilityChanged(windowInfo.data.isTabHeaderVisible);
        }
        if (windowInfo.type === "FrameSelectionChanged") {
            theWindowEvents.handleFrameSelectionChanged(windowInfo.data.newWindowId, windowInfo.data.prevWindowId);
        }
        if (windowInfo.type === "ButtonClicked") {
            theWindowEvents.handleFrameButtonClicked(windowInfo.data);
        }
        if (windowInfo.type === "ButtonAdded") {
            theWindowEvents.handleFrameButtonAdded(windowInfo.data);
        }
        if (windowInfo.type === "ButtonRemoved") {
            theWindowEvents.handleFrameButtonRemoved(windowInfo.data);
        }
        if (windowInfo.type === "WindowZoomFactorChanged") {
            theWindowEvents.handleZoomFactorChanged(windowInfo.data);
        }
        if (windowInfo.type === "Closed") {
            windowStore.remove(windowObjectAndEvents);
            theWindowEvents.handleWindowClose();
        }
        if (windowInfo.type === "FrameIsLockedChanged") {
            theWindowEvents.handleFrameIsLockedChanged(windowInfo.data);
        }
        if (windowInfo.type === "PlacementSettingsChanged") {
            theWindowEvents.handlePlacementSettingsChanged(windowInfo.data);
        }
        this._registry.execute("window-event", extendedStreamEvent);
    }
    createWindow(windowId, options) {
        const windowObjAndEvents = windowFactory(windowId, this.mapToWindowConstructorOptions(options), executor, this._logger, this._appManagerGetter, this._displayAPIGetter, this._channelsAPIGetter, this._agm);
        windowStore.add(windowObjAndEvents);
        return windowObjAndEvents;
    }
    focusChanged(theWindowEvents, theWindow, focus) {
        theWindowEvents.handleFocusChanged(focus);
        if (focus) {
            this._registry.execute("got-focus", theWindow);
        }
        else {
            this._registry.execute("lost-focus", theWindow);
        }
    }
    mapToWindowConstructorOptions(args) {
        return {
            name: args.name,
            context: args.context,
            bounds: args.bounds,
            url: args.url,
            title: args.title,
            isVisible: args.isVisible,
            focus: args.isFocused,
            state: args.state,
            frameColor: args.frameColor,
            groupId: args.groupId,
            neighbours: args.neighbors,
            isFocused: args.isFocused,
            isGroupHeaderVisible: args.groupHeaderVisible,
            isCollapsed: args.isCollapsed,
            tabGroupId: args.frameId,
            frameId: args.frameId,
            mode: args.mode,
            isTabHeaderVisible: args.isTabHeaderVisible,
            isTabSelected: args.isActiveTab,
            settings: args.settings,
            windowType: args.windowType,
            zoomFactor: args.zoomFactor,
            isLocked: args.isLocked,
            placementSettings: args.placementSettings,
            isSticky: args.isSticky,
            tabIndex: args.tabIndex,
            frameButtons: args.frameButtons,
            jumpListOptions: args.jumpList,
            applicationName: args.applicationName
        };
    }
    getExtendedStreamEvent(streamEvent) {
        try {
            if (!streamEvent.windowId) {
                return streamEvent;
            }
            const window = windowStore.get(streamEvent.windowId);
            if (!window) {
                return streamEvent;
            }
            const result = {
                state: streamEvent.type,
                windowName: window.API.name,
                ...streamEvent
            };
            if (result.state === "WindowFrameAdded") {
                result.state = "TabAttached";
            }
            if (result.state === "StateChanged") {
                result.state = result.data.charAt(0).toUpperCase() + result.data.slice(1);
            }
            if (result.state === "ButtonAdded") {
                result.state = "FrameButtonAdded";
            }
            if (result.state === "ButtonRemoved") {
                result.state = "FrameButtonRemoved";
            }
            return result;
        }
        catch (error) {
            return streamEvent;
        }
    }
}

var envDetector = (agm, logger, appManagerGetter, displayAPIGetter, channelsAPIGetter, gdMajorVersion) => {
    const _logger = logger;
    return new Promise((resolve, reject) => {
        if (gdMajorVersion === 2) {
            _logger.trace("running in HC");
            throw new Error("GD2 not supported");
        }
        else if (gdMajorVersion >= 3) {
            _logger.trace("running in GD 3");
            const gd = new GDEnvironment(agm, _logger, appManagerGetter, displayAPIGetter, channelsAPIGetter, undefined, window.glue42gd.windowId);
            gd.init()
                .then(resolve)
                .catch(reject);
        }
        else {
            const gdPromise = new GDEnvironment(agm, _logger, appManagerGetter, displayAPIGetter, channelsAPIGetter).init();
            const wait = (ms) => new Promise((res, rej) => setTimeout(() => { rej("timeout waiting for streams"); }, ms));
            Promise.race([gdPromise, wait(10000)])
                .then(resolve)
                .catch(reject);
        }
    });
};

var groupFactory = (id, executor) => {
    const _registry = lib$1();
    const _windowsId = [];
    async function addWindow(winId) {
        if (_windowsId.indexOf(winId) === -1) {
            _windowsId.push(winId);
            const win = windowStore.get(winId);
            win.Events.handleGroupChanged(groupObject, undefined);
            await executor.finished;
            _registry.execute("window-added", groupObject, win.API);
        }
    }
    async function removeWindow(win) {
        const index = _windowsId.indexOf(win.API.id);
        if (index !== -1) {
            _windowsId.splice(index, 1);
            win.Events.handleGroupChanged(undefined, groupObject);
            await executor.finished;
            _registry.execute("window-removed", groupObject, win.API);
        }
    }
    function find(window, success, error) {
        let winId;
        if (typeof window === "string") {
            winId = window;
        }
        else if (!isUndefinedOrNull(window)) {
            winId = window.id;
        }
        const win = _mapToWindowObject(winId);
        if (win) {
            if (typeof success === "function") {
                success(win);
            }
            return win;
        }
        else {
            if (typeof error === "function") {
                error(`No window with ID: ${winId}`);
            }
        }
    }
    function windows(success) {
        const mappedWindows = _mapToWindowObjects();
        if (typeof success === "function") {
            success(mappedWindows);
        }
        return mappedWindows;
    }
    async function execute(command, options, ...keys) {
        await executor.execute(command, options, ...keys);
        return groupObject;
    }
    function handleGroupHeaderVisibilityChanged(windowInfo) {
        _registry.execute("header-visibility-changed", groupObject);
    }
    function _mapToWindowObjects() {
        const winObjects = [];
        _windowsId.forEach((winId) => {
            const windowObject = _mapToWindowObject(winId);
            if (typeof windowObject !== "undefined") {
                winObjects.push(windowObject);
            }
        });
        return winObjects;
    }
    function _mapToWindowObject(windowId) {
        return windowStore.get(windowId) ? windowStore.get(windowId).API : undefined;
    }
    function _getGroupHeaderVisibility() {
        const windowWithHiddenHeader = _mapToWindowObjects().find((w) => !w.isGroupHeaderVisible);
        const _isGroupHeaderVisible = windowWithHiddenHeader === undefined;
        return _isGroupHeaderVisible;
    }
    function onHeaderVisibilityChanged(callback) {
        return _registry.add("header-visibility-changed", callback);
    }
    function onWindowAdded(callback) {
        return _registry.add("window-added", callback);
    }
    function onWindowRemoved(callback) {
        return _registry.add("window-removed", callback);
    }
    const groupObject = {
        id,
        get windows() {
            return windows();
        },
        find,
        get isHeaderVisible() {
            return _getGroupHeaderVisibility();
        },
        showHeader: (success, error) => {
            return Utils.callbackifyPromise(() => {
                return execute("setGroupHeaderVisibility", { windowId: _windowsId[0], options: { toShow: true } }, ..._windowsId.map((w) => `GroupHeaderVisibilityChanged-${w}`));
            }, success, error);
        },
        hideHeader: (success, error) => {
            return Utils.callbackifyPromise(() => {
                return execute("setGroupHeaderVisibility", { windowId: _windowsId[0], options: { toShow: false } }, ..._windowsId.map((w) => `GroupHeaderVisibilityChanged-${w}`));
            }, success, error);
        },
        getTitle: async () => {
            const r = await executor.execute("getGroupTitle", { windowId: _windowsId[0] });
            return r.title;
        },
        setTitle: async (title) => {
            if (isNullOrWhiteSpace(title)) {
                throw new Error("`title` must not be null or undefined.");
            }
            return execute("setGroupTitle", { windowId: _windowsId[0], options: { title } });
        },
        capture: (captureOptions) => {
            return executor.captureGroup(_windowsId, captureOptions);
        },
        maximize: (success, error) => {
            return Utils.callbackifyPromise(() => {
                return execute("maximizeGroup", { windowId: _windowsId[0] }, ..._windowsId.map((w) => `StateChanged-${w}`));
            }, success, error);
        },
        restore: (success, error) => {
            return Utils.callbackifyPromise(() => {
                return execute("restoreGroup", { windowId: _windowsId[0] }, ..._windowsId.map((w) => `StateChanged-${w}`));
            }, success, error);
        },
        onHeaderVisibilityChanged,
        onWindowAdded,
        onWindowRemoved,
    };
    const internal = {
        get windows() {
            return _windowsId;
        },
        addWindow,
        removeWindow,
        handleGroupHeaderVisibilityChanged,
    };
    return {
        groupAPI: groupObject,
        groupInternal: internal,
    };
};

var groupsFactory = (environment, logger) => {
    const _registry = lib$1();
    const _groups = {};
    let heardForWindowsCounter = -1;
    const windows = windowStore.list;
    Object.keys(windows).forEach((k) => {
        const win = windows[k];
        const groupId = win.API.groupId;
        const winId = win.API.id;
        if (!isNullOrWhiteSpace(groupId)) {
            addWindow(groupId, winId);
        }
    });
    windowStore.onRemoved((w) => {
        const group = findGroupWrapperByWindow(w.API);
        removeWindow(group, w);
    });
    environment.onCompositionChanged((windowInfo) => {
        handleCompositionChanged(windowInfo);
    });
    environment.onGroupHeaderVisibilityChanged((windowInfo) => {
        const windowId = windowInfo.windowId;
        const group = findGroupByWindow(windowId);
        if (typeof group !== "undefined") {
            const groupEvents = _groups[group.id];
            if (heardForWindowsCounter === -1) {
                heardForWindowsCounter = group.windows.length;
            }
            heardForWindowsCounter--;
            if (heardForWindowsCounter === 0) {
                heardForWindowsCounter = -1;
                groupEvents.groupInternal.handleGroupHeaderVisibilityChanged(windowInfo);
            }
        }
    });
    function my() {
        return findGroupByWindow(environment.my());
    }
    function list(success) {
        const result = Object.keys(_groups).map((groupId) => {
            if (_groups[groupId]) {
                return _groups[groupId].groupAPI;
            }
        });
        if (typeof success === "function") {
            success(result);
        }
        return result;
    }
    function findGroupByWindow(winId, success, error) {
        let windowId;
        if (typeof winId === "string") {
            windowId = winId;
        }
        else if (!isUndefinedOrNull(winId)) {
            windowId = winId.id;
        }
        const result = Object.values(_groups).find((groupObj) => {
            const group = groupObj.groupAPI;
            const wins = group.windows.filter((w) => w.id === windowId);
            return wins.length;
        });
        if (result) {
            if (typeof success === "function") {
                success(result.groupAPI);
            }
            return result.groupAPI;
        }
        else {
            if (typeof error === "function") {
                error(`Cannot find the group of the window.`);
            }
        }
    }
    function onWindowMoved(callback) {
        return _registry.add("window-moved", callback);
    }
    function createOrGet(groupId) {
        if (!_groups.hasOwnProperty(groupId)) {
            const createdGroup = groupFactory(groupId, environment.executor);
            _groups[groupId] = createdGroup;
            return createdGroup;
        }
        else {
            return _groups[groupId];
        }
    }
    function deleteIfEmpty(group) {
        if (group.groupAPI.windows.length === 0) {
            delete _groups[group.groupAPI.id];
        }
    }
    function addWindow(groupId, winId) {
        const group = createOrGet(groupId);
        group.groupInternal.addWindow(winId);
        return group;
    }
    function removeWindow(group, win) {
        if (!group) {
            return;
        }
        group.groupInternal.removeWindow(win);
        deleteIfEmpty(group);
    }
    function handleCompositionChanged(state) {
        const groupId = state.groupId;
        const windowId = state.windowId;
        const win = windowStore.get(windowId);
        if (!win) {
            return;
        }
        const currentGroup = findGroupWrapperByWindow(win.API);
        if (isUndefinedOrNull(groupId)) {
            removeWindow(currentGroup, win);
            return;
        }
        if (isUndefinedOrNull(currentGroup) && !isUndefinedOrNull(groupId)) {
            addWindow(groupId, win.API.id);
            return;
        }
        if (currentGroup.groupAPI.id !== groupId) {
            moveWindow(win, currentGroup.groupAPI.id, groupId);
        }
    }
    function moveWindow(win, from, to) {
        const winId = win.API.id;
        const fromGroup = _groups[from];
        removeWindow(fromGroup, win);
        const toGroup = addWindow(to, winId);
        win.Events.handleGroupChanged(toGroup.groupAPI, fromGroup.groupAPI);
        _registry.execute("window-moved", winId, from, to);
    }
    function findGroupWrapperByWindow(winId) {
        let windowId;
        if (typeof winId === "string") {
            windowId = winId;
        }
        else if (!isUndefinedOrNull(winId)) {
            windowId = winId.id;
        }
        return Object.values(_groups).find((groupObj) => {
            const groupInternal = groupObj.groupInternal;
            const wins = groupInternal.windows.filter((id) => id === windowId);
            return wins.length;
        });
    }
    const groups = {
        get my() {
            return my();
        },
        list,
        findGroupByWindow,
    };
    const events = { onWindowMoved };
    return {
        groupsAPI: groups,
        groupsEvents: events,
    };
};

var WindowsFactory = (agm, logger, appManagerGetter, displayAPIGetter, channelsGetter, gdMajorVersion) => {
    const _registry = lib$1();
    const _logger = logger;
    let groups;
    let environment;
    windowStore.init(_logger);
    const isReady = new Promise((resolve, reject) => {
        envDetector(agm, _logger, appManagerGetter, displayAPIGetter, channelsGetter, gdMajorVersion)
            .then((env) => {
            environment = env;
            groups = groupsFactory(env);
            jumpListManager.init(env.executor, agm, _logger);
            resolve();
        })
            .catch((e) => {
            const err = `Environment detector fails with: ${e}`;
            _logger.error(err);
            reject(err);
        });
    });
    function ready() {
        return isReady;
    }
    function my() {
        const myWindow = windowStore.getIfReady(environment.my());
        return myWindow ? myWindow.API : undefined;
    }
    function open(name, url, options, success, error) {
        return Utils.callbackifyPromise(() => {
            if (isNullOrWhiteSpace(name)) {
                throw new Error("The window name is missing.");
            }
            if (isNullOrWhiteSpace(url)) {
                throw new Error("The window URL is missing.");
            }
            if (!isUndefinedOrNull(options)) {
                const optionsAsAny = options;
                for (const prop of ["minHeight", "maxHeight", "minWidth", "maxWidth", "width", "height", "top", "left"]) {
                    if (prop in optionsAsAny) {
                        const value = optionsAsAny[prop];
                        if (isUndefinedOrNull(value)) {
                            delete optionsAsAny[prop];
                            continue;
                        }
                        if (!isNumber(value)) {
                            const errMessage = `${prop} must be a number`;
                            throw new Error(errMessage);
                        }
                        if (optionsAsAny[prop] === "width" || optionsAsAny[prop] === "height") {
                            if (value <= 0) {
                                const errMessage = `${prop} must be a positive number`;
                                throw new Error(errMessage);
                            }
                        }
                    }
                }
            }
            return environment.open(name, url, options);
        }, success, error);
    }
    function find(name, success, error) {
        const windows = windowStore.list;
        const windowsForListing = Object.keys(windows).reduce((memo, winId) => {
            var _a;
            const window = windows[winId];
            if (((_a = window === null || window === void 0 ? void 0 : window.API) === null || _a === void 0 ? void 0 : _a.name) === name) {
                memo.push(window.API);
            }
            return memo;
        }, []);
        const win = windowsForListing[0];
        if (win) {
            if (typeof success === "function") {
                success(windowsForListing[0]);
            }
            return windowsForListing[0];
        }
        else {
            if (typeof error === "function") {
                error("There is no window with name:" + name);
            }
        }
    }
    function findById(id, success, error) {
        const windows = windowStore.list;
        const windowsForListing = Object.keys(windows).reduce((memo, winId) => {
            const window = windows[winId];
            if (typeof window !== "undefined" && window.API.id === id) {
                memo.push(window.API);
            }
            return memo;
        }, []);
        const win = windowsForListing[0];
        if (win) {
            if (typeof success === "function") {
                success(windowsForListing[0]);
            }
            return windowsForListing[0];
        }
        else {
            if (typeof error === "function") {
                error("There is no window with such id:" + id);
            }
        }
    }
    function list(success) {
        const windows = windowStore.list;
        const windowsForListing = Object.keys(windows)
            .map((k) => {
            return windows[k].API;
        });
        if (typeof success !== "function") {
            return windowsForListing;
        }
        success(windowsForListing);
    }
    function configure(options) {
        const win = my();
        const winId = win ? win.id : "";
        return executor.configure(winId, options);
    }
    function windowAdded(callback) {
        return _registry.add("window-added", callback);
    }
    function windowRemoved(callback) {
        return _registry.add("window-removed", callback);
    }
    function tabAttached(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.tabAttached(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function tabDetached(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.tabDetached(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function onWindowFrameColorChanged(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.onWindowFrameColorChanged(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function onWindowGotFocus(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.onWindowGotFocus(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function onWindowLostFocus(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.onWindowLostFocus(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function onEvent(callback) {
        let unsubFunc;
        let unsubscribed = false;
        isReady.then(() => {
            if (unsubscribed) {
                return;
            }
            unsubFunc = environment.onEvent(callback);
        });
        return () => {
            unsubscribed = true;
            if (unsubFunc) {
                unsubFunc();
            }
        };
    }
    function createFlydown(targetId, config) {
        return environment.createFlydown(targetId, config);
    }
    function showPopup(targetId, config) {
        return environment.showPopup(targetId, config);
    }
    function handleWindowAdded(w) {
        _registry.execute("window-added", w.API);
    }
    function handleWindowRemoved(w) {
        _registry.execute("window-removed", w.API);
    }
    windowStore.onReadyWindow(handleWindowAdded);
    windowStore.onRemoved(handleWindowRemoved);
    return {
        my,
        open,
        find,
        findById,
        list,
        ready,
        onWindowAdded: windowAdded,
        windowAdded,
        onWindowRemoved: windowRemoved,
        windowRemoved,
        onTabAttached: tabAttached,
        onTabDetached: tabDetached,
        onWindowFrameColorChanged,
        get groups() {
            return groups.groupsAPI;
        },
        onWindowGotFocus,
        onWindowLostFocus,
        onEvent,
        createFlydown,
        showPopup,
        configure
    };
};

class LayoutStore {
    constructor() {
        this.layouts = [];
    }
    removeWhere(condition) {
        this.layouts = this.layouts.filter(condition);
    }
    add(item) {
        this.layouts.push(item);
    }
    get all() {
        return this.layouts;
    }
    where(condition) {
        return this.layouts.filter(condition);
    }
    first(condition) {
        return this.where(condition)[0];
    }
}
var store = new LayoutStore();

const SaveContextMethodName = "T42.HC.GetSaveContext";
class ContextProvider {
    constructor(config, activitiesGetter, callbacks, logger) {
        this.config = config;
        this.activitiesGetter = activitiesGetter;
        this.callbacks = callbacks;
        this.logger = logger;
        this.interop = config.agm;
        this.registerRequestMethods();
    }
    onSaveRequested(callback) {
        return this.callbacks.add("saveRequested", callback);
    }
    isActivityOwner() {
        if (typeof htmlContainer !== "undefined") {
            const context = htmlContainer.getContext();
            return context && context._t42 && context._t42.activityIsOwner;
        }
        const activities = this.activitiesGetter();
        if (!activities) {
            return false;
        }
        if (!activities.inActivity) {
            return false;
        }
        const myWindow = activities.my.window;
        const myActivity = activities.my.activity;
        if (!myActivity && !myWindow) {
            return false;
        }
        return myActivity.owner.id === myWindow.id;
    }
    registerRequestMethods() {
        this.interop.register(SaveContextMethodName, (args) => {
            const usersCbs = this.callbacks.execute("saveRequested", args);
            if ((usersCbs === null || usersCbs === void 0 ? void 0 : usersCbs.length) > 1) {
                this.logger.warn(`Multiple subscriptions for "glue.layouts.onSaveRequested" - only the first one will be used`);
            }
            const requestResult = usersCbs[0];
            const autoSaveWindowContext = this.config.autoSaveWindowContext;
            if (typeof autoSaveWindowContext === "boolean" && autoSaveWindowContext) {
                return { autoSaveWindowContext };
            }
            else if (Array.isArray(autoSaveWindowContext) && autoSaveWindowContext.length > 0) {
                return { autoSaveWindowContext };
            }
            const result = { windowContext: requestResult === null || requestResult === void 0 ? void 0 : requestResult.windowContext, activityContext: undefined };
            if (this.isActivityOwner()) {
                result.activityContext = requestResult === null || requestResult === void 0 ? void 0 : requestResult.activityContext;
            }
            return result;
        });
    }
}

function transformACSLayout(something) {
    if (!something) {
        return something;
    }
    if (Array.isArray(something)) {
        return something.map((item) => {
            return transformACSLayout(item);
        });
    }
    if (typeof something === "string" || typeof something === "number" || typeof something === "boolean") {
        return something;
    }
    const initial = {};
    return Object.keys(something).reduce((accumulator, current) => {
        const value = something[current];
        const convertedValue = transformACSLayout(value);
        let key = current;
        if (current[0].toLowerCase() !== current[0]) {
            key = current[0].toLowerCase() + current.substr(1);
        }
        accumulator[key] = convertedValue;
        return accumulator;
    }, initial);
}

class LayoutImpl {
    constructor(data) {
        this.name = data.name;
        this.type = data.type;
        this.components = data.components;
        this.context = data.context;
        this.metadata = data.metadata;
        this.version = data.version;
        this.displays = data.displays;
    }
}

class LayoutsAPIImpl {
    constructor(config, stream, callbacks, logger) {
        this.config = config;
        this.stream = stream;
        this.callbacks = callbacks;
        this.appManager = config.appManager;
        this.onEvent = stream.onEvent;
        this.provider = new ContextProvider(config, config.activityGetter, callbacks, logger);
        stream.subscribe();
    }
    async setDefaultGlobal(name) {
        await this.config.agm.invoke("T42.ACS.SelectDefaultLayout", { name });
        return;
    }
    async clearDefaultGlobal() {
        await this.config.agm.invoke("T42.ACS.DeselectDefaultLayout");
        return;
    }
    async getDefaultGlobal() {
        const result = await this.config.agm.invoke("T42.ACS.GetDefaultLayout");
        const layout = result.returned;
        if (!layout) {
            return undefined;
        }
        if (this.isSlimMode()) {
            return layout;
        }
        return this.list().find((l) => l.name === layout.name && l.type === "Global");
    }
    ready() {
        if (this.config.mode === "fullWaitSnapshot") {
            return this.stream.gotSnapshot;
        }
        return this.stream.ready;
    }
    save(layout) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            this.verifyNotSlimMode();
            if (isUndefinedOrNull(layout)) {
                return reject(new Error("layout is required"));
            }
            if (isNullOrWhiteSpace(layout.name)) {
                return reject(new Error("layout.name argument is required"));
            }
            if (isNullOrWhiteSpace(layout.type)) {
                layout.type = "Global";
            }
            if (!isNullOrWhiteSpace(layout.activityId)) {
                layout.type = "Activity";
            }
            const layoutObject = {
                name: layout.name,
                type: layout.type,
                context: (_a = layout.context) !== null && _a !== void 0 ? _a : {},
                metadata: (_b = layout.metadata) !== null && _b !== void 0 ? _b : {},
                options: {},
            };
            if (layout.type === "Activity") {
                let actId = layout.activityId;
                if (!actId) {
                    if (!this.appManager.myInstance.inActivity) {
                        return reject(new Error("Current application is not in activity. Cannot save activity layout for it."));
                    }
                    actId = this.appManager.myInstance.activityId;
                }
                layoutObject.activityId = actId;
            }
            else if (layout.type === "Global") {
                if (Array.isArray(layout.ignoreInstances)) {
                    layoutObject.options.ignoreInstances = layout.ignoreInstances;
                }
                if (Array.isArray(layout.instances)) {
                    layoutObject.options.instances = layout.instances;
                }
            }
            else {
                return reject(new Error(`layout type ${layout.type} is not supported`));
            }
            this.invokeMethodAndTrack("T42.ACS.SaveLayout", layoutObject, resolve, reject);
        });
    }
    restore(options) {
        return new Promise((resolve, reject) => {
            var _a, _b, _c;
            this.verifyNotSlimMode();
            if (isUndefinedOrNull(options)) {
                return reject(new Error("options argument is required"));
            }
            if (isNullOrWhiteSpace(options.name)) {
                return reject(new Error("options.name argument is required"));
            }
            if (isNullOrWhiteSpace(options.type)) {
                options.type = "Global";
            }
            if (!isNullOrWhiteSpace(options.activityIdToJoin)) {
                options.type = "Activity";
            }
            if (options.type === "Activity") {
                if (isUndefinedOrNull(options.setActivityContext)) {
                    options.setActivityContext = true;
                }
                if (typeof options.setActivityContext !== "boolean") {
                    return reject(new Error("`setActivityContext` must hold a boolean value."));
                }
                options.activityIdToJoin = (_a = options.activityIdToJoin) !== null && _a !== void 0 ? _a : this.appManager.myInstance.activityId;
            }
            if (!isUndefinedOrNull(options.closeRunningInstance)) {
                options.closeRunningInstances = options.closeRunningInstance;
            }
            if (isUndefinedOrNull(options.closeRunningInstances)) {
                options.closeRunningInstances = true;
            }
            if (!isBoolean(options.closeRunningInstances)) {
                return reject(new Error("`closeRunningInstances` must hold a boolean value."));
            }
            if (isUndefinedOrNull(options.closeMe)) {
                options.closeMe = options.closeRunningInstances;
            }
            if (!isBoolean(options.closeMe)) {
                return reject(new Error("`closeMe` must hold a boolean value."));
            }
            if (!isUndefinedOrNull(options.context) && !isObject(options.context)) {
                return reject(new Error("`context` must hold an object value."));
            }
            if (!isUndefinedOrNull(options.timeout) && typeof options.timeout !== "number") {
                return reject(new Error("`timeout` must hold an number value."));
            }
            options.context = (_b = options.context) !== null && _b !== void 0 ? _b : {};
            const restoreOptions = {
                activityToJoin: options.activityIdToJoin,
                setActivityContext: options.setActivityContext,
                ignoreActivityWindowTypes: options.ignoreActivityWindowTypes,
                reuseExistingWindows: options.reuseWindows,
                closeRunningInstances: options.closeRunningInstances,
                excludeFromClosing: options.closeMe ? [] : [(_c = this.appManager.myInstance) === null || _c === void 0 ? void 0 : _c.id]
            };
            const arg = {
                type: options.type,
                name: options.name,
                context: options.context,
                options: restoreOptions
            };
            if (options.timeout) {
                arg.timeout = options.timeout;
            }
            this.invokeMethodAndTrack("T42.ACS.RestoreLayout", arg, resolve, reject, true);
        });
    }
    remove(type, name) {
        return new Promise((resolve, reject) => {
            this.verifyNotSlimMode();
            if (!name) {
                return reject(new Error("name argument is required"));
            }
            if (!type) {
                return reject(new Error("type argument is required"));
            }
            const msg = {
                type,
                name,
            };
            this.invokeMethodAndTrack("T42.ACS.RemoveLayout", msg, resolve, reject);
        });
    }
    list() {
        this.verifyNotSlimMode();
        return store.all;
    }
    import(layouts, mode) {
        return new Promise((resolve, reject) => {
            this.verifyNotSlimMode();
            if (!isUndefinedOrNull(mode)) {
                if (mode !== "merge" && mode !== "replace") {
                    return reject(new Error(`${mode} is not supported - only "merge" and "replace"`));
                }
            }
            if (!Array.isArray(layouts)) {
                return reject(new Error("layouts arguments is not an array"));
            }
            const msg = {
                mode: mode || "replace",
                layouts
            };
            this.invokeMethodAndTrack("T42.ACS.ImportLayouts", msg, resolve, reject, true);
        });
    }
    export(layoutType) {
        return new Promise((resolve, reject) => {
            const handleResult = (result) => {
                let layouts = this.getObjectValues(result.Layouts).map((t) => new LayoutImpl(transformACSLayout(t)));
                if (layoutType) {
                    layouts = layouts.filter((l) => l.type === layoutType);
                }
                resolve(layouts);
            };
            this.invokeMethodAndTrack("T42.ACS.ExportLayouts", {}, handleResult, reject, true);
        });
    }
    rename(layout, newName) {
        return new Promise((resolve, reject) => {
            this.verifyNotSlimMode();
            if (!layout) {
                return reject(new Error("layout argument is required"));
            }
            if (!layout.name) {
                return reject(new Error("name argument is required"));
            }
            if (!layout.type) {
                return reject(new Error("type argument is required"));
            }
            const msg = { type: layout.type, oldName: layout.name, newName };
            this.invokeMethodAndTrack("T42.ACS.RenameLayout", msg, resolve, reject);
        });
    }
    updateMetadata(layout) {
        return new Promise((resolve, reject) => {
            if (!layout) {
                return reject(new Error("layout argument is required"));
            }
            if (!layout.name) {
                return reject(new Error("name argument is required"));
            }
            if (!layout.type) {
                return reject(new Error("type argument is required"));
            }
            if (!layout.metadata) {
                return reject(new Error("metadata argument is required"));
            }
            const layoutObject = {
                name: layout.name,
                type: layout.type,
                metadata: layout.metadata
            };
            this.invokeMethodAndTrack("T42.ACS.UpdateMetadata", layoutObject, resolve, reject, true);
        });
    }
    hibernate(name, options) {
        return new Promise((resolve, reject) => {
            if (!name) {
                return reject(new Error("name cannot be empty"));
            }
            options = options || {};
            const request = {
                name,
                type: "Global",
                context: options.context || {},
                metadata: options.metadata || {},
            };
            this.invokeMethodAndTrack("T42.ACS.HibernateLayout", request, resolve, reject, true);
        });
    }
    resume(name, context, options) {
        return new Promise((resolve, reject) => {
            if (!name) {
                return reject(new Error("name cannot be empty"));
            }
            const request = {
                name,
                type: "Global",
                context,
                ...options
            };
            this.invokeMethodAndTrack("T42.ACS.ResumeLayout", request, resolve, reject, true);
        });
    }
    async getCurrentLayout() {
        const result = await this.config.agm.invoke("T42.ACS.GetCurrentLayout", {}, "best", { methodResponseTimeoutMs: 120 * 1000 });
        let layout = result.returned.layout;
        if (!layout) {
            return undefined;
        }
        if (!this.isSlimMode()) {
            layout = this.list().find((l) => l.name === layout.name && l.type === layout.type);
        }
        return layout;
    }
    onAdded(callback) {
        const result = this.callbacks.add("added", callback);
        if (store.all.length > 0) {
            store.all.forEach((layout) => {
                try {
                    callback(layout);
                }
                catch (err) { }
            });
        }
        return result;
    }
    onRemoved(callback) {
        return this.callbacks.add("removed", callback);
    }
    onChanged(callback) {
        return this.callbacks.add("changed", callback);
    }
    onRestored(callback) {
        return this.callbacks.add("restored", callback);
    }
    onRenamed(callback) {
        return this.callbacks.add("renamed", callback);
    }
    onEvent(callback) {
        return this.stream.onEvent(callback);
    }
    onSaveRequested(callback) {
        return this.provider.onSaveRequested(callback);
    }
    updateAppContextInCurrent(context) {
        return new Promise((resolve, reject) => {
            if (context && typeof context !== "object") {
                return reject(new Error("context must be an object"));
            }
            context = context !== null && context !== void 0 ? context : {};
            const request = {
                context
            };
            this.invokeMethodAndTrack("T42.ACS.UpdateLayoutComponentContext", request, resolve, reject, true);
        });
    }
    updateDefaultContext(context) {
        return new Promise((resolve, reject) => {
            if (context && typeof context !== "object") {
                return reject(new Error("context must be an object"));
            }
            context = context !== null && context !== void 0 ? context : {};
            const request = {
                context
            };
            this.invokeMethodAndTrack("T42.ACS.UpdateDefaultContext", request, resolve, reject, true);
        });
    }
    async get(name, type) {
        const matching = this.list().find((l) => l.name === name && l.type === type);
        if (!matching) {
            throw new Error(`cannot find layout with name=${name} and type=${type}`);
        }
        return matching;
    }
    async getAll(type) {
        const matching = this.list().filter((l) => type === l.type);
        return matching;
    }
    isSlimMode() {
        return this.config.mode === "slim";
    }
    verifyNotSlimMode() {
        if (this.isSlimMode()) {
            throw Error("Operation not allowed in slim mode. Run in full mode.");
        }
    }
    invokeMethodAndTrack(methodName, args, resolve, reject, skipStreamEvent) {
        let streamEventReceived = skipStreamEvent;
        let agmResult;
        const token = shortid();
        args.token = token;
        const handleResult = () => {
            if (streamEventReceived && agmResult) {
                resolve(agmResult);
            }
        };
        if (!skipStreamEvent) {
            this.stream.waitFor(token)
                .then(() => {
                streamEventReceived = true;
                handleResult();
            })
                .catch((err) => {
                reject(err);
            });
        }
        const responseHandler = (result) => {
            if (!result.returned) {
                return reject(new Error("No result from method " + methodName));
            }
            if (result.returned.status && (result.returned.status !== "Success" && result.returned.status !== "PartialSuccess")) {
                if (typeof (result.returned) === "string") {
                    return reject(new Error(result.returned));
                }
                else if (typeof (result.returned) === "object") {
                    if (result.returned.status && result.returned.failed) {
                        return reject(new Error(`${result.returned.status}: ${JSON.stringify(result.returned.failed)}`));
                    }
                    else {
                        return reject(new Error(result.returned));
                    }
                }
            }
            agmResult = result.returned;
            handleResult();
        };
        this.config.agm.invoke(methodName, args, "best", { methodResponseTimeoutMs: 120 * 1000 })
            .then(responseHandler)
            .catch((err) => reject(err));
    }
    getObjectValues(obj) {
        if (!obj) {
            return [];
        }
        return Object.keys(obj).map((k) => obj[k]);
    }
}

class ACSStream {
    constructor(agm, callbacks) {
        this.agm = agm;
        this.callbacks = callbacks;
        this.ready = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
            this.rejectReady = reject;
        });
        this.gotSnapshot = new Promise((resolve, reject) => {
            this.resolveGotSnapshot = resolve;
            this.rejectGotSnapshot = reject;
        });
    }
    subscribe(noRetry) {
        const transform = (obj) => {
            return this.getObjectValues(obj).map((t) => transformACSLayout(t));
        };
        if (!this.checkForLayoutEventMethod()) {
            if (noRetry) {
                this.resolveReady();
            }
            setTimeout(() => {
                this.subscribe(true);
            }, 500);
        }
        else {
            this.agm.subscribe("T42.ACS.OnLayoutEvent", { waitTimeoutMs: 10000 })
                .then((subs) => {
                subs.onData((args) => {
                    const data = args.data;
                    if (data.IsSnapshot) {
                        this.resolveGotSnapshot();
                    }
                    this.addLayouts(transform(data.OnLayoutAdded));
                    this.removeLayouts(transform(data.OnLayoutRemoved));
                    this.changeLayouts(transform(data.OnLayoutChanged));
                    this.renameLayouts(transform(data.OnLayoutRenamed));
                    this.restoredLayout(transform(data.OnLayoutRestored));
                    this.callbacks.execute("streamEvent", data);
                });
                subs.onFailed((err) => {
                    const msg = "can not subscribe to T42.ACS.OnLayoutEvent " + err;
                    this.rejectReady(msg);
                    this.rejectGotSnapshot(msg);
                });
                this.resolveReady();
            })
                .catch((err) => {
                const msg = "Error subscribing for T42.ACS.OnLayoutEvent stream. Err: " + err;
                this.rejectReady(msg);
                this.rejectGotSnapshot(msg);
            });
        }
    }
    onEvent(callback) {
        return this.callbacks.add("streamEvent", callback);
    }
    waitFor(token, timeout) {
        if (!timeout) {
            timeout = 10000;
        }
        return new Promise((resolve, reject) => {
            let done = false;
            const unsubscribe = this.onEvent((streamEvent) => {
                if (streamEvent.Token === token) {
                    done = true;
                    unsubscribe();
                    resolve();
                }
            });
            setTimeout(() => {
                if (!done) {
                    reject("timed out");
                }
            }, timeout);
        });
    }
    checkForLayoutEventMethod() {
        try {
            return this.agm
                .methods()
                .map((m) => m.name)
                .indexOf("T42.ACS.OnLayoutEvent") !== -1;
        }
        catch (e) {
            return false;
        }
    }
    addLayouts(layoutsData) {
        if (!layoutsData) {
            return;
        }
        layoutsData.forEach((layoutData) => {
            const layout = new LayoutImpl(layoutData);
            store.add(layout);
            this.callbacks.execute("added", layout);
        });
    }
    removeLayouts(removedLayouts) {
        if (!removedLayouts) {
            return;
        }
        removedLayouts.forEach((removedLayout) => {
            store.removeWhere((existingLayout) => !this.compareLayouts(existingLayout, removedLayout));
            this.callbacks.execute("removed", removedLayout);
        });
    }
    changeLayouts(changedLayouts) {
        if (!changedLayouts) {
            return;
        }
        changedLayouts.forEach((changedLayout) => {
            store.removeWhere((existingLayout) => !this.compareLayouts(existingLayout, changedLayout));
            store.add(new LayoutImpl(changedLayout));
            this.callbacks.execute("changed", changedLayout);
        });
    }
    renameLayouts(renamedLayouts) {
        if (!renamedLayouts) {
            return;
        }
        renamedLayouts.forEach((renamedLayout) => {
            const existingLayout = store.first((current) => this.compareLayouts(current, { type: renamedLayout.type, name: renamedLayout.oldName }));
            if (!existingLayout) {
                throw Error("received rename event for unknown layout with type " + renamedLayout.type + " and name " + renamedLayout.oldName);
            }
            existingLayout.name = renamedLayout.newName;
            this.callbacks.execute("renamed", existingLayout);
        });
    }
    compareLayouts(layout1, layout2) {
        return layout1.name === layout2.name && layout1.type === layout2.type;
    }
    getObjectValues(obj) {
        if (!obj) {
            return [];
        }
        return Object.keys(obj).map((k) => obj[k]);
    }
    restoredLayout(restoredLayouts) {
        if (!restoredLayouts) {
            return;
        }
        restoredLayouts.forEach((restoredLayout) => {
            const existingLayout = store.first((current) => this.compareLayouts(current, { type: restoredLayout.type, name: restoredLayout.name }));
            this.callbacks.execute("restored", existingLayout);
        });
    }
}

function streamNull () {
    return {
        ready: Promise.resolve(undefined),
        subscribe: () => { },
        onEvent: (callback) => () => { },
        waitFor: (token, timeout) => Promise.resolve(undefined),
        gotSnapshot: Promise.resolve(undefined),
    };
}

function LayoutsFactory (config) {
    if (!config.agm) {
        throw Error("config.agm is required");
    }
    if (!config.logger) {
        throw Error("config.logger is required");
    }
    config.mode = config.mode || "slim";
    const logger = config.logger;
    const callbacks = lib$1();
    let acsStream;
    if (config.mode === "full" || "fullWaitSnapshot") {
        acsStream = new ACSStream(config.agm, callbacks);
    }
    else {
        acsStream = streamNull();
    }
    return new LayoutsAPIImpl(config, acsStream, callbacks, logger);
}

const T42DisplayCommand = "T42.Displays.Command";
const T42DisplayOnEvent = "T42.Displays.OnEvent";
class DisplayManager {
    constructor(_agm, _logger) {
        this._agm = _agm;
        this._logger = _logger;
        this._registry = lib$1();
        this._registered = false;
        this.all = async () => {
            const displays = await this.callGD(DisplayCommand.GetAll, {});
            return displays.map(this.decorateDisplay);
        };
        this.get = async (id) => {
            const display = await this.callGD(DisplayCommand.Get, { id });
            return this.decorateDisplay(display);
        };
        this.getPrimary = async () => {
            const primary = (await this.all()).find((d) => d.isPrimary);
            return primary;
        };
        this.capture = async (options) => {
            const screenshot = await this.callGD(DisplayCommand.Capture, { ...options });
            return screenshot;
        };
        this.captureAll = async (options) => {
            const screenshots = await this.callGD(DisplayCommand.CaptureAll, { ...options });
            return screenshots;
        };
        this.getMousePosition = async () => {
            const point = await this.callGD(DisplayCommand.GetMousePosition);
            return point;
        };
        this.callGD = async (command, options) => {
            const invocationResult = await this._agm.invoke(T42DisplayCommand, { options: { ...options }, command });
            return invocationResult.returned.data;
        };
        this.decorateDisplay = (original) => {
            const decoratedDisplay = {
                ...original,
                capture: (size) => this.capture({ id: original.id, size })
            };
            const workAreaAsAny = decoratedDisplay.workArea;
            workAreaAsAny.x = workAreaAsAny.left;
            workAreaAsAny.y = decoratedDisplay.workArea.top;
            return decoratedDisplay;
        };
    }
    getByWindowId(id) {
        const current = this.callGD(DisplayCommand.GetByWindowId, { id });
        return current;
    }
    onDisplayChanged(cb) {
        this.register();
        return this._registry.add("on-display-changed", cb);
    }
    register() {
        if (this._registered) {
            return;
        }
        this._registered = true;
        this._agm.register(T42DisplayOnEvent, (args, caller) => {
            const event = args.event;
            const data = args.data;
            switch (event) {
                case "display-changed":
                    this._registry.execute("on-display-changed", data.displays.map(this.decorateDisplay));
                    break;
                default:
                    this._logger.warn(`unknown event - ${event}`);
                    break;
            }
        });
    }
}
var DisplayCommand;
(function (DisplayCommand) {
    DisplayCommand["Capture"] = "capture";
    DisplayCommand["CaptureAll"] = "captureAll";
    DisplayCommand["GetAll"] = "getAll";
    DisplayCommand["Get"] = "get";
    DisplayCommand["GetByWindowId"] = "getByWindowId";
    DisplayCommand["GetMousePosition"] = "getMousePosition";
})(DisplayCommand || (DisplayCommand = {}));

let interop;
let windowId;
async function setupAGM(interopLib, channels) {
    interop = interopLib;
    if (typeof window !== "undefined") {
        if (window.glue42gd) {
            windowId = window.glue42gd.windowId;
        }
    }
    if (!windowId) {
        return;
    }
    await interop.register("T42.Channels.Command", (args) => {
        const command = args.command;
        if (!command) {
            throw new Error("missing command argument");
        }
        if (command === "join") {
            const id = args.channel;
            if (!id) {
                throw new Error("missing argument id");
            }
            channels.joinNoSelectorSwitch(id);
            return;
        }
        if (command === "leave") {
            channels.leaveNoSelectorSwitch();
            return;
        }
        if (command === "get") {
            const id = channels.current();
            return { id };
        }
        throw new Error(`unknown command ${command}`);
    });
    interop.invoke("T42.Channels.Announce", { swId: windowId, instance: interop.instance.instance });
}
async function switchChannel(channel, id) {
    interop.invoke("T42.Channels.Announce", {
        swId: id !== null && id !== void 0 ? id : windowId,
        command: "switchChannel",
        data: { newChannel: channel }
    });
}

const CONTEXT_PREFIX = "___channel___";
const LATEST_FDC3_TYPE = "latest_fdc3_type";
class SharedContextSubscriber {
    constructor(contexts) {
        this.contexts = contexts;
    }
    subscribe(callback) {
        this.callback = callback;
    }
    subscribeFor(name, callback) {
        if (!this.isChannel(name)) {
            return Promise.reject(new Error(`Channel with name: ${name} doesn't exist!`));
        }
        const contextName = this.createContextName(name);
        return this.contexts.subscribe(contextName, (data, _, __, ___, extraData) => {
            callback(data.data, data, extraData === null || extraData === void 0 ? void 0 : extraData.updaterId);
        });
    }
    async switchChannel(name) {
        this.unsubscribe();
        const contextName = this.createContextName(name);
        this.unsubscribeFunc = await this.contexts.subscribe(contextName, (data, _, __, ___, extraData) => {
            if (this.callback) {
                this.callback(data.data, data, extraData === null || extraData === void 0 ? void 0 : extraData.updaterId);
            }
        });
    }
    leave() {
        if (this.callback) {
            this.callback({}, undefined);
        }
        this.unsubscribe();
    }
    all() {
        const contextNames = this.contexts.all();
        const channelContextNames = contextNames.filter((contextName) => contextName.startsWith(CONTEXT_PREFIX));
        const channelNames = channelContextNames.map((channelContextName) => channelContextName.substr(CONTEXT_PREFIX.length));
        return channelNames;
    }
    getContextData(name) {
        return new Promise((resolve, reject) => {
            if (!this.isChannel(name)) {
                return reject(new Error(`A channel with name: ${name} doesn't exist!`));
            }
            const contextName = this.createContextName(name);
            this.contexts.subscribe(contextName, (data) => {
                if (data[LATEST_FDC3_TYPE]) {
                    const { latest_fdc3_type, ...rest } = data;
                    resolve(rest);
                }
                resolve(data);
            }).then((unsubscribeFunc) => unsubscribeFunc());
        });
    }
    updateChannel(name, data) {
        const contextName = this.createContextName(name);
        return this.contexts.update(contextName, data);
    }
    updateData(name, data) {
        const contextName = this.createContextName(name);
        const fdc3Type = this.getFDC3Type(data);
        if (this.contexts.setPathSupported) {
            const pathValues = Object.keys(data).map((key) => {
                return {
                    path: `data.` + key,
                    value: data[key]
                };
            });
            if (fdc3Type) {
                pathValues.push({ path: LATEST_FDC3_TYPE, value: fdc3Type });
            }
            return this.contexts.setPaths(contextName, pathValues);
        }
        else {
            if (fdc3Type) {
                data[LATEST_FDC3_TYPE] = fdc3Type;
            }
            return this.contexts.update(contextName, { data });
        }
    }
    isChannel(name) {
        return this.all().some((channelName) => channelName === name);
    }
    unsubscribe() {
        if (this.unsubscribeFunc) {
            this.unsubscribeFunc();
        }
    }
    createContextName(name) {
        return CONTEXT_PREFIX + name;
    }
    getFDC3Type(data) {
        const fdc3PropsArr = Object.keys(data).filter((key) => key.indexOf("fdc3_") === 0);
        if (fdc3PropsArr.length === 0) {
            return;
        }
        if (fdc3PropsArr.length > 1) {
            throw new Error("FDC3 does not support updating of multiple context keys");
        }
        return fdc3PropsArr[0].split("_").slice(1).join("_");
    }
}

class ChannelsImpl {
    constructor(shared, interop, getWindows, logger) {
        this.shared = shared;
        this.interop = interop;
        this.getWindows = getWindows;
        this.logger = logger;
        this.subsKey = "subs";
        this.changedKey = "changed";
        this.isInitialJoin = true;
        this.registry = lib$1();
        this.pendingReplays = {};
        this.shared.subscribe(this.handler.bind(this));
        if (typeof window !== "undefined" && typeof window.glue42gd !== "undefined") {
            this.currentContext = window.glue42gd.initialChannel;
            if (this.currentContext) {
                this.joinNoSelectorSwitch(this.currentContext);
            }
        }
    }
    subscribe(callback) {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        const id = shortid();
        this.pendingReplays[id] = true;
        if (this.lastUpdate) {
            let lastUpdate = Object.assign({}, this.lastUpdate);
            setTimeout(() => {
                if (this.pendingReplays[id]) {
                    if (this.lastUpdate) {
                        lastUpdate = this.lastUpdate;
                    }
                    callback(lastUpdate.context.data, lastUpdate.context, lastUpdate.updaterId);
                }
                delete this.pendingReplays[id];
            }, 0);
        }
        const unsub = this.registry.add(this.subsKey, callback);
        return () => {
            this.pendingReplays[id] = false;
            unsub();
        };
    }
    async subscribeFor(name, callback) {
        if (typeof name !== "string") {
            throw new Error("Please provide the name as a string!");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        const unsubscribeFunc = await this.shared.subscribeFor(name, callback);
        return unsubscribeFunc;
    }
    async publish(data, name) {
        if (typeof data !== "object") {
            throw new Error("Please provide the data as an object!");
        }
        if (name) {
            if (typeof name !== "string") {
                throw new Error("Please provide the name as a string!");
            }
            if (!this.shared.isChannel(name)) {
                return Promise.reject(new Error(`A channel with name: ${name} doesn't exist!`));
            }
            return this.shared.updateData(name, data);
        }
        if (!this.currentContext) {
            throw new Error("Not joined to any channel!");
        }
        return this.shared.updateData(this.currentContext, data);
    }
    all() {
        const channelNames = this.shared.all();
        return Promise.resolve(channelNames);
    }
    async list() {
        const channelNames = await this.all();
        const channelContexts = await Promise.all(channelNames.map((channelName) => this.get(channelName)));
        return channelContexts;
    }
    get(name) {
        if (typeof name !== "string") {
            return Promise.reject(new Error("Please provide the channel name as a string!"));
        }
        return this.shared.getContextData(name);
    }
    getMy() {
        if (!this.currentContext) {
            return Promise.resolve(undefined);
        }
        return this.get(this.currentContext);
    }
    async join(name, windowId) {
        if (windowId) {
            return switchChannel(name, windowId);
        }
        return this.joinCore(name);
    }
    async joinNoSelectorSwitch(name) {
        return this.joinCore(name, false);
    }
    leave(windowId) {
        if (windowId) {
            return switchChannel(undefined, windowId);
        }
        return this.leaveCore();
    }
    leaveNoSelectorSwitch() {
        return this.leaveCore(false);
    }
    current() {
        return this.currentContext;
    }
    my() {
        return this.current();
    }
    changed(callback) {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }
        const current = this.current();
        if (current) {
            setTimeout(() => {
                callback(this.current());
            }, 0);
        }
        return this.registry.add(this.changedKey, callback);
    }
    onChanged(callback) {
        return this.changed(callback);
    }
    async add(info) {
        if (typeof info !== "object") {
            throw new Error("Please provide the info as an object!");
        }
        if (typeof info.name === "undefined") {
            throw new Error("info.name is missing!");
        }
        if (typeof info.name !== "string") {
            throw new Error("Please provide the info.name as a string!");
        }
        if (typeof info.meta === "undefined") {
            throw new Error("info.meta is missing!");
        }
        if (typeof info.meta !== "object") {
            throw new Error("Please provide the info.meta as an object!");
        }
        if (typeof info.meta.color === "undefined") {
            throw new Error("info.meta.color is missing!");
        }
        if (typeof info.meta.color !== "string") {
            throw new Error("Please provide the info.meta.color as a string!");
        }
        const context = {
            name: info.name,
            meta: info.meta || {},
            data: info.data || {}
        };
        await this.shared.updateChannel(info.name, context);
        return context;
    }
    async getWindowsOnChannel(channel) {
        const windowInfos = await this.getWindowsWithChannels({ channels: [channel] });
        return windowInfos.map((w) => w.window);
    }
    async getWindowsWithChannels(filter) {
        var _a;
        try {
            const info = await this.interop.invoke("T42.Channels.Announce", { command: "getChannelsInfo", data: { filter } });
            const windows = this.getWindows();
            if ((_a = info === null || info === void 0 ? void 0 : info.returned) === null || _a === void 0 ? void 0 : _a.windows) {
                return info.returned.windows.map((windowInfo) => {
                    const window = windows.findById(windowInfo.windowId);
                    return {
                        window,
                        channel: windowInfo.channel,
                        application: windowInfo.application
                    };
                });
            }
        }
        catch (er) {
            this.logger.error(`Error getting all channel enabled windows. This method is available since Glue42 3.12`, er);
        }
        return [];
    }
    handler(data, context, updaterId) {
        this.lastUpdate = { context, updaterId };
        this.pendingReplays = {};
        this.registry.execute(this.subsKey, data, context, updaterId);
    }
    async joinCore(name, changeSelector = true) {
        if (typeof name !== "string") {
            throw new Error("Please provide the channel name as a string!");
        }
        if (!this.isInitialJoin && name === this.currentContext) {
            return;
        }
        this.isInitialJoin = false;
        const doesChannelExist = (channelName) => {
            const channelNames = this.shared.all();
            return channelNames.includes(channelName);
        };
        if (!doesChannelExist(name)) {
            const channelExistsPromise = new Promise((resolve, reject) => {
                let timeoutId;
                const intervalId = setInterval(() => {
                    if (doesChannelExist(name)) {
                        clearTimeout(timeoutId);
                        clearInterval(intervalId);
                        resolve();
                    }
                }, 100);
                timeoutId = setTimeout(() => {
                    clearInterval(intervalId);
                    return reject(new Error(`A channel with name: ${name} doesn't exist!`));
                }, 3000);
            });
            await channelExistsPromise;
        }
        this.currentContext = name;
        this.lastUpdate = undefined;
        await this.shared.switchChannel(name);
        if (changeSelector) {
            switchChannel(name);
        }
        this.registry.execute(this.changedKey, name);
    }
    leaveCore(changeSelector = true) {
        this.currentContext = undefined;
        this.registry.execute(this.changedKey, undefined);
        this.shared.leave();
        if (changeSelector) {
            switchChannel();
        }
        return Promise.resolve();
    }
}

function factory$4(contexts, agm, getWindows, logger) {
    const sharedContexts = new SharedContextSubscriber(contexts);
    const channels = new ChannelsImpl(sharedContexts, agm, getWindows, logger);
    setupAGM(agm, channels);
    return {
        subscribe: channels.subscribe.bind(channels),
        subscribeFor: channels.subscribeFor.bind(channels),
        publish: channels.publish.bind(channels),
        all: channels.all.bind(channels),
        list: channels.list.bind(channels),
        get: channels.get.bind(channels),
        join: channels.join.bind(channels),
        leave: channels.leave.bind(channels),
        current: channels.current.bind(channels),
        my: channels.my.bind(channels),
        changed: channels.changed.bind(channels),
        onChanged: channels.onChanged.bind(channels),
        add: channels.add.bind(channels),
        getWindowsOnChannel: channels.getWindowsOnChannel.bind(channels),
        getWindowsWithChannels: channels.getWindowsWithChannels.bind(channels),
        getMy: channels.getMy.bind(channels),
        ready: () => contexts.ready()
    };
}

const CommandMethod = "T42.Hotkeys.Command";
const InvokeMethod = "T42.Hotkeys.Invoke";
const RegisterCommand = "register";
const UnregisterCommand = "unregister";
const UnregisterAllCommand = "unregisterAll";
class HotkeysImpl {
    constructor(agm) {
        this.agm = agm;
        this.registry = lib$1();
        this.firstHotkey = true;
        this.hotkeys = new Map();
    }
    async register(info, callback) {
        if (typeof info === "undefined") {
            throw new Error("Hotkey parameter missing");
        }
        if (typeof info === "string") {
            info = {
                hotkey: info
            };
        }
        else {
            if (!info.hotkey) {
                throw new Error("Info's hotkey parameter missing");
            }
            info = {
                hotkey: info.hotkey,
                description: info.description
            };
        }
        const hkToLower = this.formatHotkey(info.hotkey);
        if (this.hotkeys.has(hkToLower)) {
            throw new Error(`Shortcut for ${hkToLower} already registered`);
        }
        if (this.firstHotkey) {
            this.firstHotkey = false;
            await this.registerInvokeAGMMethod();
        }
        this.registry.add(hkToLower, callback);
        await this.agm.invoke(CommandMethod, { command: RegisterCommand, hotkey: hkToLower, description: info.description });
        this.hotkeys.set(hkToLower, info);
    }
    async unregister(hotkey) {
        if (typeof hotkey === "undefined") {
            throw new Error("hotkey parameter missing");
        }
        if (typeof hotkey !== "string") {
            throw new Error("hotkey parameter must be string");
        }
        const hkToLower = this.formatHotkey(hotkey);
        await this.agm.invoke(CommandMethod, { command: UnregisterCommand, hotkey: hkToLower });
        this.hotkeys.delete(hkToLower);
        this.registry.clearKey(hkToLower);
    }
    async unregisterAll() {
        await this.agm.invoke(CommandMethod, { command: UnregisterAllCommand });
        this.hotkeys.clear();
        this.registry.clear();
    }
    isRegistered(hotkey) {
        const hkToLower = this.formatHotkey(hotkey);
        return this.hotkeys.has(hkToLower);
    }
    registerInvokeAGMMethod() {
        this.agm.register(InvokeMethod, (args) => {
            const hkToLower = args.key.toLowerCase();
            const info = this.hotkeys.get(hkToLower);
            this.registry.execute(hkToLower, info);
        });
    }
    formatHotkey(hotkey) {
        if (hotkey) {
            return hotkey.replace(/\s/g, "").toLowerCase();
        }
    }
}

function factory$3(agm) {
    const hotkeys = new HotkeysImpl(agm);
    return {
        register: hotkeys.register.bind(hotkeys),
        unregister: hotkeys.unregister.bind(hotkeys),
        unregisterAll: hotkeys.unregisterAll.bind(hotkeys),
        isRegistered: hotkeys.isRegistered.bind(hotkeys),
        ready: () => Promise.resolve()
    };
}

var version = "5.15.0";

var prepareConfig = (options) => {
    function getLibConfig(value, defaultMode, trueMode) {
        if (typeof value === "boolean" && !value) {
            return undefined;
        }
        const mode = getModeAsString(value, defaultMode, trueMode);
        if (typeof value === "object") {
            value.mode = mode;
            return value;
        }
        return {
            mode,
        };
    }
    function getModeAsString(value, defaultMode, trueMode) {
        if (typeof value === "object") {
            return getModeAsString(value.mode, defaultMode, trueMode) + "";
        }
        else if (typeof value === "undefined") {
            if (typeof defaultMode === "boolean" && !defaultMode) {
                return undefined;
            }
            else {
                return defaultMode + "";
            }
        }
        else if (typeof value === "boolean") {
            if (value) {
                return ((trueMode === undefined) ? defaultMode : trueMode) + "";
            }
            else {
                return undefined;
            }
        }
        return value + "";
    }
    const appDefaultMode = false;
    const appDefaultTrueMode = "startOnly";
    const activitiesDefaultMode = "trackMyTypeAndInitiatedFromMe";
    const layoutsDefaultMode = "slim";
    const exposeGlue = typeof options.exposeGlue === "boolean" ? options.exposeGlue : true;
    return {
        layouts: getLibConfig(options.layouts, layoutsDefaultMode),
        activities: getLibConfig(options.activities, activitiesDefaultMode),
        appManager: getLibConfig(options.appManager, appDefaultMode, appDefaultTrueMode),
        windows: getLibConfig(options.windows, true),
        channels: getLibConfig(options.channels || false, false),
        displays: getLibConfig(options.displays, true),
        exposeGlue
    };
};

class Glue42Notification {
    constructor(options) {
        this.options = options;
        this.callbacks = lib$1();
        this.actions = options.actions;
        this.body = options.body;
        this.badge = options.badge;
        this.data = options.data;
        this.dir = options.dir;
        this.icon = options.icon;
        this.image = options.image;
        this.lang = options.lang;
        this.renotify = options.renotify;
        this.requireInteraction = options.requireInteraction;
        this.silent = options.silent;
        this.tag = options.tag;
        this.timestamp = options.timestamp;
        this.title = options.title;
    }
    close() {
        throw new Error("Method not implemented.");
    }
    addEventListener(type, listener, options) {
        this.callbacks.add(type, listener);
    }
    removeEventListener(type, listener, options) {
    }
    dispatchEvent(event) {
        this.callbacks.execute(event.type, event);
        return true;
    }
}

class PanelAPI {
    constructor(interop) {
        this.interop = interop;
    }
    toggle() {
        return this.interop.invoke("T42.Notifications.Show");
    }
    show() {
        return this.interop.invoke("T42.Notifications.Show", { show: true });
    }
    hide() {
        return this.interop.invoke("T42.Notifications.Hide");
    }
    isVisible() {
        throw new Error("Method not implemented.");
    }
}

const STARTING_INDEX = 0;
class Notifications {
    constructor(interop) {
        this.interop = interop;
        this.methodsRegistered = false;
        this.NOTIFICATIONS_CONFIGURE_METHOD_NAME = "T42.Notifications.Configure";
        this.methodNameRoot = "T42.Notifications.Handler-" + shortid();
        this.nextId = 0;
        this.notifications = {};
        this.panel = new PanelAPI(interop);
    }
    get maxActions() {
        return 2;
    }
    async raise(options) {
        var _a, _b, _c, _d;
        if (!options) {
            throw new Error("invalid options - should be an object");
        }
        if (!options.title) {
            throw new Error("invalid options - should have title");
        }
        if (!this.methodsRegistered) {
            const bunchOfPromises = [];
            for (let index = STARTING_INDEX; index < this.maxActions; index++) {
                bunchOfPromises.push(this.interop.register(this.methodNameRoot + "_" + index, this.handleNotificationAction.bind(this)));
            }
            await Promise.all(bunchOfPromises);
            this.methodsRegistered = true;
        }
        const id = String(this.nextId++);
        const type = (_a = options.type) !== null && _a !== void 0 ? _a : "Notification";
        const notification = {
            title: options.title,
            type,
            severity: (_b = options.severity) !== null && _b !== void 0 ? _b : "None",
            description: options.body,
            glueRoutingDetailMethodName: this.methodNameRoot + "_" + STARTING_INDEX,
            actions: [],
            sourceId: id,
            source: options.source
        };
        if (options.actions) {
            const validActions = options.actions.slice(0, this.maxActions);
            let index = STARTING_INDEX;
            for (const action of validActions) {
                const args = {
                    g42notificationId: id,
                    g42action: action.action,
                    g42interopMethod: (_c = action.interop) === null || _c === void 0 ? void 0 : _c.method,
                    g42interopTarget: (_d = action.interop) === null || _d === void 0 ? void 0 : _d.target,
                };
                const parameters = Object.keys(args).map((key) => {
                    const value = args[key];
                    return {
                        name: key,
                        value: {
                            stringValue: value
                        }
                    };
                });
                const glueAction = {
                    name: this.methodNameRoot + "_" + index,
                    description: action.title,
                    displayName: action.title,
                    parameters
                };
                notification.actions.push(glueAction);
                index++;
            }
        }
        if (options.icon) {
            notification.attributes = notification.attributes || [];
            notification.attributes.push({ key: "icon", value: { stringValue: options.icon } });
        }
        if (options.data) {
            notification.attributes = notification.attributes || [];
            const dataAsString = JSON.stringify(options.data);
            notification.attributes.push({ key: "data", value: { stringValue: dataAsString } });
        }
        if (typeof options.panelExpiry === "number") {
            notification.attributes = notification.attributes || [];
            notification.attributes.push({ key: "panelExpiry", value: { stringValue: options.panelExpiry + "" } });
        }
        if (typeof options.toastExpiry === "number") {
            notification.attributes = notification.attributes || [];
            notification.attributes.push({ key: "toastExpiry", value: { stringValue: options.toastExpiry + "" } });
        }
        await this.interop.invoke("T42.GNS.Publish.RaiseNotification", { notification });
        const g42notification = new Glue42Notification(options);
        this.notifications[id] = g42notification;
        return g42notification;
    }
    async setFilter(filter) {
        const result = await this.interop.invoke("T42.Notifications.Filter", filter);
        return result.returned;
    }
    async getFilter() {
        const result = await this.interop.invoke("T42.Notifications.Filter");
        return result.returned;
    }
    async configure(options) {
        if (!options || Array.isArray(options)) {
            throw new Error("Invalid options - should be an object.");
        }
        if (Object.values(options).length === 0) {
            throw new Error("The argument must be a non-empty object.");
        }
        Object.values(options).forEach((value) => {
            if (typeof value !== undefined && typeof value !== "boolean") {
                throw new Error("Expected type of option values - boolean.");
            }
        });
        const result = await this.interop.invoke(this.NOTIFICATIONS_CONFIGURE_METHOD_NAME, options);
        return result.returned;
    }
    handleNotificationAction(args) {
        if (args.g42notificationId) {
            const payload = args;
            const id = payload.g42notificationId;
            const notification = this.notifications[id];
            if (!notification) {
                return;
            }
            const event = {
                type: "onaction",
                action: payload.g42action
            };
            if (notification.onaction) {
                notification.onaction(event);
            }
            const actionDefinition = (notification.actions || []).find((item) => item.action === payload.g42action);
            const actionInterop = actionDefinition.interop;
            if (actionInterop) {
                this.interop.invoke(actionInterop.method, actionInterop.arguments || {}, actionInterop.target || "best");
            }
            notification.dispatchEvent(event);
        }
        else if (args.notification && args.notification.sourceNotificationId) {
            const id = args.notification.sourceNotificationId;
            const notification = this.notifications[id];
            if (!notification) {
                return;
            }
            const event = { type: "onclick" };
            if (notification.onclick) {
                notification.onclick(event);
            }
            const clickInterop = notification.options.clickInterop;
            if (clickInterop) {
                this.interop.invoke(clickInterop.method, clickInterop.arguments || {}, clickInterop.target || "best");
            }
            notification.dispatchEvent(event);
        }
    }
}

const ThemesConfigurationMethodName = "T42.Themes.Configuration";
class ThemesImpl {
    constructor(core) {
        this.core = core;
        this.registry = lib$1();
        this.isSubscribed = false;
        this.getConfiguration();
    }
    async list() {
        await this.getConfiguration();
        if (!this.getMethodName) {
            throw new Error("not supported");
        }
        return (await this.getAll()).returned.all;
    }
    async getCurrent() {
        await this.getConfiguration();
        if (!this.getMethodName) {
            throw new Error("not supported");
        }
        const all = await this.getAll();
        return all.returned.all.find((t) => t.name === all.returned.selected);
    }
    async select(theme) {
        await this.getConfiguration();
        if (!this.setMethodName) {
            throw new Error("not supported");
        }
        await this.core.interop.invoke(this.setMethodName, { theme });
    }
    onChanged(callback) {
        this.subscribe();
        return this.registry.add("changed", callback);
    }
    async getConfiguration() {
        try {
            if (this.sharedContextName) {
                return;
            }
            const config = await this.core.interop.invoke(ThemesConfigurationMethodName);
            this.sharedContextName = config.returned.sharedContextName;
            this.getMethodName = config.returned.getThemesMethodName;
            this.setMethodName = config.returned.setThemesMethodName;
        }
        catch (error) {
            return;
        }
    }
    async getAll() {
        await this.getConfiguration();
        return await this.core.interop.invoke(this.getMethodName);
    }
    async subscribe() {
        await this.getConfiguration();
        if (this.isSubscribed) {
            return;
        }
        this.isSubscribed = true;
        this.core.contexts.subscribe(this.sharedContextName, (data) => {
            if (data && data.all && data.selected) {
                this.registry.execute("changed", data.all.find((t) => t.name === data.selected));
            }
        });
    }
}

function factory$2(core) {
    const themes = new ThemesImpl(core);
    return {
        list: themes.list.bind(themes),
        getCurrent: themes.getCurrent.bind(themes),
        select: themes.select.bind(themes),
        onChanged: themes.onChanged.bind(themes),
        ready: () => Promise.resolve(),
    };
}

const GLUE42_FDC3_INTENTS_METHOD_PREFIX = "Tick42.FDC3.Intents.";
const INTENTS_RESOLVER_INTEROP_PREFIX = "T42.Intents.Resolver.Control";
const INTENTS_RESOLVER_WIDTH = 400;
const INTENTS_RESOLVER_HEIGHT = 440;
const INTENT_HANDLER_DEFAULT_PROPS = ["applicationName", "applicationTitle", "type"];
const INTENTS_RESOLVER_APP_NAME = "intentsResolver";

class Intents {
    constructor(interop, windows, logger, options, appManager) {
        this.interop = interop;
        this.windows = windows;
        this.logger = logger;
        this.appManager = appManager;
        this.myIntents = new Set();
        this.intentsResolverResponsePromises = {};
        this.useIntentsResolverUI = true;
        this.checkIfIntentsResolverIsEnabled(options, appManager);
    }
    async find(intentFilter) {
        let intents = await this.all();
        if (typeof intentFilter === "undefined") {
            return intents;
        }
        if (typeof intentFilter === "string") {
            return intents.filter((intent) => intent.name === intentFilter);
        }
        if (typeof intentFilter !== "object") {
            throw new Error("Please provide the intentFilter as a string or an object!");
        }
        if (intentFilter.contextType) {
            const ctToLower = intentFilter.contextType.toLowerCase();
            intents = intents.filter((intent) => intent.handlers.some((handler) => { var _a; return (_a = handler.contextTypes) === null || _a === void 0 ? void 0 : _a.some((ct) => ct.toLowerCase() === ctToLower); }));
        }
        if (intentFilter.resultType) {
            const resultTypeToLower = intentFilter.resultType.toLowerCase();
            intents = intents.filter((intent) => intent.handlers.some((handler) => { var _a; return ((_a = handler.resultType) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === resultTypeToLower; }));
        }
        if (intentFilter.name) {
            intents = intents.filter((intent) => intent.name === intentFilter.name);
        }
        return intents;
    }
    async raise(intent) {
        if ((typeof intent !== "string" && typeof intent !== "object") || (typeof intent === "object" && typeof intent.intent !== "string")) {
            throw new Error("Please provide the intent as a string or an object with an intent property!");
        }
        if (typeof intent === "string") {
            intent = { intent };
        }
        const intentDef = await this.get(intent.intent);
        if (typeof intentDef === "undefined") {
            throw new Error(`Intent ${intent.intent} not found.`);
        }
        if (intent.target || !this.useIntentsResolverUI) {
            return this.raiseIntent(intent);
        }
        const intentsResolverApp = this.appManager.application(this.intentsResolverAppName);
        if (!intentsResolverApp) {
            this.logger.warn(`Intent Resolver Application with name ${this.intentsResolverAppName} not found. Intents Resolver won't be used for handling raised intents`);
            return this.raiseIntent(intent);
        }
        const hasOneHandler = (await this.getIntentHandlers(intent.intent)).length === 1;
        if (hasOneHandler) {
            return this.raiseIntent(intent);
        }
        const registeredMethod = await this.registerIntentResolverMethod();
        const resolverInstance = await this.openIntentResolverApplication(intent, registeredMethod);
        const { handler } = await this.intentsResolverResponsePromises[resolverInstance.id].promise;
        resolverInstance.stop().catch((err) => this.logger.warn(err));
        const target = handler.type === "app"
            ? { app: handler.applicationName }
            : { instance: handler.instanceId };
        const intentRequestData = { ...intent, target };
        return this.raiseIntent(intentRequestData);
    }
    async all() {
        let apps;
        try {
            const result = await this.interop.invoke("T42.ACS.GetApplications", { withIntentsInfo: true });
            apps = result.returned.applications;
        }
        catch (e) {
            this.logger.error(`Failed to get the applications!`, e);
            return [];
        }
        const intents = {};
        const appsWithIntents = apps.filter((app) => app.intents && app.intents.length > 0);
        for (const app of appsWithIntents) {
            for (const intentDef of app.intents) {
                let intent = intents[intentDef.name];
                if (!intent) {
                    intent = {
                        name: intentDef.name,
                        handlers: [],
                    };
                    intents[intentDef.name] = intent;
                }
                const handler = {
                    applicationName: app.name,
                    applicationTitle: app.title || "",
                    applicationDescription: app.caption,
                    displayName: intentDef.displayName,
                    contextTypes: intentDef.contexts,
                    applicationIcon: app.icon,
                    type: "app",
                    resultType: intentDef.resultType
                };
                intent.handlers.push(handler);
            }
        }
        const servers = this.interop.servers();
        const serverWindowIds = servers.map((server) => server.windowId).filter((serverWindowId) => typeof serverWindowId !== "undefined");
        const T42WndGetInfo = "T42.Wnd.GetInfo";
        const isT42WndGetInfoMethodRegistered = this.interop.methods().some((method) => method.name === T42WndGetInfo);
        let windowsInfos;
        if (isT42WndGetInfoMethodRegistered) {
            try {
                const result = await this.interop.invoke(T42WndGetInfo, { ids: serverWindowIds });
                windowsInfos = result.returned.windows;
            }
            catch (e) {
            }
        }
        for (const server of servers) {
            await Promise.all(server.getMethods()
                .filter((method) => method.name.startsWith(GLUE42_FDC3_INTENTS_METHOD_PREFIX))
                .map(async (method) => {
                const intentName = method.name.replace(GLUE42_FDC3_INTENTS_METHOD_PREFIX, "");
                let intent = intents[intentName];
                if (!intent) {
                    intent = {
                        name: intentName,
                        handlers: [],
                    };
                    intents[intentName] = intent;
                }
                const info = method.flags.intent;
                const app = apps.find((appWithIntents) => appWithIntents.name === server.application);
                let appIntent;
                if (app && app.intents) {
                    appIntent = app.intents.find((appDefIntent) => appDefIntent.name === intentName);
                }
                const title = await this.windowsIdToTitle(server.windowId, windowsInfos);
                const handler = {
                    instanceId: server.instance,
                    applicationName: server.application,
                    applicationIcon: info.icon || (app === null || app === void 0 ? void 0 : app.icon),
                    applicationTitle: (app === null || app === void 0 ? void 0 : app.title) || "",
                    applicationDescription: info.description || (app === null || app === void 0 ? void 0 : app.caption),
                    displayName: info.displayName || (appIntent === null || appIntent === void 0 ? void 0 : appIntent.displayName),
                    contextTypes: info.contextTypes || (appIntent === null || appIntent === void 0 ? void 0 : appIntent.contexts),
                    instanceTitle: title,
                    type: "instance",
                    resultType: (appIntent === null || appIntent === void 0 ? void 0 : appIntent.resultType) || info.resultType
                };
                intent.handlers.push(handler);
            }));
        }
        return Object.values(intents);
    }
    addIntentListener(intent, handler) {
        if ((typeof intent !== "string" && typeof intent !== "object") || (typeof intent === "object" && typeof intent.intent !== "string")) {
            throw new Error("Please provide the intent as a string or an object with an intent property!");
        }
        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }
        const intentName = typeof intent === "string" ? intent : intent.intent;
        const methodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${intentName}`;
        let intentFlag = {};
        let registerPromise;
        const alreadyRegistered = this.myIntents.has(intentName);
        if (alreadyRegistered) {
            throw new Error(`Intent listener for intent ${intentName} already registered!`);
        }
        this.myIntents.add(intentName);
        const result = {
            unsubscribe: () => {
                this.myIntents.delete(intentName);
                registerPromise
                    .then(() => this.interop.unregister(methodName))
                    .catch((err) => this.logger.trace(`Unregistration of a method with name ${methodName} failed with reason: ${err}`));
            }
        };
        if (typeof intent === "object") {
            const { intent: removed, ...rest } = intent;
            intentFlag = rest;
        }
        registerPromise = this.interop.register({ name: methodName, flags: { intent: intentFlag } }, (args) => {
            if (this.myIntents.has(intentName)) {
                return handler(args);
            }
        });
        registerPromise.catch((err) => {
            this.myIntents.delete(intentName);
            this.logger.warn(`Registration of a method with name ${methodName} failed with reason: ${err}`);
        });
        return result;
    }
    async get(intent) {
        return (await this.all()).find((registeredIntent) => registeredIntent.name === intent);
    }
    async raiseIntent(intent) {
        const intentName = intent.intent;
        const intentDef = await this.get(intentName);
        if (typeof intentDef === "undefined") {
            throw new Error(`Intent ${intentName} not found.`);
        }
        const isDynamicIntent = !intentDef.handlers.some((intentDefHandler) => intentDefHandler.type === "app");
        const target = intent.target || (isDynamicIntent ? "reuse" : "startNew");
        let handler;
        const anAppHandler = intentDef.handlers.find((intentHandler) => intentHandler.type === "app");
        if (target === "startNew") {
            handler = anAppHandler;
        }
        else if (target === "reuse") {
            const anInstanceHandler = intentDef.handlers.find((intentHandler) => intentHandler.type === "instance");
            handler = anInstanceHandler || anAppHandler;
        }
        else if (target.instance) {
            handler = intentDef.handlers.find((intentHandler) => intentHandler.type === "instance" && intentHandler.instanceId === target.instance);
        }
        else if (target.app) {
            handler = intentDef.handlers.find((intentHandler) => intentHandler.type === "app" && intentHandler.applicationName === target.app);
        }
        else {
            throw new Error(`Invalid intent target: ${JSON.stringify(target)}`);
        }
        if (!handler) {
            throw new Error(`Can not raise intent for request ${JSON.stringify(intent)} - can not find intent handler.`);
        }
        let instanceId = handler.instanceId;
        if (handler.type === "app") {
            instanceId = await this.invokeStartApp(handler.applicationName, intent.context, intent.options);
        }
        const result = await this.raiseIntentToInstance(instanceId, intentName, intent.context);
        result.request = intent;
        result.handler = handler;
        return result;
    }
    async raiseIntentToInstance(instanceId, intent, context) {
        const methodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${intent}`;
        let interopServer = this.interop.servers().find((server) => server.instance === instanceId);
        if (!interopServer) {
            await (new Promise((resolve, reject) => {
                let timeoutId;
                const unsub = this.interop.serverAdded((server) => {
                    if (server.instance === instanceId) {
                        interopServer = server;
                        resolve();
                        clearTimeout(timeoutId);
                        unsub();
                    }
                });
                timeoutId = setTimeout(() => {
                    unsub();
                    reject(new Error(`Can not find interop server for instance ${instanceId}`));
                }, 30 * 1000);
            }));
        }
        const method = interopServer.getMethods().find((registeredMethod) => registeredMethod.name === methodName);
        if (!method) {
            await (new Promise((resolve, reject) => {
                let timeoutId;
                const unsub = this.interop.methodAdded((addedMethod) => {
                    if (addedMethod.name === methodName) {
                        resolve();
                        clearTimeout(timeoutId);
                        unsub();
                    }
                });
                timeoutId = setTimeout(() => {
                    unsub();
                    reject(new Error(`Can not find interop method ${methodName} for instance ${instanceId}`));
                }, 120000);
            }));
        }
        const result = await this.interop.invoke(methodName, context, { instance: instanceId });
        const gdWin = this.windows.findById(instanceId);
        gdWin.focus();
        return {
            result: result.returned
        };
    }
    async windowsIdToTitle(id, windowsInfos) {
        var _a, _b;
        if (typeof windowsInfos !== "undefined") {
            return (_a = windowsInfos.find((windowsInfo) => windowsInfo.id === id)) === null || _a === void 0 ? void 0 : _a.title;
        }
        const window = (_b = this.windows) === null || _b === void 0 ? void 0 : _b.findById(id);
        const title = await (window === null || window === void 0 ? void 0 : window.getTitle());
        return title;
    }
    async openIntentResolverApplication(requestObj, methodName) {
        const startContext = {
            intent: requestObj.intent,
            callerId: this.interop.instance.instance,
            methodName
        };
        const startOptions = await this.composeStartOptions();
        const instance = await this.appManager.application(this.intentsResolverAppName).start(startContext, startOptions);
        this.subscribeOnInstanceStopped(instance);
        this.createResponsePromise(requestObj.intent, instance.id, methodName);
        return instance;
    }
    async registerIntentResolverMethod() {
        const methodName = INTENTS_RESOLVER_INTEROP_PREFIX + shortid();
        await this.interop.register(methodName, this.resolverResponseHandler.bind(this));
        return methodName;
    }
    resolverResponseHandler(args, callerId) {
        const { instance } = callerId;
        const isValid = this.validateIntentsResolverResponse(args);
        if (!isValid) {
            this.intentsResolverResponsePromises[instance].reject(isValid.error);
            this.cleanUpIntentResolverPromise(instance);
        }
        const validResponse = isValid.ok;
        this.intentsResolverResponsePromises[instance].resolve(validResponse);
        this.cleanUpIntentResolverPromise(instance);
    }
    async composeStartOptions() {
        const bounds = await this.windows.my().getBounds();
        return {
            top: (bounds.height - INTENTS_RESOLVER_HEIGHT) / 2 + bounds.top,
            left: (bounds.width - INTENTS_RESOLVER_WIDTH) / 2 + bounds.left,
        };
    }
    createResponsePromise(intent, instanceId, methodName) {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.intentsResolverResponsePromises[instanceId] = { intent, resolve, reject, promise, methodName };
    }
    async invokeStartApp(application, context, options) {
        const result = await this.interop.invoke("T42.ACS.StartApplication", { Name: application, options });
        return result.returned.Id;
    }
    subscribeOnInstanceStopped(instance) {
        const unsub = instance.onStopped((inst) => {
            const intentPromise = this.intentsResolverResponsePromises[inst.id];
            if (!intentPromise) {
                return unsub();
            }
            intentPromise.reject(`Cannot resolve raise intent ${intentPromise.intent} - User closed ${this.intentsResolverAppName} app without choosing an intent handler`);
            this.cleanUpIntentResolverPromise(inst.id);
            unsub();
        });
    }
    async getIntentHandlers(intentName) {
        const intents = await this.find(intentName);
        return intents.reduce((flattenHandlers, currentIntent) => flattenHandlers.concat(...currentIntent.handlers), []);
    }
    async cleanUpIntentResolverPromise(instanceId) {
        const intentPromise = this.intentsResolverResponsePromises[instanceId];
        if (!intentPromise) {
            return;
        }
        const unregisterPromise = this.interop.unregister(intentPromise.methodName);
        unregisterPromise.catch((error) => this.logger.warn(error));
        delete this.intentsResolverResponsePromises[instanceId];
    }
    validateIntentsResolverResponse(responseObj) {
        const invalidKey = Object.keys(responseObj).some((key) => key !== "intent" && key !== "handler");
        if (invalidKey) {
            return { isValid: false, error: "Response is not a valid object. Expected { intent: string, handler: IntentHandler }" };
        }
        if (typeof responseObj.intent !== "string") {
            return { isValid: false, error: `Response object has invalid 'intent' key. Expected a string, got ${typeof responseObj.intent}` };
        }
        if (typeof responseObj.handler !== "object") {
            return { isValid: false, error: `Response object has invalid 'handler' key. Expected an object, got ${typeof responseObj.handler}` };
        }
        const compulsoryKeysExist = INTENT_HANDLER_DEFAULT_PROPS.every((key) => key in responseObj.handler);
        if (!compulsoryKeysExist) {
            return { isValid: false, error: `Handler in Response object does not provide the compulsory key: ${compulsoryKeysExist}` };
        }
        return { isValid: true, ok: { intent: responseObj.intent, handler: { ...responseObj.handler } } };
    }
    checkIfIntentsResolverIsEnabled(options, appManager) {
        var _a, _b, _c;
        if (!appManager) {
            this.useIntentsResolverUI = false;
            return;
        }
        this.useIntentsResolverUI = typeof ((_a = options.intents) === null || _a === void 0 ? void 0 : _a.enableIntentsResolverUI) === "boolean"
            ? options.intents.enableIntentsResolverUI
            : true;
        this.intentsResolverAppName = (_c = (_b = options.intents) === null || _b === void 0 ? void 0 : _b.intentsResolverAppName) !== null && _c !== void 0 ? _c : INTENTS_RESOLVER_APP_NAME;
    }
}

class FactoryCallInfo {
    constructor() {
        this.initialized = false;
        this.details = [];
        this.reject = () => { };
        this.resolve = () => { };
    }
    init(config) {
        this.initialized = true;
        this.addCall(config);
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    addCall(config) {
        this.details.push({ date: new Date(), config });
    }
    done(g) {
        this.resolve(g);
    }
    error(e) {
        this.reject(e);
    }
}

class Prefs {
    constructor(appName, interop) {
        this.appName = appName;
        this.interop = interop;
        this.registry = lib$1();
        this.interopMethodRegistered = false;
    }
    async get(app) {
        const data = (await this.interop.invoke("T42.Prefs.Get", { app: app !== null && app !== void 0 ? app : this.appName }));
        return data.returned;
    }
    async set(data, options) {
        var _a;
        this.verifyDataObject(data);
        await this.interop.invoke("T42.Prefs.Set", { app: (_a = options === null || options === void 0 ? void 0 : options.app) !== null && _a !== void 0 ? _a : this.appName, data, merge: false });
    }
    async setFor(app, data) {
        this.verifyApp(app);
        this.verifyDataObject(data);
        return this.set(data, { app });
    }
    async update(data, options) {
        var _a;
        this.verifyDataObject(data);
        await this.interop.invoke("T42.Prefs.Set", { app: (_a = options === null || options === void 0 ? void 0 : options.app) !== null && _a !== void 0 ? _a : this.appName, data, merge: true });
    }
    async updateFor(app, data) {
        this.verifyApp(app);
        this.verifyDataObject(data);
        return this.update(data, { app });
    }
    async clear(app) {
        await this.interop.invoke("T42.Prefs.Set", { app: app !== null && app !== void 0 ? app : this.appName, clear: true });
    }
    async clearFor(app) {
        this.verifyApp(app);
        await this.interop.invoke("T42.Prefs.Set", { app, clear: true });
    }
    async getAll() {
        const data = (await this.interop.invoke("T42.Prefs.Get"));
        return data.returned;
    }
    async clearAll() {
        await this.interop.invoke("T42.Prefs.Set", { clear: true });
    }
    subscribe(callback) {
        this.verifyCallback(callback);
        return this.subscribeFor(this.appName, callback);
    }
    subscribeFor(app, callback) {
        this.verifyApp(app);
        this.verifyCallback(callback);
        const unsubscribeFn = this.registry.add(app, callback);
        this.registerInteropIfNeeded()
            .then(() => {
            this.interop.invoke("T42.Prefs.Get", { app, subscribe: true });
        });
        return () => {
            unsubscribeFn();
        };
    }
    async registerInteropIfNeeded() {
        if (this.interopMethodRegistered) {
            return;
        }
        this.interopMethodRegistered = true;
        await this.interop.register("T42.Prefs.Update", (args) => {
            this.registry.execute(args.app, args);
        });
    }
    verifyApp(app) {
        if (!app) {
            throw new Error(`app should be defined`);
        }
        if (!isString(app)) {
            throw new Error(`app should be a string`);
        }
    }
    verifyDataObject(data) {
        if (!data) {
            throw new Error(`data should be defined`);
        }
        if (!isObject(data)) {
            throw new Error(`data should be an object`);
        }
    }
    verifyCallback(callback) {
        if (!isFunction(callback)) {
            throw new Error(`callback should be defined`);
        }
    }
}

class Cookies {
    constructor(methodName, interop) {
        this.methodName = methodName;
        this.interop = interop;
    }
    async get(filter) {
        const result = await this.invoke("get-cookies", { filter });
        return result.returned.cookies;
    }
    async set(cookie) {
        this.verifyCookieObject(cookie);
        await this.invoke("set-cookie", cookie);
    }
    async remove(url, name) {
        if (!isString(url)) {
            throw new Error(`url should be a string`);
        }
        if (!isString(name)) {
            throw new Error(`name should be a string`);
        }
        await this.invoke("remove-cookie", { url, name });
    }
    invoke(command, data) {
        return this.interop.invoke(this.methodName, { command, args: data });
    }
    verifyCookieObject(cookie) {
        if (!cookie) {
            throw new Error(`cookie should be defined`);
        }
        if (!isObject(cookie)) {
            throw new Error(`cookie should be an object`);
        }
    }
}

function factory$1(agm, methodName) {
    const cookies = new Cookies(methodName, agm);
    return {
        get: cookies.get.bind(cookies),
        remove: cookies.remove.bind(cookies),
        set: cookies.set.bind(cookies),
        ready: () => Promise.resolve()
    };
}

class EventsDispatcher {
    constructor(config) {
        this.config = config;
        this.glue42EventName = "Glue42";
        this.events = {
            notifyStarted: { name: "notifyStarted", handle: this.handleNotifyStarted.bind(this) },
            requestGlue: { name: "requestGlue", handle: this.handleRequestGlue.bind(this) }
        };
    }
    start(glue) {
        if (Utils.isNode()) {
            return;
        }
        this.glue = glue;
        this.wireCustomEventListener();
        this.announceStarted();
    }
    wireCustomEventListener() {
        window.addEventListener(this.glue42EventName, (event) => {
            const data = event.detail;
            if (!data || !data.glue42) {
                return;
            }
            const glue42Event = data.glue42.event;
            const foundHandler = this.events[glue42Event];
            if (!foundHandler) {
                return;
            }
            foundHandler.handle(data.glue42.message);
        });
    }
    announceStarted() {
        this.send("start");
    }
    handleRequestGlue() {
        if (!this.config.exposeGlue) {
            this.send("requestGlueResponse", { error: "Will not give access to the underlying Glue API, because it was explicitly denied upon initialization." });
            return;
        }
        this.send("requestGlueResponse", { glue: this.glue });
    }
    handleNotifyStarted() {
        this.announceStarted();
    }
    send(eventName, message) {
        const payload = { glue42: { event: eventName, message } };
        const event = new CustomEvent(this.glue42EventName, { detail: payload });
        window.dispatchEvent(event);
    }
}

const callInfo = new FactoryCallInfo();
const factory = async (options) => {
    let firstRun = false;
    if (!callInfo.initialized) {
        firstRun = true;
        callInfo.init(options);
    }
    const glue42gd = typeof window !== "undefined" && window.glue42gd;
    if (glue42gd) {
        if (!firstRun) {
            callInfo.addCall(options);
            return callInfo.promise;
        }
    }
    const g = await factoryCore(options, glue42gd);
    callInfo.resolve(g);
    return g;
};
const factoryCore = async (options, glue42gd) => {
    const T42GDExecuteMethod = "T42.GD.Execute";
    const gdMajorVersion = Utils.getGDMajorVersion();
    options = options || {};
    const glueConfig = prepareConfig(options);
    options.gateway = options.gateway || {};
    let _appManager;
    let _activity;
    let _windows;
    let _displays;
    let _channels;
    const _browserEventsDispatcher = new EventsDispatcher(glueConfig);
    function createWindows(core) {
        if (glueConfig.windows) {
            const windowsLogger = getLibLogger("windows", core.logger, glueConfig.windows);
            _windows = WindowsFactory(core.agm, windowsLogger, () => {
                return _appManager;
            }, () => {
                return _displays;
            }, () => {
                return _channels;
            }, gdMajorVersion);
            debugLog(_windows);
            return _windows;
        }
    }
    function createActivities(core) {
        var _a;
        if (glueConfig.activities) {
            if (ActivityModule.checkIsUsingGW3Implementation && ActivityModule.checkIsUsingGW3Implementation(core.connection)) {
                const activityLogger = getLibLogger("activity", core.logger, glueConfig.activities);
                _activity = new ActivityModule({
                    connection: core.connection,
                    contexts: core.contexts,
                    agm: core.agm,
                    logger: activityLogger,
                    logLevel: "info",
                    disableAutoAnnounce: false,
                    disposeRequestHandling: "exit",
                    announcementInfo: null,
                    windows: _windows,
                    appManagerGetter: () => {
                        return _appManager;
                    },
                    mode: glueConfig.activities.mode,
                    typesToTrack: glueConfig.activities.typesToTrack,
                    activityId: (_a = glue42gd === null || glue42gd === void 0 ? void 0 : glue42gd.activityInfo) === null || _a === void 0 ? void 0 : _a.activityId,
                    gdMajorVersion
                }).api;
                debugLog(_activity);
                return _activity;
            }
        }
    }
    function createAppManager(core) {
        if (!glueConfig.appManager) {
            return;
        }
        const logger = getLibLogger("appManager", core.logger, glueConfig.appManager);
        _appManager = AppManagerFactory({
            agm: core.agm,
            windows: _windows,
            logger,
            activities: _activity,
            mode: glueConfig.appManager.mode,
            gdMajorVersion
        });
        debugLog(_appManager);
        return _appManager;
    }
    function createLayouts(core) {
        var _a;
        if (!glueConfig.layouts) {
            return;
        }
        const logger = getLibLogger("layouts", core.logger, glueConfig.layouts);
        const layoutsConfig = glueConfig.layouts;
        const lay = LayoutsFactory({
            agm: core.agm,
            appManager: _appManager,
            activityGetter: () => _activity,
            logger,
            mode: layoutsConfig.mode,
            autoSaveWindowContext: (_a = layoutsConfig.autoSaveWindowContext) !== null && _a !== void 0 ? _a : false,
            gdMajorVersion
        });
        debugLog(lay);
        return lay;
    }
    function createChannels(core) {
        if (!glueConfig.channels) {
            return;
        }
        if (!core.contexts) {
            return;
        }
        const logger = getLibLogger("channels", core.logger, glueConfig.channels);
        _channels = factory$4(core.contexts, core.agm, () => _windows, logger);
        debugLog(_channels);
        return _channels;
    }
    function createHotkeys(core) {
        const hotkeysAPI = factory$3(core.agm);
        debugLog(hotkeysAPI);
        return hotkeysAPI;
    }
    function createIntents(core) {
        const intentsAPI = new Intents(core.agm, _windows, core.logger.subLogger("intents"), options, _appManager);
        debugLog(intentsAPI);
        return intentsAPI;
    }
    function createNotifications(core) {
        const notificationsAPI = new Notifications(core.interop);
        debugLog(notificationsAPI);
        return notificationsAPI;
    }
    function createDisplaysApi(core) {
        if (glueConfig.displays) {
            const displaysLogger = getLibLogger("displays", core.logger, glueConfig.displays);
            _displays = new DisplayManager(core.agm, displaysLogger);
            debugLog(_displays);
            return _displays;
        }
    }
    function createThemes(core) {
        if (!core.contexts) {
            return;
        }
        const themesAPI = factory$2(core);
        debugLog(themesAPI);
        return themesAPI;
    }
    function createPrefs(core) {
        var _a, _b;
        const appName = (_b = (_a = options.application) !== null && _a !== void 0 ? _a : glue42gd === null || glue42gd === void 0 ? void 0 : glue42gd.application) !== null && _b !== void 0 ? _b : core.interop.instance.application;
        const prefs = new Prefs(appName, core.interop);
        debugLog(prefs);
        return prefs;
    }
    function createCookies(core) {
        const api = factory$1(core.interop, T42GDExecuteMethod);
        debugLog(api);
        return api;
    }
    function getLibLogger(loggerName, logger, config) {
        const newLogger = logger.subLogger(loggerName);
        if (config && config.logger) {
            const loggerConfig = config.logger;
            if (loggerConfig.console) {
                newLogger.consoleLevel(loggerConfig.console);
            }
            if (loggerConfig.publish) {
                newLogger.publishLevel(loggerConfig.publish);
            }
        }
        return newLogger;
    }
    const ext = {
        libs: [
            { name: "windows", create: createWindows },
            { name: "activities", create: createActivities },
            { name: "appManager", create: createAppManager },
            { name: "layouts", create: createLayouts },
            { name: "channels", create: createChannels },
            { name: "hotkeys", create: createHotkeys },
            { name: "displays", create: createDisplaysApi },
            { name: "intents", create: createIntents },
            { name: "notifications", create: createNotifications },
            { name: "themes", create: createThemes },
            { name: "prefs", create: createPrefs },
            { name: "cookies", create: createCookies }
        ],
        version,
        enrichGlue: (glue) => {
            glue.config.activities = glueConfig.activities;
            glue.config.windows = glueConfig.windows;
            glue.config.appManager = glueConfig.appManager;
            glue.config.layouts = glueConfig.layouts;
            glue.config.channels = glueConfig.channels;
            glue.config.displays = glueConfig.displays;
        },
    };
    const currentLog = [];
    if (typeof window !== "undefined") {
        if (!window.glueFactoryLog) {
            window.glueFactoryLog = [];
        }
        window.glueFactoryLog.push(currentLog);
    }
    function debugLog(entry) {
        currentLog.push(entry);
    }
    const glueApi = (await GlueCore(options, ext));
    if (Array.isArray(options === null || options === void 0 ? void 0 : options.libraries) && options.libraries.length) {
        await Promise.all(options.libraries.map((lib) => lib(glueApi, options)));
    }
    _browserEventsDispatcher.start(glueApi);
    return glueApi;
};
factory.coreVersion = GlueCore.version;
factory.version = version;
factory.calls = callInfo;

let whatToExpose = factory;
let shouldSetToWindow = true;
if (typeof window !== "undefined") {
    const glue42gd = window.glue42gd;
    if (glue42gd && glue42gd.autoInjected) {
        whatToExpose = window.Glue;
        shouldSetToWindow = false;
    }
    if (shouldSetToWindow) {
        window.Glue = whatToExpose;
    }
    delete window.GlueCore;
}
whatToExpose.default = whatToExpose;
var whatToExpose$1 = whatToExpose;

export { whatToExpose$1 as default };
//# sourceMappingURL=desktop.es.js.map
