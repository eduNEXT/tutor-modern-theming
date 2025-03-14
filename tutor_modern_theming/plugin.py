import json
import sys
import os
from glob import glob

import click
import importlib_resources
from tutor import hooks
from tutormfe import hooks as mfe_hooks

from .__about__ import __version__

########################################
# CONFIGURATION
########################################

hooks.Filters.CONFIG_DEFAULTS.add_items(
    [
        # Add your new settings that have default values here.
        # Each new setting is a pair: (setting_name, default_value).
        # Prefix your setting names with 'TUTOR_MODERN_THEMING_'.
        ("TUTOR_MODERN_THEMING_VERSION", __version__),
    ]
)

hooks.Filters.CONFIG_UNIQUE.add_items(
    [
        # Add settings that don't have a reasonable default for all users here.
        # For instance: passwords, secret keys, etc.
        # Each new setting is a pair: (setting_name, unique_generated_value).
        # Prefix your setting names with 'TUTOR_MODERN_THEMING_'.
        # For example:
        ### ("TUTOR_MODERN_THEMING_SECRET_KEY", "{{ 24|random_string }}"),
    ]
)

hooks.Filters.CONFIG_OVERRIDES.add_items(
    [
        # Danger zone!
        # Add values to override settings from Tutor core or other plugins here.
        # Each override is a pair: (setting_name, new_value). For example:
        ### ("PLATFORM_NAME", "My platform"),
    ]
)


########################################
# INITIALIZATION TASKS
########################################

# To add a custom initialization task, create a bash script template under:
# tutor_modern_theming/templates/tutor-modern-theming/tasks/
# and then add it to the MY_INIT_TASKS list. Each task is in the format:
# ("<service>", ("<path>", "<to>", "<script>", "<template>"))
MY_INIT_TASKS: list[tuple[str, tuple[str, ...]]] = [
    # For example, to add LMS initialization steps, you could add the script template at:
    # tutor_modern_theming/templates/tutor-modern-theming/tasks/lms/init.sh
    # And then add the line:
    ### ("lms", ("tutor-modern-theming", "tasks", "lms", "init.sh")),
]


# For each task added to MY_INIT_TASKS, we load the task template
# and add it to the CLI_DO_INIT_TASKS filter, which tells Tutor to
# run it as part of the `init` job.
for service, template_path in MY_INIT_TASKS:
    full_path: str = str(
        importlib_resources.files("tutor_modern_theming")
        / os.path.join("templates", *template_path)
    )
    with open(full_path, encoding="utf-8") as init_task_file:
        init_task: str = init_task_file.read()
    hooks.Filters.CLI_DO_INIT_TASKS.add_item((service, init_task))


########################################
# DOCKER IMAGE MANAGEMENT
########################################


# Images to be built by `tutor images build`.
# Each item is a quadruple in the form:
#     ("<tutor_image_name>", ("path", "to", "build", "dir"), "<docker_image_tag>", "<build_args>")
hooks.Filters.IMAGES_BUILD.add_items(
    [
        # To build `myimage` with `tutor images build myimage`,
        # you would add a Dockerfile to templates/tutor-modern-theming/build/myimage,
        # and then write:
        ### (
        ###     "myimage",
        ###     ("plugins", "tutor-modern-theming", "build", "myimage"),
        ###     "docker.io/myimage:{{ TUTOR_MODERN_THEMING_VERSION }}",
        ###     (),
        ### ),
    ]
)


# Images to be pulled as part of `tutor images pull`.
# Each item is a pair in the form:
#     ("<tutor_image_name>", "<docker_image_tag>")
hooks.Filters.IMAGES_PULL.add_items(
    [
        # To pull `myimage` with `tutor images pull myimage`, you would write:
        ### (
        ###     "myimage",
        ###     "docker.io/myimage:{{ TUTOR_MODERN_THEMING_VERSION }}",
        ### ),
    ]
)


# Images to be pushed as part of `tutor images push`.
# Each item is a pair in the form:
#     ("<tutor_image_name>", "<docker_image_tag>")
hooks.Filters.IMAGES_PUSH.add_items(
    [
        # To push `myimage` with `tutor images push myimage`, you would write:
        ### (
        ###     "myimage",
        ###     "docker.io/myimage:{{ TUTOR_MODERN_THEMING_VERSION }}",
        ### ),
    ]
)


########################################
# TEMPLATE RENDERING
# (It is safe & recommended to leave
#  this section as-is :)
########################################

hooks.Filters.ENV_TEMPLATE_ROOTS.add_items(
    # Root paths for template files, relative to the project root.
    [
        str(importlib_resources.files("tutor_modern_theming") / "templates"),
    ]
)

hooks.Filters.ENV_TEMPLATE_TARGETS.add_items(
    # For each pair (source_path, destination_path):
    # templates at ``source_path`` (relative to your ENV_TEMPLATE_ROOTS) will be
    # rendered to ``source_path/destination_path`` (relative to your Tutor environment).
    # For example, ``tutor_modern_theming/templates/tutor-modern-theming/build``
    # will be rendered to ``$(tutor config printroot)/env/plugins/tutor-modern-theming/build``.
    [
        ("tutor-modern-theming/build", "plugins"),
        ("tutor-modern-theming/apps", "plugins"),
    ],
)


########################################
# PATCH LOADING
# (It is safe & recommended to leave
#  this section as-is :)
########################################

# For each file in tutor_modern_theming/patches,
# apply a patch based on the file's name and contents.
for path in glob(str(importlib_resources.files("tutor_modern_theming") / "patches" / "*")):
    with open(path, encoding="utf-8") as patch_file:
        hooks.Filters.ENV_PATCHES.add_item((os.path.basename(path), patch_file.read()))


########################################
# CUSTOM JOBS (a.k.a. "do-commands")
########################################

# A job is a set of tasks, each of which run inside a certain container.
# Jobs are invoked using the `do` command, for example: `tutor local do importdemocourse`.
# A few jobs are built in to Tutor, such as `init` and `createuser`.
# You can also add your own custom jobs:


# To add a custom job, define a Click command that returns a list of tasks,
# where each task is a pair in the form ("<service>", "<shell_command>").
# For example:
### @click.command()
### @click.option("-n", "--name", default="plugin developer")
### def say_hi(name: str) -> list[tuple[str, str]]:
###     """
###     An example job that just prints 'hello' from within both LMS and CMS.
###     """
###     return [
###         ("lms", f"echo 'Hello from LMS, {name}!'"),
###         ("cms", f"echo 'Hello from CMS, {name}!'"),
###     ]


# Then, add the command function to CLI_DO_COMMANDS:
## hooks.Filters.CLI_DO_COMMANDS.add_item(say_hi)

# Now, you can run your job like this:
#   $ tutor local do say-hi --name="Jose Palma"


#######################################
# CUSTOM CLI COMMANDS
#######################################

# Your plugin can also add custom commands directly to the Tutor CLI.
# These commands are run directly on the user's host computer
# (unlike jobs, which are run in containers).

# To define a command group for your plugin, you would define a Click
# group and then add it to CLI_COMMANDS:


### @click.group()
### def tutor-modern-theming() -> None:
###     pass


### hooks.Filters.CLI_COMMANDS.add_item(tutor-modern-theming)


# Then, you would add subcommands directly to the Click group, for example:


### @tutor-modern-theming.command()
### def example_command() -> None:
###     """
###     This is helptext for an example command.
###     """
###     print("You've run an example command.")


# This would allow you to run:
#   $ tutor tutor-modern-theming example-command

#######################################
# COMMANDS TUTOR MODERN THEMING
#######################################
hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            f"mfe-dockerfile-post-npm-install",
            f"""
            RUN git clone https://github.com/eduNEXT/frontend-render-widgets.git
            RUN npm install ./frontend-render-widgets
            """,
        )
    ]
)

hooks.Filters.ENV_PATCHES.add_item(
    (
        "mfe-env-config-runtime-definitions",
        "const { SlotWidgetHeaderLogo } = require('./frontend-render-widgets/src');",
    )
)

def load_all_plugin_slots():
    """Carga todos los archivos .py en plugin-slots y los convierte a JSON."""
    slots = {}
    plugin_slots_dir = os.path.join(os.path.dirname(__file__), "plugin-slots")

    if not os.path.exists(plugin_slots_dir):
        return slots

    for filename in os.listdir(plugin_slots_dir):
        if filename.endswith(".py"):
            module_name = filename[:-3]  # Elimina la extensión .py
            try:
                # Importa el archivo Python directamente
                sys.path.append(plugin_slots_dir)
                module = __import__(module_name)
                slot_data = getattr(module, "default", None)

                if slot_data:
                    slots[module_name] = json.loads(json.dumps(slot_data))
                else:
                    print(f"Advertencia: {filename} no exporta un objeto por defecto.")

            except ImportError as e:
                print(f"Error al importar {filename}: {e}")
            except json.JSONDecodeError as e:
                print(f"Error al convertir {filename} a JSON: {e}")

        else:
            print(f"Advertencia: {filename} no es un archivo .py válido.")

    for mfe in slots:
        for slot in slots[mfe]:
            mfe_hooks.PLUGIN_SLOTS.add_item((mfe, slot, slots[mfe][slot]))

    return slots

hooks.Filters.ENV_PATCHES.add_item(
    (
        "mfe-env-config-buildtime-definitions",
        "let helloWorld = 'Hello World!'",
    )
)

load_all_plugin_slots()

# PLUGIN_SLOTS.add_item(
#         (
#             "learner-dashboard",
#             "footer_slot",
#             """ 
#             {
#                 op: PLUGIN_OPERATIONS.Hide,
#                 widgetId: 'default_contents',
#             },
#             {
#                 op: PLUGIN_OPERATIONS.Insert,
#                 widget: {
#                     id: 'custom_footer',
#                     type: DIRECT_PLUGIN,
#                     RenderWidget: () => (
#                         <h1 style={{textAlign: 'center'}}>{helloWorld}</h1>
#                     )
#                 },
#             },
#   """,
#         ),
#     )

# PLUGIN_SLOTS.add_item(
#         (
#             "learner-dashboard",
#             "widget_sidebar_slot",
#             """
#             {
#                 op: PLUGIN_OPERATIONS.Insert,
#                 widget: {
#                     id: 'custom_sidebar_panel',
#                     type: DIRECT_PLUGIN,
#                     RenderWidget: () => (
#                         <div>
#                             <h3>
#                             Sidebar Menu
#                             </h3>
#                             <p>
#                             sidebar item #1
#                             </p>
#                             <p>
#                             sidebar item #2
#                             </p>
#                             <p>
#                             sidebar item #3
#                             </p>
#                         </div>
#                     ),
#                 },
#             },
#   """,
#         ),
#     )

# mfe_hooks.PLUGIN_SLOTS.add_item(
#     (
#         "learning",
#         "logo_slot",
#         """
#         {
#             op: PLUGIN_OPERATIONS.Insert,   
#             widget: {
#                 id: 'custom_logo_component',
#                 type: DIRECT_PLUGIN,
#                 RenderWidget: () => (
#                     <h1 style={{textAlign: 'center'}}>Modern Theming Logo</h1>
#                 ),
#             },
#         },
#         """,
#     ),
# )