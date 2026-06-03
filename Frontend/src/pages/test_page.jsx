import { useState } from "react";
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

const ubicaciones = [
  {
    id: 1, label: "Formosa",
    children: [
      {
        id: 2, label: "Formosa Capital",
        children: [
          {
            id: 3, label: "Departamento Formosa",
            children: [
              { id: 4, label: "Barrio Centro" },
              { id: 5, label: "Barrio San Miguel" },
            ],
          },
        ],
      },
      {
        id: 6, label: "Clorinda",
        children: [
          {
            id: 7, label: "Departamento Pilcomayo",
            children: [
              {
                id: 8, label: "Barrio Centro Clorinda",
                children: [{ id: 300, label: "Testeo" }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 9, label: "Chaco",
    children: [
      {
        id: 10, label: "Resistencia",
        children: [
          {
            id: 11, label: "Departamento San Fernando",
            children: [{ id: 12, label: "Barrio Güiraldes" }],
          },
        ],
      },
    ],
  },
];

const columns = [
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

const rows = [
  { id: 1, nombre: "Juan",  apellido: "Pérez", documento: "12345678", estado: "Activo" },
  { id: 2, nombre: "María", apellido: "Gómez", documento: "87654321", estado: "Activo" },
];

export default function TesteoPage() {
  const [ubicacionId, setUbicacionId] = useState(null);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [, setGuardando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  async function handleGuardar(_data) {
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
        badge="Base Proyecto"
        title="Panel principal"
        accent="Nahuel Riveros"
        subtitle="Página de testeo del template base."
        asideTitle="Módulos disponibles"
        asideText="El sistema base incluye autenticación, roles, navegación y formularios."
        features={[
          { title: "Módulo A",  text: "Registro y seguimiento de entidades." },
          { title: "Módulo B",  text: "Gestión documental interna." },
          { title: "Reportes",  text: "Consultas e históricos." },
        ]}
        actions={<Button label="Testeando" />}
      >
        <TreeSelector
          label="Ubicación"
          name="ubicacion_id"
          value={ubicacionId}
          onChange={({ value, node }) => {
            setUbicacionId(value);
            setUbicacionSeleccionada(node);
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
            <p className="mt-1">ID: <strong>{String(ubicacionSeleccionada._id)}</strong></p>
            <p>Nombre: <strong>{ubicacionSeleccionada._label}</strong></p>
          </div>
        )}

        <DataGrid
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

        <Button label="Nuevo"    icon={Plus}   variant="success" />
        <Button label="Eliminar" icon={Trash2} variant="danger" />
        <Button label="Editar"   icon={Pencil}  variant="warning" />

        <div className="grid grid-cols-1 gap-6 justify-items-center">
          <div className="w-full max-w-xl">
            <Form onSubmit={async (data) => { await handleGuardar(data); }}>
              {({ register, errors, loading, watch }) => (
                <>
                  <InputField label="Nombres"    name="nombres"   type="text"     register={register} error={errors.nombres?.message}   required />
                  <InputField label="apellido"   name="apellido"  type="text"     register={register} error={errors.apellido?.message}  required />
                  <InputField label="Email"      name="email"     type="email"    register={register} error={errors.email?.message}     required autoComplete="" />
                  <InputField
                    label="Contraseña" name="password" type="password" autoComplete=""
                    icon={LockKeyhole} register={register} showPasswordToggle
                    error={errors.password?.message} required watch={watch}
                    matchField="password1" matchFieldMessage="Raulitoo"
                  />
                  <InputField
                    label="Repetir Contraseña" name="password1" type="password" icon={LockKeyhole}
                    autoComplete="" register={register} error={errors.password1?.message}
                    required watch={watch} showPasswordToggle
                    matchField="password" matchFieldMessage="No son Iguales Raul"
                  />
                  <div className="col-span-1 flex justify-center md:col-span-2">
                    <Button type="submit" label="guardar" variant="success" loading={loading} />
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
