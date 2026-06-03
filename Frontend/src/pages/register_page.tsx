import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, LockKeyhole, User, IdCard } from "lucide-react";
import { useState, useEffect } from "react";

import Container from "../components/layout/container";
import Form from "../components/form/form";
import InputField from "../components/form/input_field";
import Button from "../components/ui/button";
import SelectField from "../components/form/select_field";
import { useAuth } from "../auth/auth_context";
import { getEstadosCiviles } from "../api/estado_civil_api.js";

interface EstadoCivil {
  ID_USEPERS03: number;
  USEPERS03_DESCRI: string;
  [key: string]: unknown;
}

interface RegisterFormData {
  nombre: string;
  apellido: string;
  documento: string;
  estado_civil_id: string;
  email: string;
  password: string;
  confirmar_password: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registrarUsuario } = useAuth();

  const [errorGeneral, setErrorGeneral] = useState<string>("");
  const [okMensaje, setOkMensaje] = useState<string>("");
  const [estadosCiviles, setEstadosCiviles] = useState<EstadoCivil[]>([]);

  useEffect(() => {
    async function cargar() {
      try {
        const response = await getEstadosCiviles();
        setEstadosCiviles(response.data || []);
      } catch (error) {
        console.error(error);
      }
    }

    cargar();
  }, []);

  async function onSubmit(data: RegisterFormData) {
    setErrorGeneral("");
    setOkMensaje("");

    const payload = {
      nombre: data.nombre?.trim(),
      apellido: data.apellido?.trim(),
      documento: data.documento?.trim(),
      estado_civil_id: data.estado_civil_id,
      email: data.email?.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const respuesta = await registrarUsuario(payload);

      if (!respuesta?.ok) {
        setErrorGeneral(
          (respuesta?.mensaje as string) || "No se pudo completar el registro.",
        );
        return;
      }

      setOkMensaje(
        (respuesta?.mensaje as string) || "Registro realizado correctamente.",
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { mensaje?: string; message?: string } };
        message?: string;
      };
      const mensaje =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo completar el registro.";

      setErrorGeneral(mensaje);
    }
  }

  return (
    <Container
      layout="single"
      badge="Sistema Consulado"
      accent="Consulado Paraguay"
      title="Registro de usuario"
      subtitle="Completá los datos necesarios para solicitar acceso al sistema."
    >
      <div className="grid grid-cols-1 gap-6 justify-items-center">
        <div className="w-full max-w-xl">
          <Form<RegisterFormData>
            onSubmit={onSubmit}
            grid
            columns={2}
            title="Crear cuenta"
            subtitle="Ingresá la información básica del usuario."
            icon={<UserPlus className="h-7 w-7" />}
            iconBg="navy"
          >
            {({ register, errors, loading, watch }) => (
              <>
                {errorGeneral && (
                  <div className="col-span-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 md:col-span-2">
                    {errorGeneral}
                  </div>
                )}

                {okMensaje && (
                  <div className="col-span-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 md:col-span-2">
                    {okMensaje}
                  </div>
                )}

                <InputField
                  label="Nombre"
                  name="nombre"
                  placeholder="Juan"
                  icon={User}
                  register={register}
                  error={errors.nombre?.message}
                  required
                  requiredMessage="El nombre es obligatorio"
                  minLength={2}
                />

                <InputField
                  label="Apellido"
                  name="apellido"
                  placeholder="Pérez"
                  icon={User}
                  register={register}
                  error={errors.apellido?.message}
                  required
                  requiredMessage="El apellido es obligatorio"
                  minLength={2}
                />

                <InputField
                  label="Documento"
                  name="documento"
                  placeholder="12345678"
                  icon={IdCard}
                  inputMode="numeric"
                  register={register}
                  error={errors.documento?.message}
                  required
                  requiredMessage="El documento es obligatorio"
                  minLength={6}
                  maxLength={12}
                  validationPreset="numeric"
                />

                <SelectField
                  label="Estado civil"
                  name="estado_civil_id"
                  register={register}
                  required
                  error={errors.estado_civil_id?.message}
                  options={estadosCiviles}
                  optionValue="ID_USEPERS03"
                  optionLabel="USEPERS03_DESCRI"
                  placeholder="Seleccionar estado civil"
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="usuario@mail.com"
                  autoComplete="email"
                  icon={Mail}
                  register={register}
                  error={errors.email?.message}
                  required
                  requiredMessage="El email es obligatorio"
                />

                <InputField
                  label="Contraseña"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  icon={LockKeyhole}
                  register={register}
                  error={errors.password?.message}
                  required
                  requiredMessage="La contraseña es obligatoria"
                  minLength={6}
                  showPasswordToggle
                />

                <InputField
                  label="Confirmar contraseña"
                  name="confirmar_password"
                  type="password"
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                  icon={LockKeyhole}
                  register={register}
                  error={errors.confirmar_password?.message}
                  required
                  requiredMessage="Confirmá tu contraseña"
                  minLength={6}
                  showPasswordToggle
                  watch={watch}
                  matchField="password"
                  matchFieldMessage="Las contraseñas no coinciden"
                />

                <div className="col-span-1 flex justify-center md:col-span-2">
                  <div>
                    <Button
                      label="Registrarme"
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loading}
                      loadingLabel="Registrando..."
                    />
                  </div>
                </div>

                <div className="col-span-1 border-t border-line pt-4 text-center text-sm text-muted md:col-span-2">
                  ¿Ya tenés cuenta?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-ink hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </Container>
  );
}
