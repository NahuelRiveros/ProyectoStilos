import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import Container from "../components/layout/container";
import InputField from "../components/form/input_field";
import Form from "../components/form/form";
import Button from "../components/ui/button";
import GlobalModal from "../components/ui/global_modal";
import { useAuth } from "../auth/auth_context";
import { brandConfig } from "../config/app_config";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [errorGeneral, setErrorGeneral] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [usuarioBienvenida, setUsuarioBienvenida] = useState(null);

  async function onSubmit(data) {
    setErrorGeneral("");

    try {
      const response = await login({
        email:    data.email,
        password: data.password,
      });

      setUsuarioBienvenida(response?.usuario ?? null);
      setShowWelcome(true);
    } catch (error) {
      const mensaje =
        error?.response?.data?.mensaje ||
        error?.response?.data?.message ||
        "No se pudo iniciar sesión. Verificá tus credenciales.";

      setErrorGeneral(mensaje);
    }
  }

  function finalizarBienvenida() {
    setShowWelcome(false);
    navigate("/dashboard", { replace: true });
  }

  return (
    <>
      <Container
        layout="single"
        badge={brandConfig.footerLicense}
        accent={brandConfig.name}
        title="Acceso al sistema"
        subtitle="Ingrese tus credenciales."
      >
        <div className="flex justify-center">
          <div className="w-100">
            <Form
              title="Login"
              subtitle="Iniciá sesión con tu cuenta"
              icon={<ShieldCheck size={32} className="h-7 w-7" />}
              onSubmit={async (data) => {
                await onSubmit(data);
              }}
            >
              {({ register, errors, loading }) => (
                <>
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    required
                    requiredMessage="El email es obligatorio"
                    autoComplete="email"
                  />

                  <InputField
                    label="Contraseña"
                    name="password"
                    type="password"
                    register={register}
                    error={errors.password?.message}
                    required
                    requiredMessage="La contraseña es obligatoria"
                    autoComplete="password"
                    showPasswordToggle
                  />

                  {errorGeneral && (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {errorGeneral}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-slate-600 transition hover:text-slate-900 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <div className="flex justify-center">
                    <div>
                      <Button
                        type="submit"
                        label="Ingresar"
                        loading={loading}
                        loadingLabel="Ingresando..."
                        fullWidth
                        variant="success"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
                    ¿No tenés cuenta?{" "}
                    <Link to="/register" className="font-bold text-slate-900 hover:underline">
                      Registrate
                    </Link>
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
      </Container>

      {showWelcome && (
        <GlobalModal
          type="success"
          title="Acceso autorizado"
          message="Se inicio sesión correctamente en el sistema."
          user={usuarioBienvenida ?? undefined}
          confirmLabel="Continuar ahora"
          onFinish={finalizarBienvenida}
          delayMs={4000}
        />
      )}
    </>
  );
}
