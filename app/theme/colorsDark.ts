const palette = {
  neutral100: "#121212", // Near black (background)
  neutral200: "#1E1E1E", // Dark background
  neutral300: "#2C2C2C", // Light-dark gray
  neutral400: "#3D3D3D", // Mid-dark gray
  neutral500: "#505050", // Medium gray
  neutral600: "#8F8F8F", // Medium-light gray
  neutral700: "#BDBDBD", // Light gray
  neutral800: "#E0E0E0", // Very light gray
  neutral900: "#FFFFFF", // White

  primary100: "#0A1E3B", // Darkest blue
  primary200: "#0F2D59", // Darker blue
  primary300: "#154077", // Dark blue
  primary400: "#1E5099", // Medium blue
  primary500: "#0A3977", // Main brand blue
  primary600: "#3A75B9", // Lighter blue accent

  secondary100: "#121212", // Dark background
  secondary200: "#1E1E1E", // Dark alternate
  secondary300: "#2C2C2C", // Mid-dark alternate
  secondary400: "#E0E0E0", // Light alternate
  secondary500: "#0A3977", // Dark blue accent

  accent100: "#0A1E3B", // Dark accent
  accent200: "#0F2D59", // Medium-dark accent
  accent300: "#154077", // Medium accent
  accent400: "#1E5099", // Medium-light accent
  accent500: "#0A3977", // Main accent (dark blue)

  angry100: "#2C1212", // Dark error background
  angry500: "#E53E3E", // Bright error color

  overlay20: "rgba(255, 255, 255, 0.2)",
  overlay50: "rgba(255, 255, 255, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
