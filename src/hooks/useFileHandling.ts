// src/hooks/useFileHandling.ts
import { useState } from 'react'

export function useFileHandling() {
    const [productFiles, setProductFiles] = useState<File[]>([])

    const handleProductFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setProductFiles(prev => [...prev, ...arr])
    }

    const handleVariantFiles = (e: React.ChangeEvent<HTMLInputElement>, setVariantForm: any) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setVariantForm((prev: any) => ({ ...prev, files: [...prev.files, ...arr] }))
    }

    const handleMultipleVariantFiles = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>, setVariantsData: any) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setVariantsData((prev: any) => ({
            variants: prev.variants.map((variant: any, i: number) =>
                i === variantIndex
                    ? { ...variant, files: [...variant.files, ...arr] }
                    : variant
            )
        }))
    }

    const resetProductFiles = () => {
        setProductFiles([])
    }

    return {
        productFiles,
        handleProductFiles,
        handleVariantFiles,
        handleMultipleVariantFiles,
        resetProductFiles
    }
}
