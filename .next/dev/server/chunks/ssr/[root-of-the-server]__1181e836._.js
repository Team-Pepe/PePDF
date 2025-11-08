module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/lib/services/pdf-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PDFService",
    ()=>PDFService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/docx/dist/index.mjs [app-ssr] (ecmascript)");
;
;
// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib = null;
// Configure PDF.js worker only on client side
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
class PDFService {
    /**
   * Extract text from PDF file
   */ static async extractTextFromPDF(file) {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error("PDF text extraction is only available on the client side");
        }
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-ssr] (ecmascript, async loader)");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;
            const textPages = [];
            for(let i = 1; i <= pdf.numPages; i++){
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let pageText = "";
                textContent.items.forEach((item)=>{
                    if (item.str) {
                        pageText += item.str + " ";
                    }
                });
                textPages.push(pageText.trim());
            }
            return textPages;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }
    /**
   * Convert PDF to Word document
   */ static async convertToWord(options) {
        const { file, preserveFormatting = true, includeImages = false, includeTables = false } = options;
        try {
            // Extract text from PDF
            const textPages = await this.extractTextFromPDF(file);
            // Create Word document
            const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Document"]({
                sections: [
                    {
                        properties: {},
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                children: [
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextRun"]({
                                        text: `Converted from: ${file.name}`,
                                        bold: true,
                                        size: 24
                                    })
                                ]
                            }),
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                text: ""
                            }),
                            ...textPages.flatMap((pageText, index)=>[
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        children: [
                                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextRun"]({
                                                text: `Page ${index + 1}`,
                                                bold: true,
                                                size: 20
                                            })
                                        ]
                                    }),
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        text: ""
                                    }),
                                    ...this.groupSentencesIntoParagraphs(pageText.split(/[.!?]+/)).map((paragraph)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                            children: [
                                                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextRun"]({
                                                    text: paragraph.trim(),
                                                    size: 20
                                                })
                                            ]
                                        })),
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        text: ""
                                    })
                                ])
                        ]
                    }
                ]
            });
            // Generate Word document
            const buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Packer"].toBuffer(doc);
            return new Blob([
                new Uint8Array(buffer)
            ], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
        } catch (error) {
            console.error('Error converting PDF to Word:', error);
            throw new Error('Failed to convert PDF to Word');
        }
    }
    /**
   * Convert PDF to images
   */ static async convertToImages(options) {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error("PDF to images conversion is only available on the client side");
        }
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-ssr] (ecmascript, async loader)");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        }
        const { file, format, quality = 0.92, scale = 2.0 } = options;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;
            const images = [];
            for(let i = 1; i <= pdf.numPages; i++){
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({
                    scale
                });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                const blob = await new Promise((resolve)=>{
                    canvas.toBlob((blob)=>{
                        resolve(blob);
                    }, `image/${format}`, quality);
                });
                images.push(blob);
            }
            return images;
        } catch (error) {
            console.error('Error converting PDF to images:', error);
            throw new Error('Failed to convert PDF to images');
        }
    }
    /**
   * Compress PDF file
   */ static async compress(options) {
        const { file, quality = 'medium' } = options;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
            // Compression settings based on quality
            const compressionOptions = {
                low: {
                    useObjectStreams: false,
                    addDefaultPage: false
                },
                medium: {
                    useObjectStreams: true,
                    addDefaultPage: false
                },
                high: {
                    useObjectStreams: true,
                    addDefaultPage: false,
                    compress: true
                }
            };
            const pdfBytes = await pdfDoc.save(compressionOptions[quality]);
            return new Blob([
                new Uint8Array(pdfBytes)
            ], {
                type: "application/pdf"
            });
        } catch (error) {
            console.error('Error compressing PDF:', error);
            throw new Error('Failed to compress PDF');
        }
    }
    // encrypt method removed
    /**
   * Merge multiple PDF files
   */ static async merge(options) {
        const { files } = options;
        try {
            const mergedPdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].create();
            for (const file of files){
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page)=>mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            return new Blob([
                new Uint8Array(pdfBytes)
            ], {
                type: "application/pdf"
            });
        } catch (error) {
            console.error('Error merging PDFs:', error);
            throw new Error('Failed to merge PDFs');
        }
    }
    /**
   * Group sentences into paragraphs for better Word formatting
   */ static groupSentencesIntoParagraphs(sentences) {
        const paragraphs = [];
        let currentParagraph = "";
        sentences.forEach((sentence)=>{
            const trimmedSentence = sentence.trim();
            if (trimmedSentence) {
                if (currentParagraph.length + trimmedSentence.length > 500) {
                    if (currentParagraph) {
                        paragraphs.push(currentParagraph.trim());
                    }
                    currentParagraph = trimmedSentence + ". ";
                } else {
                    currentParagraph += trimmedSentence + ". ";
                }
            }
        });
        if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
        }
        return paragraphs;
    }
    /**
   * Validate if file is a valid PDF
   */ static async validatePDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
            return true;
        } catch  {
            return false;
        }
    }
    /**
   * Get PDF metadata
   */ static async getPDFInfo(file) {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error("PDF info extraction is only available on the client side");
        }
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-ssr] (ecmascript, async loader)");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;
            const metadata = await pdf.getMetadata();
            return {
                pageCount: pdf.numPages,
                title: metadata.info?.Title,
                author: metadata.info?.Author,
                subject: metadata.info?.Subject,
                creator: metadata.info?.Creator
            };
        } catch (error) {
            console.error('Error getting PDF info:', error);
            throw new Error('Failed to get PDF information');
        }
    }
    /**
   * Wrap text for better formatting
   */ static wrapText(text, maxLength) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
        words.forEach((word)=>{
            if (currentLine.length + word.length + 1 <= maxLength) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
    }
}
}),
"[project]/lib/services/translation-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// TranslationService: Offline PDF translation using local MarianMT models via transformers.js
// Works entirely in the browser. No API keys or third-party services.
__turbopack_context__.s([
    "TranslationService",
    ()=>TranslationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$pdf$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/pdf-service.ts [app-ssr] (ecmascript)");
;
// Map language pairs to local model IDs (MarianMT converted models for transformers.js)
const MODEL_MAP = {
    en: {
        es: 'Xenova/opus-mt-en-es',
        fr: 'Xenova/opus-mt-en-fr',
        de: 'Xenova/opus-mt-en-de',
        it: 'Xenova/opus-mt-en-it',
        pt: 'Xenova/opus-mt-en-pt'
    },
    es: {
        en: 'Xenova/opus-mt-es-en',
        fr: 'Xenova/opus-mt-es-fr',
        de: 'Xenova/opus-mt-es-de',
        it: 'Xenova/opus-mt-es-it',
        pt: 'Xenova/opus-mt-es-pt'
    },
    fr: {
        en: 'Xenova/opus-mt-fr-en',
        es: 'Xenova/opus-mt-fr-es',
        de: 'Xenova/opus-mt-fr-de',
        it: 'Xenova/opus-mt-fr-it',
        pt: 'Xenova/opus-mt-fr-pt'
    },
    de: {
        en: 'Xenova/opus-mt-de-en',
        es: 'Xenova/opus-mt-de-es',
        fr: 'Xenova/opus-mt-de-fr',
        it: 'Xenova/opus-mt-de-it',
        pt: 'Xenova/opus-mt-de-pt'
    },
    it: {
        en: 'Xenova/opus-mt-it-en',
        es: 'Xenova/opus-mt-it-es',
        fr: 'Xenova/opus-mt-it-fr',
        de: 'Xenova/opus-mt-it-de',
        pt: 'Xenova/opus-mt-it-pt'
    },
    pt: {
        en: 'Xenova/opus-mt-pt-en',
        es: 'Xenova/opus-mt-pt-es',
        fr: 'Xenova/opus-mt-pt-fr',
        de: 'Xenova/opus-mt-pt-de',
        it: 'Xenova/opus-mt-pt-it'
    }
};
class TranslationService {
    static cache = {};
    /**
   * Translate a full PDF file and return a new PDF blob with translated text.
   */ static async translatePDF(options) {
        const { file, sourceLang, targetLang } = options;
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error('PDF translation is only available on the client side');
        }
        const modelId = this.getModelId(sourceLang, targetLang);
        const translator = await this.getTranslator(modelId);
        // Extract text per page
        const pages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$pdf$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFService"].extractTextFromPDF(file);
        // Translate each page with chunking to avoid context limits
        const translatedPages = [];
        for (const pageText of pages){
            const translated = await this.translateLargeText(pageText, await translator);
            translatedPages.push(translated);
        }
        // Create a new PDF with translated text
        const translatedPdf = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$pdf$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFService"].createPDFfromTextPages(translatedPages);
        return translatedPdf;
    }
    /** Get the model ID for a language pair. */ static getModelId(src, tgt) {
        if (src === tgt) throw new Error('El idioma de origen y destino no pueden ser iguales');
        const id = MODEL_MAP[src]?.[tgt];
        if (!id) throw new Error(`No hay modelo local configurado para ${src}→${tgt}`);
        return id;
    }
    /** Lazily initialize and cache the translation pipeline using local models only. */ static async getTranslator(modelId) {
        if (!this.cache[modelId]) {
            this.cache[modelId] = (async ()=>{
                // Dynamic import to avoid SSR issues
                // Ensure transformers.js detects browser correctly under Next/Turbopack.
                // Provide a safe `process` shape so env detection in transformers.js doesn't call
                // `Object.keys(undefined)` on `process.versions`.
                {
                    const g = globalThis;
                    // Create a safe process polyfill for browser bundles
                    if (!g.process || typeof g.process !== 'object') {
                        g.process = {
                            versions: {},
                            env: {},
                            browser: true
                        };
                    } else {
                        const p = g.process;
                        if (p.versions == null) p.versions = {};
                        if (p.env == null) p.env = {};
                        p.browser = true;
                    }
                }
                // Optional remote models support via env flag
                const allowRemote = ("TURBOPACK compile-time value", "true") === 'true';
                // Quick preflight: ensure local model files exist only when remote models are disabled
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
                const { pipeline, env } = await __turbopack_context__.A("[externals]/@xenova/transformers [external] (@xenova/transformers, esm_import, async loader)");
                env.allowRemoteModels = allowRemote;
                env.localModelPath = '/models';
                let pipe;
                try {
                    pipe = await pipeline('translation', modelId);
                } catch (e) {
                    throw new Error(e?.message || 'No se pudo inicializar el pipeline de traducción con el modelo local');
                }
                return pipe;
            })();
        }
        return this.cache[modelId];
    }
    /** Translate long text by splitting into manageable chunks. */ static async translateLargeText(text, translator) {
        const chunks = this.chunkText(text, 500);
        const outputs = [];
        for (const chunk of chunks){
            const result = await translator(chunk);
            const translated = Array.isArray(result) ? result[0].translation_text : result.translation_text;
            outputs.push(translated);
        }
        return outputs.join(' ');
    }
    /** Simple sentence-based chunking with a max length safeguard. */ static chunkText(text, maxLen) {
        const sentences = text.split(/(?<=[.!?])\s+/);
        const chunks = [];
        let current = '';
        for (const s of sentences){
            if ((current + ' ' + s).trim().length <= maxLen) {
                current = (current ? current + ' ' : '') + s;
            } else {
                if (current) chunks.push(current);
                current = s;
            }
        }
        if (current) chunks.push(current);
        return chunks;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1181e836._.js.map