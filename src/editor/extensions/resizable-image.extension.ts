export const resizableImageExtensionName = 'resizableImage'

export interface ResizableImageAttributes {
  src: string
  alt?: string
  width?: number
  height?: number
  align?: 'left' | 'center' | 'right'
}
