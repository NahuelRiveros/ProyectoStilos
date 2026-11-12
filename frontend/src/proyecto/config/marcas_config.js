// Logos de las marcas (ROP-35): la cinta del inicio, "Nuestras marcas" y el panel.
//
// Cuál se muestra: el logo subido desde el panel (Marcas) tiene prioridad; si no hay, el de este
// archivo; si tampoco, el nombre de la marca en negrita y mayúsculas.
//
// Para sumar o cambiar un logo:
//   1. Copiá la imagen a ../assets/marcas/ (svg, png o webp, mejor con fondo transparente).
//   2. Importala abajo.
//   3. Agregala a LOGOS_MARCAS con el nombre de la marca como figura en el panel (no importan
//      mayúsculas ni espacios de más).
// `fondo`: color del recuadro, solo si el logo es claro y no se ve sobre blanco (ej. MAYCLA).
//
// Los logos son de cada marca: se muestran porque Stilos las vende; no los modifiques.
import bando from "../assets/marcas/bando.webp";
import cataleia from "../assets/marcas/cataleia.webp";
import isostasia from "../assets/marcas/isostasia.png";
import maycla from "../assets/marcas/maycla.webp";
import mistral from "../assets/marcas/mistral.webp";
import panther from "../assets/marcas/panther.webp";
import taverniti from "../assets/marcas/taverniti.webp";
import raiders from "../assets/marcas/raiders.webp";
import bravo from "../assets/marcas/bravo.webp";
import bbn from "../assets/marcas/bbn.webp";
import aff from "../assets/marcas/aff.webp";
import usAmerika from "../assets/marcas/us-amerika.webp";

export const LOGOS_MARCAS = {
  Bando: { logo: bando },
  Cataleia: { logo: cataleia },
  Isostasia: { logo: isostasia },
  MAYCLA: { logo: maycla, fondo: "#1E2D3D" },
  Mistral: { logo: mistral },
  Panther: { logo: panther },
  Taverniti: { logo: taverniti },
  // Estos tres vienen con fondo negro: la tarjeta también, así no queda un cuadrado adentro de otro.
  Raiders: { logo: raiders, fondo: "#000000" },
  Bravo: { logo: bravo, fondo: "#000000" },
  BBN: { logo: bbn, fondo: "#000000" },
  AFF: { logo: aff },
  "US Amerika": { logo: usAmerika },
};
