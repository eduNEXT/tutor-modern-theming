import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'cobalt.catalog.home-page.title',
    defaultMessage: 'Welcome to {siteName}',
    description: 'Fallback main heading in the home banner when COBALT_HOME_BANNER_TITLE is not set',
  },
  subtitle: {
    id: 'cobalt.catalog.home-page.subtitle',
    defaultMessage: 'It works! Powered by the Open edX® Platform',
    description: 'Fallback subtitle in the home banner when COBALT_HOME_BANNER_SUBTITLE is not set',
  },
  searchPlaceholder: {
    id: 'cobalt.catalog.home-page.search-placeholder',
    defaultMessage: 'Search for a course',
    description: 'Placeholder text inside the course search input field',
  },
});

export default messages;
