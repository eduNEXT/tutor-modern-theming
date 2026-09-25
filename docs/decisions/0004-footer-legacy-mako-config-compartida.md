# ADR-0004: Footer legacy (Mako) config-driven — una config, dos renderers

## Estado

Aceptado, *2026-09-24*

## Contexto

La queja recurrente de cliente (ver `hosting-heimdall#844`) es la
**inconsistencia** entre el footer legacy (páginas Django/Mako) y el footer de
los MFE. El footer del MFE ya lo cubre este plugin (ADR-0002), pero el legacy
seguía siendo un componente aparte — típicamente una **copia a mano** del footer
por cliente (p. ej. `soa-your-cluster-project` copió el soa-footer a
`edx-platform/overrides/lms/templates/footer.html`).

Se evaluó si `tutor-modern-theming` podía **tomar el JSX del footer, compilarlo
a JS e inyectarlo en legacy** para tener "un solo código".

### Lo que encontramos

1. **Compilar React → JS e inyectarlo en Django es posible pero malo.**
   - *Mount client-side* (bundle + `ReactDOM.render` en el Mako): el componente
     depende de `getConfig()`/`AppContext`/frontend-platform/Paragon/i18n, nada
     de eso existe en la página Django. Habría que bootstrapear todo eso dentro
     del LMS legacy. React embebido en Django, frágil y pesado.
   - *Web Component*: bundlea React en cada página; portales de modales y estilos
     Paragon en shadow DOM traen bugs.
   - *SSR → HTML estático*: pierde el runtime config-driven (multi-tenant se
     rompe).
   - Y va **contra la dirección de Open edX**: upstream está eliminando las
     páginas legacy hacia frontend-base. Sería trabajo desechable.

2. **El dolor real no es "un solo código", es no mantener dos copias a mano.**
   El footer legacy de SOA **ya lee `MFE_CONFIG`** (`footerDomainLinks`,
   `footerSocialLinks`, `LOGO_URL`, …). Es decir, legacy ya puede ser
   config-driven. Lo que faltaba era una fuente de config **compartida** con el
   footer MFE y un **mantenedor único**, en vez de una copia por cliente.

## Decisión

No compilar React a legacy. En su lugar, `tutor-modern-theming` entrega **dos
renderers delgados** que leen las **mismas llaves `FOOTER_*` de `MFE_CONFIG`**:

- **MFE**: `frontend/edunext-footer/` (React), vía `PLUGIN_SLOTS` (ADR-0002).
- **Legacy**: `legacy/footer.html` (Mako), que lee `settings.MFE_CONFIG` con las
  mismas llaves (`FOOTER_LOGO_SRC`, `FOOTER_DESCRIPTION`, `FOOTER_NAV_COLUMNS`,
  `FOOTER_SOCIAL_LINKS`, `FOOTER_EXTRA_LINKS`, `FOOTER_COPYRIGHT`,
  `FOOTER_OPENEDX_LOGO_*`, `FOOTER_EDUNEXT_LOGO_*`, `ENABLE_EDUNEXT_FOOTER`).

Entrega del legacy: igual que el MFE, por `ADD` de este repo por git ref en el
build de la imagen openedx (`openedx-dockerfile-post-git-checkout`), que
sobreescribe el `lms/templates/footer.html` core de edx-platform. Mismo
`MODERN_THEMING_GIT_REF`.

Resultado: **una fuente de verdad** (las llaves `MFE_CONFIG`) y **un mantenedor**
(el plugin, ambas plantillas en el mismo repo). El cliente configura una vez y
obtiene footers consistentes en legacy y MFE, sin copias por cliente.

## Consecuencias

- Es **paridad visual con config compartida**, no "un solo código". El contenido
  es 100% config-driven; la **estructura** (markup) hay que mantenerla en sync
  entre `frontend/edunext-footer/` (React) y `legacy/footer.html` (Mako) cuando
  cambie — pero en un solo repo, un solo PR, no por cliente.
- Sobreescribe el `footer.html` **core**. Un comprehensive theme que traiga su
  propio `footer.html` (p. ej. `bragi`) tiene precedencia; en esos sitios hay que
  quitar el override del theme para que aplique. Documentado.
- Legacy no expone tokens Paragon de forma fiable, así que la paleta del footer
  legacy es autocontenida con override opcional `FOOTER_BACKGROUND_COLOR`. Los
  colores del MFE siguen viniendo de varsify (`--pgn-*`); no hay paridad exacta
  de color entre ambos mundos por diseño de cada stack.
- El flag `ENABLE_EDUNEXT_FOOTER` en legacy oculta el footer (no restaura el
  original, porque el archivo core fue sobreescrito). En MFE sí cae al default.

## Alternativas consideradas

- **Compilar el JSX e inyectarlo en legacy** (mount client-side / web component /
  SSR). Descartada: frágil, cara, y contra la dirección upstream (legacy en
  retirada). Ver contexto.
- **Comprehensive theme propio + `DEFAULT_SITE_THEME`**. Descartada: forzar el
  theme por defecto rompe el theme existente del cliente (`bragi`, etc.).
- **Seguir copiando el footer legacy por cliente.** Descartada: es justo el
  problema (dos copias a mano, inconsistencia).

## Referencias

- ADR-0002 (footer MFE, Opción B) · `hosting-heimdall#844` (queja de
  inconsistencia legacy ↔ MFE).
- Precedente de copia a mano: `soa-your-cluster-project`
  `src/edx-platform/overrides/lms/templates/footer.html` (ya lee `MFE_CONFIG`).
- `overhangio/tutor-indigo` (footer legacy vía comprehensive theming).
