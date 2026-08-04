import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, RefreshCw, FileText, Search, Filter } from "lucide-react";

import { http } from "../api/http";
import { useAuth } from "../auth/auth_context";

// ── Componentes de formulario ────────────────────────────────
import Form        from "../components/form/form";
import InputField  from "../components/form/input_field";
import SelectField from "../components/form/select_field";

// ── Componentes UI ───────────────────────────────────────────
import Button      from "../components/ui/button";
import GlobalModal from "../components/ui/global_modal";
import Container   from "../components/layout/container";

// ── Componentes admin ────────────────────────────────────────
import {
  AdminPageHeader,
  AdminSpinner,
  AdminEmptyState,
  AdminStatCard,
  AdminPagination,
  StatusBadge,
} from "../components/admin";

// ── API (mover a src/api/mi_dominio_api.js cuando sea real) ──
// const RUTA = "/mi-modulo";
// async function getItems()       { const { data } = await http.get(RUTA);                      return data.data; }
// async function crearItem(body)  { const { data } = await http.post(RUTA, body);                return data;      }
// async function editarItem(body) { const { data } = await http.put(`${RUTA}/${body.id}`, body); return data;      }
// async function eliminarItem(id) { const { data } = await http.delete(`${RUTA}/${id}`);         return data;      }

export default function TestPage2() {
  return (
    <Container
      title="Mi Página"
      subtitle="Descripción breve de qué hace esta sección."
      maxWidth="md"
    >
      <Form
        grid
        columns={2}
        gap="md"
        title="Mi formulario"
        icon={<FileText />}
        onSubmit={(data) => console.log("submit", data)}
      >
        {({ register, errors, loading }) => (
          <>
            {/* ── Campos en 2 columnas ── */}
            <InputField
              label="Nombre"
              name="nombre"
              placeholder="Ej: Juan"
              register={register}
              error={errors.nombre?.message}
              required
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="Ej: juan@mail.com"
              register={register}
              error={errors.email?.message}
              required
            />

            {/* ── Campo que ocupa la fila entera ── */}
            <div className="col-span-full">
              <SelectField
                label="País"
                name="pais"
                placeholder="Seleccioná tu país"
                register={register}
                error={errors.pais?.message}
                options={[
                  { value: "AR", label: "Argentina" },
                  { value: "BR", label: "Brasil"    },
                  { value: "UY", label: "Uruguay"   },
                ]}
              />
            </div>

            {/* ── Error del servidor (cuando hay) ── */}
            {/* <p className="col-span-full text-sm text-rose-600">Mensaje de error</p> */}

            {/* ── Acciones — siempre al final, siempre col-span-full ── */}
            <div className="col-span-full flex items-center justify-end gap-3 border-t border-line pt-4">
              <Button variant="ghost" label="Cancelar" type="button" />
              <Button type="submit" label="Guardar" loading={loading} />
            </div>
          </>
        )}
      </Form>
    </Container>
  );
}
