"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useFileHandler, type UseFileHandlerOptions } from '@/hooks/use-file-handler'
import { formatBytes, getFileExtension, isImageFile, isPDFFile } from '@/lib/utils/file-utils'
import { cn } from '@/lib/utils'

export interface FileUploadProps extends UseFileHandlerOptions {
  title?: string
  description?: string
  className?: string
  showFileList?: boolean
  showProgress?: boolean
  disabled?: boolean
  variant?: 'default' | 'compact' | 'minimal'
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

export function FileUpload({
  title = "Seleccionar archivos",
  description = "Arrastra archivos aquí o haz click para seleccionar",
  className,
  showFileList = true,
  showProgress = false,
  disabled = false,
  variant = 'default',
  ...fileHandlerOptions
}: FileUploadProps) {
  const {
    files,
    isLoading,
    errors,
    warnings,
    hasFiles,
    fileCount,
    clearFiles,
    removeFile,
    openFileDialog,
    inputProps,
    dropZoneProps,
    getTotalSize
  } = useFileHandler(fileHandlerOptions)

  const isCompact = variant === 'compact'
  const isMinimal = variant === 'minimal'

  if (isMinimal) {
    return (
      <div className={cn("space-y-2", className)}>
        <Button
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {title}
        </Button>
        <input {...inputProps} />
        
        {hasFiles && (
          <div className="text-sm text-muted-foreground">
            {fileCount} archivo{fileCount > 1 ? 's' : ''} seleccionado{fileCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>{title}</Label>
            
            <div
              {...dropZoneProps}
              className={cn(
                "border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                "hover:border-primary/50 hover:bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed",
                isCompact ? "p-4" : "p-8"
              )}
              onClick={disabled ? undefined : openFileDialog}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">{description}</p>
                  {fileHandlerOptions.maxFiles && (
                    <p className="text-xs text-muted-foreground">
                      Máximo {fileHandlerOptions.maxFiles} archivo{fileHandlerOptions.maxFiles > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <input {...inputProps} />
          </div>
        </CardContent>
      </Card>

      {/* Errores */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">Errores encontrados:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-600">Advertencias:</p>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de archivos */}
      {showFileList && hasFiles && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Archivos seleccionados ({fileCount})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Total: {formatBytes(getTotalSize())}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFiles}
                  >
                    Limpiar todo
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => {
                  const FileIcon = getFileIcon(file)
                  const iconColor = getFileTypeColor(file)
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg group"
                    >
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <FileIcon className={cn("w-5 h-5", iconColor)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(file.size)} • {file.type || getFileExtension(file.name)}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progreso */}
      {showProgress && isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Procesando archivos...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}