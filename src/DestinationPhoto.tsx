import { useState } from 'react'
import photoManifest from './placePhotos.json'

interface Photo {
  src: string
  smallSrc: string
  width: number
  height: number
  alt: string
  title: string
  author: string
  source: string
  license: string
  licenseUrl: string
  modifications: string
}

export const destinationPhotos: Record<string, Photo> = photoManifest

export function DestinationPhoto({ placeId, className = '', eager = false }: { placeId: string; className?: string; eager?: boolean }) {
  const [failedSource, setFailedSource] = useState('')
  const photo = destinationPhotos[placeId]
  if (!photo) return null
  if (failedSource === photo.src) {
    return <div className={`photo-unavailable ${className}`} role="img" aria-label={`Photo unavailable: ${photo.alt}`}><span>Photo unavailable</span></div>
  }
  return <img
    className={`destination-image ${className}`}
    data-place={placeId}
    src={photo.src}
    srcSet={`${photo.smallSrc} 480w, ${photo.src} 960w`}
    sizes={className === 'stop-photo' ? '96px' : '(max-width: 600px) 88vw, (max-width: 800px) 44vw, 420px'}
    width={photo.width}
    height={photo.height}
    alt={photo.alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={() => setFailedSource(photo.src)}
  />
}

export function PhotoCredit({ placeId }: { placeId: string }) {
  const photo = destinationPhotos[placeId]
  if (!photo) return null
  return <span className="photo-credit">Photo: <a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.author}</a> · <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></span>
}
