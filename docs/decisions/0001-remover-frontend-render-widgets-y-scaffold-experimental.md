# ADR-0001: Remover el enfoque `frontend-render-widgets` y el scaffold experimental

## Estado

Aceptado, *2026-09-23*

## Contexto

`tutor-modern-theming` arrastraba una primera iteración experimental. La entrega de los
componentes React de los MFE se hacía a través de un **repositorio aparte**,
[`eduNEXT/frontend-render-widgets`](https://github.com/eduNEXT/frontend-render-widgets),
que el build del MFE clonaba e instalaba como módulo:

```dockerfile
# patch mfe-dockerfile-post-npm-install (removido)
RUN git clone https://github.com/eduNEXT/frontend-render-widgets.git
RUN npm install ./frontend-render-widgets
RUN npm install @edx/frontend-platform@8.3.4 --force
RUN git clone https://github.com/eduNEXT/modern-theming.git
RUN cd modern-theming && npm install && npm run build-tokens && ...
RUN npm i @edx/brand@file:./modern-theming --force
```

```js
// patch mfe-env-config-runtime-definitions (removido)
const { SlotWidgetHeaderLogo, SlotWidgetFooter, SlotWidgetLearnerDashboardSidebar }
  = require('./frontend-render-widgets/src');
```

Alrededor de eso convivía código no apto para producción:

- Comandos CLI `copy-footer-mfes` / `copy-header-mfes` que **se auto-escribían código
  a `plugin.py`** en tiempo de ejecución e inyectaban HTML legacy en los MFE mediante
  `dangerouslySetInnerHTML`.
- Un comando `enable-legacy-theme` que clonaba `modern-theming` por SSH
  (`git@github.com:...`), sin fijar versión, y corría `npm build` en el host.
- Una función `load_all_plugin_slots()` definida pero **nunca invocada** (los slots no
  llegaban a registrarse), archivos `plugin-slots/*.py` con ids de slot inválidos
  (`footer_slot` en vez de `org.openedx.frontend.layout.footer.v1`) y un patch de prueba
  `mfe-env-config-buildtime-definitions = "let helloWorld = 'Hello World!'"`.

### Problemas del enfoque de dos repositorios (`frontend-render-widgets`)

1. **Skew de versión.** El plugin (`require('SlotWidgetFooter')`) y el repo de widgets
   evolucionaban por separado; renombrar un export en uno rompía al otro, sin ninguna
   garantía de compatibilidad entre commits.
2. **No reproducible.** Los `git clone` apuntaban a `master` sin tag ni SHA, y los
   `npm install ... --force` forzaban versiones. Dos builds del mismo commit del plugin
   podían producir MFE distintos.
3. **Duplicación de dependencias.** Instalar los widgets como módulo arrastraba su propio
   árbol (`react`, `@openedx/paragon`, `@edx/frontend-platform`), con riesgo de duplicar
   React/Paragon respecto al MFE anfitrión — un problema clásico de las librerías de
   componentes de Open edX.
4. **Sobrecarga operativa.** Dos repos, dos ciclos de release, dos CIs, para un footer y
   un header que solo consume este plugin.

### Restricción de producto

Dirección del CTO: **menos repositorios y sin publicar paquetes en npm**. Las
instalaciones de eduNEXT se hacen como el resto: por enlaces de GitHub y ramas/tags
(`pip install git+https://...@<rama>`), no vía registro npm. El enfoque de repo separado
más módulo npm va en contra de esa restricción.

## Decisión

Remover, en este PR base, todo el enfoque `frontend-render-widgets` y el scaffold
experimental, dejando el plugin como un esqueleto limpio e instalable:

- Se elimina el wiring a `frontend-render-widgets` (patches
  `mfe-dockerfile-post-npm-install` y `mfe-env-config-runtime-definitions`).
- Se eliminan los comandos CLI self-modifying, `enable-legacy-theme`, el código muerto
  `load_all_plugin_slots()`, los `plugin-slots/*.py` con ids inválidos, el patch
  `helloWorld` y los patches de comprehensive theming legacy que dependían de clones
  externos sin fijar.
- Los componentes de theming (footer/header) pasarán a **vivir dentro de este mismo
  repositorio** y se entregarán en tiempo de build, sin repositorio de widgets aparte y
  sin publicar en npm. La instalación sigue el modelo GitHub + rama/tag.

El mecanismo concreto de entrega e inyección de esos componentes (inline vía
`ENV_PATCHES` al estilo `tutor-indigo`, u obtención por `ADD` de git al árbol `src/` del
MFE al estilo del plugin de Warrior) se decide en un ADR posterior, junto con el PR que
agrega el footer. Este PR solo remueve.

## Consecuencias

- El plugin queda como skeleton no-op: instala y `tutor config save` corre limpio, sin
  aportar theming todavía. El footer/header llegan en un cambio siguiente sobre esta base.
- Se elimina el skew entre plugin y repo de widgets, la duplicación de dependencias y los
  builds no reproducibles.
- `frontend-render-widgets` queda sin este consumidor. No se archiva en este PR; esa
  decisión es independiente.

## Alternativas consideradas

- **Mantener `frontend-render-widgets`, fijando versiones (tag/SHA) o publicándolo en
  npm.** Descartada. Fijar versiones resuelve la reproducibilidad pero no la sobrecarga
  de dos repos ni el skew, y publicar en npm contradice la restricción del CTO.
- **Dejar el código viejo y solo corregir bugs in situ.** Descartada. Arrastra el enfoque
  que se quiere abandonar y no deja una base limpia para el PR del footer.

## Referencias

- PR: `eduNEXT/tutor-modern-theming#6`
- `eduNEXT/frontend-render-widgets` (enfoque removido)
- `overhangio/tutor-indigo`: theme plugin de referencia, componentes React dentro del
  propio repo del plugin, sin repo de widgets aparte.
- `eduNEXT-collab/cajamar-azimut-project`: `build/plugins/tierratheme.py`,
  `src/themes/tierra/components/TierraFooter.jsx` (mismo patrón, componente in-repo).
