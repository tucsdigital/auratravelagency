"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, onSnapshot, query, orderBy as firestoreOrderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Categoria, Paquete } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoriaCard from "@/components/CategoriaCard";
import PaqueteCard from "@/components/PaqueteCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactSection from "@/components/ContactSection";
import Newsletter from "@/components/Newsletter";
import {
  CheckCircle,
  Users,
  Shield,
  Plane,
  Globe,
  Headphones,
  Heart,
  Award,
  Sparkles,
  Smile,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { serializeFirestoreData } from "@/lib/utils/serialize";

// Variantes de animación profesionales con efectos en cascada
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1], // Easing más dramático
    },
  },
};

const fadeInLeftVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeInRightVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Más espaciado para efecto cascada
      delayChildren: 0.3,
    },
  },
};

const staggerFastVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showAllCategorias, setShowAllCategorias] = useState(false);
  const [serviciosActiveIndex, setServiciosActiveIndex] = useState(0);
  const [porqueActiveIndex, setPorqueActiveIndex] = useState(0);
  
  const serviciosScrollRef = useRef<HTMLDivElement>(null);
  const porqueScrollRef = useRef<HTMLDivElement>(null);

  // Handler para detectar scroll y actualizar indicadores
  const handleScroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, setter: (index: number) => void, itemCount: number) => {
    if (!ref.current) return;
    
    const container = ref.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.scrollWidth / itemCount;
    const index = Math.round(scrollLeft / itemWidth);
    
    setter(Math.max(0, Math.min(index, itemCount - 1)));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasSnapshot, paquetesSnapshot] = await Promise.all([
          getDocs(collection(db, "categorias")),
          getDocs(collection(db, "paquetes")),
        ]);

        // Procesar categorías
        const categoriasData = categoriasSnapshot.docs
          .map((doc) =>
            serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() })
          )
          .filter((cat) => cat.activa && cat.destacada)
          .sort((a, b) => a.orden - b.orden);

        // Procesar paquetes (solo primeros 9 destacados)
        const paquetesData = paquetesSnapshot.docs
          .map((doc) =>
            serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() })
          )
          .filter((paq) => paq.visible === true && paq.destacado === true)
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .slice(0, 9); // Solo mostrar los primeros 9

        setCategorias(categoriasData);
        setPaquetes(paquetesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const bannersQuery = query(collection(db, "banners"), firestoreOrderBy("orden", "asc"));
    const unsubscribe = onSnapshot(
      bannersQuery,
      (snapshot) => {
        const bannersData = snapshot.docs
          .map((doc) => doc.data() as { imageUrl?: string; activa?: boolean })
          .filter((banner) => banner.activa !== false && banner.imageUrl)
          .map((banner) => banner.imageUrl as string);

        setBanners(bannersData);
        setBannerIndex((prev) =>
          bannersData.length === 0 ? 0 : Math.min(prev, bannersData.length - 1)
        );
      },
      (error) => {
        console.error("Error fetching banners:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="overflow-x-hidden">
      <Navbar transparent={true} />
      <WhatsAppButton />

      {/* Hero Section */}
      <Hero
        title="Elegí tu destino con AURA TRAVEL AGENCY"
        subtitle="Agencia boutique de viajes a medida, grupales y personalizados"
        backgroundImage={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        backgroundImageMobile={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        backgroundImageDesktop={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        ctaText="Explorar destinos"
        ctaLink="/#categorias"
        height="xl"
          showOverlay={true}
          overlayClassName="bg-black/45"
      />

      {/* Sección Servicios - Diseño Impactante y Vibrante */}
      <section className="py-10 md:py-16 bg-[#F9FAFB] overflow-x-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Header Alineado a la Izquierda */}
          <motion.div
            className="mb-10 md:mb-14 max-w-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={staggerFastVariants}
          >
            <motion.div
              className="inline-block mb-4"
              variants={fadeInUpVariants}
            >
              <span className="badge-seccion">
                Servicios
              </span>
            </motion.div>
            <motion.h2
              className="text-lg font-bold mb-6 leading-tight"
              variants={fadeInUpVariants}
            >
              Nuestros Servicios
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-[#4B5563] leading-relaxed"
              variants={fadeInUpVariants}
            >
              Te acompañamos en cada etapa de tu viaje con servicios pensados
              para vos
            </motion.p>
          </motion.div>

          {/* Carousel Mobile - Servicios */}
          <div className="md:hidden relative">
            <div 
              ref={serviciosScrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
              onScroll={() => handleScroll(serviciosScrollRef, setServiciosActiveIndex, 4)}
            >
              {[
                {
                  icon: Users,
                  title: "Viajes grupales",
                  desc: "Ofrecemos viajes grupales cuidadosamente planificados, ideales para quienes disfrutan compartir experiencias sin resignar organizacion, seguridad y momentos unicos. Cada grupo esta pensado para vivir el destino con sentido y disfrute.",
                  color: "from-blue-50 to-cyan-50",
                },
                {
                  icon: Plane,
                  title: "Viajes personalizados",
                  desc: "Itinerarios 100 % a medida. Armamos tu viaje desde cero, adaptado a tus tiempos, intereses y preferencias. Cada detalle se diseña segun tus sueños, para que vivas una experiencia autentica, personal y memorable.",
                  color: "from-purple-50 to-pink-50",
                },
                {
                  icon: Headphones,
                  title: "Asesoramiento integral",
                  desc: "Te acompañamos en cada etapa del viaje con asesoramiento profesional, informacion clara y respaldo permanente. Trabajamos con fuentes oficiales para que viajes informado, seguro y sin preocupaciones.",
                  color: "from-orange-50 to-red-50",
                },
                {
                  icon: Globe,
                  title: "Servicios independientes",
                  desc: "Ofrecemos la contratacion de servicios por separado: vuelos, hoteles, traslados, asistencia al viajero, excursiones y mas. Flexibilidad total para quienes ya tienen un plan y buscan soluciones.",
                  color: "from-green-50 to-teal-50",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="shrink-0 w-[85vw] snap-center"
                  >
                    <div className="relative h-full bg-white border-2 border-secondary/40 rounded-3xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                      <div className="absolute inset-0 bg-[#F9FAFB] opacity-60"></div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold mb-4 text-primary">
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-base text-[#4B5563] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Indicadores de scroll */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === serviciosActiveIndex ? 'bg-primary w-8' : 'bg-secondary/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Grid Desktop - 4 columnas */}
          <motion.div
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
          >
            {[
              {
                icon: Users,
                title: "Viajes grupales",
                desc: "Ofrecemos viajes grupales cuidadosamente planificados, ideales para quienes disfrutan compartir experiencias sin resignar organizacion, seguridad y momentos unicos. Cada grupo esta pensado para vivir el destino con sentido y disfrute.",
                color: "from-blue-50 to-cyan-50",
              },
              {
                icon: Plane,
                title: "Viajes personalizados",
                desc: "Itinerarios 100 % a medida. Armamos tu viaje desde cero, adaptado a tus tiempos, intereses y preferencias. Cada detalle se diseña segun tus sueños, para que vivas una experiencia autentica, personal y memorable.",
                color: "from-purple-50 to-pink-50",
              },
              {
                icon: Headphones,
                title: "Asesoramiento integral",
                desc: "Te acompañamos en cada etapa del viaje con asesoramiento profesional, informacion clara y respaldo permanente. Trabajamos con fuentes oficiales para que viajes informado, seguro y sin preocupaciones.",
                color: "from-orange-50 to-red-50",
              },
              {
                icon: Globe,
                title: "Servicios independientes",
                desc: "Ofrecemos la contratacion de servicios por separado: vuelos, hoteles, traslados, asistencia al viajero, excursiones y mas. Flexibilidad total para quienes ya tienen un plan y buscan soluciones.",
                color: "from-green-50 to-teal-50",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative"
                  variants={scaleInVariants}
                >
                  {/* Card Premium con efecto hover espectacular */}
                  <div className="relative h-full bg-white border-2 border-secondary/40 rounded-3xl p-8 md:p-10 hover:border-secondary hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    {/* Fondo degradado que aparece en hover */}
                    <div
                      className="absolute inset-0 bg-[#F9FAFB] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>

                    {/* Contenido */}
                    <div className="relative z-10">
                      {/* Icono destacado */}
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>

                      {/* Título con efecto */}
                      <h3 className="text-base md:text-lg font-bold mb-4 text-primary group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Descripción */}
                      <p className="text-sm md:text-base text-[#4B5563] leading-relaxed group-hover:text-[#4B5563] transition-colors duration-300 mb-6">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Categorías destacadas */}
      <section
        id="categorias"
        className="py-12 md:py-20 bg-[#F9FAFB] overflow-x-hidden"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Header Minimalista con Animación en Cascada */}
          <motion.div
            className="mb-16 md:mb-20 max-w-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={staggerFastVariants}
          >
            <motion.div
              className="inline-block mb-4"
              variants={fadeInUpVariants}
            >
              <span className="badge-seccion">
                Destinos
              </span>
            </motion.div>
            <motion.h2
              className="text-lg font-bold mb-6 leading-tight"
              variants={fadeInUpVariants}
            >
              Nuestros Destinos
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-[#4B5563] leading-relaxed"
              variants={fadeInUpVariants}
            >
              Explorá nuestras categorías y encontrá el viaje perfecto para vos
            </motion.p>
          </motion.div>

          {/* Grid Desktop - 4 columnas fijas */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categorias.length > 0 ? (
              categorias.map((categoria, index) => (
                <CategoriaCard
                  key={categoria.id}
                  categoria={categoria}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm md:text-base text-gray-400">
                  No hay categorías destacadas disponibles
                </p>
              </motion.div>
            )}
          </div>

          {/* Grid Mobile - Solo 3 categorías inicialmente */}
          <div className="md:hidden space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {categorias.length > 0 ? (
                categorias
                  .slice(0, showAllCategorias ? categorias.length : 3)
                  .map((categoria, index) => (
                    <CategoriaCard
                      key={categoria.id}
                      categoria={categoria}
                      index={index}
                    />
                  ))
              ) : (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-sm md:text-base text-gray-400">
                    No hay categorías destacadas disponibles
                  </p>
                </motion.div>
              )}
              </div>

            {/* Botón Ver Más para mobile */}
            {categorias.length > 3 && !showAllCategorias && (
              <motion.div
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => setShowAllCategorias(true)}
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Ver todos los destinos ({categorias.length})
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Paquetes destacados */}
      {paquetes.length > 0 && (
        <section className="py-12 md:py-20 bg-white border-t border-gray-200 overflow-x-hidden">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Header con Animación en Cascada */}
            <motion.div
              className="mb-16 md:mb-20 max-w-3xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={staggerFastVariants}
            >
              <motion.div
                className="inline-block mb-4"
                variants={fadeInUpVariants}
              >
                <span className="badge-seccion">
                  Destacados
                </span>
              </motion.div>
              <motion.h2
                className="text-lg font-bold mb-6 leading-tight"
                variants={fadeInUpVariants}
              >
                Paquetes Destacados
              </motion.h2>
              <motion.p
                className="text-sm md:text-base text-[#4B5563] leading-relaxed"
                variants={fadeInUpVariants}
              >
                Los mejores paquetes turísticos seleccionados especialmente para
                vos
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {paquetes.map((paquete, index) => (
                <PaqueteCard key={paquete.id} paquete={paquete} index={index} />
              ))}
            </div>

            {/* Botón Ver Más */}
            <motion.div
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Link href="/paquetes">
                  Ver todos los paquetes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Por qué elegirnos - Diseño Impactante con Vida */}
      <section className="py-10 md:py-16 bg-[#F9FAFB] border-t border-gray-200 overflow-x-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Header Alineado a la Izquierda */}
          <motion.div
            className="mb-10 md:mb-14 max-w-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={staggerFastVariants}
          >
            <motion.div
              className="inline-block mb-4"
              variants={fadeInUpVariants}
            >
              <span className="badge-seccion">
                Valores
              </span>
            </motion.div>
            <motion.h2
              className="text-lg font-bold mb-6 leading-tight"
              variants={fadeInUpVariants}
            >
              ¿Por qué elegirnos?
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-[#4B5563] leading-relaxed"
              variants={fadeInUpVariants}
            >
              Creemos en una forma de viajar donde cada detalle cuenta
            </motion.p>
          </motion.div>

          {/* Carousel Mobile - Por qué elegirnos */}
          <div className="md:hidden relative">
            <div 
              ref={porqueScrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
              onScroll={() => handleScroll(porqueScrollRef, setPorqueActiveIndex, 6)}
            >
              {[
                {
                  icon: Award,
                  number: "01",
                  title: "Alianzas con proveedores de excelencia",
                  desc: "Trabajamos con operadores y prestadores confiables, garantizando experiencias bien organizadas y servicios de alto nivel.",
                  color: "from-green-50 to-emerald-50",
                },
                {
                  icon: CheckCircle,
                  number: "02",
                  title: "Mejor precio",
                  desc: "Buscamos las mejores tarifas disponibles y opciones de pago convenientes, combinando precio y calidad para que obtengas el mayor valor en cada viaje.",
                  color: "from-teal-50 to-cyan-50",
                },
                {
                  icon: Sparkles,
                  number: "03",
                  title: "Conocimiento que marca la diferencia",
                  desc: "Asesoramos desde la experiencia real y el conocimiento profundo de cada destino. Recomendamos con criterio, honestidad y sensibilidad, para que vivas el viaje que mejor se adapta a vos.",
                  color: "from-yellow-50 to-amber-50",
                },
                {
                  icon: Shield,
                  number: "04",
                  title: "Seguridad y bienestar",
                  desc: "Seleccionamos cuidadosamente cada proveedor y servicio, priorizando la calidad, la seguridad y la tranquilidad de quienes viajan con nosotros.",
                  color: "from-blue-50 to-indigo-50",
                },
                {
                  icon: Heart,
                  number: "05",
                  title: "Honestidad y transparencia",
                  desc: "Creemos en un vinculo basado en la confianza. Brindamos informacion clara, condiciones reales y propuestas pensadas con responsabilidad y compromiso.",
                  color: "from-red-50 to-pink-50",
                },
                {
                  icon: Smile,
                  number: "06",
                  title: "Atencion cercana, permanente y humana",
                  desc: "Cada viajero es unico. Nos involucramos en cada viaje como si fuera propio. Escuchamos tus necesidades y te acompañamos con dedicacion, calidez y profesionalismo en todo el proceso.",
                  color: "from-purple-50 to-violet-50",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="shrink-0 w-[85vw] snap-center"
                  >
                    <div className="relative h-full bg-white border-2 border-secondary/40 rounded-2xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                      <div className="absolute inset-0 bg-[#F9FAFB] opacity-60"></div>
                      <div className="absolute top-4 right-6 text-6xl font-bold text-secondary/30">
                        {item.number}
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold mb-3 text-primary">
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-base text-[#4B5563] leading-relaxed">
                          {item.desc}
            </p>
          </div>
                    </div>
              </div>
                );
              })}
            </div>
            {/* Indicadores de scroll */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === porqueActiveIndex ? 'bg-primary w-8' : 'bg-secondary/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Grid Desktop - 3 columnas */}
          <motion.div
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
          >
            {[
              {
                icon: Award,
                number: "01",
                title: "Alianzas con proveedores de excelencia",
                desc: "Trabajamos con operadores y prestadores confiables, garantizando experiencias bien organizadas y servicios de alto nivel.",
                color: "from-green-50 to-emerald-50",
              },
              {
                icon: CheckCircle,
                number: "02",
                title: "Mejor precio",
                desc: "Buscamos las mejores tarifas disponibles y opciones de pago convenientes, combinando precio y calidad para que obtengas el mayor valor en cada viaje.",
                color: "from-teal-50 to-cyan-50",
              },
              {
                icon: Sparkles,
                number: "03",
                title: "Conocimiento que marca la diferencia",
                desc: "Asesoramos desde la experiencia real y el conocimiento profundo de cada destino. Recomendamos con criterio, honestidad y sensibilidad, para que vivas el viaje que mejor se adapta a vos.",
                color: "from-yellow-50 to-amber-50",
              },
              {
                icon: Shield,
                number: "04",
                title: "Seguridad y bienestar",
                desc: "Seleccionamos cuidadosamente cada proveedor y servicio, priorizando la calidad, la seguridad y la tranquilidad de quienes viajan con nosotros.",
                color: "from-blue-50 to-indigo-50",
              },
              {
                icon: Heart,
                number: "05",
                title: "Honestidad y transparencia",
                desc: "Creemos en un vinculo basado en la confianza. Brindamos informacion clara, condiciones reales y propuestas pensadas con responsabilidad y compromiso.",
                color: "from-red-50 to-pink-50",
              },
              {
                icon: Smile,
                number: "06",
                title: "Atencion cercana, permanente y humana",
                desc: "Cada viajero es unico. Nos involucramos en cada viaje como si fuera propio. Escuchamos tus necesidades y te acompañamos con dedicacion, calidez y profesionalismo en todo el proceso.",
                color: "from-purple-50 to-violet-50",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative"
                  variants={scaleInVariants}
                >
                  {/* Card con efecto hover */}
                  <div className="relative h-full bg-white border-2 border-secondary/40 rounded-2xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Fondo degradado sutil que aparece en hover */}
                    <div
                      className="absolute inset-0 bg-[#F9FAFB] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                    ></div>

                    {/* Número decorativo */}
                    <div className="absolute top-4 right-6 text-6xl font-bold text-secondary/30 group-hover:text-secondary/50 transition-colors duration-500">
                      {item.number}
            </div>

                    {/* Contenido */}
                    <div className="relative z-10">
                      {/* Icono con círculo de fondo */}
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>

                      <h3 className="text-base md:text-lg font-bold mb-3 text-primary group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>

                      <p className="text-sm md:text-base text-[#4B5563] leading-relaxed group-hover:text-[#4B5563] transition-colors duration-300 mb-6">
                        {item.desc}
              </p>
            </div>
          </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros - Texto izquierda, QR abajo; imagen derecha */}
      <section className="py-12 md:py-20 bg-[#F9FAFB] border-t border-gray-200 overflow-x-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
            {/* Izquierda: Texto + QR abajo */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={staggerFastVariants}
              className="flex flex-col"
            >
              <motion.div
                className="inline-block mb-4 md:mb-6"
                variants={fadeInLeftVariants}
              >
                <span className="badge-seccion">
                  Quiénes Somos
                </span>
              </motion.div>
              <motion.h2
                className="text-lg font-bold mb-6 md:mb-8 leading-tight"
                variants={fadeInLeftVariants}
              >
                Sobre Nosotros
              </motion.h2>
              <motion.div
                className="space-y-5 md:space-y-6 text-sm md:text-base text-[#4B5563] leading-relaxed max-w-xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainerVariants}
              >
                <motion.p variants={fadeInLeftVariants}>
                  Somos una agencia de viajes boutique, creada para quienes buscan una experiencia pensada a medida, con dedicación, criterio y sensibilidad por los detalles.
                </motion.p>
                <motion.p variants={fadeInLeftVariants}>
                  Actualmente contamos con atención en Palermo (CABA) y en Bolívar (Provincia de Buenos Aires), nuestra ciudad natal. Un lugar que forma parte de nuestra identidad y de la manera cercana en la que entendemos el trato que merece cada cliente.
                </motion.p>
                <motion.p variants={fadeInLeftVariants}>
                  Trabajamos con atención personalizada y cita previa, porque creemos que cada viaje merece tiempo, escucha y una planificación consciente, alineada con los deseos y preferencias de cada persona.
                </motion.p>
              </motion.div>
              <motion.div
                className="mt-8 flex justify-start"
                variants={fadeInLeftVariants}
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <Image
                    src="/images/qr.jpeg"
                    alt="QR - AURA TRAVEL AGENCY"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Derecha: Imagen */}
            <motion.div
              className="relative h-[380px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={fadeInRightVariants}
            >
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/sobre-nosotros.jpeg"
                  alt="AURA TRAVEL AGENCY - Sobre nosotros"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Formulario de Contacto con Animación */}
      <section className="pt-12 pb-4 md:py-20 bg-white border-t border-gray-200 overflow-x-hidden">
        <motion.div
          className="container mx-auto px-4 md:px-6 lg:px-8 mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
        >
          <motion.div className="inline-block mb-4" variants={fadeInUpVariants}>
            <span className="badge-seccion">
              Hablemos
            </span>
          </motion.div>
          <motion.h2
            className="text-lg font-bold mb-6 leading-tight"
            variants={fadeInUpVariants}
          >
            Contactanos
          </motion.h2>
          <motion.p
            className="text-sm md:text-base text-[#4B5563] max-w-2xl leading-relaxed"
            variants={fadeInUpVariants}
          >
            ¿Tenés alguna consulta? Envianos un mensaje y te respondemos a la
            brevedad
          </motion.p>
        </motion.div>
        <ContactSection showTitle={false} />
      </section>

      {/* Newsletter */}
      <Newsletter />

      <Footer />
    </div>
  );
}
