# ADR-0002: Entrega del footer de los MFE como componente copiado al código fuente de cada MFE

## Estado

Aceptado, 2026-09-23

## Contexto

Open edX renderiza el footer con dos tecnologías independientes: las páginas
legacy (Django/Mako) y los micro-frontends (MFE, React). La configuración de
footer de cada tenant solo llega al footer legacy; los MFE muestran el footer
por defecto de Open edX. El resultado es que un mismo usuario ve dos footers
distintos dentro de la plataforma (`hosting-heimdall#844`).

Para personalizar el footer de los MFE hay que insertar un componente React
propio en el slot `org.openedx.frontend.layout.footer.v1`, usando el mecanismo
`PLUGIN_SLOTS` de tutor-mfe. Hay dos formas de llevar el código de ese
componente al build de cada MFE:

- **Opción A, código en línea.** El plugin lee el archivo `.jsx` y lo inserta
  como texto dentro de `env.config.jsx` mediante patches de Tutor. Es el patrón
  que usa `tutor-indigo`. Como el código queda embebido en un solo archivo, no
  puede importar otros archivos locales: los estilos (`.scss`) y los textos
  traducibles (`messages.js`) no se pueden usar.
- **Opción B, componente copiado al código fuente.** Durante el build de la
  imagen, el plugin descarga este repositorio y copia la carpeta del componente
  dentro de `src/` del MFE, antes de `npm run build`. El MFE lo compila como
  cualquier módulo propio: con sus estilos, sus traducciones y las mismas
  versiones de React y Paragon que usa el MFE.

Requerimientos que condicionan la decisión:

- **Gobernanza de repositorios:** minimizar la cantidad de repositorios y no
  publicar paquetes en npm. Los plugins se instalan desde GitHub por rama o tag.
- El componente está organizado en varios archivos: JSX, estilos SCSS basados en
  tokens de Paragon y mensajes de i18n.

## Decisión

Alojar el componente en este repositorio (`frontend/edunext-footer/`) y
entregarlo con la **Opción B** a cada MFE que expone `footer.v1`: `account`,
`catalog`, `communications`, `discussions`, `gradebook`, `learner-dashboard`,
`learning`, `ora-grading` y `profile`.

Para cada MFE, el plugin registra:

1. Patch `mfe-dockerfile-pre-npm-build-<mfe>`: descarga este repositorio en la
   referencia `MODERN_THEMING_GIT_REF` y copia el componente a
   `src/edunext-footer`.
2. Patch `mfe-env-config-runtime-definitions-<mfe>`: carga el componente en
   `env.config.jsx`.
3. Entrada en `PLUGIN_SLOTS`: oculta el contenido por defecto del slot e inserta
   `EdunextFooter`.

El contenido se configura por tenant con las llaves `FOOTER_*` de `MFE_CONFIG`.
La llave `ENABLE_EDUNEXT_FOOTER` activa el componente: si está ausente o en
`false`, se muestra el footer por defecto de Open edX, sin reconstruir la imagen.

## Consecuencias

**Positivas**

- El componente conserva su estructura (JSX, SCSS y traducciones) y se compila
  con las dependencias del propio MFE, sin duplicar React ni Paragon.
- Un solo repositorio y ninguna publicación en npm.
- Activar o desactivar el footer por tenant no requiere un nuevo build.

**Costos y limitaciones**

- Cada MFE descarga este repositorio durante el build. El repositorio debe ser
  accesible desde el entorno de build, y en producción conviene fijar
  `MODERN_THEMING_GIT_REF` a un tag o commit para que el build sea reproducible.
- En proyectos que reemplazan por completo el `env.config.jsx` de un MFE, el
  registro del slot debe hacerse en el archivo del proyecto; el plugin solo
  entrega el componente.
- Studio (`authoring`) usa un slot distinto (`studio_footer.v1`) y no está
  cubierto por esta decisión.

## Alternativas consideradas

- **Opción A, código en línea (patrón de `tutor-indigo`).** Evita la descarga
  del repositorio por MFE, pero obliga a reunir el componente en un solo
  archivo, mover los estilos a un bloque `<style>` y dejar los textos fuera de
  la extracción de traducciones. Queda como evolución posible dentro de una
  estrategia de adopción incremental: si en el futuro los estilos se
  centralizan en un paquete de marca (`@edx/brand`), el componente puede
  migrarse a la Opción A sin cambiar el registro del slot.
- **Repositorio independiente publicado en npm (`frontend-render-widgets`).**
  Descartada por los requerimientos de gobernanza de repositorios (ver
  ADR-0001).

## Referencias

- ADR-0001: remoción de `frontend-render-widgets`.
- `eduNEXT/hosting-heimdall#844`: diferencias entre footer legacy y MFE.
- `overhangio/tutor-indigo`: implementación de referencia de la Opción A.
- `overhangio/tutor-mfe`: `templates/mfe/build/mfe/env.config.jsx`.
- `warrior-azimut-project`: `build/plugins/warrior-learner-dashboard-plugin.py`,
  antecedente de la Opción B.
