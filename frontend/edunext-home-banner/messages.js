import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'edunext.catalog.home-page.title',
    defaultMessage: 'Welcome to {siteName}',
    description: 'Fallback main heading in the home banner when HOME_BANNER_TITLE is not set',
  },
  subtitle: {
    id: 'edunext.catalog.home-page.subtitle',
    defaultMessage: 'It works! Powered by the Open edX® Platform',
    description: 'Fallback subtitle in the home banner when HOME_BANNER_SUBTITLE is not set',
  },
  searchPlaceholder: {
    id: 'edunext.catalog.home-page.search-placeholder',
    defaultMessage: 'Search for a course',
    description: 'Placeholder text inside the course search input field',
  },
});

export default messages;
