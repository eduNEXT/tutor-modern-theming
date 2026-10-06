# ADR-0003: Banner del home del MFE catalog configurable por tenant

## Estado

Aceptado, 2026-09-24

## Contexto

El MFE `catalog` muestra un banner en su página de inicio. Se requiere que cada
tenant pueda configurar la imagen de fondo, el color de fondo, el título y el
subtítulo de ese banner, sin mantener una copia modificada del MFE.

Situación del MFE `catalog` (`release/ulmo`):

- La imagen y el color de fondo se leen de dos variables CSS
  (`--catalog-home-page-banner-background-image` y
  `--catalog-home-page-banner-background-color`). La herramienta de theming por
  tenant (varsify) solo genera variables de Paragon (`--pgn-*`), así que no
  puede definirlas.
- El título y el subtítulo vienen de textos de i18n fijos (por ejemplo,
  `Welcome to {siteName}`); no hay una llave de configuración para cambiarlos.
- El banner está envuelto en el slot `org.openedx.frontend.catalog.home_page.banner`,
  que permite ocultar el contenido por defecto e insertar un componente propio.

## Decisión

Entregar un componente propio, `frontend/edunext-home-banner/`, al MFE `catalog`
con el mismo mecanismo del footer (Opción B, ADR-0002), insertado en el slot
`home_page.banner` en lugar del banner por defecto.

El componente lee de `MFE_CONFIG`:

- `HOME_BANNER_BACKGROUND_IMAGE` y `HOME_BANNER_BACKGROUND_COLOR`, que asigna a
  las variables CSS que ya usa el banner del MFE.
- `HOME_BANNER_TITLE` y `HOME_BANNER_SUBTITLE`.
- `ENABLE_EDUNEXT_HOME_BANNER`: si está ausente o en `false`, se muestra el
  banner por defecto del MFE.

Para el resto del banner (buscador, video promocional, estilos) el componente
reutiliza las piezas del propio MFE `catalog` mediante su alias `@src`, sin
duplicar esa lógica.

División de responsabilidades de theming:

- varsify: colores de Paragon.
- `MFE_CONFIG`: imagen, color de fondo, título y subtítulo del banner.

## Consecuencias

**Positivas**

- Cada tenant configura el banner sin reconstruir la imagen y sin modificar el
  MFE.
- El buscador y el video promocional siguen funcionando, porque se reutilizan
  los componentes del MFE.

**Costos y limitaciones**

- El componente depende de la estructura interna del MFE `catalog` (rutas
  importadas con `@src`). Un cambio de estructura en una nueva versión del MFE
  puede requerir ajustes.
- Requiere compilar `catalog` desde su rama de release de Open edX (por ejemplo,
  `release/ulmo.3`). La rama `master` usa `frontend-base` y no es compatible con
  el build de tutor-mfe para Ulmo.
- Solo aplica al MFE `catalog`.

## Alternativas consideradas

- **Definir las variables CSS desde varsify o desde el CSS del theme.**
  Descartada: varsify no genera variables fuera de Paragon, y la imagen y los
  textos deben ser configurables por tenant.
- **Modificar directamente `HomeBanner.tsx` en una copia del MFE.** Descartada:
  no es configurable por tenant y obliga a mantener un fork.
- **Paquete de marca (`@edx/brand`).** No cubre la imagen ni los textos.

## Referencias

- ADR-0002: mecanismo de entrega (Opción B).
- `openedx/frontend-app-catalog@release/ulmo.3`:
  `src/plugin-slots/HomeBannerSlot/index.tsx`,
  `src/home/components/home-banner/index.scss`.
