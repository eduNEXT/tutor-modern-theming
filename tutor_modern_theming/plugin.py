import json
import sys
import os
from glob import glob

import click
import importlib_resources
import subprocess
from tutor import hooks
from tutor import utils as tutor_utils
from tutormfe import hooks as mfe_hooks
from tutormfe.hooks import PLUGIN_SLOTS

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


@click.command(name="enable-legacy-theme", help="Enable modern theme")
def enable_legacy_theme() -> None:
    THEMES = [{
        "name": "modern-theming",
        "repo": "git@github.com:eduNEXT/modern-theming.git",
        "version": "ase/footer-theme",
    }]
    context = click.get_current_context().obj
    tutor_root = context.root

    # We use `type: ignore` for the `tutor_conf` object
    # because it comes from the Tutor framework.
    # We are not handle type errors related to this object.
    for theme in THEMES:  # type: ignore
        if not isinstance(theme, dict):
            raise click.ClickException(
                "Expected 'theme' to be a dictionary, but got something else."
            )

        if not {"name", "repo", "version"}.issubset(theme.keys()):
            raise click.ClickException(
                f"{theme} is missing one or more required keys: "
                "'name', 'repo', 'version'"
            )

        theme_path = f'{tutor_root}/env/build/openedx/themes/{theme["name"]}'
        if os.path.isdir(theme_path):
            subprocess.call(["rm", "-rf", theme_path])

        theme_version = theme.get("version", "")
        theme_repo = theme.get("repo", "")
        tutor_utils.execute(
            "git",
            "clone",
            "-b",
            theme_version,
            theme_repo,
            theme_path,
        )

        echo_command = f'cd {theme_path} && npm install && npm run build-tokens && npm run replace-variables && npm run build-files'
        subprocess.call(echo_command, shell=True)


hooks.Filters.CLI_COMMANDS.add_item(enable_legacy_theme)

@click.command(name="copy-footer-mfes", help="Enable modern theme")
def copy_footer_mfes() -> None:
        context = click.get_current_context().obj
        tutor_root = context.root
            # Read and escape the footer HTML
        html_path = os.path.join(tutor_root, "env/build/openedx/themes/modern-theming","lms/templates/footer.html")
        plugin_path = os.path.dirname(os.path.abspath(__file__)) + '/plugin.py'
        print(plugin_path)
        if os.path.isfile(html_path):
            with open(html_path, "r", encoding="utf-8") as f:
                raw_html = f.read()
        else:
            raise click.ClickException(f"Missing footer.html at {html_path}")
        raw_html_no_newlines = raw_html.replace("\n", "").replace("\r", "")
        # Use JSON encoding to escape the string for JavaScript
        escaped_html = json.dumps(raw_html_no_newlines)[1:-1]  # Strip the outer quotes added by json.dumps
        # Replace ALL " with \\"
        escaped_html = escaped_html.replace('"', '\\"')
        print(escaped_html)
        # Code to append
        slot_code = f'''
        # Add slot injection
PLUGIN_SLOTS.add_items([
    (
        "all",
        "footer_slot",
        \"\"\"
        {{
        op: PLUGIN_OPERATIONS.Hide,
        widgetId: 'default_contents',
        }}
        \"\"\"
    ),
    (
        "all",
        "footer_slot",
        \"\"\"
        {{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {{
            id: 'custom_footer',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
             <div
                dangerouslySetInnerHTML={{{{ __html: "{escaped_html}" }}}}
            />
            ),
        }},
        }}
        \"\"\"
    )
])
 '''
        # Append to plugin.py
        with open(plugin_path, "a") as plugin_file:
            plugin_file.write("\n" + slot_code)
            print(plugin_file)

        print(f"Slot injection code appended to {plugin_path}")
        subprocess.check_output("tutor config save",shell=True)

hooks.Filters.CLI_COMMANDS.add_item(copy_footer_mfes)

@click.command(name="copy-header-mfes", help="Enable modern theme")
def copy_header_mfes() -> None:
        context = click.get_current_context().obj
        tutor_root = context.root
            # Read and escape the footer HTML
        html_path = os.path.join(tutor_root, "env/build/openedx/themes/modern-theming","lms/templates/header.html")
        plugin_path = os.path.dirname(os.path.abspath(__file__)) + '/plugin.py'
        print(plugin_path)
        if os.path.isfile(html_path):
            with open(html_path, "r", encoding="utf-8") as f:
                raw_html = f.read()
        else:
            raise click.ClickException(f"Missing header.html at {html_path}")
        raw_html_no_newlines = raw_html.replace("\n", "").replace("\r", "")
        # Use JSON encoding to escape the string for JavaScript
        escaped_html = json.dumps(raw_html_no_newlines)[1:-1]  # Strip the outer quotes added by json.dumps
        # Replace ALL " with \\"
        escaped_html = escaped_html.replace('"', '\\"')
        print(escaped_html)
        # Code to append
        slot_code = f'''
        # Add slot injection
PLUGIN_SLOTS.add_items([
    (
        "all",
        "header_slot",
        \"\"\"
        {{
        op: PLUGIN_OPERATIONS.Hide,
        widgetId: 'default_contents',
        }}
        \"\"\"
    ),
    (
        "all",
        "header_slot",
        \"\"\"
        {{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {{
            id: 'custom_header',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
             <div
                dangerouslySetInnerHTML={{{{ __html: "{escaped_html}" }}}}
            />
            ),
        }},
        }}
        \"\"\"
    )
])
 '''
        # Append to plugin.py
        with open(plugin_path, "a") as plugin_file:
            plugin_file.write("\n" + slot_code)
            print(plugin_file)

        print(f"Slot injection code appended to {plugin_path}")
        subprocess.check_output("tutor config save",shell=True)

hooks.Filters.CLI_COMMANDS.add_item(copy_header_mfes)
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

def load_all_plugin_slots():
    """Loads all .py files into plugin-slots and converts them to JSON."""
    slots = {}
    plugin_slots_dir = os.path.join(os.path.dirname(__file__), "plugin-slots")

    if not os.path.exists(plugin_slots_dir):
        return slots

    for filename in os.listdir(plugin_slots_dir):
        if filename.endswith(".py"):
            module_name = filename[:-3]  # Remove the .py extension
            try:
                # Import the Python file directly
                sys.path.append(plugin_slots_dir)
                module = __import__(module_name)
                slot_data = getattr(module, "default", None)

                if slot_data:
                    slots[module_name] = json.loads(json.dumps(slot_data))
                else:
                    print(f"Warning!: {filename} does not export an object by default.")

            except ImportError as e:
                print(f"Error importing {filename}: {e}")
            except json.JSONDecodeError as e:
                print(f"Error casting {filename} to JSON: {e}")

        else:
            print(f"Warning!: {filename} is not a valid .py file.")

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
