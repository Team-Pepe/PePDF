module.exports = [
"[project]/lib/services/pdf-service.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/_648e0717._.js",
  "server/chunks/ssr/node_modules_docx_dist_index_mjs_1a4762bc._.js",
  "server/chunks/ssr/[root-of-the-server]__33742380._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/services/pdf-service.ts [app-ssr] (ecmascript)");
    });
});
}),
];