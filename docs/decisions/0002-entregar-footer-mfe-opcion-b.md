# ADR-0002: Entregar el footer MFE con "Opción B" (componente in-repo copiado al árbol del MFE)

## Estado

Aceptado, *2026-09-23*

## Contexto

Open edX renderiza el footer en dos mundos que **no comparten código**:

- **Legacy** (páginas Django/Mako): comprehensive theming, `footer.html`.
- **MFE** (apps React): un componente React inyectado en un plugin slot.

El cliente ve footers distintos entre páginas legacy y MFE porque la config del
tenant (`footer_*`) alimenta solo el footer legacy; el componente del MFE no lee
esas llaves y muestra su footer por defecto (ver investigación en
`eduNEXT/hosting-heimdall#844`). No es un bug: es la arquitectura. La única vía a
paridad en el MFE es un componente React propio inyectado por `PLUGIN_SLOTS`.
No existe "un solo código" que renderice ambos mundos; lo máximo alcanzable es
**paridad visual** con dos plantillas que leen la misma config.

Ya teníamos un footer MFE maduro (token-driven Paragon, varsify-compatible,
i18n, analytics, config por `MFE_CONFIG`) probado localmente en
`frontend-app-learner-dashboard` vía `env.config.jsx`. Faltaba decidir **dónde
hospedarlo y cómo inyectarlo** para instalarlo en todos los clientes de forma
estándar.

### Lo que encontramos por el camino

1. **`tutor-indigo` es el referente canónico** de esta meta: un plugin pip que
   tematiza legacy y MFE en un solo repo, con los componentes React dentro del
   propio repo (`tutorindigo/components/*.jsx`). `tierratheme.py` de Cajamar es
   ese mismo patrón. No hay que inventar arquitectura.

2. **Indigo entrega los componentes con "Opción A": inline vía `ENV_PATCHES`.**
   Lee cada `.jsx`, lo agrega como patch nombrado por archivo, y lo referencia
   con `{{ patch("Componente.jsx") }}` en `mfe-env-config-runtime-definitions`,
   más un patch de imports. Cajamar hace lo mismo.

3. **Indigo evita el problema del SCSS por diseño**: sus componentes MFE **no**
   importan `.scss` externo; el estilo llega del paquete `@edx/brand` (Paragon
   tokens) y algo inline. Por eso el inline (A) le funciona limpio.

4. **La Opción A obliga a aplanar** nuestro componente. Al inlinear el `.jsx`
   como string en `env.config.jsx` no hay resolución de módulos para sus imports
   locales: `import './EdunextFooter.scss'` y `import messages from './messages'`
   se rompen. El SCSS habría que volverlo un bloque `<style>` inline y el i18n
   (`messages.js`) se pierde para la extracción de traducciones (que no escanea
   `env.config.jsx`). Los imports npm (react, paragon, frontend-platform) sí
   funcionan en A vía el patch de imports.

5. **La Opción B (estilo Warrior) conserva el multi-archivo intacto.** Un patch
   de Dockerfile obtiene el repo por git y copia el componente al `src/` del MFE
   **antes** de `npm run build`; webpack del MFE lo compila como cualquier módulo
   → el `sass-loader` corre y el `.scss` + `messages.js` sobreviven sin tocar
   nada. Además compila contra el `react`/`paragon` **del propio MFE**, evitando
   duplicados.

6. **Convivencia con proyectos que ya poseen `env.config.jsx`** (SOA/azimut, que
   hacen `COPY` wholesale del archivo): la **entrega** (copiar al `src/`) es
   siempre aditiva y no choca; el **wiring** del slot compite por el dueño del
   `env.config.jsx`. Regla: un solo dueño por `env.config.jsx` de cada MFE y un
   solo footer por slot. En proyectos wholesale, el plugin solo entrega y el
   override del proyecto hace el wiring.

7. **Restricción del CTO**: menos repositorios y sin publicar en npm; instalar
   por enlace de GitHub + rama/tag. Esto descartó el repo separado
   `frontend-render-widgets` (ver ADR-0001) y el `npm publish`.

8. **Orden del template `env.config.jsx` de tutor-mfe** (v21 y v22): dentro de
   `setConfig()`, el patch `mfe-env-config-runtime-definitions-<app>` se emite
   **antes** de los `addPlugins()` de ese app, con `DIRECT_PLUGIN` /
   `PLUGIN_OPERATIONS` ya en scope. Es decir: un `require()` que define
   `EdunextFooter` y, a continuación, el slot que lo referencia — sin
   temporal-dead-zone.

## Decisión

Hospedar el footer **dentro de este repo** (`frontend/edunext-footer/`, un solo
repo, sin npm) y entregarlo con **Opción B** por cada MFE con `footer.v1`:

1. **Delivery** — patch `mfe-dockerfile-pre-npm-build-<mfe>`:
   `ADD --keep-git-dir=true <este-repo>#{{ MODERN_THEMING_GIT_REF }}` y
   `cp -r .../frontend/edunext-footer src/edunext-footer`.
2. **Definición** — patch `mfe-env-config-runtime-definitions-<mfe>`:
   `const EdunextFooter = require('./src/edunext-footer').default;`
   (`require`, no import top-level, porque `env.config.jsx` es compartido).
3. **Wiring** — `PLUGIN_SLOTS.add_item((mfe, "org.openedx.frontend.layout.footer.v1", <Hide default + Insert EdunextFooter>))`,
   el API estándar de tutor-mfe (mismo que indigo). El orden del template
   garantiza que la definición precede al registro.

`MODERN_THEMING_GIT_REF` (default `master`) selecciona el ref; en producción se
fija a un tag/SHA para builds reproducibles. `ENABLE_EDUNEXT_FOOTER` (default
`True`) es un kill-switch por tenant que cae al footer default sin rebuild.

Se aplican dos correcciones al componente traído del piloto: el flag estaba
invertido (`if (cfg?.ENABLE_EDUNEXT_FOOTER)` → `if (!cfg?.ENABLE_EDUNEXT_FOOTER)`)
y un `useMemo` corría después de un `return` condicional (violación de rules of
hooks); ahora todos los hooks corren antes del early return.

### Por qué B y no A, por ahora

- Conserva el componente **ordenado y multi-archivo** (`.jsx` + `.scss` +
  `messages.js`) y el **i18n** intacto — lo que A rompería.
- **No vamos a hacer un `@edx/brand` package todavía**, que es justo la pieza que
  hace que A brille (mover el estilo a tokens del brand). Sin ese paquete, el
  SCSS local es la forma ordenada de estilar y B lo respeta.
- Compila contra el `react`/`paragon` del MFE anfitrión → sin duplicados.
- Cumple la restricción del CTO: 1 repo, sin npm, instalación por GitHub + ref.

## Consecuencias

- Un `ADD` de git por MFE (8 MFEs). El repo debe ser alcanzable en build
  (público, o proveer credenciales) y conviene fijar `MODERN_THEMING_GIT_REF`.
- `authoring`/Studio (slot `studio_footer.v1`) y el header quedan para follow-up.
- No es el patrón "oficial" (indigo usa A); es una variante válida (Warrior) que
  respeta nuestras restricciones actuales.
- Migración futura a A queda abierta: cuando exista un `@edx/brand` package y el
  texto sea config-driven, se puede pasar a inline estilo indigo. El wiring del
  slot y la lista de MFEs no cambian; el refactor es local al componente.

## Alternativas consideradas

- **Opción A (inline `ENV_PATCHES`, patrón indigo/Cajamar).** Es el estándar
  upstream y evita el `ADD` por MFE, pero exige aplanar el componente (SCSS →
  `<style>`, perder la extracción i18n) y rinde mejor con un brand package que
  hoy no haremos. Diferida.
- **Repo separado `frontend-render-widgets` instalado como módulo npm.**
  Descartada en ADR-0001 (skew de versión, clones sin pin, duplicación de deps,
  y va contra "menos repos / sin npm").
- **Mutar `config.pluginSlots` a mano en el patch runtime** en vez de usar
  `PLUGIN_SLOTS`. Descartada: `PLUGIN_SLOTS` es el API soportado y el template ya
  emite el `addPlugins()` en el orden correcto.

## Referencias

- PR base: `eduNEXT/tutor-modern-theming#6` · ADR-0001 (remoción de
  `frontend-render-widgets`).
- Investigación: `eduNEXT/hosting-heimdall#844` (gap legacy ↔ MFE).
- `overhangio/tutor-indigo` (Opción A canónica) ·
  `overhangio/tutor-mfe` `templates/mfe/build/mfe/env.config.jsx` (orden del
  template, v21/v22).
- `eduNEXT-collab/cajamar-azimut-project`: `build/plugins/tierratheme.py`,
  `src/themes/tierra/components/TierraFooter.jsx`.
- Patrón de delivery por `ADD` git: `warrior-azimut-project`
  `build/plugins/warrior-learner-dashboard-plugin.py`.
