// src/hooks/useFileHandling.ts
import { useState } from 'react';
import { removeImagesFromBucket, derivePathFromPublicUrl } from '@/lib/upload';

export function useFileHandling() {
  const [productFiles, setProductFiles] = useState<File[]>([]);

  const handleProductFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = e.target.files ? Array.from(e.target.files) : [];
    setProductFiles(prev => [...prev, ...arr]);
  };

  const handleVariantFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    setVariantForm: any
  ) => {
    const arr = e.target.files ? Array.from(e.target.files) : [];
    setVariantForm((prev: any) => ({
      ...prev,
      files: [...prev.files, ...arr],
    }));
  };

  const handleMultipleVariantFiles = (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
    setVariantsData: any
  ) => {
    const arr = e.target.files ? Array.from(e.target.files) : [];
    setVariantsData((prev: any) => ({
      variants: prev.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? { ...variant, files: [...variant.files, ...arr] }
          : variant
      ),
    }));
  };

  const resetProductFiles = () => {
    setProductFiles([]);
  };

  const removeNewVariantImage = (
    variantIndex: number,
    fileIndex: number,
    setVariantsData: any
  ) => {
    setVariantsData((prev: any) => ({
      variants: prev.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? {
              ...variant,
              files: variant.files.filter(
                (_: any, idx: number) => idx !== fileIndex
              ),
            }
          : variant
      ),
    }));
  };

  const removeExistingVariantImage = async (
    variantIndex: number,
    imageIndex: number,
    setVariantsData: any
  ) => {
    setVariantsData((prev: any) => {
      const variant = prev.variants[variantIndex];
      const imageToRemove = variant.existingImages[imageIndex];

      // Remove from storage bucket
      if (imageToRemove?.url) {
        const path =
          imageToRemove.path || derivePathFromPublicUrl(imageToRemove.url);
        if (path) {
          removeImagesFromBucket([path]).catch(console.error);
        }
      }

      return {
        variants: prev.variants.map((variant: any, i: number) =>
          i === variantIndex
            ? {
                ...variant,
                existingImages: variant.existingImages.filter(
                  (_: any, idx: number) => idx !== imageIndex
                ),
              }
            : variant
        ),
      };
    });
  };

  // Reorder product images (new files)
  const reorderProductImages = (reorderedFiles: File[]) => {
    setProductFiles(reorderedFiles);
  };

  // Reorder variant images (new files)
  const reorderVariantImages = (
    variantIndex: number,
    reorderedFiles: File[],
    setVariantsData: any
  ) => {
    setVariantsData((prev: any) => ({
      variants: prev.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? { ...variant, files: reorderedFiles }
          : variant
      ),
    }));
  };

  // Reorder existing variant images
  const reorderExistingVariantImages = (
    variantIndex: number,
    reorderedImages: any[],
    setVariantsData: any
  ) => {
    setVariantsData((prev: any) => ({
      variants: prev.variants.map((variant: any, i: number) =>
        i === variantIndex
          ? { ...variant, existingImages: reorderedImages }
          : variant
      ),
    }));
  };

  return {
    productFiles,
    handleProductFiles,
    handleVariantFiles,
    handleMultipleVariantFiles,
    resetProductFiles,
    removeNewVariantImage,
    removeExistingVariantImage,
    reorderProductImages,
    reorderVariantImages,
    reorderExistingVariantImages,
  };
}
