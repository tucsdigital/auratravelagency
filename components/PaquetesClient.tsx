'use client';

import { useState, useMemo, useEffect } from 'react';
import { Paquete, Categoria } from '@/types';
import PaqueteCard from '@/components/PaqueteCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, SlidersHorizontal, Search, Plane, Hotel, Bus, Utensils, Coffee, MapPin, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface PaquetesClientProps {
  paquetes: Paquete[];
  categorias: Categoria[];
}

// Servicios disponibles (constante fuera del componente)
const SERVICIOS_DISPONIBLES = [
  { id: 'aereos', label: 'Aéreos', icon: <Plane className="h-4 w-4" />, keywords: ['aéreo', 'aereo', 'pasaje', 'vuelo', 'avión', 'avion', 'flight'] },
  { id: 'alojamiento', label: 'Alojamiento', icon: <Hotel className="h-4 w-4" />, keywords: ['hotel', 'alojamiento', 'hospedaje', 'noche', 'noches', 'estadía', 'estadia', 'accommodation'] },
  { id: 'traslados', label: 'Traslados', icon: <Bus className="h-4 w-4" />, keywords: ['traslado', 'transfer', 'charter', 'aeropuerto', 'transporte', 'bus', 'colectivo'] },
  { id: 'desayuno', label: 'Desayuno', icon: <Coffee className="h-4 w-4" />, keywords: ['desayuno', 'breakfast', 'desayunos'] },
  { id: 'comidas', label: 'Comidas', icon: <Utensils className="h-4 w-4" />, keywords: ['comida', 'almuerzo', 'cena', 'media pensión', 'pension', 'pensión completa', 'meals', 'lunch', 'dinner'] },
  { id: 'excursiones', label: 'Excursiones', icon: <MapPin className="h-4 w-4" />, keywords: ['excursión', 'excursion', 'visita', 'tour', 'actividad', 'paseo'] },
  { id: 'asistencia', label: 'Asistencia', icon: <ShieldCheck className="h-4 w-4" />, keywords: ['asistencia', 'seguro', 'cobertura', 'insurance'] },
];

export default function PaquetesClient({ paquetes, categorias }: PaquetesClientProps) {
  // Debug: Mostrar información de los paquetes recibidos
  useEffect(() => {
    console.log('=== PAQUETES RECIBIDOS ===');
    console.log('Total de paquetes:', paquetes.length);
    if (paquetes.length > 0) {
      console.log('Primer paquete:', paquetes[0]);
      console.log('Precios de todos los paquetes:', paquetes.map(p => ({ titulo: p.titulo, precio: p.precio })));
    }
  }, [paquetes]);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Obtener valores únicos de destinos
  const destinos = useMemo(() => {
    const uniqueDestinos = Array.from(new Set(paquetes.map(p => p.destino)));
    return uniqueDestinos.sort();
  }, [paquetes]);

  const [selectedDestinos, setSelectedDestinos] = useState<string[]>([]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategorias, selectedTipos, selectedDestinos, selectedServicios]);

  // Filtrar paquetes
  const paquetesFiltrados = useMemo(() => {
    console.log('Filtrando paquetes:', {
      total: paquetes.length,
      serviciosSeleccionados: selectedServicios
    });

    const filtered = paquetes.filter((paquete) => {
      // Búsqueda por texto (busca en título, destino y descripción)
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          paquete.titulo.toLowerCase().includes(searchLower) ||
          paquete.destino.toLowerCase().includes(searchLower) ||
          (paquete.descripcion && paquete.descripcion.toLowerCase().includes(searchLower)) ||
          (paquete.descripcionCorta && paquete.descripcionCorta.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Filtro por categoría (solo si hay categorías seleccionadas)
      if (selectedCategorias.length > 0) {
        const categoriasPaquete = paquete.categoriaIds?.length
          ? paquete.categoriaIds
          : (paquete.categoriaId ? [paquete.categoriaId] : []);
        if (!categoriasPaquete.some(id => selectedCategorias.includes(id))) return false;
      }

      // Filtro por tipo (solo si hay tipos seleccionados)
      if (selectedTipos.length > 0) {
        if (!selectedTipos.includes(paquete.tipo)) return false;
      }

      // Filtro por destino (solo si hay destinos seleccionados)
      if (selectedDestinos.length > 0) {
        if (!selectedDestinos.includes(paquete.destino)) return false;
      }

      // Filtro por servicios incluidos
      if (selectedServicios.length > 0) {
        const incluyeText = (paquete.incluye || []).join(' ').toLowerCase();
        
        // El paquete debe incluir TODOS los servicios seleccionados
        const tieneServicios = selectedServicios.every(servicioId => {
          const servicio = SERVICIOS_DISPONIBLES.find(s => s.id === servicioId);
          if (!servicio) return false;
          
          // Verificar si alguna keyword del servicio aparece en lo que incluye el paquete
          return servicio.keywords.some(keyword => incluyeText.includes(keyword.toLowerCase()));
        });
        
        if (!tieneServicios) return false;
      }

      return true;
    });
    
    return filtered;
  }, [paquetes, searchTerm, selectedCategorias, selectedTipos, selectedDestinos, selectedServicios]);

  // Calcular paginación
  const totalPages = Math.ceil(paquetesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paquetesPaginados = useMemo(() => {
    return paquetesFiltrados.slice(startIndex, endIndex);
  }, [paquetesFiltrados, startIndex, endIndex]);

  // Scroll al inicio al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const toggleCategoria = (categoriaId: string) => {
    setSelectedCategorias(prev =>
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    );
  };

  const toggleTipo = (tipo: string) => {
    setSelectedTipos(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const toggleDestino = (destino: string) => {
    setSelectedDestinos(prev =>
      prev.includes(destino)
        ? prev.filter(d => d !== destino)
        : [...prev, destino]
    );
  };

  const toggleServicio = (servicioId: string) => {
    setSelectedServicios(prev =>
      prev.includes(servicioId)
        ? prev.filter(s => s !== servicioId)
        : [...prev, servicioId]
    );
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCategorias([]);
    setSelectedTipos([]);
    setSelectedDestinos([]);
    setSelectedServicios([]);
  };

  const hayFiltrosActivos = 
    searchTerm.trim() !== '' ||
    selectedCategorias.length > 0 ||
    selectedTipos.length > 0 ||
    selectedDestinos.length > 0 ||
    selectedServicios.length > 0;

  return (
    <section className="pt-6 pb-12 md:pt-10 md:pb-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar de Filtros */}
          <aside className="lg:col-span-1">
            {/* Botón para móvil */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-[#143D84] hover:bg-[#143D84]/90 text-white h-11 text-sm font-semibold"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            </div>

            {/* Filtros */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-gray-50 border-2 border-gray-200 rounded-lg p-6 space-y-6 sticky top-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                {hayFiltrosActivos && (
                  <Button
                    onClick={limpiarFiltros}
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-gray-200"
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Búsqueda */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-gray-900">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Destino, título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              {/* Categorías */}
              {categorias.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-gray-900">Categorías</Label>
                  <div className="space-y-2">
                    {categorias.map((categoria) => (
                      <div key={categoria.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${categoria.id}`}
                          checked={selectedCategorias.includes(categoria.id)}
                          onCheckedChange={() => toggleCategoria(categoria.id)}
                        />
                        <label
                          htmlFor={`cat-${categoria.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {categoria.nombre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipo de Paquete */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-900">Tipo de Paquete</Label>
                <div className="space-y-2">
                  {[
                    { value: 'individual', label: 'Individual' },
                    { value: 'grupal', label: 'Grupal' },
                    { value: 'a-medida', label: 'A Medida' },
                  ].map((tipo) => (
                    <div key={tipo.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tipo-${tipo.value}`}
                        checked={selectedTipos.includes(tipo.value)}
                        onCheckedChange={() => toggleTipo(tipo.value)}
                      />
                      <label
                        htmlFor={`tipo-${tipo.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tipo.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destinos */}
              {destinos.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-gray-900">
                    Destinos ({destinos.length})
                  </Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {destinos.map((destino) => (
                      <div key={destino} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dest-${destino}`}
                          checked={selectedDestinos.includes(destino)}
                          onCheckedChange={() => toggleDestino(destino)}
                        />
                        <label
                          htmlFor={`dest-${destino}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {destino}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios Incluidos */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-900">
                  Servicios Incluidos
                </Label>
                <div className="space-y-2">
                  {SERVICIOS_DISPONIBLES.map((servicio) => (
                    <div key={servicio.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`serv-${servicio.id}`}
                        checked={selectedServicios.includes(servicio.id)}
                        onCheckedChange={() => toggleServicio(servicio.id)}
                      />
                      <label
                        htmlFor={`serv-${servicio.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        {servicio.icon}
                        <span>{servicio.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Paquetes */}
          <div className="lg:col-span-3">
            {/* Resultados */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                {paquetesFiltrados.length} {paquetesFiltrados.length === 1 ? 'paquete encontrado' : 'paquetes encontrados'}
              </h3>
            </div>

            {/* Paquetes */}
            {paquetes.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
                  <X className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">No hay paquetes disponibles</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                  Aún no hay paquetes turísticos cargados en el sistema.
                </p>
              </div>
            ) : paquetesFiltrados.length > 0 ? (
              <>
                {/* Info y controles de paginación superiores */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-3 sm:pb-4 border-b">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}</span> a{' '}
                    <span className="font-semibold text-gray-900">{Math.min(endIndex, paquetesFiltrados.length)}</span> de{' '}
                    <span className="font-semibold text-gray-900">{paquetesFiltrados.length}</span> resultados
                  </div>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 por página</SelectItem>
                      <SelectItem value="24">24 por página</SelectItem>
                      <SelectItem value="48">48 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {paquetesPaginados.map((paquete, index) => (
                      <PaqueteCard 
                        key={paquete.id} 
                        paquete={paquete} 
                        index={startIndex + index} 
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      {/* Primera página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      {/* Página anterior */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Mostrar: primera, última, actual, y 2 a cada lado de la actual
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 2) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            // Agregar "..." entre números no consecutivos
                            const prevPage = index > 0 ? array[index - 1] : 0;
                            const showEllipsis = prevPage && page - prevPage > 1;

                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`h-9 w-9 p-0 ${
                                    currentPage === page
                                      ? 'bg-[#143D84] text-white hover:bg-[#143D84]/90'
                                      : ''
                                  }`}
                                >
                                  {page}
                                </Button>
                              </div>
                            );
                          })}
                      </div>

                      {/* Página siguiente */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Última página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500">
                      Página {currentPage} de {totalPages}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
                  <X className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">No se encontraron paquetes</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 max-w-md mx-auto">
                  No hay paquetes que coincidan con los filtros seleccionados.
                </p>
                {hayFiltrosActivos && (
                  <p className="text-sm text-gray-500 mb-6">
                    Filtros activos: 
                    {searchTerm && ` Búsqueda: "${searchTerm}"`}
                    {selectedCategorias.length > 0 && ` · ${selectedCategorias.length} categoría(s)`}
                    {selectedTipos.length > 0 && ` · ${selectedTipos.length} tipo(s)`}
                    {selectedDestinos.length > 0 && ` · ${selectedDestinos.length} destino(s)`}
                    {selectedServicios.length > 0 && ` · ${selectedServicios.length} servicio(s)`}
                  </p>
                )}
                <Button
                  onClick={limpiarFiltros}
                  className="bg-[#143D84] hover:bg-[#143D84]/90 text-white"
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
