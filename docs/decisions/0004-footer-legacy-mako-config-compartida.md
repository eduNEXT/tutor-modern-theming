# ADR-0004: Footer legacy (Mako) configurado con las mismas llaves que el footer de los MFE

## Estado

Aceptado, 2026-09-24

## Contexto

Las páginas legacy de Open edX (Django/Mako) y los MFE (React) no comparten
código. ADR-0002 resolvió el footer de los MFE; el footer legacy sigue siendo
una plantilla aparte que, en la práctica, se copia y se adapta a mano para cada
cliente (por ejemplo, `soa-your-cluster-project`). Esto produce footers
inconsistentes entre ambos mundos y un costo de mantenimiento por cliente.

Además, los comprehensive themes (por ejemplo, `bragi`) suelen traer su propio
`lms/templates/footer.html`. En la búsqueda de plantillas, el archivo del theme
activo tiene prioridad sobre el de Open edX core, así que reemplazar solo el
archivo de core no tiene efecto en esos sitios.

Requerimientos:

- Una sola fuente de configuración para el footer legacy y el de los MFE.
- Un único responsable de mantener ambas plantillas, en lugar de una copia por
  cliente.
- Si el footer eduNEXT está desactivado para un tenant, ese tenant debe ver el
  footer que tendría sin este plugin: el de su theme (por ejemplo, `bragi`) o el
  de Open edX core.

## Decisión

Mantener dos plantillas en este repositorio, una por tecnología, que leen **las
mismas llaves de `MFE_CONFIG`**:

- MFE: `frontend/edunext-footer/` (React), según ADR-0002.
- Legacy: `legacy/footer.html` (Mako).

La plantilla legacy obtiene `MFE_CONFIG` de la misma forma que el endpoint
`/api/mfe_config/v1`, que alimenta a los MFE: primero la configuración del
tenant (`configuration_helpers`) y, si no existe, los settings de Django.

**Instalación en la imagen.** Durante el build de la imagen `openedx` (patch
`openedx-dockerfile`, después de copiar los themes), cada
`lms/templates/footer.html` presente en la imagen, tanto el de core como el de
cada theme en `/openedx/themes`, se renombra a `footer-original.html` en su
misma carpeta, y la plantilla eduNEXT toma su lugar.

**Comportamiento en ejecución.**

- `ENABLE_EDUNEXT_FOOTER` activado: se muestra el footer eduNEXT.
- `ENABLE_EDUNEXT_FOOTER` ausente o en `false`: la plantilla incluye
  `footer-original.html`. La búsqueda de plantillas lo resuelve igual que
  habría resuelto `footer.html` sin el plugin: el footer del theme activo, el
  de su theme padre o el de core. La plantilla no depende de ningún theme en
  particular.

## Consecuencias

**Positivas**

- Una sola configuración por tenant produce footers equivalentes en páginas
  legacy y MFE.
- Se elimina la copia manual del footer legacy por cliente.
- Funciona con cualquier comprehensive theme incluido en la imagen, y al
  desactivarse respeta el footer propio de cada theme.

**Costos y limitaciones**

- Hay paridad de contenido, no de código: los cambios de estructura (HTML) deben
  replicarse en ambas plantillas, dentro del mismo repositorio y del mismo PR.
- Las páginas legacy no exponen los tokens de Paragon de forma confiable; la
  paleta del footer legacy es propia, con el color de fondo configurable
  (`FOOTER_BACKGROUND_COLOR`).
- Solo cubre themes incluidos en la imagen. Un theme montado en tiempo de
  ejecución (volumen, `tutor dev`) reemplaza los archivos modificados en el
  build.
- Un theme cuyo `main.html` no incluya `footer.html` no recibe el footer.

## Alternativas consideradas

- **Compilar el componente React y cargarlo en las páginas legacy** (montaje en
  el navegador, Web Component o renderizado a HTML estático). Descartada: el
  componente depende de `frontend-platform`, Paragon e i18n, que no existen en
  las páginas legacy; el renderizado estático pierde la configuración por
  tenant; y Open edX está retirando las páginas legacy, por lo que sería una
  inversión de corta vida.
- **Reemplazar solo el `footer.html` de core.** Descartada: los themes con
  footer propio (como `bragi`) tienen prioridad y el cambio no se ve.
- **Comprehensive theme propio definido como theme por defecto
  (`DEFAULT_SITE_THEME`).** Descartada: sustituye el theme existente de cada
  cliente.
- **Mantener una copia del footer legacy por cliente.** Descartada: es la causa
  de la inconsistencia que este cambio busca resolver.

## Referencias

- ADR-0002: footer de los MFE.
- `eduNEXT/hosting-heimdall#844`: diferencias entre footer legacy y MFE.
- `soa-your-cluster-project`: `src/edx-platform/overrides/lms/templates/footer.html`,
  antecedente de footer legacy configurado por `MFE_CONFIG`.
- `openedx/edx-platform`: `lms/djangoapps/mfe_config_api/views.py` (resolución
  de `MFE_CONFIG` por tenant).
