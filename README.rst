Tutor Modern Theming
====================

⚠️ Warning
----------

This is an `alpha` or `pilot` version of the plugin. Expect possible changes and instability.

Overview
--------

`tutor-modern-theming` is a Tutor plugin designed to enhance theming capabilities for OpenedX Micro-Frontends (MFEs).
It integrates modern theming approaches, including design tokens and CSS runtime configurations, to ensure a consistent
look and feel across MFEs and the legacy Open edX experience.

Example
-------



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

Then enable the plugin:

.. code-block:: bash

    tutor plugins enable tutor-modern-theming


Configuration
-------------

This plugin modifies `MFE_CONFIG["PARAGON_THEME_URLS"]` to dynamically load theme CSS files. The default configuration points to:

.. code-block:: json

    MFE_CONFIG["PARAGON_THEME_URLS"] = {
        "core": {"url": "https://cdn.jsdelivr.net/npm/@edunext/modern-theming-alpha@1.0.0/dist/core.min.css"},
        "defaults": {"light": "light"},
        "variants": {
            "light": {"url": "https://cdn.jsdelivr.net/npm/@edunext/modern-theming-alpha@1.0.0/dist/light.min.css"}
        }
    }


Usage
-----

Enable Legacy Theme
^^^^^^^^^^^^^^^^^^^

Run the following command to enable the legacy theme:

.. code-block:: bash

    tutor enable-legacy-theme

This command will create a symlink to the modern-theming directory in the openedx/themes directory, allowing you to customize the theme.

Build and Start
^^^^^^^^^^^^^^^

After enabling the plugin, rebuild and restart your Tutor environment:

.. code-block:: bash

    tutor config save

    tutor images build mfe

    tutor images build openedx

    tutor local start -d

Modern Theming
--------------

This plugin integrates the Modern Theming system, which is designed to provide a unified look across Open edX's MFEs and legacy pages.
The theme, called modern-theming, is hosted at `eduNEXT/modern-theming <https://github.com/eduNEXT/modern-theming/tree/main>`_ and leverages Paragon and CSS Variables for runtime styling customization.

How to set theme colors?
^^^^^^^^^^^^^^^^^^^^^^^^

To set theme colors, you can modify the tokens defined in the `modern-theming` repository.
You can find the tokens in the `lms/tokens` directory of the `modern-theming` repository.
For example, to change the primary color, you can modify the `primary` token in `lms/tokens/themes/light/global/color.json`.
After modifying the tokens, you need to rebuild the theme or rebuild the openedx images to apply the changes.
Colors can also be modified at runtime using Varsity and the usual eox-tenant configurations.

Theming includes:
-----------------

- Support for Paragon UI components with theme-specific styles.

- Comprehensive CSS Variables that allow runtime adjustments without recompiling styles.

- Consistency between MFE-based and legacy Open edX pages.

MFE Compatibility
-----------------------

This plugin is supported and tested with Open edX releases >= Sumac.

Due to the fact that upstream MFEs in the Sumac release do not support CSS variables at runtime, it is necessary to use our custom MFE branches: `ednx-release/sumac.master`.

If the Open edX release being used already includes runtime support for CSS variables, then using the custom MFEs is not required.
This ensures compatibility and the support provided by eduNEXT for MFEs.

Dependency Versions
^^^^^^^^^^^^^^^^^^^

- **@edunext/frontend-render-widgets**: >= 1.0.0  
- **@edunext/modern-theming-alpha**: >= 1.0.0  
- **@edx/frontend-component-footer**: >= 14.0.0  
- **@edx/frontend-component-header**: >= 5.8.0  
- **@edx/frontend-lib-learning-assistant**: >= 2.13.0  
- **@edx/frontend-lib-special-exams**: >= 3.1.3  
- **@edx/frontend-platform**: >= 8.3.0  
- **@edx/react-unit-test-utils**: >= 3.0.0  
- **@openedx/frontend-build**: >= 14.1.2  
- **@openedx/frontend-plugin-framework**: >= 1.3.0  
- **@openedx/frontend-slot-footer**: >= 1.0.2  
- **@openedx/paragon**: >= 23.4.3 or 23.x.y-alpha.z


Plugin Slots
------------

The plugin-slots directory allows you to define and manage slot-based customizations for different MFEs.
These slots are JSON-like objects that specify widget modifications, such as inserting or hiding components,
using JSX components from the `frontend-render-widgets <https://github.com/eduNEXT/frontend-render-widgets>`_ repository.

Example slot definitions:

.. code-block:: json

    learner_dashboard_slots = {
        "widget_sidebar_slot": """
        {
            op: PLUGIN_OPERATIONS.Hide,
            widgetId: 'default_contents',
        },
        {
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
                id: 'widget_sidebar_slot',
                type: DIRECT_PLUGIN,
                RenderWidget: SlotWidgetLearnerDashboardSidebar,
            },
        }
        """,
        "footer_slot": """
        {
            op: PLUGIN_OPERATIONS.Hide,
            widgetId: 'default_contents',
        },
        {
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
                id: 'custom_footer',
                type: DIRECT_PLUGIN,
                RenderWidget: SlotWidgetFooter,
            },
        }
        """,
    }

    default = learner_dashboard_slots

These definitions allow inserting custom widgets like `SlotWidgetLearnerDashboardSidebar` and `SlotWidgetFooter`
into MFEs without modifying core Open edX code. The plugin dynamically loads these slots during initialization to
ensure a seamless integration with the frontend experience.

Slots availables:
^^^^^^^^^^^^^^^^^

The slots available for each MFE can be found in the master branch, within the `src/plugin-slots` directory.
For example, https://github.com/openedx/frontend-app-learner-dashboard/tree/master/src/plugin-slots

For MFEs that function as shared components, such as the Header and Footer, the slots defined in them can
be used directly by the parent MFE that integrates them.

For example, the `logo_slot` slot is available within the frontend-component-header and can be used in the
Learning MFE, provided that the MFE has a version of the frontend-component-header that includes this slot.
This allows greater flexibility in customizing MFEs without directly modifying their source code.

Examples
^^^^^^^^

**Slots in Learner Dashboard MFE**

.. image:: examples/learner-dashboard-slots.png
    :alt: Slots in Learner Dashboard MFE


**Slots in Learning Header MFE**

.. image:: examples/learning-header-slots.png
    :alt: Slots in Learning Header MFE

Patches
-------

This plugin applies several patches to ensure proper theme integration. Here are some key patches and their functions:

- openedx-lms-production-settings:

.. code-block:: json

    ENABLE_COMPREHENSIVE_THEMING = True
    COMPREHENSIVE_THEME_DIRS.extend("/openedx/themes/modern-theming")

This enables comprehensive theming and ensures the modern-theming directory is included in the theme search path.

- mfe-dockerfile-post-npm-install:

.. code-block:: json

    RUN git clone https://github.com/eduNEXT/frontend-render-widgets.git
    RUN npm install ./frontend-render-widgets

This ensures that the frontend-render-widgets repository is cloned and installed, providing the necessary JSX components for slot rendering.

- mfe-env-config-runtime-definitions:

.. code-block:: js

    const { SlotWidgetHeaderLogo, SlotWidgetFooter, SlotWidgetLearnerDashboardSidebar } = require('./frontend-render-widgets/src');

This imports custom JSX components from frontend-render-widgets, making them available for use within MFEs.

- mfe-lms-production-settings & mfe-lms-development-settings:

.. code-block:: json

    MFE_CONFIG["PARAGON_THEME_URLS"] = {
        "core": {
            "url": "https://cdn.jsdelivr.net/npm/@edunext/modern-theming-alpha@1.0.0/dist/core.min.css"
        },
        "defaults": {
            "light": "light"
        },
        "variants": {
            "light": {
                "url": "https://cdn.jsdelivr.net/npm/@edunext/modern-theming-alpha@1.0.0/dist/light.min.css"
            }
        }
    }

These patches configure Paragon-based theming for both production and development environments.

Customization
-------------
You can customize the plugin in several ways:

- Modify theme sources by editing PARAGON_THEME_URLS in your Tutor configuration.

- Add additional theme variants by extending the plugin.py file.

- Define custom slots in plugin-slots/ to inject additional UI components into MFEs.

Contributing
------------

If you want to contribute:

- Fork the repository.

- Create a feature branch.

- Submit a pull request.

License
-------

This plugin is released under the MIT License.
