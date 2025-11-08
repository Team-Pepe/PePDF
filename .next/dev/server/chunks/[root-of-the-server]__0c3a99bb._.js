module.exports = [
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[project]/node_modules/node-qpdf2/dist/spawn.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Ignore errors about unsafe-arguments, this is because data is unknown
/* eslint-disable @typescript-eslint/no-unsafe-argument */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
;
const __TURBOPACK__default__export__ = (callArguments)=>new Promise((resolve, reject)=>{
        const process = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])("qpdf", callArguments);
        const stdout = [];
        const stderr = [];
        process.stdout.on("data", (data)=>{
            stdout.push(data);
        });
        process.stderr.on("data", (data)=>{
            /* c8 ignore next */ stderr.push(data);
        });
        process.on("error", (error)=>{
            /* c8 ignore next */ reject(error);
        });
        process.on("close", (code)=>{
            if (code === 0) {
                resolve(Buffer.from(stdout.join("")));
            } else {
                // There is a problem from qpdf
                reject(Buffer.from(stderr.join("")).toLocaleString());
            }
        });
    });
}),
"[project]/node_modules/node-qpdf2/dist/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileExists",
    ()=>fileExists,
    "hyphenate",
    ()=>hyphenate
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
;
const hyphenate = (variable)=>variable.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const fileExists = (file)=>!!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(file);
}),
"[project]/node_modules/node-qpdf2/dist/decrypt.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/spawn.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/utils.js [app-route] (ecmascript)");
;
;
const decrypt = async (payload)=>{
    if (!payload.input) throw new Error("Please specify input file");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileExists"])(payload.input)) throw new Error("Input file doesn't exist");
    const callArguments = [
        "--decrypt"
    ];
    // Password
    if (payload.password) {
        callArguments.push(`--password=${payload.password}`);
    }
    // Input file path
    callArguments.push(payload.input);
    // Print PDF on stdout
    if (payload.output) {
        callArguments.push(payload.output);
    } else {
        callArguments.push("-");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(callArguments);
};
}),
"[project]/node_modules/node-qpdf2/dist/encrypt.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encrypt",
    ()=>encrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/spawn.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/utils.js [app-route] (ecmascript)");
;
;
const EncryptDefaults = {
    keyLength: 256,
    overwrite: true
};
const encrypt = async (userPayload)=>{
    // Set Defaults
    const payload = {
        ...EncryptDefaults,
        ...userPayload
    };
    // Check if the file exists
    if (!payload.input) throw new Error("Please specify input file");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileExists"])(payload.input)) throw new Error("Input file doesn't exist");
    if (payload.output && !payload.overwrite && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileExists"])(payload.output)) throw new Error("Output file already exists");
    const callArguments = [];
    // If the keyLength is 40, `--allow-weak-crypto` needs to be specified before `--encrypt`.
    // This is required for qpdf 11+.
    if (payload.keyLength === 40) callArguments.push("--allow-weak-crypto");
    callArguments.push("--encrypt");
    // Set user-password and owner-password
    if (typeof payload.password === "object") {
        if (payload.password.user === undefined || payload.password.owner === undefined) {
            // TODO: If the keyLength is 256 AND there is no owner password, `--allow-insecure` can be used
            throw new Error("Please specify both owner and user passwords");
        }
        callArguments.push(payload.password.user, payload.password.owner);
    } else if (typeof payload.password === "string") {
        // Push twice for user-password and owner-password
        callArguments.push(payload.password, payload.password);
    } else {
        // no password specified, push two empty strings (https://stackoverflow.com/a/43736897/455124)
        callArguments.push("", "");
    }
    // Specifying the key length
    callArguments.push(payload.keyLength.toString());
    // Add Restrictions for encryption
    if (payload.restrictions) {
        if (typeof payload.restrictions !== "object") throw new Error("Invalid Restrictions");
        for (const [restriction, value] of Object.entries(payload.restrictions)){
            // cleartextMetadata does not have a value
            if (restriction === "cleartextMetadata" && value === true) {
                callArguments.push(`--${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hyphenate"])(restriction)}`);
            }
            if (restriction === "useAes" && payload.keyLength === 256) {
            // use-aes is always on with 256 bit keyLength
            } else {
                callArguments.push(`--${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hyphenate"])(restriction)}=${value}`);
            }
        }
    }
    // Marks end of --encrypt options, Input file path
    callArguments.push("--", payload.input);
    if (payload.output) {
        // If the input and output locations are the same, and overwrite is true, replace the input file
        if (payload.input === payload.output && payload.overwrite) {
            callArguments.push("--replace-input");
        } else {
            callArguments.push(payload.output);
        }
    } else {
        // Print PDF on stdout
        callArguments.push("-");
    }
    // Execute command and return stdout for pipe
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(callArguments);
};
}),
"[project]/node_modules/node-qpdf2/dist/info.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "info",
    ()=>info
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/spawn.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/utils.js [app-route] (ecmascript)");
;
;
const info = async (payload)=>{
    if (!payload.input) throw new Error("Please specify input file");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileExists"])(payload.input)) throw new Error("Input file doesn't exist");
    const callArguments = [
        "--show-encryption"
    ];
    // Password
    if (payload.password) {
        callArguments.push(`--password=${payload.password}`);
    }
    // Input file path
    callArguments.push(payload.input);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$spawn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(callArguments);
    return result.toLocaleString().trim();
};
}),
"[project]/node_modules/node-qpdf2/dist/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$decrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/decrypt.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$encrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/encrypt.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/info.js [app-route] (ecmascript)");
;
;
;
}),
"[project]/node_modules/node-qpdf2/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$decrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"],
    "encrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$encrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"],
    "info",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["info"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$decrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/decrypt.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$encrypt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/encrypt.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$qpdf2$2f$dist$2f$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-qpdf2/dist/info.js [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c3a99bb._.js.map