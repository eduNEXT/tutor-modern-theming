# ADR-0006: Nombre del tema (Cobalt) y namespace de variables

## Estado

Aceptado, 2026-10-21. Reemplaza los nombres de llaves, componentes y archivos
definidos en ADR-0002 a ADR-0005; el resto de esas decisiones sigue vigente.

## Contexto

"Modern Theming" describe lo que hace el plugin, pero no es un nombre de tema.
Además, el código usaba dos convenciones sin namespace de tema:

- Llaves de `MFE_CONFIG` con el nombre de la organización
  (`ENABLE_EDUNEXT_FOOTER`, `ENABLE_EDUNEXT_HEADER`,
  `ENABLE_EDUNEXT_HOME_BANNER`) o genéricas (`FOOTER_*`, `HEADER_*`,
  `HOME_BANNER_*`), que pueden chocar con llaves de Open edX, de otros plugins
  o de otros temas.
- Componentes, carpetas, clases CSS e ids de i18n con el nombre de la
  organización (`EdunextFooter`, `frontend/edunext-footer/`, `.edunext-header`,
  `edunext.header.*`).

Con el Product Manager se eligió **Cobalt** (eduNEXT/hosting-heimdall#890):
sigue el orden alfabético de los temas anteriores (Aegir, Bragi), es fácil de
escribir y pronunciar, y el azul cobalto está en la paleta de eduNEXT.

## Decisión

Distinguir el plugin del tema que entrega:

- **Plugin**: conserva su nombre. Repositorio y paquete `tutor-modern-theming`,
  módulo `tutor_modern_theming`, y sus settings de Tutor
  (`MODERN_THEMING_GIT_REF`, `TUTOR_MODERN_THEMING_VERSION`).
- **Tema (Cobalt)**: todo lo que pertenece al tema usa el namespace `COBALT`:

| Elemento | Antes | Ahora |
|---|---|---|
| Flags de `MFE_CONFIG` | `ENABLE_EDUNEXT_FOOTER`, `_HEADER`, `_HOME_BANNER` | `ENABLE_COBALT_FOOTER`, `_HEADER`, `_HOME_BANNER` |
| Contenido del footer | `FOOTER_*` | `COBALT_FOOTER_*` |
| Contenido del header | `HEADER_MAIN_MENU`, `HEADER_USER_MENU_EXTRA_LINKS` | `COBALT_HEADER_MAIN_MENU`, `COBALT_HEADER_USER_MENU_EXTRA_LINKS` |
| Contenido del banner | `HOME_BANNER_*` | `COBALT_HOME_BANNER_*` |
| Componentes | `EdunextFooter`, `EdunextDesktopHeader`, `EdunextHomeBanner` | `CobaltFooter`, `CobaltDesktopHeader`, `CobaltHomeBanner` |
| Carpetas | `frontend/edunext-*` | `frontend/cobalt-*` |
| Clases CSS | `.edunext-header`, `.ehd-*`, `#footer-edunext`, `.ef-*` | `.cobalt-header`, `.chd-*`, `#footer-cobalt`, `.cf-*` |
| Ids de i18n | `edunext.*`, `footer.*` | `cobalt.*` |
| Ids de widget en los slots | `modern_theming_*` | `cobalt_*` |

Se mantienen sin cambio:

- Las llaves estándar de Open edX que el tema también lee (`LMS_BASE_URL`,
  `LOGO_URL`, `LOGO_TRADEMARK_URL`, `SITE_NAME`, `PARAGON_THEME_URLS`, etc.).
- Las referencias a la marca eduNEXT como contenido: el logo "powered by"
  (ahora `COBALT_FOOTER_EDUNEXT_LOGO_*`) y el copyright por defecto.

No se leen las llaves anteriores como respaldo: el tema está en piloto y el
cambio se hace de una vez.

## Consecuencias

**Positivas**

- Las llaves del tema no chocan con las de Open edX ni con las de otros temas.
- Un futuro tema puede convivir con Cobalt usando su propio namespace.
- El código ya no mezcla el nombre de la organización con el nombre del tema.

**Negativas**

- Cambio incompatible: los sitios que ya configuran las llaves anteriores
  (settings de Tutor o tenants en eox-tenant) deben renombrarlas antes de
  reconstruir las imágenes, o verán el footer, el header y el banner por
  defecto. El README incluye la tabla de migración.
- Los ADR anteriores conservan los nombres de su momento; este ADR es la
  referencia para los nombres actuales.
