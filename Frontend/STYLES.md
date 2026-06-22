# Guía de estilos — Stilos

Referencia visual del sistema de diseño. Para cambiar el tema editar únicamente
`src/config/theme_config.js` — los valores se inyectan automáticamente via `ThemeProvider`.

---

## Paleta de colores

| Token                    | Hex       | Uso                                              |
|--------------------------|-----------|--------------------------------------------------|
| `--color-navy`           | `#283149` | Botón primario, links, énfasis, fondos de bloque |
| `--color-surface`        | `#F3E6D9` | Fondo de página y secciones                      |
| `--color-ink`            | `#1C2438` | Texto principal                                  |
| `--color-muted`          | `#8A95A8` | Texto secundario, placeholders                   |
| `--color-card`           | `#FFFFFF` | Cards, modales, dropdowns                        |
| `--color-line`           | `#E2D3C4` | Bordes y separadores                             |
| `--color-accent`         | `#C9A87C` | Brass dorado — CTAs, badges destacados           |
| `--color-accent-light`   | `#F5EAD8` | Fondo suave para badges y alertas                |
| `--color-accent-dark`    | `#8A6B3A` | Texto sobre fondos claros con acento             |
| `--color-shell`          | `#F3E6D9` | Fondo del navbar                                 |
| `--color-shell-text`     | `#283149` | Texto del navbar                                 |
| `--color-footer`         | `#283149` | Fondo del footer                                 |
| `--color-footer-text`    | `#F3E6D9` | Texto principal del footer                       |
| `--color-admin`          | `#1C2438` | Sidebar del backoffice                           |
| `--color-admin-raised`   | `#283149` | Items activos del sidebar                        |

### Combinación base
```
Fondo de página:   #F3E6D9  (crema cálida)
Bloques de impacto: #283149  (navy profundo)
Texto sobre navy:  #F3E6D9  (crema — mismo tono que el fondo)
Accents / CTAs:    #C9A87C  (brass dorado)
```

---

## Tipografías

### Display — Cormorant Garamond
- **Google Fonts**: `Cormorant+Garamond`
- **Pesos**: 300 · 400 · 500 · 600 · 700 (normal + italic)
- **Uso**: logo, títulos de sección, headings editoriales, nombre de producto
- **Variable CSS**: `--font-display`
- **Clase Tailwind**: `font-display`

```jsx
<h1 className="font-display text-4xl font-light italic">Stilo's</h1>
```

### Promo — Rubik One
- **Google Fonts**: `Rubik+One`
- **Peso**: 400 (el único — es bold por diseño)
- **Uso**: banners de oferta, "HOT SALE", "50% OFF", textos de impacto y chunky
- **Variable CSS**: `--font-promo`
- **Clase Tailwind**: `font-promo`

```jsx
<p className="font-promo text-5xl uppercase tracking-tight">HOT SALE</p>
```

### Sans — DM Sans
- **Google Fonts**: `DM+Sans`
- **Pesos**: 300–900 (normal + italic)
- **Uso**: todo el body, botones, labels, UI en general
- **Variable CSS**: `--font-sans`
- **Clase Tailwind**: `font-sans` (default del body)

---

## Estilos visuales

### Bordes redondeados
El sistema usa una escala de `border-radius` coherente:

| Contexto                    | Clase Tailwind    | Valor     |
|-----------------------------|-------------------|-----------|
| Cards, modales, secciones   | `rounded-2xl`     | `1rem`    |
| Botones, inputs, badges     | `rounded-xl`      | `0.875rem`|
| Pills / chips / tags        | `rounded-full`    | `9999px`  |
| Items de nav, dropdowns     | `rounded-lg`      | `0.5rem`  |

### Bloque de impacto (contenedor navy)
Patrón directo de la identidad visual de Stilos:

```jsx
<div className="bg-[#283149] text-[#F3E6D9] rounded-2xl p-8">
  <p className="font-promo text-5xl uppercase">HOT SALE</p>
  <span className="border border-[#F3E6D9] rounded-full px-3 py-1 text-sm">
    PARA ELLOS
  </span>
  <p className="font-promo text-4xl uppercase">ZAPATILLAS 50% OFF</p>
</div>
```

### Tag / badge de categoría
```jsx
<span className="border border-current rounded-full px-3 py-1 text-xs font-sans uppercase tracking-widest">
  PARA ELLOS
</span>
```

---

## Clases semánticas del sistema

Definidas en `src/index.css` y disponibles en todo el proyecto:

| Clase              | Descripción                                            |
|--------------------|--------------------------------------------------------|
| `.section-title`   | Heading de sección con `font-display`                  |
| `.eyebrow`         | Label pequeño en uppercase sobre un título             |
| `.card-ui`         | Card base con borde, radio y sombra suave              |
| `.card-hover`      | Card con efecto hover elevado                          |
| `.badge-brand`     | Badge con color acento                                 |
| `.badge-primary`   | Badge con color navy                                   |
| `.btn-primary`     | Botón navy sólido                                      |
| `.btn-accent`      | Botón brass dorado                                     |
| `.btn-outline`     | Botón con borde                                        |
| `.btn-whatsapp`    | Botón verde WhatsApp con gradiente                     |
| `.category-tile`   | Tile de categoría con imagen y overlay navy            |
| `.input-form`      | Input estilizado del sistema de formularios            |
| `.empty-state`     | Placeholder para listas vacías                         |
| `.app-page`        | Wrapper de página con fondo surface y color ink        |

---

## Modificar el tema

Editar solo `src/config/theme_config.js`:

```js
// Cambiar a navbar navy oscuro:
navbar: {
  bg:      "#283149",
  text:    "#F3E6D9",
  textDim: "#8A95A8",
}

// Cambiar superficie a blanco limpio:
content: {
  surface: "#FFFFFF",
  ...
}
```

Los cambios se reflejan instantáneamente sin tocar CSS.
