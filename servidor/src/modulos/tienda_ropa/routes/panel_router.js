import { Router } from "express";
import { requireAuth, requirePermiso } from "../../../core/middleware/auth_middleware.js";
import { validar } from "../../../core/middleware/validar.js";
import * as panel from "../controllers/panel_controller.js";
import {
  esquemaCategoria, esquemaColor, esquemaEstado, esquemaFiltrosPanel, esquemaGrupoCaracteristica, esquemaGrupoTalle, esquemaId, esquemaMarca, esquemaPrenda,
} from "../reglas.js";

// Panel del catálogo: todo pide "Editar productos" (ROP-20).
export const panelRopaRouter = Router();
panelRopaRouter.use(requireAuth, requirePermiso("productos.editar"));

const conId = (body) => validar({ params: esquemaId, ...(body ? { body } : {}) });

/** GET, POST, PUT /:id y DELETE /:id de una lista. */
function lista(ruta, controlador, esquema) {
  panelRopaRouter.get(ruta, controlador.listar);
  panelRopaRouter.post(ruta, validar({ body: esquema }), controlador.crear);
  panelRopaRouter.put(`${ruta}/:id`, conId(esquema), controlador.actualizar);
  panelRopaRouter.delete(`${ruta}/:id`, conId(), controlador.eliminar);
}

// Las rutas fijas van antes de "/:id" (si no, Express toma "sugeridos" como un id).
panelRopaRouter.post("/colores/sugeridos", panel.coloresSugeridosController);
panelRopaRouter.post("/talles/sugeridos", panel.gruposSugeridosController);
panelRopaRouter.post("/marcas/sugeridos", panel.marcasSugeridasController);
panelRopaRouter.post("/caracteristicas/sugeridos", panel.caracteristicasSugeridasController);
panelRopaRouter.post("/categorias/sugeridos", panel.categoriasSugeridasController);
lista("/categorias", panel.categorias, esquemaCategoria);
lista("/marcas", panel.marcas, esquemaMarca);
lista("/colores", panel.colores, esquemaColor);
lista("/caracteristicas", panel.caracteristicas, esquemaGrupoCaracteristica);
lista("/talles", panel.grupos, esquemaGrupoTalle);

panelRopaRouter.get("/prendas", validar({ query: esquemaFiltrosPanel }), panel.listarPrendasController);
panelRopaRouter.post("/prendas", validar({ body: esquemaPrenda }), panel.crearPrendaController);
panelRopaRouter.get("/prendas/:id", conId(), panel.obtenerPrendaController);
panelRopaRouter.put("/prendas/:id", conId(esquemaPrenda), panel.actualizarPrendaController);
panelRopaRouter.patch("/prendas/:id/estado", conId(esquemaEstado), panel.estadoPrendaController);
panelRopaRouter.delete("/prendas/:id", conId(), panel.eliminarPrendaController);
