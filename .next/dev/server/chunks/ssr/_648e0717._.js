module.exports = [
"[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_pdfjs-dist_build_pdf_mjs_74288fa9._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-ssr] (ecmascript)");
    });
});
}),
"[project]/lib/services/encryption-service.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_a7738f65._.js",
  "server/chunks/ssr/[root-of-the-server]__18a25c4d._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/services/encryption-service.ts [app-ssr] (ecmascript)");
    });
});
}),
];