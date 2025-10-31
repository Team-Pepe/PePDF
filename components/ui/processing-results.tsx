"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Image, 
  File,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { formatBytes, getFileExtension, isImageFile, isPDFFile } from '@/lib/utils/file-utils'
import { cn } from '@/lib/utils'

export interface ProcessingResult {
  id: string
  originalFile: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  result?: {
    blob: Blob
    filename: string
    size: number
    compressionRatio?: number
    processingTime?: number
  }
  error?: string
  metadata?: Record<string, any>
}

export interface ProcessingResultsProps {
  results: ProcessingResult[]
  title?: string
  showDownloadAll?: boolean
  onDownload?: (result: ProcessingResult) => void
  onDownloadAll?: () => void
  onRetry?: (result: ProcessingResult) => void
  className?: string
}

const getStatusIcon = (status: ProcessingResult['status']) => {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'error':
      return XCircle
    case 'processing':
      return Loader2
    case 'pending':
      return Clock
    default:
      return Clock
  }
}

const getStatusColor = (status: ProcessingResult['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'processing':
      return 'text-blue-600'
    case 'pending':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusBadgeVariant = (status: ProcessingResult['status']) => {
  switch (status) {
    case 'completed':
      return 'default' as const
    case 'error':
      return 'destructive' as const
    case 'processing':
      return 'secondary' as const
    case 'pending':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

const getFileIcon = (file: File) => {
  if (isImageFile(file)) return Image
  if (isPDFFile(file)) return FileText
  return File
}

const getFileTypeColor = (file: File) => {
  if (isImageFile(file)) return 'text-blue-600'
  if (isPDFFile(file)) return 'text-red-600'
  return 'text-gray-600'
}

export function ProcessingResults({
  results,
  title = "Resultados del procesamiento",
  showDownloadAll = true,
  onDownload,
  onDownloadAll,
  onRetry,
  className
}: ProcessingResultsProps) {
  const completedResults = results.filter(r => r.status === 'completed')
  const hasCompletedResults = completedResults.length > 0
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalFile.size, 0)
  const totalProcessedSize = completedResults.reduce((sum, r) => sum + (r.result?.size || 0), 0)
  const overallCompressionRatio = totalOriginalSize > 0 ? ((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100 : 0

  if (results.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {hasCompletedResults && showDownloadAll && onDownloadAll && (
              <Button onClick={onDownloadAll} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar todo
              </Button>
            )}
          </div>
          
          {/* Estadísticas generales */}
          {results.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{results.length}</p>
                <p className="text-sm text-muted-foreground">Total archivos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedResults.length}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatBytes(totalOriginalSize)}</p>
                <p className="text-sm text-muted-foreground">Tamaño original</p>
              </div>
              {overallCompressionRatio > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {overallCompressionRatio.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Reducción</p>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {results.map((result) => {
              const StatusIcon = getStatusIcon(result.status)
              const statusColor = getStatusColor(result.status)
              const FileIcon = getFileIcon(result.originalFile)
              const fileTypeColor = getFileTypeColor(result.originalFile)
              const isAnimated = result.status === 'processing'

              return (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                >
                  {/* Icono del archivo */}
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileIcon className={cn("w-6 h-6", fileTypeColor)} />
                  </div>

                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{result.originalFile.name}</p>
                      <Badge variant={getStatusBadgeVariant(result.status)}>
                        {result.status === 'pending' && 'Pendiente'}
                        {result.status === 'processing' && 'Procesando'}
                        {result.status === 'completed' && 'Completado'}
                        {result.status === 'error' && 'Error'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Original: {formatBytes(result.originalFile.size)}
                      </span>
                      {result.result && (
                        <>
                          <span>
                            Procesado: {formatBytes(result.result.size)}
                          </span>
                          {result.result.compressionRatio !== undefined && (
                            <span className="text-green-600 font-medium">
                              -{result.result.compressionRatio.toFixed(1)}%
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Progreso */}
                    {result.status === 'processing' && result.progress !== undefined && (
                      <Progress value={result.progress} className="w-full" />
                    )}

                    {/* Error */}
                    {result.status === 'error' && result.error && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{result.error}</p>
                      </div>
                    )}

                    {/* Metadata adicional */}
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estado y acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusIcon 
                      className={cn(
                        "w-5 h-5", 
                        statusColor,
                        isAnimated && "animate-spin"
                      )} 
                    />
                    
                    {result.status === 'completed' && onDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(result)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {result.status === 'error' && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetry(result)}
                      >
                        Reintentar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}