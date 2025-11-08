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
"[externals]/@xenova/transformers [external] (@xenova/transformers, esm_import, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[externals]_@xenova_transformers_91389dd1._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/@xenova/transformers [external] (@xenova/transformers, esm_import)");
    });
});
}),
];