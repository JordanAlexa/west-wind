import { useState, useRef, useCallback } from 'react'
import { Upload, X, User as UserIcon, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
    onFileSelect: (file: File | null) => void
    currentAvatarUrl?: string
    className?: string
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function AvatarUpload({ onFileSelect, currentAvatarUrl, className }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((file: File) => {
        setError(null)

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Only JPG, PNG, WEBP, and GIF files are allowed')
            return
        }

        if (file.size > MAX_SIZE) {
            setError('File size must be less than 5MB')
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        onFileSelect(file)
    }, [onFileSelect])

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }, [handleFile])

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }, [handleFile])

    const removeImage = useCallback(() => {
        setPreview(null)
        onFileSelect(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }, [onFileSelect])

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <div
                className={cn(
                    "relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group",
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                    preview ? "border-solid border-gray-200" : ""
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-500">Upload</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={onInputChange}
                />
            </div>

            {preview && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <X className="w-4 h-4 mr-2" /> Remove
                </Button>
            )}

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {!preview && !error && (
                <p className="text-xs text-gray-500 text-center">
                    Drag & drop or click to upload<br />
                    (Max 5MB)
                </p>
            )}
        </div>
    )
}
