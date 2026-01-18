import { Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import React, { FC } from "react"
import { ActivityIndicator, TextStyle, View, ViewStyle } from "react-native"

interface LoaderProps {
  /**
   * Optional text to display below the spinner
   */
  text?: string
  /**
   * Size of the spinner
   */
  size?: "small" | "large"
  /**
   * Custom style for the container
   */
  style?: ViewStyle
  /**
   * Color of the spinner (defaults to theme tint color)
   */
  color?: string
}

export const Loading: React.FC<LoaderProps> = ({ text, size = "large", style, color }) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const spinnerColor = color || colors.tint

  return (
    <View style={[themed($container), style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && <Text text={text} style={themed($loadingText)} preset="formHelper" />}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $loadingText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  textAlign: "center",
  color: colors.textDim,
  fontSize: 14,
})
