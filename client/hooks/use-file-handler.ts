import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { validateFiles, type FileValidationResult } from '@/lib/utils/file-utils'
import { APP_CONFIG } from '@/lib/config/app-config'

export interface UseFileHandlerOptions {
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  category?: 'pdf' | 'image' | 'general'
  onFilesSelected?: (files: File[]) => void
  onValidationError?: (errors: Array<{ file: File, error: string }>) => void
}

export interface FileHandlerState {
  files: File[]
  isLoading: boolean
  errors: string[]
  warnings: string[]
}

export const useFileHandler = (options: UseFileHandlerOptions = {}) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    maxFiles = APP_CONFIG.FILES.MAX_BATCH_SIZE,
    maxSize,
    allowedTypes,
    category = 'general',
    onFilesSelected,
    onValidationError
  } = options

  const [state, setState] = useState<FileHandlerState>({
    files: [],
    isLoading: false,
    errors: [],
    warnings: []
  })

  const updateState = useCallback((updates: Partial<FileHandlerState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const clearFiles = useCallback(() => {
    updateState({
      files: [],
      errors: [],
      warnings: []
    })
  }, [updateState])

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }, [])

  const handleFileSelection = useCallback((selectedFiles: File[]) => {
    updateState({ isLoading: true, errors: [], warnings: [] })

    try {
      // Limitar número de archivos
      const filesToProcess = selectedFiles.slice(0, maxFiles)
      
      if (selectedFiles.length > maxFiles) {
        toast({
          title: "Demasiados archivos",
          description: `Solo se procesarán los primeros ${maxFiles} archivos`,
          variant: "destructive"
        })
      }

      // Validar archivos
      const validation = validateFiles(filesToProcess, {
        maxSize,
        allowedTypes,
        category
      })

      // Mostrar errores de validación
      if (validation.invalid.length > 0) {
        const errorMessages = validation.invalid.map(({ file, error }) => 
          `${file.name}: ${error}`
        )
        
        updateState({ 
          errors: errorMessages,
          files: validation.valid,
          warnings: validation.warnings
        })

        toast({
          title: "Algunos archivos no son válidos",
          description: `${validation.invalid.length} archivo(s) rechazado(s)`,
          variant: "destructive"
        })

        onValidationError?.(validation.invalid)
      } else {
        updateState({ 
          files: validation.valid,
          warnings: validation.warnings
        })
      }

      // Mostrar advertencias
      if (validation.warnings.length > 0) {
        toast({
          title: "Advertencias",
          description: validation.warnings.join(', '),
        })
      }

      // Callback de éxito
      if (validation.valid.length > 0) {
        onFilesSelected?.(validation.valid)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error procesando archivos'
      updateState({ errors: [errorMessage] })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      updateState({ isLoading: false })
    }
  }, [maxFiles, maxSize, allowedTypes, category, onFilesSelected, onValidationError, toast, updateState])

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  // Propiedades para el input de archivos
  const inputProps = {
    ref: fileInputRef,
    type: 'file' as const,
    multiple: maxFiles > 1,
    accept: allowedTypes?.join(','),
    onChange: handleInputChange,
    style: { display: 'none' }
  }

  // Propiedades para drag & drop
  const dropZoneProps = {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragEnter: handleDragOver
  }

  return {
    // Estado
    files: state.files,
    isLoading: state.isLoading,
    errors: state.errors,
    warnings: state.warnings,
    hasFiles: state.files.length > 0,
    fileCount: state.files.length,
    
    // Acciones
    clearFiles,
    removeFile,
    openFileDialog,
    handleFileSelection,
    
    // Props para componentes
    inputProps,
    dropZoneProps,
    
    // Utilidades
    getFileInfo: (index: number) => state.files[index],
    getTotalSize: () => state.files.reduce((total, file) => total + file.size, 0)
  }
}