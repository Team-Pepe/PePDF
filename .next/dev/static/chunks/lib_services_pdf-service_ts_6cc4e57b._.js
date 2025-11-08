(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/services/pdf-service.ts [app-client] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_pdfjs-dist_build_pdf_mjs_538f34c7._.js",
  "static/chunks/node_modules_docx_dist_index_mjs_dc9c6205._.js",
  "static/chunks/lib_services_pdf-service_ts_da981efe._.js",
  "static/chunks/lib_services_pdf-service_ts_e93a9d84._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/services/pdf-service.ts [app-client] (ecmascript)");
    });
});
}),
]);