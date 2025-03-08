const palette = {
  neutral100: "#FFFFFF", // White
  neutral200: "#F8F9FA", // Off-white background
  neutral300: "#E9ECEF", // Light gray
  neutral400: "#CED4DA", // Mid-light gray
  neutral500: "#ADB5BD", // Medium gray
  neutral600: "#6C757D", // Medium-dark gray
  neutral700: "#343A40", // Dark gray
  neutral800: "#212529", // Near black
  neutral900: "#000000", // Black

  primary100: "#E6F0FF", // Lightest blue
  primary200: "#CCE0FF", // Lighter blue
  primary300: "#99C2FF", // Light blue
  primary400: "#6699FF", // Medium blue
  primary500: "#0A3977", // Dark blue (main brand color)
  primary600: "#062856", // Darker blue

  secondary100: "#F8F9FA", // Light background
  secondary200: "#E9ECEF", // Light alternate
  secondary300: "#DEE2E6", // Mid-light alternate
  secondary400: "#212529", // Dark alternate
  secondary500: "#0A3977", // Dark blue accent

  accent100: "#E6F0FF", // Light accent
  accent200: "#CCE0FF", // Medium-light accent
  accent300: "#99C2FF", // Medium accent
  accent400: "#6699FF", // Strong accent
  accent500: "#0A3977", // Main accent (dark blue)

  angry100: "#FEE2E2", // Light error
  angry500: "#DC2626", // Error color

  overlay20: "rgba(0, 0, 0, 0.2)",
  overlay50: "rgba(0, 0, 0, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
