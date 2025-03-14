learning_slots = {
    "logo_slot": """
        {
            op: PLUGIN_OPERATIONS.Hide,
            widgetId: 'default_contents',
        },
        {
            op: PLUGIN_OPERATIONS.Insert,
            widget: {
                id: 'custom_logo_component',
                type: DIRECT_PLUGIN,
                RenderWidget: SlotWidgetHeaderLogo,
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

default = learning_slots