import HomeHero from "./HomeHero";
import { images } from "../../assets";

export default function HomePage() {
  const cards = [
    {
      image: images.info1,
      title: "Cálculos técnicos",
      subtitle: "Análisis físico aplicado",
      phrase:
        "Frenado, derrape, proyección y multitramos dentro de un mismo entorno de trabajo.",
      linkLabel: "Ver módulos",
      to: "/login",
      tone: "orange",
    },
    {
      image: images.info4,
      title: "Informes profesionales",
      subtitle: "Salida documental clara",
      phrase:
        "Organizá resultados, observaciones y documentación técnica en un flujo pericial consistente.",
      linkLabel: "Explorar informes",
      to: "/login",
      tone: "cyan",
    },
    {
      image: images.info3,
      title: "Gestión integral",
      subtitle: "Casos, personas y vehículos",
      phrase:
        "Centralizá la información del siniestro y vinculá todos los elementos relevantes desde una sola interfaz.",
      linkLabel: "Conocer más",
      to: "/login",
      tone: "purple",
    },
    {
      image: images.info2,
      title: "Dashboard estadístico",
      subtitle: "Análisis y tendencias",
      phrase:
        "Visualizá distribuciones por tipo de siniestro, severidad, vehículos y factores humanos desde un panel centralizado.",
      linkLabel: "Ver estadísticas",
      to: "/login",
      tone: "green",
    },
  ];

  const slides = [
    {
      titleBadge: "Sistema RAV",
      title: "Gestión Integral del Siniestro",
      subtitle: "Registro, análisis y documentación técnica en un mismo entorno.",
      description:
        "Centralizá la información del hecho, los actores intervinientes, los cálculos físicos y la producción del informe final.",
      primaryCta:   { label: "Iniciar sesión", to: "/login" },
      secondaryCta: { label: "Crear cuenta",   to: "/register" },
      highlights: [
        {
          title: "Cálculos técnicos",
          text:  "Frenado, derrape, proyección y multitramos.",
          tone:  "orange",
        },
        {
          title: "Interfaz clara",
          text:  "Diseño consistente, técnico y profesional.",
          tone:  "cyan",
        },
      ],
      visualCards: [
        {
          label: "Módulos",
          value: "6+",
          text:  "Cálculos integrados",
          tone:  "orange",
        },
        {
          label: "Salida",
          value: "PDF",
          text:  "Informes periciales",
          tone:  "cyan",
        },
      ],
    },
    {
      titleBadge: "Reconstrucción",
      title: "Cálculos físicos con enfoque pericial",
      subtitle: "Resultados claros, trazables y listos para documentar.",
      description:
        "Cada módulo fue pensado para asistir el análisis técnico con una salida comprensible y consistente para el perito.",
      primaryCta:   { label: "Ver módulos",  to: "/login" },
      secondaryCta: { label: "Conocer más",  to: "/register" },
      highlights: [
        {
          title: "Trazabilidad",
          text:  "Parámetros y resultados organizados por expediente.",
          tone:  "purple",
        },
        {
          title: "Escalabilidad",
          text:  "Arquitectura preparada para nuevos módulos.",
          tone:  "green",
        },
      ],
      visualCards: [
        {
          label: "Coef.",
          value: "μ",
          text:  "Variables técnicas centralizadas",
          tone:  "purple",
        },
        {
          label: "Modelo",
          value: "RAV",
          text:  "Plataforma modular pericial",
          tone:  "green",
        },
      ],
    },
  ];

  return (
    <HomeHero
      badge="Sistema RAV"
      title="Gestión y Reconstrucción"
      accent="Pericial de Siniestros Viales"
      description=""
      slides={slides}
      autoPlay
      intervalMs={5000}
      showCarousel
      showCards
      cards={cards}
    />
  );
}
