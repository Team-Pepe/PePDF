"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { 
  Download, 
  Loader2, 
  Archive,
  Settings
} from 'lucide-react'
import { saveAs } from 'file-saver'
import { saveGeneratedFile, generateFileId } from '@/lib/file-storage'
import { CompressionService } from '@/lib/services/compression-service'
import { FileUpload } from '@/components/ui/file-upload'
import { ProcessingResults, type ProcessingResult } from '@/components/ui/processing-results'
import { APP_CONFIG } from '@/lib/config/app-config'
import { formatBytes } from '@/lib/utils/file-utils'

export function CompressFiles() {
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageQuality, setImageQuality] = useState([0.8])
  const [pdfQuality, setPdfQuality] = useState([0.7])
  const [createZip, setCreateZip] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFilesSelected = (files: File[]) => {
    const newResults: ProcessingResult[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      originalFile: file,
      status: 'pending' as const
    }))
    
    setResults(prev => [...prev, ...newResults])
  }

  const compressFile = async (result: ProcessingResult): Promise<ProcessingResult> => {
    const { originalFile } = result
    
    try {
      // Actualizar estado a procesando
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, status: 'processing' as const, progress: 0 } : r
      ))

      let compressionResult: { blob: Blob; originalSize: number; compressedSize: number; compressionRatio: number }
      const startTime = Date.now()

      if (originalFile.type.startsWith('image/')) {
        // Comprimir imagen
        compressionResult = await CompressionService.compressImage(originalFile, {
          quality: imageQuality[0],
          maxSizeMB: APP_CONFIG.COMPRESSION.IMAGE.MAX_SIZE_MB,
          maxWidthOrHeight: 1920
        })
      } else if (originalFile.type === 'application/pdf') {
        // Comprimir PDF
        compressionResult = await CompressionService.compressPDF(originalFile, {
          quality: pdfQuality[0]
        })
      } else {
        throw new Error('Tipo de archivo no soportado para compresión')
      }

      const processingTime = Date.now() - startTime
      const compressionRatio = compressionResult.compressionRatio

      const updatedResult: ProcessingResult = {
        ...result,
        status: 'completed',
        progress: 100,
        result: {
          blob: compressionResult.blob,
          filename: `compressed_${originalFile.name}`,
          size: compressionResult.blob.size,
          compressionRatio,
          processingTime
        }
      }

      setResults(prev => prev.map(r => 
        r.id === result.id ? updatedResult : r
      ))

      return updatedResult
    } catch (error) {
      const errorResult: ProcessingResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }

      setResults(prev => prev.map(r => 
        r.id === result.id ? errorResult : r
      ))

      return errorResult
    }
  }

  const compressAllFiles = async () => {
    const pendingResults = results.filter(r => r.status === 'pending')
    if (pendingResults.length === 0) return

    setIsProcessing(true)

    try {
      const compressedResults: ProcessingResult[] = []

      // Comprimir archivos uno por uno
      for (const result of pendingResults) {
        const compressedResult = await compressFile(result)
        compressedResults.push(compressedResult)
      }

      const successfulResults = compressedResults.filter(r => r.status === 'completed')
      
      if (successfulResults.length === 0) {
        toast({
          title: "Error",
          description: "No se pudo comprimir ningún archivo",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Compresión completada",
        description: `${successfulResults.length} archivo(s) comprimido(s) exitosamente`,
      })

    } catch (error) {
      console.error('Error durante la compresión:', error)
      toast({
        title: "Error",
        description: "Error durante el proceso de compresión",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  const handleDownload = async (result: ProcessingResult) => {
    if (!result.result) return

    try {
      saveAs(result.result.blob, result.result.filename)
      
      // Guardar metadata
      saveGeneratedFile({
        id: generateFileId(),
        name: result.result.filename,
        type: 'Archivo Comprimido',
        date: new Date().toLocaleDateString(),
        size: formatBytes(result.result.size)
      })

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${result.result.filename}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al descargar el archivo",
        variant: "destructive"
      })
    }
  }

  const handleDownloadAll = async () => {
    const completedResults = results.filter(r => r.status === 'completed' && r.result)
    
    if (completedResults.length === 0) return

    try {
      if (createZip && completedResults.length > 1) {
        // Crear ZIP con archivos comprimidos
        const zipBlob = await CompressionService.compressToZip(
          completedResults.map(r => r.originalFile)
        )

        saveAs(zipBlob, 'compressed_files.zip')
        
        // Guardar metadata del ZIP
        saveGeneratedFile({
          id: generateFileId(),
          name: 'compressed_files.zip',
          type: 'Archivo ZIP Comprimido',
          date: new Date().toLocaleDateString(),
          size: formatBytes(zipBlob.size)
        })

        toast({
          title: "ZIP creado",
          description: "Todos los archivos comprimidos descargados en un ZIP",
        })
      } else {
        // Descargar archivos individualmente
        for (const result of completedResults) {
          await handleDownload(result)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la descarga",
        variant: "destructive"
      })
    }
  }

  const handleRetry = (result: ProcessingResult) => {
    setResults(prev => prev.map(r => 
      r.id === result.id ? { ...r, status: 'pending' as const, error: undefined } : r
    ))
  }

  const clearResults = () => {
    setResults([])
  }

  const pendingCount = results.filter(r => r.status === 'pending').length
  const completedCount = results.filter(r => r.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Subida de archivos */}
      <FileUpload
        title="Seleccionar archivos para comprimir"
        description="Arrastra imágenes y PDFs aquí o haz click para seleccionar"
        allowedTypes={['image/*', 'application/pdf']}
        maxFiles={APP_CONFIG.FILES.MAX_BATCH_SIZE}
        maxSize={APP_CONFIG.FILES.MAX_UPLOAD_SIZE}
        onFilesSelected={handleFilesSelected}
        disabled={isProcessing}
      />

      {/* Configuración de compresión */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de compresión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calidad de imagen */}
            <div className="space-y-2">
              <Label>Calidad de imagen: {Math.round(imageQuality[0] * 100)}%</Label>
              <Slider
                value={imageQuality}
                onValueChange={setImageQuality}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Mayor calidad = archivos más grandes
              </p>
            </div>

            {/* Calidad de PDF */}
            <div className="space-y-2">
              <Label>Calidad de PDF: {Math.round(pdfQuality[0] * 100)}%</Label>
              <Slider
                value={pdfQuality}
                onValueChange={setPdfQuality}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Menor calidad = mayor compresión
              </p>
            </div>

            {/* Opción de ZIP */}
            {results.length > 1 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-zip"
                  checked={createZip}
                  onCheckedChange={setCreateZip}
                />
                <Label htmlFor="create-zip">
                  Crear archivo ZIP con todos los archivos comprimidos
                </Label>
              </div>
            )}

            {/* Botón de compresión */}
            <div className="flex gap-2">
              <Button
                onClick={compressAllFiles}
                disabled={pendingCount === 0 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Comprimiendo...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Comprimir {pendingCount} archivo{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearResults}
                  disabled={isProcessing}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      <ProcessingResults
        results={results}
        title="Resultados de compresión"
        onDownload={handleDownload}
        onDownloadAll={handleDownloadAll}
        onRetry={handleRetry}
        showDownloadAll={completedCount > 0}
      />
    </div>
  )
}
