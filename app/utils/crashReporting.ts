import * as Sentry from "@sentry/react-native"

export const initCrashReporting = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    debug: true,
  })
}

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch
   */
  HANDLED = "Handled",
}

export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    const message = error.message || "Unknown"
    console.error(error)
    console.log(message, type)
  } else {
    Sentry.captureException(error)
  }
}
