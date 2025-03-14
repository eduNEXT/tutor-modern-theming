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