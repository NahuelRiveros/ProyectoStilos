import { BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

import Container from "../components/layout/container";
import Form from "../components/form/form";
import InputField from "../components/form/input_field";
import Button from "../components/ui/button";

// ─── TEMPLATE BASE PARA PÁGINAS NUEVAS ──────────────────────────────────────
// Copiá este archivo como punto de partida para cada nueva página.
// Borrá los comentarios una vez que entiendas el patrón.

export default function TestPage2() {
  const [errorGeneral, setErrorGeneral] = useState("");
  const [okMensaje, setOkMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [elementos, setElementos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      // Acá llamarías a tu API real, ejemplo:
      // const response = await getMisElementos();
      // setElementos(response.data || []);

      // Simulación para el template:
      const mock = [
        { id: 1, nombre: "Elemento A", descripcion: "Descripción A" },
        { id: 2, nombre: "Elemento B" },
      ];
      setElementos(mock);
    } catch (error) {
      setErrorGeneral(error?.message || "Error al cargar los datos.");
    } finally {
      setCargando(false);
    }
  }

  async function onSubmit(data) {
    setErrorGeneral("");
    setOkMensaje("");

    try {
      // Acá enviarías al backend:
      // const response = await crearElemento(data);
      console.log("Datos del form:", data);
      setOkMensaje("Guardado correctamente.");
    } catch (error) {
      setErrorGeneral(error?.message || "Error al guardar.");
    }
  }

  return (
    <Container
      layout="single"
      badge="Base Proyecto"
      accent="Sección de ejemplo"
      title="Mi nueva página"
      subtitle="Template base para páginas nuevas."
    >
      <div className="grid grid-cols-1 gap-6 justify-items-center">
        {cargando && <p className="text-sm text-slate-500">Cargando...</p>}

        {!cargando && elementos.length > 0 && (
          <ul className="w-full max-w-xl space-y-2">
            {elementos.map((el) => (
              <li key={el.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span className="font-semibold">{el.nombre}</span>
                {el.descripcion && (
                  <span className="ml-2 text-slate-500">{el.descripcion}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="w-full max-w-xl">
          <Form
            onSubmit={onSubmit}
            grid
            columns={2}
            title="Agregar elemento"
            subtitle="Completá los datos y guardá."
            icon={<BookOpen className="h-7 w-7" />}
          >
            {({ register, errors, loading }) => (
              <>
                {errorGeneral && (
                  <div className="col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {errorGeneral}
                  </div>
                )}

                {okMensaje && (
                  <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {okMensaje}
                  </div>
                )}

                <InputField
                  label="Nombre"
                  name="nombre"
                  placeholder="Escribí el nombre"
                  register={register}
                  error={errors.nombre?.message}
                  required
                  requiredMessage="El nombre es obligatorio"
                />

                <InputField
                  label="Descripción"
                  name="descripcion"
                  placeholder="Descripción opcional"
                  register={register}
                  error={errors.descripcion?.message}
                />

                <div className="col-span-2 flex justify-end">
                  <Button label="Guardar" type="submit" variant="primary" size="lg" loading={loading} loadingLabel="Guardando..." />
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </Container>
  );
}
