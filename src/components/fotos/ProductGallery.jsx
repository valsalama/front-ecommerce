import './fotos.css'
import { useState } from 'react'

// Galería reutilizable: recibe fotos (FotoRespuestaDTO[]) y muestra la portada
// primero. Uso: <ProductGallery fotos={producto.fotos} nombre={producto.nombre} />
function ProductGallery({ fotos = [], nombre }) {
  const ordered = [...fotos].sort((first, second) => Number(second.esPortada) - Number(first.esPortada))
  const [selected, setSelected] = useState(0)
  const index = Math.min(selected, Math.max(ordered.length - 1, 0))
  const current = ordered[index]

  if (ordered.length === 0) {
    return (
      <div className="gallery gallery--empty" role="img" aria-label="Este producto todavía no tiene fotos">
        <span>Sin fotos</span>
      </div>
    )
  }

  const move = (step) => setSelected((index + step + ordered.length) % ordered.length)

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={current.url} alt={`${nombre} · foto ${index + 1} de ${ordered.length}`} />
        {ordered.length > 1 && (
          <>
            <button type="button" className="gallery__arrow gallery__arrow--prev" onClick={() => move(-1)} aria-label="Foto anterior">‹</button>
            <button type="button" className="gallery__arrow gallery__arrow--next" onClick={() => move(1)} aria-label="Foto siguiente">›</button>
            <span className="gallery__counter" aria-hidden="true">{index + 1} / {ordered.length}</span>
          </>
        )}
      </div>

      {ordered.length > 1 && (
        <ul className="gallery__thumbs">
          {ordered.map((photo, position) => (
            <li key={photo.id}>
              <button
                type="button"
                className={position === index ? 'is-current' : undefined}
                aria-label={`Ver foto ${position + 1}`}
                aria-current={position === index}
                onClick={() => setSelected(position)}
              >
                <img src={photo.url} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductGallery
