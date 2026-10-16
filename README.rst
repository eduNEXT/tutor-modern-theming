Tutor Modern Theming
====================

⚠️ Warning
----------

This is an ``alpha`` / ``pilot`` version of the plugin. Expect changes and instability.

Overview
--------

``tutor-modern-theming`` is a Tutor plugin by eduNEXT that brings modern,
token-based theming to Open edX Micro-Frontends (MFEs) through the Frontend
Plugin Framework (plugin slots).

This is the base skeleton: it installs cleanly and exposes the standard Tutor
plugin surface (config defaults, template rendering, patch loading). The
theming components (footer/header MFE slot widgets) are added in follow-up
changes.

Compatibility
-------------

Supported and tested with:

- Tutor 21 (Ulmo)
- Tutor 22 (Verawood)

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

The plugin ships a React footer (``frontend/edunext-footer/``) and injects it
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
through Tutor settings or per tenant (eox-tenant). The eduNEXT footer only
renders when ``ENABLE_EDUNEXT_FOOTER`` is ``true``; every other key is optional,
and when it is missing or empty the footer uses the fallback below.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_EDUNEXT_FOOTER``
     - The default Open edX footer is shown instead of the eduNEXT footer.
   * - ``FOOTER_LOGO_SRC``
     - ``LOGO_TRADEMARK_URL`` (the platform logo).
   * - ``FOOTER_LOGO_URL``
     - ``LMS_BASE_URL``.
   * - ``FOOTER_LOGO_ALT``
     - Translated text "Platform logo".
   * - ``FOOTER_LOGO_TARGET``
     - ``_self``.
   * - ``FOOTER_DESCRIPTION``
     - Translated text "Empowering learners everywhere with world-class
       online education."
   * - ``FOOTER_NAV_COLUMNS``
     - Three columns (About, Legal, Connect) linking to ``LMS_BASE_URL`` +
       ``/about``, ``/blog``, ``/careers``, ``/news``, ``/tos``, ``/privacy``,
       ``/accessibility``, ``/contact`` and ``/support``. Some of these pages
       may not exist on a given site; set this key in production.
   * - ``FOOTER_SOCIAL_LINKS``
     - edX/Open edX accounts on Facebook, X, LinkedIn, Instagram, YouTube
       and GitHub. Set this key in production.
   * - ``FOOTER_EXTRA_LINKS``
     - No extra links.
   * - ``FOOTER_COPYRIGHT``
     - Translated text "© {current year} eduNEXT. All rights reserved."
   * - ``FOOTER_OPENEDX_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - Official "Powered by Open edX" logo, linking to https://open.edx.org/.
   * - ``FOOTER_EDUNEXT_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - eduNEXT logo, linking to https://www.edunext.co.

Example of the structured keys, as they go in ``MFE_CONFIG`` (Tutor settings or
the tenant configuration):

.. code-block:: json

   {
     "ENABLE_EDUNEXT_FOOTER": true,
     "FOOTER_LOGO_SRC": "https://example.com/static/logo.png",
     "FOOTER_LOGO_URL": "https://example.com",
     "FOOTER_DESCRIPTION": "Learn anytime, anywhere.",
     "FOOTER_NAV_COLUMNS": [
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
     "FOOTER_SOCIAL_LINKS": [
       { "key": "linkedin", "url": "https://www.linkedin.com/company/example", "label": "LinkedIn" },
       { "key": "github", "url": "https://github.com/example", "label": "GitHub" }
     ],
     "FOOTER_EXTRA_LINKS": [
       { "txt": "Accessibility", "url": "https://example.com/accessibility" }
     ],
     "FOOTER_COPYRIGHT": "© 2026 Example Inc. All rights reserved."
   }

- ``FOOTER_NAV_COLUMNS``: each column has a ``title`` and a list of ``links``.
- Links (``FOOTER_NAV_COLUMNS`` and ``FOOTER_EXTRA_LINKS``): ``txt`` and ``url``
  are required; ``target`` is optional and defaults to ``_self``.
- ``FOOTER_SOCIAL_LINKS``: ``key`` selects the icon and must be one of
  ``facebook``, ``twitter``, ``linkedin``, ``instagram``, ``youtube`` or
  ``github``; ``label`` is the accessible name of the link.

Colors come from Paragon design tokens (``--pgn-color-*``), so per-tenant
varsify variants restyle the footer without touching this plugin.

Legacy (Django/Mako) footer
---------------------------

The plugin also ships a legacy footer (``legacy/footer.html``, Mako) that reads
the **same** ``FOOTER_*`` ``MFE_CONFIG`` keys as the React MFE footer. This keeps
legacy Django pages and the MFEs consistent from a single config source — two
thin renderers, one config — without compiling React into Django (see
``docs/decisions/0004``).

It is delivered at openedx image build time (same git-ref delivery as the MFE
side) by **delegation**: every ``lms/templates/footer.html`` in the image — core
and every theme under ``/openedx/themes`` (e.g. ``bragi``) — is renamed to
``footer-original.html`` in place, and the eduNEXT footer takes its name.

``ENABLE_EDUNEXT_FOOTER`` is opt-in (same as the MFE footer). When it is off,
the legacy footer includes ``footer-original.html``, which the theme lookup
resolves exactly as ``footer.html`` would have been resolved without this
plugin: the active theme's own footer, its parent's, or Open edX core.

The legacy footer looks the same as the MFE footer: same markup structure, same
defaults and the same Paragon color tokens (``--pgn-color-*``) as
``EdunextFooter.scss``. It loads the tenant's tokens itself from
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
   renderers (``frontend/edunext-footer/`` and ``legacy/footer.html``).

Legacy footer configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The legacy footer reads the same ``MFE_CONFIG`` keys as the MFE footer, resolved
the same way as ``/api/mfe_config/v1``: tenant configuration first, Django
settings second. It only renders when ``ENABLE_EDUNEXT_FOOTER`` is ``true``.

Every other ``FOOTER_*`` key has the same fallback as in the MFE footer (see
`Configuration`_). The differences are:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_EDUNEXT_FOOTER``
     - The footer the site would show without this plugin: the active theme's
       footer (e.g. ``bragi``), its parent theme's, or the Open edX default.
   * - ``LMS_BASE_URL`` (used by the default logo URL and navigation links)
     - Django's ``LMS_ROOT_URL``.
   * - ``PARAGON_THEME_URLS``
     - No theme tokens are loaded; colors fall back to Paragon's defaults.
   * - ``FOOTER_BACKGROUND_COLOR`` (legacy only)
     - The same background as the MFE footer, ``--pgn-color-primary-700``. Set
       it only to force a different background on legacy pages.

MFE Home Banner (catalog)
-------------------------

The plugin also ships a custom home banner (``frontend/edunext-home-banner/``)
and injects it into the catalog MFE's ``org.openedx.frontend.catalog.home_page.banner``
slot, hiding the default banner. Same delivery as the footer (Option B); the
component reuses the catalog MFE's own building blocks via its ``@src`` alias.

Everything customizable comes from ``MFE_CONFIG``, not varsify: varsify cannot
emit the catalog-specific CSS variables. Use varsify only for Paragon colors.
The eduNEXT banner only renders when ``ENABLE_EDUNEXT_HOME_BANNER`` is ``true``.

Home banner configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_EDUNEXT_HOME_BANNER``
     - The default catalog banner is shown instead of the eduNEXT banner.
   * - ``HOME_BANNER_BACKGROUND_IMAGE``
     - The catalog default: no background image.
   * - ``HOME_BANNER_BACKGROUND_COLOR``
     - The catalog default: Paragon ``--pgn-color-gray-500``.
   * - ``HOME_BANNER_TITLE``
     - Translated text "Welcome to {SITE_NAME}".
   * - ``HOME_BANNER_SUBTITLE``
     - Translated text "It works! Powered by the Open edX® Platform".

The search field and the promo video keep the catalog behavior: the search field
shows only when ``ENABLE_COURSE_DISCOVERY`` is ``true``, and the promo video uses
``HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID``.

MFE Header (standard desktop)
-----------------------------

The plugin ships an eduNEXT desktop header (``frontend/edunext-header/``) and
injects it into ``org.openedx.frontend.layout.header_desktop.v1`` (Hide default
+ Insert) for the MFEs that use ``frontend-component-header``'s standard header.
Only that header exposes a whole-header slot; the ``learning`` and ``authoring``
headers, and the mobile header, are follow-ups (see ``docs/decisions/0005``).

Styled MFEs: ``account``, ``catalog``, ``communications``, ``discussions``,
``gradebook``, ``learner-dashboard``, ``ora-grading``, ``profile``.

The header reuses the session data from ``AppContext`` (login state, avatar,
username) instead of rebuilding it and keeps the base logged-in / logged-out
buttons.

Header configuration and fallbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The eduNEXT header only renders when ``ENABLE_EDUNEXT_HEADER`` is ``true``.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_EDUNEXT_HEADER``
     - The default Open edX desktop header is shown instead of the eduNEXT
       header.
   * - ``HEADER_MAIN_MENU``
     - The main menu that the host MFE passes to the header; if it passes
       none, no main menu.
   * - ``HEADER_USER_MENU_EXTRA_LINKS``
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
     "ENABLE_EDUNEXT_HEADER": true,
     "HEADER_MAIN_MENU": [
       { "txt": "Courses", "url": "https://example.com/courses" },
       { "txt": "Programs", "url": "https://example.com/programs" },
       { "txt": "Blog", "url": "https://blog.example.com", "target": "_blank" }
     ],
     "HEADER_USER_MENU_EXTRA_LINKS": [
       { "txt": "My certificates", "url": "https://example.com/certificates" },
       { "txt": "Help center", "url": "https://help.example.com" }
     ]
   }

- ``HEADER_MAIN_MENU``: ``txt`` and ``url`` are required; ``target`` is optional
  and defaults to ``_self``.
- ``HEADER_USER_MENU_EXTRA_LINKS``: ``txt`` and ``url`` are required. The links
  are added to the user dropdown after Dashboard, Profile and Account, and
  before "Sign Out"; they open in the same tab.

Colors come from Paragon design tokens (``--pgn-color-*``), varsify per tenant,
same as the footer.

Roadmap
-------

- Mobile header (``header_mobile.v1``), learning header and Studio header.
- Legacy (Mako) header sharing the same ``HEADER_*`` config.
- Optional ``@edx/brand`` package for global token defaults.

Contributing
------------

- Fork the repository.
- Create a feature branch.
- Submit a pull request.

License
-------

See ``pyproject.toml`` for the current license declaration.
