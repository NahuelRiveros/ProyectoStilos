# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server en :5173
npm run build    # Build a dist/
npm run preview  # Preview del build
npm run lint     # ESLint
```

## Stack

React 19 + Vite, **JavaScript puro (sin TypeScript)**, Tailwind CSS v4, React Router v7, TanStack Query v5, react-hook-form, axios.

## Convenciones

- Archivos en **snake_case**: `login_page.jsx`, `auth_context.jsx`
- Extensiones: `.jsx` para archivos con JSX, `.js` para utilidades puras
- Sin TypeScript — sin interfaces, sin tipos, sin `as`, sin genéricos

## Arquitectura

```
src/
  main.jsx                 ← Entry: QueryClientProvider → AuthProvider → RouterProvider
  index.css                ← @import "tailwindcss"
  api/
    http.js                ← instancia axios con interceptor de token
    auth_api.js            ← funciones de auth (login, me, logout, etc.)
    <dominio>_api.js       ← un archivo por dominio
  app/
    router.jsx             ← createBrowserRouter
    query_client.js        ← instancia QueryClient
  auth/
    auth_context.jsx       ← AuthProvider + useAuth() hook
  config/
    auth_config.js         ← storageKey, endpoints, labels
  layouts/
    app_layout.jsx         ← Navbar + Outlet + Footer
  components/
    layout/
      navbar.jsx           ← Navbar principal (sticky, scroll-aware)
      navbar_config.js     ← brand, links[], dropdowns[] — EDITÁ ESTO por proyecto
      navbar_permissions.js← filtrarNavbarPorRol(config, usuario)
      navbar_desktop.jsx
      navbar_mobile.jsx
      navbar_dropdown.jsx
      navbar_userbox.jsx
      container.jsx        ← wrapper de página con header/aside/features
      footer.jsx
    ui/
      button.jsx           ← Button multi-variant
      global_modal.jsx     ← Modal success/error/warning/info
    form/
      form.jsx             ← Wrapper react-hook-form con render prop
      input_field.jsx      ← Input con validación, iconos, password toggle
      select_field.jsx     ← Select con opciones dinámicas
    styles/
      ui_*.js              ← constantes de clases Tailwind por componente
  pages/
    home_page.jsx
    login_page.jsx
    register_page.jsx
    test_page.jsx          ← ejemplo con TreeSelector + DataGrid + Form
    test_page2.jsx         ← template base para páginas nuevas
```

## Componentes clave

### Form (render prop)
```jsx
<Form onSubmit={onSubmit} grid columns={2} title="Mi form">
  {({ register, errors, loading, watch }) => (
    <>
      <InputField name="email" type="email" register={register} error={errors.email?.message} required />
      <Button type="submit" label="Guardar" loading={loading} />
    </>
  )}
</Form>
```

### InputField
Props: `name`, `label`, `type`, `register`, `error`, `required`, `icon`, `showPasswordToggle`, `validationPreset`, `watch`+`matchField` (para confirmar password).

### Navbar
Configurá `navbar_config.js` para cada proyecto: brand, links simples y dropdowns (con soporte de grupos anidados y modo `wide`). La función `filtrarNavbarPorRol` filtra items según `requiereAuth` y `roles`.

### useAuth
```js
const { usuario, isAuth, login, logout, register, cargando } = useAuth();
```

## Agregar una página nueva

1. Crear `src/pages/mi_pagina.jsx` (copiar `test_page2.jsx` como base)
2. Agregar la ruta en `src/app/router.jsx`
3. Si necesita link en el nav, agregar en `navbar_config.js`
4. Si necesita datos de la API, crear `src/api/mi_dominio_api.js` usando `http`
