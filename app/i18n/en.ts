const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log Out",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "There was an error in the app. Our developers have been notified and will fix it as soon as possible.",
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
    settingsTab: "Settings",
  },
}

export default en
export type Translations = typeof en
