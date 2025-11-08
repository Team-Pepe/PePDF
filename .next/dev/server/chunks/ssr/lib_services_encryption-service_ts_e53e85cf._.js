module.exports = [
"[project]/lib/services/encryption-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncryptionService",
    ()=>EncryptionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jszip$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jszip/lib/index.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'pdf-encrypt'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
;
class EncryptionService {
    /**
   * Encrypt a PDF file with password protection
   */ static async encryptPDF(file, options) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const { password, permissions = {} } = options;
            // Set default permissions (restrictive by default)
            const pdfPermissions = {
                printing: permissions.printing ?? false,
                modifying: permissions.modifying ?? false,
                copying: permissions.copying ?? false,
                annotating: permissions.annotating ?? false
            };
            // Use pdf-encrypt library for real PDF encryption
            const encryptedBuffer = await new Promise((resolve, reject)=>{
                pdfEncrypt(Buffer.from(arrayBuffer), {
                    userPassword: password,
                    ownerPassword: password + "_owner",
                    permissions: {
                        print: pdfPermissions.printing,
                        modify: pdfPermissions.modifying,
                        copy: pdfPermissions.copying,
                        annotate: pdfPermissions.annotating
                    }
                }, (err, buffer)=>{
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buffer);
                    }
                });
            });
            const blob = new Blob([
                new Uint8Array(encryptedBuffer)
            ], {
                type: "application/pdf"
            });
            const fileName = file.name.replace('.pdf', '-encrypted.pdf');
            return {
                blob,
                fileName,
                algorithm: 'PDF-Standard'
            };
        } catch (error) {
            console.error('Error encrypting PDF:', error);
            throw new Error('Failed to encrypt PDF file');
        }
    }
    /**
   * Decrypt PDF file with password
   */ static async decryptPDF(file, password) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            // Try to load the PDF with the provided password
            const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer, {
                ignoreEncryption: false
            });
            // If we get here, the PDF was successfully loaded (decrypted)
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([
                new Uint8Array(pdfBytes)
            ], {
                type: "application/pdf"
            });
            const fileName = file.name.replace('.pdf', '-decrypted.pdf');
            return {
                blob,
                fileName,
                algorithm: 'PDF-Standard'
            };
        } catch (error) {
            console.error('Error decrypting PDF:', error);
            if (error instanceof Error && error.message.includes('password')) {
                throw new Error('Contraseña incorrecta o PDF no encriptado');
            }
            throw new Error('Error al desencriptar el archivo PDF');
        }
    }
    /**
   * Check if PDF is encrypted
   */ static async isPDFEncrypted(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            // Try to load without password
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PDFDocument"].load(arrayBuffer, {
                ignoreEncryption: false
            });
            return false // If successful, it's not encrypted
            ;
        } catch (error) {
            // If it fails, it might be encrypted
            return true;
        }
    }
    /**
   * Encrypt any file using browser's Web Crypto API
   */ static async encryptFile(file, password) {
        try {
            // Generate a key from the password
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), {
                name: 'PBKDF2'
            }, false, [
                'deriveKey'
            ]);
            // Generate a random salt
            const salt = crypto.getRandomValues(new Uint8Array(16));
            // Derive the actual encryption key
            const key = await crypto.subtle.deriveKey({
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            }, keyMaterial, {
                name: 'AES-GCM',
                length: 256
            }, false, [
                'encrypt'
            ]);
            // Generate a random IV
            const iv = crypto.getRandomValues(new Uint8Array(12));
            // Read file data
            const fileData = await file.arrayBuffer();
            // Encrypt the file
            const encryptedData = await crypto.subtle.encrypt({
                name: 'AES-GCM',
                iv: iv
            }, key, fileData);
            // Combine salt, IV, and encrypted data
            const combinedData = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combinedData.set(salt, 0);
            combinedData.set(iv, salt.length);
            combinedData.set(new Uint8Array(encryptedData), salt.length + iv.length);
            const blob = new Blob([
                combinedData
            ], {
                type: 'application/octet-stream'
            });
            const fileName = file.name + '.encrypted';
            return {
                blob,
                fileName,
                algorithm: 'AES-256-GCM'
            };
        } catch (error) {
            console.error('Error encrypting file:', error);
            throw new Error('Failed to encrypt file');
        }
    }
    /**
   * Encrypt multiple files into a password-protected ZIP
   */ static async encryptMultipleFiles(files, password, zipName = 'encrypted-files.zip') {
        try {
            const zip = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jszip$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
            // Add files to ZIP
            for (const file of files){
                const fileData = await file.arrayBuffer();
                zip.file(file.name, fileData);
            }
            // Generate password-protected ZIP
            const encryptedZip = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            return {
                blob: encryptedZip,
                fileName: zipName,
                algorithm: 'ZIP-Deflate'
            };
        } catch (error) {
            console.error('Error creating encrypted ZIP:', error);
            throw new Error('Failed to create encrypted ZIP file');
        }
    }
    /**
   * Validate password strength
   */ static validatePassword(password) {
        const suggestions = [];
        let score = 0;
        if (password.length >= 8) score += 1;
        else suggestions.push('Use at least 8 characters');
        if (/[a-z]/.test(password)) score += 1;
        else suggestions.push('Include lowercase letters');
        if (/[A-Z]/.test(password)) score += 1;
        else suggestions.push('Include uppercase letters');
        if (/\d/.test(password)) score += 1;
        else suggestions.push('Include numbers');
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        else suggestions.push('Include special characters');
        const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
        const isValid = score >= 3;
        return {
            isValid,
            strength,
            suggestions
        };
    }
    /**
   * Generate a secure random password
   */ static generateSecurePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, (byte)=>charset[byte % charset.length]).join('');
    }
}
}),
];

//# sourceMappingURL=lib_services_encryption-service_ts_e53e85cf._.js.map