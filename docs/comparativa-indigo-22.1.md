# Comparativa con Tutor Indigo v22.1.0

Fecha: 2026-10-21. Análisis completo en `eduNEXT/hosting-heimdall#891`.

## Conclusión

No se requieren cambios de código ni ADR nuevo. ADR-0002 a ADR-0005 siguen
vigentes.

## Qué cambió en Indigo v22.1.0

- Los MFE cargan el CSS de marca en runtime por `PARAGON_THEME_URLS`
  (`brandOverride`), desde `INDIGO_BRAND_CSS_BASE_URL`. Ya no se instala
  `@edx/brand` con npm en cada imagen.
- Un contenedor `indigo-brand` para `tutor dev` que recompila un fork de
  brand-openedx al guardar.

## Por qué se mantiene la arquitectura

- **Marca en runtime:** este plugin ya la usa desde el inicio. Los colores y la
  tipografía vienen de varsify por `PARAGON_THEME_URLS`, y se configuran por
  tenant. Indigo usa una URL global por instalación.
- **Entrega de componentes (ADR-0002):** Indigo cumplió la condición que el ADR
  dejó para pasar a la Opción A (estilos centralizados en un paquete de marca).
  Se evaluó y se descarta:
  - el SCSS de cada componente tendría que compilarse aparte y servirse por
    URL, separado del componente;
  - esa URL sería `PARAGON_THEME_URLS.core.urls.brandOverride`, que los
    tenants ya usan para la tipografía de varsify (ADR-0004);
  - el banner (`@src` de catalog) y el header (`DesktopHeader`) necesitan el
    componente dentro del código del MFE.
- **Paridad legacy/MFE (ADR-0004):** Indigo usa `INDIGO_PRIMARY_COLOR` para
  LMS/CMS y otra fuente para los MFE. El footer legacy de este plugin lee los
  mismos tokens que los MFE.

## Pendientes fuera de este análisis

- Probar cambios en los componentes requiere reconstruir la imagen del MFE.
- Sin dark mode ni header en learning, Studio y móvil.
- Migración a frontend-base: `eduNEXT/tutor-modern-theming#13`.
