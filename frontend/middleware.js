import { deploymentConfig } from "../proyecto/deployment_config.js";
import { resolverApiUrl } from "./src/core/api/api_url.js";
import { esBotDeVistaPrevia, htmlVistaPrevia, slugDeRuta } from "./src/modules/tienda_ropa/tienda/vista_previa.js";

// ROP-31: Routing Middleware de Vercel. Solo para los bots que arman la vista previa de un link
// (WhatsApp, Facebook…): les responde el título, el precio y la foto de la prenda. A las personas no
// les cambia nada: la petición sigue a la tienda de siempre.
export const config = { matcher: "/catalogo/:slug" };

// Render gratis se duerme: si tarda, se responde la vista previa de la tienda (con caché corta, para reintentar).
const ESPERA_MS = 4000;

export default async function middleware(request) {
  if (!esBotDeVistaPrevia(request.headers.get("user-agent"))) return undefined;
  const url = new URL(request.url);
  const slug = slugDeRuta(url.pathname);
  if (!slug) return undefined;
  const prenda = await buscarPrenda(slug);
  return new Response(htmlVistaPrevia({ prenda, url: url.href, sitio: deploymentConfig.nombre }), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Con la prenda, la CDN de Vercel la guarda una hora: compartir mucho no despierta a Render ni consulta la base cada vez.
      "cache-control": prenda ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60",
    },
  });
}

async function buscarPrenda(slug) {
  try {
    const api = resolverApiUrl(globalThis.process?.env?.VITE_API_URL);
    const respuesta = await fetch(`${api}/ropa/catalogo/prendas/${slug}`, { signal: AbortSignal.timeout(ESPERA_MS) });
    return respuesta.ok ? (await respuesta.json()).data ?? null : null;
  } catch {
    return null;
  }
}
