.. raw:: html

    <div style="background-color: #ffe0b2; padding: 10px; border: 1px solid #ff9800; border-radius: 5px; color: black">
        <strong>Warning:</strong> This is an `alpha` or `pilot` version of the plugin. Expect possible changes and instability.
    </div>

Tutor Modern Theming
====================

Overview
--------

`tutor-modern-theming` is a Tutor plugin designed to enhance theming capabilities for OpenedX Micro-Frontends (MFEs).
It integrates modern theming approaches, including design tokens and CSS runtime configurations, to ensure a consistent
look and feel across MFEs and the legacy Open edX experience.

Features
--------

- **Automatic Installation of Modern Themes**: Fetches and configures theme assets during the build process.
- **Supports `PARAGON_THEME_URLS` Configuration**: Ensures MFEs can dynamically load themes via Paragon.
- **Plugin Slots Integration**: Allows custom slot-based theming components to be loaded into MFEs.
- **Consistent Header and Footer**: Enables cross-platform theming alignment between MFEs and legacy pages.
- **Custom CLI Commands**: Provides an `enable-legacy-theme` command to simplify theme deployment.

Installation
------------

To install `tutor-modern-theming`, follow these steps:

.. code-block:: bash

    pip install git+https://github.com/eduNEXT/tutor-modern-theming.git
