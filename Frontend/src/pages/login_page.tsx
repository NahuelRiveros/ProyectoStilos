import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import Container from "../components/layout/container";
import InputField from "../components/form/input_field";
import Form from "../components/form/form";
import Button from "../components/ui/button";
import GlobalModal from "../components/ui/global_modal";
import { useAuth, type Usuario } from "../auth/auth_context";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [errorGeneral, setErrorGeneral] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [usuarioBienvenida, setUsuarioBienvenida] = useState<Usuario | null>(null);

  async function onSubmit(data: LoginFormData) {
    setErrorGeneral("");

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      setUsuarioBienvenida(response?.usuario ?? null);
      setShowWelcome(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { mensaje?: string; message?: string } } };
      const mensaje =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
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
        badge="Sistema Consulado"
        accent="Consulado Paraguay"
        title="Acceso al sistema"
        subtitle="Ingrese tus credenciales."
      >
        <div className="flex justify-center">
          <div className="w-100">
            <Form<LoginFormData>
              title="Login"
              subtitle="Iniciá sesión con tu cuenta"
              icon={<ShieldCheck size={32} className="h-7 w-7" />}
              iconBg="navy"
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
                      className="text-sm font-semibold text-muted transition hover:text-ink hover:underline"
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
                        variant="primary"
                      />
                    </div>
                  </div>

                  <div className="border-t border-line pt-4 text-center text-sm text-muted">
                    ¿No tenés cuenta?{" "}
                    <Link
                      to="/register"
                      className="font-bold text-ink hover:underline"
                    >
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
