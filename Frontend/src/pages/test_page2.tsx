// ─── IMPORTS ────────────────────────────────────────────────────────────────
// Íconos de lucide-react (buscá en https://lucide.dev)
import { BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

// Componentes del proyecto
import Container from "../components/layout/container";
import Form from "../components/form/form";
import InputField from "../components/form/input_field";
import Button from "../components/ui/button";

// ─── TIPOS (TypeScript) ──────────────────────────────────────────────────────
//
// "interface" define la FORMA de un objeto. Le decís a TypeScript exactamente
// qué campos tiene y de qué tipo es cada uno.
//
// Tipos básicos:
//   string   → texto           → "hola", ""
//   number   → número          → 42, 3.14
//   boolean  → verdadero/falso → true, false
//   campo?   → el ? significa que es OPCIONAL (puede no venir)
//
// Usás la interface para:
//   1. Tipar el estado del componente  (useState<MiInterface>)
//   2. Tipar los datos de un form      (Form<MiFormData>)
//   3. Tipar la respuesta de una API   (lo que devuelve el fetch)

// Ejemplo: datos que vienen de la API (un registro de la BD)
interface Elemento {
  id: number;
  nombre: string;
  descripcion?: string; // opcional: puede venir o no
}

// Ejemplo: los campos del formulario de esta página
interface MiFormData {
  nombre: string;
  descripcion: string;
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
//
// En TypeScript una función de componente puede escribirse como:
//
//   export default function MiPagina(): JSX.Element { ... }
//
// El ": JSX.Element" dice qué DEVUELVE la función (un componente React).
// Es opcional escribirlo porque TypeScript lo infiere solo, pero es buena
// práctica al principio para entender qué se está devolviendo.

export default function TestPage2() {
  // ─── ESTADO LOCAL ──────────────────────────────────────────────────────────
  //
  // useState<T> → el T entre <> es el tipo del estado.
  //
  //   useState<string>("")        → estado de tipo string, empieza vacío
  //   useState<number>(0)         → estado de tipo number, empieza en 0
  //   useState<boolean>(false)    → estado de tipo boolean
  //   useState<Elemento[]>([])    → array de Elemento, empieza vacío
  //   useState<Elemento | null>(null) → un Elemento O null (cuando no cargó aún)

  const [errorGeneral, setErrorGeneral] = useState<string>("");
  const [okMensaje, setOkMensaje] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);

  // ─── EFECTO AL MONTAR ──────────────────────────────────────────────────────
  //
  // useEffect(() => { ... }, [])
  //   → El [] vacío al final significa "ejecutar solo UNA vez cuando el
  //     componente aparece en pantalla" (equivale al componentDidMount de clases)
  //
  // Si ponés una variable adentro del array: [variableX]
  //   → se ejecuta cada vez que cambia variableX

  useEffect(() => {
    cargarDatos();
  }, []);

  // ─── FUNCIONES ASÍNCRONAS ──────────────────────────────────────────────────
  //
  // "async function nombre(): Promise<void>"
  //   → Promise<void> significa que la función es async pero no devuelve nada útil
  //   → Si devolviera un Elemento sería Promise<Elemento>
  //
  // "async/await" es la forma moderna de manejar llamadas al backend.
  // Siempre envolvé en try/catch para manejar errores.

  async function cargarDatos(): Promise<void> {
    setCargando(true);
    try {
      // Acá llamarías a tu API real, ejemplo:
      // const response = await getMisElementos();
      // setElementos(response.data || []);

      // Simulación para el template:
      const mock: Elemento[] = [
        { id: 1, nombre: "Elemento A", descripcion: "Descripción A" },
        { id: 2, nombre: "Elemento B" }, // sin descripcion (es opcional)
      ];
      setElementos(mock);
    } catch (error) {
      // "error" en el catch siempre es tipo "unknown" en TypeScript moderno.
      // Para acceder a sus propiedades tenés que castearlo (decirle a TS qué tipo es):
      const err = error as { message?: string };
      setErrorGeneral(err?.message || "Error al cargar los datos.");
    } finally {
      // "finally" se ejecuta SIEMPRE, haya error o no → ideal para quitar loading
      setCargando(false);
    }
  }

  // Form<MiFormData> → la función recibe "data" tipado como MiFormData
  // Así TypeScript sabe exactamente qué campos tiene "data" y te avisa si
  // intentás acceder a uno que no existe.
  async function onSubmit(data: MiFormData): Promise<void> {
    setErrorGeneral("");
    setOkMensaje("");

    try {
      // Acá enviarías al backend:
      // const response = await crearElemento(data);
      console.log("Datos del form:", data);
      setOkMensaje("Guardado correctamente.");
    } catch (error) {
      const err = error as { message?: string };
      setErrorGeneral(err?.message || "Error al guardar.");
    }
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  //
  // Todo lo que está después del "return" es JSX (HTML + lógica React).
  // Container, Form, InputField, Button son los componentes base del proyecto.

  return (
    <Container
      layout="single"
      badge="Sistema Consulado"
      accent="Sección de ejemplo"
      title="Mi nueva página"
      subtitle="Template base para páginas nuevas."
    >
      <div className="grid grid-cols-1 gap-6 justify-items-center">
        {/* Lista de datos cargados desde la API */}
        {cargando && (
          <p className="text-sm text-slate-500">Cargando...</p>
        )}

        {!cargando && elementos.length > 0 && (
          <ul className="w-full max-w-xl space-y-2">
            {/* El .map() recorre el array y devuelve JSX por cada elemento */}
            {/* "key" es obligatorio en listas para que React las maneje eficientemente */}
            {elementos.map((el) => (
              <li
                key={el.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold">{el.nombre}</span>
                {/* Renderizado condicional: si existe descripcion, la muestra */}
                {el.descripcion && (
                  <span className="ml-2 text-slate-500">{el.descripcion}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Formulario */}
        <div className="w-full max-w-xl">
          <Form<MiFormData>
            onSubmit={onSubmit}
            grid
            columns={2}
            title="Agregar elemento"
            subtitle="Completá los datos y guardá."
            icon={<BookOpen className="h-7 w-7" />}
          >
            {({ register, errors, loading }) => (
              <>
                {/* Mensaje de error global */}
                {errorGeneral && (
                  <div className="col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {errorGeneral}
                  </div>
                )}

                {/* Mensaje de éxito */}
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
                  <Button
                    label="Guardar"
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    loadingLabel="Guardando..."
                  />
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </Container>
  );
}
