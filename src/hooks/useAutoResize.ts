// src/hooks/useAutoResize.ts
import { useRef, useEffect, useCallback } from 'react'

export function useAutoResize() {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = useCallback((textarea: HTMLTextAreaElement) => {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto'
        // Set height to scrollHeight to fit content, with a minimum height
        const minHeight = 60 // Minimum height in pixels
        const newHeight = Math.max(textarea.scrollHeight, minHeight)
        textarea.style.height = `${newHeight}px`
    }, [])

    const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
        adjustHeight(e.currentTarget)
    }, [adjustHeight])

    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight(textareaRef.current)
        }
    }, [adjustHeight])

    return {
        textareaRef,
        handleInput
    }
}
