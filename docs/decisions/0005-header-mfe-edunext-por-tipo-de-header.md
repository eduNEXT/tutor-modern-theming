# ADR-0005: Header eduNEXT en los MFE, implementado por tipo de header

## Estado

Aceptado, 2026-09-25. Cubre el header estándar de escritorio; los demás tipos
de header quedan para decisiones posteriores.

## Contexto

Se requiere un header personalizable por tenant en los MFE, con el mismo
enfoque del footer: componente propio, estilos con tokens de Paragon y
configuración por `MFE_CONFIG` (menú principal y enlaces adicionales en el menú
de usuario), conservando el inicio de sesión y el menú de usuario de Open edX.

La librería `frontend-component-header` no tiene un header único, sino tres
tipos con puntos de extensión distintos:

| Tipo | MFE que lo usan | Slot que permite reemplazar el header completo |
|---|---|---|
| Estándar (`Header`) | account, catalog, communications, discussions, gradebook, learner-dashboard, ora-grading, profile | Sí: `header_desktop.v1` (escritorio) y `header_mobile.v1` (móvil) |
| Learning (`LearningHeader`) | learning | No; solo slots parciales (logo, ayuda, menú de usuario) |
| Studio (`StudioHeader`) | authoring | No; slots propios distintos |

El slot `header_desktop.v1` entrega al componente insertado los mismos datos
que recibe el header por defecto (menú, logo, avatar, estado de sesión), y los
datos del usuario autenticado están disponibles en `AppContext`.

## Decisión

Implementar el header por tipo, empezando por el **header estándar de
escritorio**:

- Componente `frontend/edunext-header/` (`EdunextDesktopHeader`), entregado con
  la Opción B (ADR-0002) e insertado en `header_desktop.v1` en los MFE de la
  tabla anterior que usan el header estándar.
- Usa los datos de sesión de `AppContext` y del slot; no reimplementa la
  autenticación.
- Configuración en `MFE_CONFIG`: `HEADER_MAIN_MENU` (menú principal) y
  `HEADER_USER_MENU_EXTRA_LINKS` (enlaces adicionales en el menú de usuario).
- Estilos con tokens de Paragon, personalizables por tenant con varsify.
- `ENABLE_EDUNEXT_HEADER` activa el componente, igual que en el footer y el
  banner: si está ausente o en `false`, se muestra el header de escritorio por
  defecto de Open edX (`DesktopHeader`) con los mismos datos que entrega el
  slot, sin reconstruir la imagen.

Quedan fuera de esta decisión, para ADR posteriores:

- Header estándar móvil (`header_mobile.v1`).
- `LearningHeader` y `StudioHeader`, que solo admiten personalización parcial
  o requieren modificar el componente del MFE.
- Header de las páginas legacy (Mako).

## Consecuencias

**Positivas**

- El header de escritorio de 8 MFE queda configurable por tenant y con un
  diseño consistente.
- Desactivarlo por tenant devuelve el header original de Open edX.
- El inicio de sesión y el menú de usuario siguen dependiendo de Open edX, sin
  lógica duplicada.

**Costos y limitaciones**

- Para mostrar el header por defecto, el componente importa `DesktopHeader`
  desde la carpeta `dist` de `frontend-component-header`, porque la librería no
  lo exporta en su índice. Si una versión futura cambia esa ruta, el import
  debe ajustarse.
- En `learning`, `authoring`, en móvil y en las páginas legacy el header sigue
  siendo el de Open edX, hasta que se tomen las decisiones pendientes.
- El componente se descarga en una carpeta temporal propia durante el build
  para no colisionar con la del footer en los MFE que reciben ambos.

## Alternativas consideradas

- **Un único componente para los tres tipos de header.** No es viable: Learning
  y Studio no tienen un slot que permita reemplazar el header completo.
- **Reimplementar inicio de sesión, avatar y menú de usuario.** Descartada:
  duplica lógica que Open edX ya provee por `AppContext` y por el slot.
- **Personalización solo con CSS.** Permite cambiar colores en los tres tipos,
  pero no permite configurar menús ni la estructura del header. Es
  complementaria, no sustituta.

## Referencias

- ADR-0002: mecanismo de entrega (Opción B).
- `openedx/frontend-component-header`: `src/Header.jsx`,
  `src/plugin-slots/DesktopHeaderSlot`, `src/learning-header/LearningHeader.jsx`.
- `eduNEXT/ednx-saas-themes`: `edx-platform/bragi/lms/templates/header/*`,
  modelo de configuración del header legacy.
