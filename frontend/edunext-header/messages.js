import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  skipNav: {
    id: 'edunext.header.skipNav',
    defaultMessage: 'Skip to main content',
    description: 'Accessibility skip-navigation link in the header',
  },
  mainMenu: {
    id: 'edunext.header.mainMenu',
    defaultMessage: 'Main menu',
    description: 'Aria label for the header main navigation',
  },
  dashboard: {
    id: 'edunext.header.userMenu.dashboard',
    defaultMessage: 'Dashboard',
    description: 'User dropdown link to the learner dashboard',
  },
  profile: {
    id: 'edunext.header.userMenu.profile',
    defaultMessage: 'Profile',
    description: 'User dropdown link to the profile page',
  },
  account: {
    id: 'edunext.header.userMenu.account',
    defaultMessage: 'Account',
    description: 'User dropdown link to the account settings page',
  },
  signOut: {
    id: 'edunext.header.userMenu.signOut',
    defaultMessage: 'Sign Out',
    description: 'User dropdown link to log out',
  },
  signIn: {
    id: 'edunext.header.signIn',
    defaultMessage: 'Sign in',
    description: 'Header link to the login page for anonymous users',
  },
  register: {
    id: 'edunext.header.register',
    defaultMessage: 'Register',
    description: 'Header button to the registration page for anonymous users',
  },
});

export default messages;
