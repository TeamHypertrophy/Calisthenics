import { ThemedStyle, typography } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { FC } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { Text } from "./Text"

interface InfoChipProps {
  label: string
  value?: string | number | null
  style?: ViewStyle
}

export const InfoChip: FC<InfoChipProps> = ({ label, value, style }) => {
  const { themed } = useAppTheme()

  if (!value) return null

  return (
    <View style={[themed($infoChipContainer), style]}>
      <Text text={label} style={themed($infoChipLabel)} preset="formLabel" />
      <Text
        text={String(value)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}
        style={themed($infoChipValue)}
      />
    </View>
  )
}

const $infoChipContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  flex: 1,
  marginHorizontal: spacing.xs,
  minHeight: 70,
  justifyContent: "center",
})

const $infoChipLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 12,
  marginBottom: spacing.xxs,
})

const $infoChipValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "bold",
  fontSize: 14,
  textAlign: "center",
})
