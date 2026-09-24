# ADR-0003: Banner del home de catalog como componente eduNEXT, configurable por MFE_CONFIG

## Estado

Aceptado, *2026-09-24*

## Contexto

El MFE `catalog` (frontend-app-catalog) renderiza el banner del home. Se quería
personalizar: imagen de fondo, título y subtítulo, por tenant, sin forks.

### Lo que encontramos

1. El upstream **ya soporta imagen de fondo por CSS var**. En
   `src/home/components/home-banner/index.scss`:
   ```scss
   background-image: var(--catalog-home-page-banner-background-image, none);
   background-color: var(--catalog-home-page-banner-background-color, var(--pgn-color-gray-500));
   ```
   Diseñado para setearse desde CSS/theme, no desde JSX.

2. **Pero varsify no genera esas CSS vars.** Varsify (saas-css-varsify) emite
   variables Paragon (`--pgn-*`); no produce `--catalog-home-page-banner-*`.
   Por lo tanto no se pueden entregar por varsify. Varsify queda para colores.

3. El título/subtítulo son texto; el upstream los saca de i18n
   (`Welcome to {siteName}`), sin llave de config. No hay forma de
   configurarlos sin tocar el componente.

4. Existen slots en el catalog MFE, incluido
   `org.openedx.frontend.catalog.home_page.banner` (`HomeBannerSlot`), que
   envuelve `<HomeBanner/>` como contenido por defecto. El slot permite
   ocultar el default e insertar un widget propio.

5. Un piloto previo editó `HomeBanner.tsx`/`HomePageOverlay.tsx` directamente
   (override de JSX, con URL de imagen hardcodeada). No versionado, no
   configurable, por-fork. Se descarta.

### Conclusión del contexto

Como varsify no puede entregar la imagen de fondo y el título/subtítulo no son
configurables en upstream, **sí hace falta un componente React** que lea esos
valores de `MFE_CONFIG` y los inyecte (la imagen como CSS var inline; el texto
directo). Es lo contrario del footer legacy: aquí el JSX es necesario, pero se
mantiene en el slot, no como override del archivo del MFE.

## Decisión

Empaquetar un banner eduNEXT propio (`frontend/edunext-home-banner/`) y
entregarlo con **Opción B** (misma mecánica que el footer, ver ADR-0002) al MFE
`catalog`, inyectado en `home_page.banner` (Hide default + Insert). Todo lo
personalizable viene de `MFE_CONFIG` vía `getConfig()`:

- `HOME_BANNER_BACKGROUND_IMAGE` → CSS var inline
  `--catalog-home-page-banner-background-image` que el SCSS del banner ya lee.
- `HOME_BANNER_BACKGROUND_COLOR` → CSS var opcional.
- `HOME_BANNER_TITLE` / `HOME_BANNER_SUBTITLE` → texto, con fallback i18n.
- `ENABLE_EDUNEXT_HOME_BANNER` (default `True`) → kill-switch por tenant; cae al
  banner default sin rebuild.

El componente **reusa las piezas propias del catalog MFE** vía su alias `@src`
(rutas, slots de promo video, el `.scss` del banner, y el banner default para el
fallback), disponibles porque se copia al árbol `src/` del MFE en build. Así
reproduce el elemento completo (search, promo video, overlay) sin duplicar
lógica, y sólo cambia lo personalizable.

Reparto de responsabilidades de theming:
- **varsify** → colores Paragon (`--pgn-*`).
- **MFE_CONFIG** → imagen de fondo, título, subtítulo (lo que varsify no puede).

## Consecuencias

- El banner vive en el slot, no como override de `HomeBanner.tsx`. El piloto que
  editaba el JSX del MFE se abandona.
- Acoplado a la estructura interna del catalog MFE (imports `@src/...`): válido
  porque se compila dentro del MFE y la versión del MFE está fijada por el
  release. Cambios grandes de estructura upstream podrían requerir ajuste.
- Sólo aplica al MFE `catalog`. En el workspace de prueba (ulmo) `catalog-mfe`
  está deshabilitado y su build está roto (script `make build` incompatible con
  `npm run build -- --config`, ver hilo de build); para probar el banner hay que
  re-habilitar/arreglar `catalog-mfe` primero. No bloquea el empaquetado.

## Alternativas consideradas

- **Setear la CSS var por varsify/CSS del theme.** Descartada: varsify no genera
  `--catalog-home-page-banner-*`; no hay forma de entregarla por esa vía.
- **Override directo de `HomeBanner.tsx`/`HomePageOverlay.tsx`** (el piloto).
  Descartada: no configurable, por-fork, hardcodea la imagen; contradice el
  objetivo de config por tenant.
- **Un `@edx/brand` package** para el color de fondo. No cubre la imagen ni el
  texto; y aún no haremos brand package (ver ADR-0002).

## Referencias

- ADR-0002 (footer, Opción B) · PR base `#6`.
- `frontend-app-catalog@release/ulmo`:
  `src/plugin-slots/HomeBannerSlot/index.tsx`,
  `src/home/components/home-banner/index.scss`.
- Slots del catalog MFE: `home_page.banner`, `home_page.overlay_html`,
  `course_about_page.course_image`, `course_about_page.intro_video_modal`,
  `course_about_page.intro_video_modal_content`.
