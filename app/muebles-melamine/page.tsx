export default function MueblesMelaminePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Muebles de Melamine</h1>
        <p className="section-subtitle">
          Descubre nuestra colección de muebles elaborados en melamine de alta calidad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder furniture items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">Imagen del Mueble</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Mueble de Melamine #{i + 1}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Descripción del mueble de melamine con excelente acabado y durabilidad.
              </p>
              <div className="text-primary font-bold">Ver Más</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-6">
          Para ver todos nuestros productos disponibles en venta, visita nuestra sección de catálogo.
        </p>
        <a
          href="/muebles-venta"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-light transition-colors"
        >
          Ver Catálogo Completo
        </a>
      </div>
    </div>
  );
}
