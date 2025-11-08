(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/services/pdf-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PDFService",
    ()=>PDFService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/docx/dist/index.mjs [app-client] (ecmascript)");
;
;
// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib = null;
// Configure PDF.js worker only on client side
if ("TURBOPACK compile-time truthy", 1) {
    __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript, async loader)").then((pdfjs)=>{
        pdfjsLib = pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    });
}
class PDFService {
    /**
   * Extract text from PDF file
   */ static async extractTextFromPDF(file) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript, async loader)");
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
            const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Document"]({
                sections: [
                    {
                        properties: {},
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                children: [
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                        text: `Converted from: ${file.name}`,
                                        bold: true,
                                        size: 24
                                    })
                                ]
                            }),
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                text: ""
                            }),
                            ...textPages.flatMap((pageText, index)=>[
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        children: [
                                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                                text: `Page ${index + 1}`,
                                                bold: true,
                                                size: 20
                                            })
                                        ]
                                    }),
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        text: ""
                                    }),
                                    ...this.groupSentencesIntoParagraphs(pageText.split(/[.!?]+/)).map((paragraph)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                            children: [
                                                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                                    text: paragraph.trim(),
                                                    size: 20
                                                })
                                            ]
                                        })),
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        text: ""
                                    })
                                ])
                        ]
                    }
                ]
            });
            // Generate Word document
            const buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Packer"].toBuffer(doc);
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript, async loader)");
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
            const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
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
    /**
   * Encrypt PDF file
   */ static async encrypt(options) {
        const { file, password, permissions = {} } = options;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
            // pdf-lib no soporta encriptación directa, por ahora solo guardamos el PDF
            // La encriptación real se debe hacer con otra librería o en el backend
            const pdfBytes = await pdfDoc.save();
            return new Blob([
                new Uint8Array(pdfBytes)
            ], {
                type: "application/pdf"
            });
        } catch (error) {
            console.error('Error encrypting PDF:', error);
            throw new Error('Failed to encrypt PDF');
        }
    }
    /**
   * Merge multiple PDF files
   */ static async merge(options) {
        const { files } = options;
        try {
            const mergedPdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].create();
            for (const file of files){
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer);
            return true;
        } catch  {
            return false;
        }
    }
    /**
   * Get PDF metadata
   */ static async getPDFInfo(file) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (!pdfjsLib) {
            pdfjsLib = await __turbopack_context__.A("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript, async loader)");
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_services_pdf-service_ts_da981efe._.js.map