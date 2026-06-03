import { useState } from "react";
import type { ReactNode } from "react";
import Container from "../components/layout/container";
import TreeSelector from "../components/data/tree_selector";
import DataGrid from "../components/data/data_grid";
import Button from "../components/ui/button";
import Form from "../components/form/form";
import InputField from "../components/form/input_field";
import GlobalModal from "../components/ui/global_modal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth_context";
import { Plus, Trash2, Pencil, LockKeyhole } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UbicacionNode {
  id: number;
  label: string;
  children?: UbicacionNode[];
  [key: string]: unknown;
}

interface VisitanteRow extends Record<string, unknown> {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
}

interface NodoSeleccionado {
  _id: unknown;
  _label: string;
  [key: string]: unknown;
}

interface TestFormData {
  nombres: string;
  apellido: string;
  email: string;
  password: string;
  password1: string;
}

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const ubicaciones: UbicacionNode[] = [
  {
    id: 1,
    label: "Formosa",
    children: [
      {
        id: 2,
        label: "Formosa Capital",
        children: [
          {
            id: 3,
            label: "Departamento Formosa",
            children: [
              { id: 4, label: "Barrio Centro" },
              { id: 5, label: "Barrio San Miguel" },
            ],
          },
        ],
      },
      {
        id: 6,
        label: "Clorinda",
        children: [
          {
            id: 7,
            label: "Departamento Pilcomayo",
            children: [
              {
                id: 8,
                label: "Barrio Centro Clorinda",
                children: [{ id: 300, label: "Testeo" }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 9,
    label: "Chaco",
    children: [
      {
        id: 10,
        label: "Resistencia",
        children: [
          {
            id: 11,
            label: "Departamento San Fernando",
            children: [{ id: 12, label: "Barrio Güiraldes" }],
          },
        ],
      },
    ],
  },
];

const columns: { key: string; label: string; render?: (row: VisitanteRow) => ReactNode }[] = [
  { key: "nombre",    label: "Nombre" },
  { key: "apellido",  label: "Apellido" },
  { key: "documento", label: "Documento" },
  {
    key: "estado",
    label: "Estado",
    render: (row) => (
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
        {row.estado}
      </span>
    ),
  },
];

const rows: VisitanteRow[] = [
  { id: 1, nombre: "Juan",  apellido: "Pérez", documento: "12345678", estado: "Activo" },
  { id: 2, nombre: "María", apellido: "Gómez", documento: "87654321", estado: "Activo" },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TesteoPage() {
  const [ubicacionId, setUbicacionId] = useState<unknown>(null);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<NodoSeleccionado | null>(null);
  const [, setGuardando] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  async function handleGuardar(_data: TestFormData) {
    try {
      console.log("acallego todo", usuario);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  }

  function cerrarModal() {
    setShowModal(false);
    navigate("/test", { replace: true });
  }

  return (
    <>
      <Container
        layout="split"
        badge="Sistema Consuladoss"
        title="Panel principal"
        accent="Stylios"
        subtitle="Accedé rápidamente a los módulos administrativos."
        asideTitle="Módulos disponibles"
        asideText="El sistema centraliza visitantes, notas, reportes e históricos."
        features={[
          { title: "Visitantes", text: "Registro y seguimiento de ingresos." },
          { title: "Notas",      text: "Gestión documental interna." },
          { title: "Reportes",   text: "Consultas e históricos." },
        ]}
        actions={<Button label="Testeando" />}
      >
        <TreeSelector
          label="Ubicación"
          name="ubicacion_id"
          value={ubicacionId}
          onChange={({ value, node }) => {
            setUbicacionId(value);
            setUbicacionSeleccionada(node as NodoSeleccionado);
            console.log("Nodo seleccionado:", node);
          }}
          data={ubicaciones}
          levels={["Provincia", "Localidad", "Departamento", "Barrio", "test"]}
          helperText="Seleccioná una ubicación del árbol."
          collapseOnSelect
        />

        {ubicacionSeleccionada && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-bold text-slate-900">Selección actual</p>
            <p className="mt-1">
              ID: <strong>{String(ubicacionSeleccionada._id)}</strong>
            </p>
            <p>
              Nombre: <strong>{ubicacionSeleccionada._label}</strong>
            </p>
          </div>
        )}

        <DataGrid<VisitanteRow>
          title="Visitantes"
          subtitle="Listado general de visitantes registrados"
          columns={columns}
          rows={rows}
          keyField="id"
          searchColumns={["nombre", "apellido", "documento"]}
          actionsPosition="start"
          showDefaultActions
          onView={(row) => console.log("Ver", row)}
          onEdit={(row) => console.log("Editar", row)}
          onDelete={(row) => console.log("Eliminar", row)}
        />

        <Button label="Nuevo"   icon={Plus}   variant="success" />
        <Button label="Eliminar" icon={Trash2} variant="danger" />
        <Button label="Editar"  icon={Pencil}  variant="warning" />

        <div className="grid grid-cols-1 gap-6 justify-items-center">
          <div className="w-full max-w-xl">
            <Form<TestFormData>
              onSubmit={async (data) => {
                await handleGuardar(data);
              }}
            >
              {({ register, errors, loading, watch }) => (
                <>
                  <InputField
                    label="Nombres"
                    name="nombres"
                    type="text"
                    register={register}
                    error={errors.nombres?.message}
                    required
                  />
                  <InputField
                    label="apellido"
                    name="apellido"
                    type="text"
                    register={register}
                    error={errors.apellido?.message}
                    required
                  />
                  <InputField
                    label="Email"
                    name="email"
                    autoComplete=""
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    required
                  />
                  <InputField
                    label="Contraseña"
                    name="password"
                    type="password"
                    autoComplete=""
                    icon={LockKeyhole}
                    register={register}
                    showPasswordToggle
                    error={errors.password?.message}
                    required
                    watch={watch}
                    matchField="password1"
                    matchFieldMessage="Raulitoo"
                  />
                  <InputField
                    label="Repetir Contraseña"
                    name="password1"
                    type="password"
                    icon={LockKeyhole}
                    autoComplete=""
                    register={register}
                    error={errors.password1?.message}
                    required
                    watch={watch}
                    showPasswordToggle
                    matchField="password"
                    matchFieldMessage="No son Iguales Raul"
                  />
                  <div className="col-span-1 flex justify-center md:col-span-2">
                    <Button
                      type="submit"
                      label="guardar"
                      variant="success"
                      loading={loading}
                    />
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
      </Container>

      {showModal && (
        <GlobalModal
          type="success"
          title="Acceso autorizado Probando"
          details="Usar details o usuario"
          user={usuario ?? undefined}
          confirmLabel="Probando Label"
          onFinish={cerrarModal}
          delayMs={4000}
        />
      )}
    </>
  );
}
