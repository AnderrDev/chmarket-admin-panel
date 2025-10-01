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

    return {
        productFiles,
        productAlts,
        handleProductFiles,
        handleProductAlt,
        handleVariantFiles,
        handleVariantAlt
    }
}
