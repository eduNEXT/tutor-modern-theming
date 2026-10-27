import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  skipNav: {
    id: 'cobalt.header.skipNav',
    defaultMessage: 'Skip to main content',
    description: 'Accessibility skip-navigation link in the header',
  },
  mainMenu: {
    id: 'cobalt.header.mainMenu',
    defaultMessage: 'Main menu',
    description: 'Aria label for the header main navigation',
  },
  dashboard: {
    id: 'cobalt.header.userMenu.dashboard',
    defaultMessage: 'Dashboard',
    description: 'User dropdown link to the learner dashboard',
  },
  profile: {
    id: 'cobalt.header.userMenu.profile',
    defaultMessage: 'Profile',
    description: 'User dropdown link to the profile page',
  },
  account: {
    id: 'cobalt.header.userMenu.account',
    defaultMessage: 'Account',
    description: 'User dropdown link to the account settings page',
  },
  signOut: {
    id: 'cobalt.header.userMenu.signOut',
    defaultMessage: 'Sign Out',
    description: 'User dropdown link to log out',
  },
  signIn: {
    id: 'cobalt.header.signIn',
    defaultMessage: 'Sign in',
    description: 'Header link to the login page for anonymous users',
  },
  register: {
    id: 'cobalt.header.register',
    defaultMessage: 'Register',
    description: 'Header button to the registration page for anonymous users',
  },
});

export default messages;
