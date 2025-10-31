"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Key, 
  Loader2,
  RefreshCw,
  Settings
} from 'lucide-react'
import { saveAs } from 'file-saver'
import { saveGeneratedFile, generateFileId } from '@/lib/file-storage'
import { formatBytes } from '@/lib/utils/file-utils'
import { EncryptionService } from '@/lib/services/encryption-service'
import { FileUpload } from '@/components/ui/file-upload'
import { ProcessingResults, type ProcessingResult } from '@/components/ui/processing-results'
import { APP_CONFIG } from '@/lib/config/app-config'
import { isPDFFile } from '@/lib/utils/file-utils'

export function EncryptPDF() {
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [encryptionType, setEncryptionType] = useState<'pdf' | 'general'>('pdf')
  const [createZip, setCreateZip] = useState(false)
  const [permissions, setPermissions] = useState({
    printing: true,
    modifying: false,
    copying: false,
    annotating: true,
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleFilesSelected = (files: File[]) => {
    const newResults: ProcessingResult[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      originalFile: file,
      status: 'pending' as const
    }))
    
    setResults(prev => [...prev, ...newResults])

    // Determinar tipo de encriptación basado en archivos
    const hasPdf = files.some(file => isPDFFile(file))
    const hasOtherFiles = files.some(file => !isPDFFile(file))
    
    if (hasPdf && !hasOtherFiles) {
      setEncryptionType('pdf')
    } else {
      setEncryptionType('general')
    }
  }

  const validatePassword = () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Por favor ingresa una contraseña",
        variant: "destructive"
      })
      return false
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      })
      return false
    }

    const validation = EncryptionService.validatePassword(password)
    if (!validation.isValid) {
      toast({
        title: "Contraseña débil",
        description: validation.suggestions.join(', '),
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const encryptFile = async (result: ProcessingResult): Promise<ProcessingResult> => {
    const { originalFile } = result
    
    try {
      // Actualizar estado a procesando
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, status: 'processing' as const, progress: 0 } : r
      ))

      let encryptionResult: { blob: Blob; fileName: string; algorithm: string }
      const startTime = Date.now()

      if (isPDFFile(originalFile)) {
        // Encriptar PDF con permisos específicos
        encryptionResult = await EncryptionService.encryptPDF(originalFile, {
          password,
          permissions
        })
      } else {
        // Encriptación general de archivos
        encryptionResult = await EncryptionService.encryptFile(originalFile, password)
      }

      const processingTime = Date.now() - startTime

      const updatedResult: ProcessingResult = {
        ...result,
        status: 'completed',
        progress: 100,
        result: {
          blob: encryptionResult.blob,
          filename: encryptionResult.fileName,
          size: encryptionResult.blob.size,
          processingTime
        },
        metadata: {
          algorithm: encryptionResult.algorithm,
          encryptionType: encryptionResult.algorithm,
          permissions: isPDFFile(originalFile) ? permissions : undefined
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

  const encryptAllFiles = async () => {
    if (!validatePassword()) return

    const pendingResults = results.filter(r => r.status === 'pending')
    if (pendingResults.length === 0) return

    setIsProcessing(true)

    try {
      const encryptedResults: ProcessingResult[] = []

      // Encriptar archivos uno por uno
      for (const result of pendingResults) {
        const encryptedResult = await encryptFile(result)
        encryptedResults.push(encryptedResult)
      }

      const successfulResults = encryptedResults.filter(r => r.status === 'completed')
      
      if (successfulResults.length === 0) {
        toast({
          title: "Error",
          description: "No se pudo encriptar ningún archivo",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Encriptación completada",
        description: `${successfulResults.length} archivo(s) encriptado(s) exitosamente`,
      })

    } catch (error) {
      console.error('Error durante la encriptación:', error)
      toast({
        title: "Error",
        description: "Error durante el proceso de encriptación",
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

      // Guardar en el historial
      saveGeneratedFile({
        id: generateFileId(),
        name: result.result.filename,
        type: 'PDF Encriptado',
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
        // Crear ZIP con archivos encriptados
        const zipBlob = await EncryptionService.encryptMultipleFiles(
          completedResults.map(r => r.originalFile),
          password
        )

        saveAs(zipBlob.blob, zipBlob.fileName)
        
        // Guardar metadata del ZIP
        saveGeneratedFile({
          id: generateFileId(),
          name: zipBlob.fileName,
          type: 'ZIP Encriptado',
          date: new Date().toLocaleDateString(),
          size: formatBytes(zipBlob.blob.size)
        })

        toast({
          title: "ZIP encriptado creado",
          description: "Todos los archivos encriptados descargados en un ZIP",
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

  const generateSecurePassword = () => {
    const newPassword = EncryptionService.generateSecurePassword()
    setPassword(newPassword)
    setConfirmPassword(newPassword)
    
    toast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura automáticamente",
    })
  }

  const getPasswordStrength = () => {
    if (!password) return null
    return EncryptionService.validatePassword(password)
  }

  const passwordStrength = getPasswordStrength()
  const pendingCount = results.filter(r => r.status === 'pending').length
  const completedCount = results.filter(r => r.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Subida de archivos */}
      <FileUpload
        title="Seleccionar archivos para encriptar"
        description="Arrastra archivos aquí o haz click para seleccionar"
        allowedTypes={['*/*']}
        maxFiles={APP_CONFIG.FILES.MAX_BATCH_SIZE}
        maxSize={APP_CONFIG.FILES.MAX_UPLOAD_SIZE}
        onFilesSelected={handleFilesSelected}
        disabled={isProcessing}
      />

      {/* Configuración de encriptación */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de encriptación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de encriptación */}
            <div className="space-y-2">
              <Label>Tipo de encriptación</Label>
              <div className="flex gap-2">
                <Badge variant={encryptionType === 'pdf' ? 'default' : 'outline'}>
                  {encryptionType === 'pdf' ? 'PDF con permisos' : 'Encriptación general (AES-256-GCM)'}
                </Badge>
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSecurePassword}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generar
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa una contraseña segura"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma la contraseña"
                />
              </div>

              {/* Indicador de fortaleza */}
              {passwordStrength && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Fortaleza:</span>
                    <Badge 
                      variant={passwordStrength.isValid ? 'default' : 'destructive'}
                    >
                      {passwordStrength.strength}
                    </Badge>
                  </div>
                  {!passwordStrength.isValid && (
                    <p className="text-sm text-muted-foreground">
                      {passwordStrength.suggestions.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Permisos PDF */}
            {encryptionType === 'pdf' && (
              <div className="space-y-4">
                <Label>Permisos del PDF</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="printing"
                      checked={permissions.printing}
                      onCheckedChange={(checked) =>
                        setPermissions(prev => ({ ...prev, printing: !!checked }))
                      }
                    />
                    <Label htmlFor="printing">Permitir impresión</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modifying"
                      checked={permissions.modifying}
                      onCheckedChange={(checked) =>
                        setPermissions(prev => ({ ...prev, modifying: !!checked }))
                      }
                    />
                    <Label htmlFor="modifying">Permitir modificación</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copying"
                      checked={permissions.copying}
                      onCheckedChange={(checked) =>
                        setPermissions(prev => ({ ...prev, copying: !!checked }))
                      }
                    />
                    <Label htmlFor="copying">Permitir copia de texto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="annotating"
                      checked={permissions.annotating}
                      onCheckedChange={(checked) =>
                        setPermissions(prev => ({ ...prev, annotating: !!checked }))
                      }
                    />
                    <Label htmlFor="annotating">Permitir anotaciones</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Opción de ZIP */}
            {results.length > 1 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-zip"
                  checked={createZip}
                  onCheckedChange={setCreateZip}
                />
                <Label htmlFor="create-zip">
                  Crear archivo ZIP encriptado con todos los archivos
                </Label>
              </div>
            )}

            {/* Botón de encriptación */}
            <div className="flex gap-2">
              <Button
                onClick={encryptAllFiles}
                disabled={pendingCount === 0 || isProcessing || !password}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Encriptando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Encriptar {pendingCount} archivo{pendingCount !== 1 ? 's' : ''}
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
        title="Resultados de encriptación"
        onDownload={handleDownload}
        onDownloadAll={handleDownloadAll}
        onRetry={handleRetry}
        showDownloadAll={completedCount > 0}
      />
    </div>
  )
}
