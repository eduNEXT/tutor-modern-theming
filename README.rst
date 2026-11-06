Tutor Modern Theming
====================

⚠️ Warning
----------

This is an ``alpha`` / ``pilot`` version of the plugin. Expect changes and instability.

Overview
--------

``tutor-modern-theming`` is a Tutor plugin by eduNEXT that brings modern,
token-based theming to Open edX Micro-Frontends (MFEs) through the Frontend
Plugin Framework (plugin slots), to the frontend-base site through a
frontend-base app (see `frontend-base site`_), and to legacy Django pages
through Mako templates.

The theme this plugin delivers is called **Cobalt**. The plugin keeps its own
name (``tutor-modern-theming``, settings ``MODERN_THEMING_*``); everything that
belongs to the theme uses the ``COBALT`` namespace:

- ``MFE_CONFIG`` keys: ``ENABLE_COBALT_*`` flags and ``COBALT_FOOTER_*``,
  ``COBALT_HEADER_*`` and ``COBALT_HOME_BANNER_*`` content keys.
- Components: ``frontend/cobalt-footer/`` (``CobaltFooter``),
  ``frontend/cobalt-header/`` (``CobaltDesktopHeader``,
  ``CobaltLearningHeader``) and
  ``frontend/cobalt-home-banner/`` (``CobaltHomeBanner``).
- ``frontend/cobalt-app/``: the frontend-base app (``cobaltApp``) that puts the
  same header and footer on the frontend-base site.
- ``frontend/cobalt-platform/``: the only place that imports platform APIs
  (config, user, analytics, i18n). ``index.js`` wraps frontend-platform for the
  MFEs and ``frontend-base.js`` wraps ``@openedx/frontend-base`` for the site;
  the components are the same on both.
- CSS classes, i18n message ids (``cobalt.*``) and plugin slot widget ids
  (``cobalt_*``).

See `Upgrading from the eduNEXT-named keys`_ if a site still uses the previous
key names.

Compatibility
-------------

Supported and tested with:

- Tutor 21 (Ulmo)
- Tutor 22 (Verawood)

The same release serves both. The frontend-base support only takes effect where
tutor-mfe builds a frontend-base site, i.e. Tutor 22 with at least one
frontend-base app enabled. On Tutor 21, or on Tutor 22 with every frontend-base
app off, its patches have no consumer and the images are built exactly as
before.

Using it together with tutor-indigo
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``tutor-indigo`` (v22.1.0 and later) sets ``PARAGON_THEME_URLS`` at the
settings level to load its brand CSS. A tenant that defines its own
``PARAGON_THEME_URLS`` (for example, the varsify CSS) overrides it, so this
plugin keeps working; tenants without that key get Indigo's brand. See the
`Tutor Indigo v22.1.0 comparison
<https://github.com/eduNEXT/heimdall-notebook/blob/main/explanation/comparativa-tutor-indigo-22.1.md>`_
in heimdall-notebook.

Installation
------------

.. code-block:: bash

    pip install git+https://github.com/eduNEXT/tutor-modern-theming.git@<branch-or-tag>

Enable the plugin and save the configuration:

.. code-block:: bash

    tutor plugins enable tutor-modern-theming
    tutor config save

MFE Footer
----------

The plugin ships a React footer (``frontend/cobalt-footer/``) and injects it
into the ``org.openedx.frontend.layout.footer.v1`` slot of every styled MFE,
hiding the default footer. Delivery uses "Option B" (see
``docs/decisions/0002``): the component is fetched from this repo by git ref at
build time and copied into each MFE source tree, so it compiles through the
MFE's own webpack — SCSS and i18n stay intact — using the MFE's own
react/paragon versions. No separate widget repo, no npm publishing.

Styled MFEs: ``account``, ``catalog``, ``communications``, ``discussions``,
``gradebook``, ``learner-dashboard``, ``learning``, ``ora-grading``,
``profile``. ``catalog`` must be built from its Open edX release branch
(e.g. ``release/ulmo.3``), not ``master``, which uses frontend-base.
(``authoring``/Studio uses a different slot and is a follow-up.)

Source ref of the frontend files
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The image builds fetch the frontend and legacy files of this repo by git ref
(``MODERN_THEMING_GIT_REF``). By default it is the exact commit that pip
installed, so installing the plugin is the only thing to pin:

.. code-block:: bash

    pip install "git+https://github.com/eduNEXT/tutor-modern-theming.git@<branch-tag-or-sha>"
    tutor config save
    tutor images build mfe openedx

The build then uses the same commit as the installed plugin code, even if the
branch moves afterwards. Installs that do not record a commit (release or
editable installs) fall back to ``master``. To force another ref:

.. code-block:: bash

    tutor config save --set MODERN_THEMING_GIT_REF=<tag-or-sha>

Configuration
-------------

The footer reads everything from ``MFE_CONFIG`` via ``getConfig()``. Set the keys
through Tutor settings or per tenant (eox-tenant). The Cobalt footer only
renders when ``ENABLE_COBALT_FOOTER`` is ``true``; every other key is optional,
and when it is missing or empty the footer uses the fallback below. The list
keys (``COBALT_FOOTER_NAV_COLUMNS``, ``COBALT_FOOTER_SOCIAL_LINKS``) fall back
only when missing: an empty list (``[]``) shows no columns or no social icons,
in both the MFE and the legacy footer.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_COBALT_FOOTER``
     - The default Open edX footer is shown instead of the Cobalt footer.
   * - ``COBALT_FOOTER_LOGO_SRC``
     - ``LOGO_TRADEMARK_URL`` (the platform logo).
   * - ``COBALT_FOOTER_LOGO_URL``
     - ``LMS_BASE_URL``.
   * - ``COBALT_FOOTER_LOGO_ALT``
     - Translated text "Platform logo".
   * - ``COBALT_FOOTER_LOGO_TARGET``
     - ``_self``.
   * - ``COBALT_FOOTER_DESCRIPTION``
     - Translated text "Empowering learners everywhere with world-class
       online education."
   * - ``COBALT_FOOTER_NAV_COLUMNS``
     - Three columns (About, Legal, Connect) linking to ``LMS_BASE_URL`` +
       ``/about``, ``/blog``, ``/careers``, ``/news``, ``/tos``, ``/privacy``,
       ``/accessibility``, ``/contact`` and ``/support``. Some of these pages
       may not exist on a given site; set this key in production.
   * - ``COBALT_FOOTER_SOCIAL_LINKS``
     - edX/Open edX accounts on Facebook, X, LinkedIn, Instagram, YouTube
       and GitHub. Set this key in production.
   * - ``COBALT_FOOTER_EXTRA_LINKS``
     - No extra links.
   * - ``COBALT_FOOTER_COPYRIGHT``
     - Translated text "© {current year} eduNEXT. All rights reserved."
   * - ``COBALT_FOOTER_OPENEDX_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - Official "Powered by Open edX" logo, linking to https://open.edx.org/.
   * - ``COBALT_FOOTER_EDUNEXT_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - eduNEXT logo, linking to https://www.edunext.co.

Example of the structured keys, as they go in ``MFE_CONFIG`` (Tutor settings or
the tenant configuration):

.. code-block:: json

   {
     "ENABLE_COBALT_FOOTER": true,
     "COBALT_FOOTER_LOGO_SRC": "https://example.com/static/logo.png",
     "COBALT_FOOTER_LOGO_URL": "https://example.com",
     "COBALT_FOOTER_DESCRIPTION": "Learn anytime, anywhere.",
     "COBALT_FOOTER_NAV_COLUMNS": [
       {
         "title": "About",
         "links": [
           { "txt": "About us", "url": "https://example.com/about" },
           { "txt": "Blog", "url": "https://blog.example.com", "target": "_blank" }
         ]
       },
       {
         "title": "Legal",
         "links": [
           { "txt": "Terms of Service", "url": "https://example.com/tos" },
           { "txt": "Privacy Policy", "url": "https://example.com/privacy" }
         ]
       }
     ],
     "COBALT_FOOTER_SOCIAL_LINKS": [
       { "key": "linkedin", "url": "https://www.linkedin.com/company/example", "label": "LinkedIn" },
       { "key": "github", "url": "https://github.com/example", "label": "GitHub" }
     ],
     "COBALT_FOOTER_EXTRA_LINKS": [
       { "txt": "Accessibility", "url": "https://example.com/accessibility" }
     ],
     "COBALT_FOOTER_COPYRIGHT": "© 2026 Example Inc. All rights reserved."
   }

- ``COBALT_FOOTER_NAV_COLUMNS``: each column has a ``title`` and a list of ``links``.
- Links (``COBALT_FOOTER_NAV_COLUMNS`` and ``COBALT_FOOTER_EXTRA_LINKS``): ``txt`` and ``url``
  are required; ``target`` is optional and defaults to ``_self``.
- ``COBALT_FOOTER_SOCIAL_LINKS``: ``key`` selects the icon and must be one of
  ``facebook``, ``twitter``, ``linkedin``, ``instagram``, ``youtube`` or
  ``github``; ``label`` is the accessible name of the link.

Colors come from Paragon design tokens (``--pgn-color-*``), so per-tenant
varsify variants restyle the footer without touching this plugin.

Legacy (Django/Mako) footer
---------------------------

The plugin also ships a legacy footer (``legacy/footer.html``, Mako) that reads
the **same** ``COBALT_FOOTER_*`` ``MFE_CONFIG`` keys as the React MFE footer. This keeps
legacy Django pages and the MFEs consistent from a single config source — two
thin renderers, one config — without compiling React into Django (see
``docs/decisions/0004``).

It is delivered at openedx image build time (same git-ref delivery as the MFE
side) by **delegation**: every ``lms/templates/footer.html`` in the image — core
and every theme under ``/openedx/themes`` (e.g. ``bragi``) — is renamed to
``footer-original.html`` in place, and the Cobalt footer takes its name.

``ENABLE_COBALT_FOOTER`` is opt-in (same as the MFE footer). When it is off,
the legacy footer includes ``footer-original.html``, which the theme lookup
resolves exactly as ``footer.html`` would have been resolved without this
plugin: the active theme's own footer, its parent's, or Open edX core.

The legacy footer looks the same as the MFE footer: same markup structure, same
defaults and the same Paragon color tokens (``--pgn-color-*``) as
``CobaltFooter.scss``. It loads the tenant's tokens itself from
``MFE_CONFIG["PARAGON_THEME_URLS"]`` (the theme variant, e.g. the varsify CSS),
the same file the MFEs load, so it does not depend on the legacy theme. Only the
variant is loaded; the Paragon ``core`` stylesheet would restyle the legacy page.

Fonts
^^^^^

Paragon splits its tokens in two layers: **core** (typography, spacing, sizes)
and **theme variants** (colors). The MFEs load the variant first and the Paragon
``core`` stylesheet after it, so a variant can change colors but not typography.
A varsify file defines both kinds of tokens, but it is usually registered only
as a variant, so its font never reaches the MFEs: they render Paragon's default
font, and the legacy footer does the same so that both footers match.

To use the tenant's font, register the same file also as the core brand
override in the tenant's ``MFE_CONFIG``. The MFEs load it right after Paragon
``core``, and the legacy footer detects it and uses the same font:

.. code-block:: json

   {
     "PARAGON_THEME_URLS": {
       "core": {
         "urls": {
           "default": "<Paragon core stylesheet URL>",
           "brandOverride": "<varsify CSS URL>"
         }
       },
       "defaults": { "light": "light" },
       "variants": { "light": { "url": "<varsify CSS URL>" } }
     }
   }

This changes the font of every MFE of the tenant, not only the footer.

.. warning::

   Only themes baked into the image are covered: a theme mounted at runtime
   (volume, ``tutor dev``) hides the build-time change. Content parity is
   config-driven; **structure** changes must be kept in sync across both
   renderers (``frontend/cobalt-footer/`` and ``legacy/footer.html``).

Legacy footer configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The legacy footer reads the same ``MFE_CONFIG`` keys as the MFE footer, resolved
the same way as ``/api/mfe_config/v1``: tenant configuration first, Django
settings second. It only renders when ``ENABLE_COBALT_FOOTER`` is ``true``.

Every other ``COBALT_FOOTER_*`` key has the same fallback as in the MFE footer (see
`Configuration`_). The differences are:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_COBALT_FOOTER``
     - The footer the site would show without this plugin: the active theme's
       footer (e.g. ``bragi``), its parent theme's, or the Open edX default.
   * - ``LMS_BASE_URL`` (used by the default logo URL and navigation links)
     - Django's ``LMS_ROOT_URL``.
   * - ``LOGO_TRADEMARK_URL`` (default footer logo)
     - The platform logo, like the MFEs' build-time ``LOGO_TRADEMARK_URL``.
   * - ``PARAGON_THEME_URLS``
     - No theme tokens are loaded; colors fall back to Paragon's defaults.
   * - ``COBALT_FOOTER_BACKGROUND_COLOR`` (legacy only)
     - The same background as the MFE footer, ``--pgn-color-primary-700``. Set
       it only to force a different background on legacy pages.

MFE Home Banner (catalog)
-------------------------

The plugin also ships a custom home banner (``frontend/cobalt-home-banner/``)
and injects it into the catalog MFE's ``org.openedx.frontend.catalog.home_page.banner``
slot, hiding the default banner. Same delivery as the footer (Option B); the
component reuses the catalog MFE's own building blocks via its ``@src`` alias.

Everything customizable comes from ``MFE_CONFIG``, not varsify: varsify cannot
emit the catalog-specific CSS variables. Use varsify only for Paragon colors.
The Cobalt banner only renders when ``ENABLE_COBALT_HOME_BANNER`` is ``true``.

Home banner configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_COBALT_HOME_BANNER``
     - The default catalog banner is shown instead of the Cobalt banner.
   * - ``COBALT_HOME_BANNER_BACKGROUND_IMAGE``
     - The catalog default: no background image.
   * - ``COBALT_HOME_BANNER_BACKGROUND_COLOR``
     - The catalog default: Paragon ``--pgn-color-gray-500``.
   * - ``COBALT_HOME_BANNER_TITLE``
     - Translated text "Welcome to {SITE_NAME}".
   * - ``COBALT_HOME_BANNER_SUBTITLE``
     - Translated text "It works! Powered by the Open edX® Platform".

The search field and the promo video keep the catalog behavior: the search field
shows only when ``ENABLE_COURSE_DISCOVERY`` is ``true``, and the promo video uses
``HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID``.

MFE Header
----------

The plugin ships a Cobalt header (``frontend/cobalt-header/``) in two variants
that share the same chrome (``CobaltHeaderBase``: logo, main menu, Help link,
user menu, Sign in / Register):

- ``CobaltDesktopHeader``, injected into
  ``org.openedx.frontend.layout.header_desktop.v1`` (Wrap of the default) for
  the MFEs that use ``frontend-component-header``'s standard header:
  ``account``, ``catalog``, ``communications``, ``discussions``, ``gradebook``,
  ``learner-dashboard``, ``ora-grading``, ``profile``.
- ``CobaltLearningHeader``, injected into
  ``org.openedx.frontend.layout.header_learning.v1`` in ``learning``. It keeps
  what ``LearningHeader`` needs: the course lockup (org, number and title) in
  place of the main menu, and ``showUserDropdown``.

Not covered yet (see `Roadmap`_): the Studio header (``authoring``) and the
mobile header (``header_mobile.v1``). The frontend-base site gets the desktop
header from ``cobaltApp`` instead (see `frontend-base site`_).

The header reuses the session data from ``AppContext`` (login state, avatar,
username) instead of rebuilding it and keeps the base logged-in / logged-out
buttons.

Both variants show the notifications bell
(``org.openedx.frontend.layout.header_notifications_tray.v1``) before Help, as
the Open edX header does, in the MFEs whose ``frontend-component-header`` has
it (8.2 and later: most Verawood MFEs). With an older header (all of Ulmo;
``catalog``, ``communications`` and ``gradebook`` in Verawood) there is no
bell, and the MFE build prints a ``Module not found`` warning for that optional
import.

Header configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The Cobalt header only renders when ``ENABLE_COBALT_HEADER`` is ``true``.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_COBALT_HEADER``
     - The default Open edX desktop header is shown instead of the Cobalt
       header.
   * - ``COBALT_HEADER_MAIN_MENU``
     - No main menu. The menu the host MFE passes to the header is ignored,
       so MFE and legacy pages render the same links (see `Keeping the MFE
       and legacy headers consistent`_).
   * - ``COBALT_HEADER_USER_MENU_EXTRA_LINKS``
     - User menu with only Dashboard, Profile, Account and Sign Out.
   * - ``LOGO_URL``
     - The logo the host MFE passes to the header.
   * - ``SITE_NAME``
     - The logo alt text the host MFE passes; otherwise "Home".
   * - ``LOGIN_URL`` / ``LOGOUT_URL``
     - ``LMS_BASE_URL`` + ``/login`` / ``/logout``.
   * - ``ACCOUNT_SETTINGS_URL``
     - ``LMS_BASE_URL`` + ``/account/settings``.
   * - ``ACCOUNT_PROFILE_URL``
     - ``PROFILE_MICROFRONTEND_URL``; otherwise ``LMS_BASE_URL``.

Example of the header keys, as they go in ``MFE_CONFIG`` (Tutor settings or the
tenant configuration):

.. code-block:: json

   {
     "ENABLE_COBALT_HEADER": true,
     "COBALT_HEADER_MAIN_MENU": [
       { "txt": "Courses", "url": "https://example.com/courses" },
       { "txt": "Programs", "url": "https://example.com/programs" },
       { "txt": "Blog", "url": "https://blog.example.com", "target": "_blank" }
     ],
     "COBALT_HEADER_USER_MENU_EXTRA_LINKS": [
       { "txt": "My certificates", "url": "https://example.com/certificates" },
       { "txt": "Help center", "url": "https://help.example.com" }
     ]
   }

- ``COBALT_HEADER_MAIN_MENU``: ``txt`` and ``url`` are required; ``target`` is optional
  and defaults to ``_self``.
- ``COBALT_HEADER_USER_MENU_EXTRA_LINKS``: ``txt`` and ``url`` are required. The links
  are added to the user dropdown after Dashboard, Profile and Account, and
  before "Sign Out"; they open in the same tab.

- ``SUPPORT_URL``: the Help link, before the user menu. Not shown if not set.

Keeping the MFE and legacy headers consistent
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

MFE pages and legacy Django pages only show the same header when the Cobalt
header is on and configured in one place. To get the same links everywhere:

1. Set ``ENABLE_COBALT_HEADER: true``. When it is off, each side renders its
   default Open edX header: every MFE shows the menu it builds itself (for
   example ``learner-dashboard`` and ``catalog`` show different links) and the
   legacy pages show the original ``header.html``. Those menus do not match;
   that is the upstream behavior, not a Cobalt bug.
2. Set ``COBALT_HEADER_MAIN_MENU``. It is the only source of the main menu:
   the menu the host MFE passes to the header is ignored on purpose, because
   it is MFE-specific and the legacy pages cannot see it. With the Cobalt
   header on and this key unset, no page shows a main menu.
3. Put both keys (and ``COBALT_HEADER_USER_MENU_EXTRA_LINKS``,
   ``SUPPORT_URL``) in ``MFE_CONFIG``: the tenant site configuration
   (eox-tenant) or, as the fallback, the ``MFE_CONFIG`` Django setting. The
   legacy header resolves it the same way as the MFE config API
   (``/api/mfe_config/v1``) that feeds the MFEs. A value set only in an MFE's
   build-time environment is not seen by the legacy pages.

Expected differences: the ``learning`` MFE and legacy course pages show the
course lockup instead of the main menu, and MFEs outside the list above
(``authoring``, the mobile header) keep the default Open edX header.

Colors come from Paragon design tokens (``--pgn-color-*``), varsify per tenant,
same as the footer.

Legacy (Django/Mako) header
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Same approach as the `Legacy (Django/Mako) footer`_: ``legacy/header/header.html``
reads the same ``COBALT_HEADER_*`` keys and renders the same markup and tokens
as the React header, so legacy Django pages match the MFEs. On course pages it
shows the course lockup, like ``CobaltLearningHeader``.

At openedx image build time every ``lms/templates/header/header.html`` (core and
every theme under ``/openedx/themes``) is renamed to ``header-original.html``
in place and the Cobalt header takes its name. When ``ENABLE_COBALT_HEADER`` is
off, it includes ``header/header-original.html``, resolved by the theme lookup.
The same warning applies: themes mounted at runtime hide the build-time change,
and structure changes must be kept in sync across ``frontend/cobalt-header/``
and ``legacy/header/header.html``.

frontend-base site
------------------

From Verawood, tutor-mfe builds a single frontend-base **site** besides the
legacy MFEs. Every frontend-base app enabled in tutor-mfe (``instructor-dashboard``
in Verawood; ``authn``, ``learner-dashboard``, ``catalog`` and others from Willow)
runs inside that site, and the header and footer belong to the site's shell, not
to each app. FPF slots do not exist there, so Cobalt ships as its own
frontend-base app, ``cobaltApp`` (``frontend/cobalt-app/``), registered in the
site with ``addApp``.

``cobaltApp`` REPLACEs two shell widgets with the same components the MFEs use:

.. list-table::
   :header-rows: 1
   :widths: 25 40 35

   * - Part
     - Shell slot / widget replaced
     - Flag
   * - Desktop header
     - ``org.openedx.frontend.slot.header.desktop.v1`` /
       ``org.openedx.frontend.widget.header.desktopLayout.v1``
     - ``ENABLE_COBALT_HEADER``
   * - Footer
     - ``org.openedx.frontend.slot.footer.desktop.v1`` /
       ``org.openedx.frontend.widget.footer.desktopLayout.v1``
     - ``ENABLE_COBALT_FOOTER``

Because the shell is shared, this covers **every app in the site**: an app that
tutor-mfe adds later gets the Cobalt header and footer with no change to this
plugin. It is the opposite of the MFEs, where each one is listed in
``plugin.py``.

Behavior:

- **Flag off**: each operation has a ``condition.callback`` on its flag, read on
  every render. frontend-base drops an operation whose condition is not met
  before applying any, so the shell's own header or footer renders. Nothing from
  Open edX is imported as a fallback.
- **Mobile** (below 768px, the shell's breakpoint): the Cobalt header hides
  itself and the shell's mobile header shows, as in the MFEs, where Cobalt only
  fills ``header_desktop.v1``.
- **Chromeless routes** (e.g. login): apps that ask the shell for no header and
  footer get none, Cobalt included.
- **Landmarks**: the shell already wraps the header in ``<header><nav>`` with a
  skip link, so on the site the Cobalt header renders a ``div`` and no skip link.
- **Widgets from other apps**: replacing the desktop layout also replaces the
  ``header.desktopLeft.v1`` and ``header.desktopRight.v1`` slots, where other
  apps add widgets (e.g. the bell of the notifications app). The Cobalt header
  renders both slots without the shell's own widgets, so those widgets still
  show, in the same order, next to the Cobalt menu and before Help.

Site configuration
^^^^^^^^^^^^^^^^^^

Same keys and fallbacks as the MFE header and footer (see `Configuration`_ and
`Header configuration and fallbacks`_). The site reads them from
``/api/frontend_site_config/v1/``, which turns the ``MFE_CONFIG`` of the
current tenant into the site config:

- ``ENABLE_COBALT_*``, ``COBALT_*``, ``SUPPORT_URL`` and the other keys it does
  not know end up in ``commonAppConfig``, which ``getAppConfig()`` merges into
  ``cobaltApp``'s config. Per tenant, as in the MFEs.
- ``LMS_BASE_URL``, ``STUDIO_BASE_URL``, ``LOGIN_URL``, ``LOGOUT_URL``,
  ``LOGO_URL``, ``SITE_NAME`` and ``BASE_URL`` move to the site config
  (``lmsBaseUrl``, ``headerLogoImageUrl``, ...). ``cobalt-platform/frontend-base.js``
  maps them back to the MFE names, so the components read the same keys.

Build
^^^^^

Nothing to configure: the same ``tutor images build mfe`` builds it.

- ``mfe-dockerfile-pre-npm-build-site`` fetches this repo at
  ``MODERN_THEMING_GIT_REF`` and runs ``frontend/install-site.sh src/cobalt``,
  which copies the app, the components the site can use and the frontend-base
  platform layer. The MFE-only wrappers (``CobaltFooter.jsx``,
  ``CobaltDesktopHeader.jsx``, ``CobaltLearningHeader.jsx``) are not copied:
  they import ``frontend-component-header``/``-footer``, which the site does not
  have.
- ``mfe-site-config-imports-production`` and ``mfe-site-config-production``
  register the app in ``site.config.build.tsx``. Only the production patches
  are used: the dev site (``tutor dev``) does not run the Dockerfile patch, so
  it has no ``src/cobalt``.

Local development
^^^^^^^^^^^^^^^^^

To work on the app against a frontend-base checkout (an app repo such as
``frontend-app-instructor-dashboard``, or a site):

.. code-block:: bash

    make dev-site-sync SITE=<path to the checkout>

It copies the same files as the build into ``<checkout>/src/cobalt`` with
``install-site.sh`` and keeps them in sync. Then, in the checkout's
``site.config.dev.tsx``, import ``cobaltApp`` from ``./src/cobalt/cobalt-app``,
add it to ``apps`` and set ``runtimeConfigJsonUrl`` to the LMS
``/api/frontend_site_config/v1/`` so the ``COBALT_*`` keys arrive. Keep
``src/cobalt/`` and ``.cobalt-sync/`` out of git (``.git/info/exclude``).

Not covered yet: the mobile header and the catalog home banner (see
`Roadmap`_).

Upgrading from the eduNEXT-named keys
-------------------------------------

Earlier versions used keys without a theme namespace. They are not read any
more; rename them in the Tutor settings and in every tenant configuration
(eox-tenant) before rebuilding the images:

.. list-table::
   :header-rows: 1
   :widths: 50 50

   * - Before
     - Now
   * - ``ENABLE_EDUNEXT_FOOTER``
     - ``ENABLE_COBALT_FOOTER``
   * - ``ENABLE_EDUNEXT_HEADER``
     - ``ENABLE_COBALT_HEADER``
   * - ``ENABLE_EDUNEXT_HOME_BANNER``
     - ``ENABLE_COBALT_HOME_BANNER``
   * - ``FOOTER_*`` (e.g. ``FOOTER_LOGO_SRC``, ``FOOTER_NAV_COLUMNS``)
     - ``COBALT_FOOTER_*`` (e.g. ``COBALT_FOOTER_LOGO_SRC``)
   * - ``HEADER_MAIN_MENU`` / ``HEADER_USER_MENU_EXTRA_LINKS``
     - ``COBALT_HEADER_MAIN_MENU`` / ``COBALT_HEADER_USER_MENU_EXTRA_LINKS``
   * - ``HOME_BANNER_*`` (e.g. ``HOME_BANNER_TITLE``)
     - ``COBALT_HOME_BANNER_*`` (e.g. ``COBALT_HOME_BANNER_TITLE``)

The standard Open edX keys the theme also reads (``LMS_BASE_URL``,
``LOGO_URL``, ``LOGO_TRADEMARK_URL``, ``SITE_NAME``, ``PARAGON_THEME_URLS``,
etc.) keep their names. ``MODERN_THEMING_GIT_REF`` is a plugin setting and also
keeps its name.

Roadmap
-------

- Studio header (``authoring``, ``StudioHeader``) for Ulmo and Verawood.
- Mobile header: ``header_mobile.v1`` in the MFEs and the shell's mobile layout
  on the frontend-base site.
- Catalog home banner on the frontend-base site (catalog moves to frontend-base
  in Willow), without depending on catalog internals.

Contributing
------------

- Fork the repository.
- Create a feature branch.
- Submit a pull request.

License
-------

See ``pyproject.toml`` for the current license declaration.
