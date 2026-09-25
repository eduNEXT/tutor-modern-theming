# ADR-0005: Header eduNEXT en los MFE — por tipo de header

## Estado

Aceptado (parcial: header estándar desktop), *2026-09-25*

## Contexto

Se quería el mismo patrón del footer para el header: un componente eduNEXT
config-driven por `MFE_CONFIG`, con Paragon, on/off y links configurables,
reusando los botones base (login / usuario logueado) y permitiendo agregar
opciones al dropdown de usuario. Referencia del modelo de config: el header
legacy `bragi` usa `theming.options('header', 'header_links' / 'header_top' /
'header_langselector')`.

### Lo que encontramos (por qué el header NO es one-shot como el footer)

`frontend-component-header` expone **tres headers distintos**, cada uno con su
propia superficie de slots:

1. **Standard** (`DesktopHeader` + `MobileHeader`) — lo usan la mayoría de MFE
   (account, profile, discussions, gradebook, communications, ora-grading,
   learner-dashboard, authn). **Sí** tiene slots de header completo:
   `header_desktop.v1` y `header_mobile.v1` (Hide default + Insert), como el
   footer pero ×2 (desktop y mobile).
2. **LearningHeader** — el MFE `learning` (courseware). **No** hay slot de header
   completo; solo granulares (`header_learning_user_menu.v1`, `LearningLogoSlot`,
   `LearningHelpSlot`, `LearningHeaderActionsSlot`).
3. **StudioHeader** — `authoring`. Superficie de slots propia, distinta.

Además, `header_desktop.v1` (`DesktopHeaderSlot`) usa `mergeProps: true` y pasa
al widget insertado los mismos props que recibe `DesktopHeader` (mainMenu,
userMenu, avatar, loggedIn, logo…). Y la data de auth está en `AppContext`
(`authenticatedUser`), igual que la usa `LearningHeader`.

## Decisión

Cubrir el header **por tipo**, empezando por el caso con slot completo:

- **Standard desktop (este cambio)**: `frontend/edunext-header/` con
  `EdunextDesktopHeader`, inyectado en `header_desktop.v1` (Hide default +
  Insert) vía Opción B (ADR-0002), en los MFE que usan el header estándar.
  El componente:
  - Lee la auth de `AppContext` (login state, username, avatar) — **no**
    reconstruye la lógica de sesión; reusa lo que ya existe.
  - Reusa `props.mainMenu` del slot si el MFE lo pasó; `MFE_CONFIG.HEADER_MAIN_MENU`
    tiene precedencia.
  - Botones base: usuario logueado → dropdown Paragon (Dashboard / Profile /
    Account / Sign Out) con extras de `MFE_CONFIG.HEADER_USER_MENU_EXTRA_LINKS`;
    anónimo → botones Sign in / Register (Paragon).
  - Estilos en `EdunextHeader.scss` con tokens Paragon (`--pgn-*`), varsify por
    tenant, igual que `EdunextFooter.scss`.
  - Kill-switch `MFE_CONFIG.ENABLE_EDUNEXT_HEADER` (default `True`): en `False`
    renderiza los elementos base en modo plano (sin chrome/extras eduNEXT).

Pendiente (follow-ups, este ADR se ampliará):
- **Mobile** del header estándar (`header_mobile.v1`) — mismo patrón.
- **LearningHeader** y **StudioHeader** — sin slot completo: se cubren con slots
  granulares (logo, user-menu extras) o, para reshape total, con override de JSX
  (más frágil, acoplado a versión). Decisión pendiente por-header.

## Consecuencias

- El header estándar (desktop) de ~7 MFE queda config-driven y consistente,
  reusando la auth base. Learning/Studio/mobile todavía no.
- Kill-switch imperfecto: desde dentro del slot no se puede renderizar el header
  default del paquete (recursaría), así que "apagado" = render plano de nuestro
  componente, no el header stock exacto. Documentado.
- El delivery clona el repo a un `/tmp` propio (`-header`) para no colisionar con
  el `ADD` del footer en los MFE compartidos.
- Legacy (Mako) del header queda **fuera de este cambio** por decisión de alcance
  (esta etapa es solo JSX).

## Alternativas consideradas

- **Un solo componente para reemplazar los 3 headers.** Imposible: son tres
  componentes con superficies de slot distintas; learning/studio no tienen slot
  de header completo.
- **Reconstruir la auth (login/avatar/user-menu) desde cero.** Descartada:
  frágil; `AppContext` + los props del slot ya la proveen.
- **Skin solo por CSS (como SOA)** para los 3 uniformemente. Válido para color,
  pero no permite reshape ni links configurables por menú. Complementario, no
  sustituto.

## Referencias

- ADR-0002 (Opción B, footer) · ADR-0004 (una config, varios renderers).
- `openedx/frontend-component-header`: `desktop-header/DesktopHeader.jsx`,
  `learning-header/LearningHeader.jsx`, `plugin-slots/DesktopHeaderSlot`,
  `plugin-slots/*` (slots de header).
- `eduNEXT/ednx-saas-themes` `edx-platform/bragi/lms/templates/header/*`
  (modelo de config `theming.options`).
- Precedente híbrido: `soa-your-cluster-project/prod` (CSS skin + inserción por
  slot + override JSX de Studio + Mako legacy).
