import type { MediaUploadService } from './media-upload.service';

export interface UploadEmbeddedPasteImagesOptions {
  html: string;
  documentId: string;
  mediaUpload: MediaUploadService;
}

export interface UploadEmbeddedPasteImagesResult {
  html: string;
  uploadedCount: number;
  failedCount: number;
}

const embeddedBase64ImagePattern =
  /^data:(image\/(?:png|jpe?g|webp))(?:;[^,]*)?;base64,([\s\S]*)$/i;
const embeddedBase64ImageMarker =
  /<img\b[^>]*\bsrc\s*=\s*["']?\s*data:image\/[^,;]+(?:;[^,]*)?;base64,/i;
const embeddedBase64ImageSourcePattern = /^data:image\/[^,;]+(?:;[^,]*)?;base64,/i;
const maxConcurrentUploads = 4;

export function hasEmbeddedBase64Images(html: string): boolean {
  return embeddedBase64ImageMarker.test(html);
}

export async function uploadEmbeddedPasteImages({
  html,
  documentId,
  mediaUpload,
}: UploadEmbeddedPasteImagesOptions): Promise<UploadEmbeddedPasteImagesResult> {
  const container = document.createElement('div');
  container.innerHTML = html;

  const embeddedImages = Array.from(container.querySelectorAll<HTMLImageElement>('img')).filter(
    (image) => embeddedBase64ImageSourcePattern.test(image.getAttribute('src')?.trim() ?? ''),
  );
  let uploadedCount = 0;
  let failedCount = 0;
  let nextImageIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(maxConcurrentUploads, embeddedImages.length) }, async () => {
      while (nextImageIndex < embeddedImages.length) {
        const imageIndex = nextImageIndex;
        const image = embeddedImages[imageIndex];
        nextImageIndex += 1;

        if (!image) {
          continue;
        }

        try {
          const file = createFileFromEmbeddedImage(image, imageIndex);
          const altText = image.getAttribute('alt') ?? '';
          const asset = await mediaUpload.uploadImage(documentId, file, altText);

          image.setAttribute('src', asset.url);
          image.setAttribute('alt', asset.altText ?? altText);
          image.removeAttribute('srcset');
          uploadedCount += 1;
        } catch {
          image.remove();
          failedCount += 1;
        }
      }
    }),
  );

  return {
    html: container.innerHTML,
    uploadedCount,
    failedCount,
  };
}

function createFileFromEmbeddedImage(image: HTMLImageElement, index: number): File {
  const source = image.getAttribute('src')?.trim() ?? '';
  const match = source.match(embeddedBase64ImagePattern);

  if (!match) {
    throw new Error('La imagen embebida no usa un formato base64 compatible.');
  }

  const mimeType = normalizeImageMimeType(match[1] ?? '');
  const base64 = (match[2] ?? '').replace(/\s+/g, '');
  const binary = window.atob(base64);

  if (binary.length === 0) {
    throw new Error('La imagen embebida esta vacia.');
  }

  const bytes = new Uint8Array(binary.length);

  for (let byteIndex = 0; byteIndex < binary.length; byteIndex += 1) {
    bytes[byteIndex] = binary.charCodeAt(byteIndex);
  }

  return new File([bytes], `pasted-image-${index + 1}.${getImageExtension(mimeType)}`, {
    type: mimeType,
  });
}

function normalizeImageMimeType(mimeType: string): string {
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();
}

function getImageExtension(mimeType: string): string {
  return mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice('image/'.length);
}
