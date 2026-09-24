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

Styled MFEs: ``account``, ``communications``, ``discussions``, ``gradebook``,
``learner-dashboard``, ``learning``, ``ora-grading``, ``profile``.
(``authoring``/Studio uses a different slot and is a follow-up.)

Pin the source ref for reproducible builds
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``MODERN_THEMING_GIT_REF`` selects which ref of this repo the MFE build pulls
the component from. It defaults to ``master``; pin a tag or commit SHA in
production:

.. code-block:: bash

    tutor config save --set MODERN_THEMING_GIT_REF=<tag-or-sha>
    tutor images build mfe

Configuration
-------------

The footer reads everything from ``MFE_CONFIG`` via ``getConfig()``. All keys
are optional and fall back to sensible defaults; set them through Tutor
settings or per-tenant (eox-tenant).

- ``ENABLE_EDUNEXT_FOOTER`` (bool, default ``True``): when false, the MFE
  renders the default Open edX footer instead — a runtime kill-switch that
  needs no rebuild.
- ``FOOTER_LOGO_SRC`` / ``FOOTER_LOGO_URL`` / ``FOOTER_LOGO_ALT`` /
  ``FOOTER_LOGO_TARGET``
- ``FOOTER_DESCRIPTION``
- ``FOOTER_NAV_COLUMNS``: ``[{ title, links: [{ txt, url, target }] }]``
- ``FOOTER_SOCIAL_LINKS``: ``[{ key, url, label }]`` (key ∈ facebook, twitter,
  linkedin, instagram, youtube, github)
- ``FOOTER_EXTRA_LINKS``: ``[{ txt, url, target }]``
- ``FOOTER_COPYRIGHT``
- ``FOOTER_OPENEDX_LOGO_*`` / ``FOOTER_EDUNEXT_LOGO_*``

Colors come from Paragon design tokens (``--pgn-color-*``), so per-tenant
varsify variants restyle the footer without touching this plugin.

Roadmap
-------

- MFE header slot widgets.
- ``authoring``/Studio footer (``studio_footer.v1``).
- Optional ``@edx/brand`` package for global token defaults.

Contributing
------------

- Fork the repository.
- Create a feature branch.
- Submit a pull request.

License
-------

See ``pyproject.toml`` for the current license declaration.
