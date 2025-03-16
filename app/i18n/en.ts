const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log Out",
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
    letsGo: "Let's go!",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    traceTitle: "Error from %{name} stack",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },

  errors: {
    invalidEmail: "Invalid email address.",
  },
  loginScreen: {
    logIn: "Hypertrophy",
    enterDetails: "Enter Your 👤 and 🔏",
    emailFieldLabel: "Username",
    passwordFieldLabel: "Password",
    emailFieldPlaceholder: "Enter your username",
    passwordFieldPlaceholder: "Super secret password here",
    tapToLogIn: "Login",
    hint: "Hint: Make sure username is spelt correctly!",
  },
  homeNavigator: {
    profileTab: "Profile",
    logsTab: "Logs",
    mainTab: "Main",
    trainerTab: "Trainers",
  },
}

export default en
export type Translations = typeof en
