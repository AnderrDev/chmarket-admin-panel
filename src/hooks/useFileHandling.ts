// src/hooks/useFileHandling.ts
import { useState } from 'react'

export function useFileHandling() {
    const [productFiles, setProductFiles] = useState<File[]>([])
    const [productAlts, setProductAlts] = useState<string[]>([])

    const handleProductFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setProductFiles(arr)
        setProductAlts(arr.map(() => ''))
    }

    const handleProductAlt = (i: number, val: string) => {
        setProductAlts(prev => prev.map((a, idx) => (idx === i ? val : a)))
    }

    const handleVariantFiles = (e: React.ChangeEvent<HTMLInputElement>, setVariantForm: any) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setVariantForm((prev: any) => ({ ...prev, files: arr, alts: arr.map(() => '') }))
    }

    const handleVariantAlt = (i: number, val: string, setVariantForm: any) => {
        setVariantForm((prev: any) => ({
            ...prev,
            alts: prev.alts.map((a: string, idx: number) => (idx === i ? val : a))
        }))
    }

    const handleMultipleVariantFiles = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>, setVariantsData: any) => {
        const arr = e.target.files ? Array.from(e.target.files) : []
        setVariantsData((prev: any) => ({
            variants: prev.variants.map((variant: any, i: number) =>
                i === variantIndex
                    ? { ...variant, files: arr, alts: arr.map(() => '') }
                    : variant
            )
        }))
    }

    const handleMultipleVariantAlt = (variantIndex: number, fileIndex: number, value: string, setVariantsData: any) => {
        setVariantsData((prev: any) => ({
            variants: prev.variants.map((variant: any, i: number) =>
                i === variantIndex
                    ? {
                        ...variant,
                        alts: variant.alts.map((a: string, idx: number) => (idx === fileIndex ? value : a))
                    }
                    : variant
            )
        }))
    }

    return {
        productFiles,
        productAlts,
        handleProductFiles,
        handleProductAlt,
        handleVariantFiles,
        handleVariantAlt,
        handleMultipleVariantFiles,
        handleMultipleVariantAlt
    }
}
