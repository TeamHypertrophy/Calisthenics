import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import React, { FC } from "react"
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from "react-native"

import { Text, TextProps } from "./Text" // Assuming Text component exists

type ChipPreset = "filled" | "outlined"

export interface ChipProps extends TouchableOpacityProps {
  /**
   * Text to display inside the chip.
   */
  text?: string
  /**
   * Text translation key.
   */
  tx?: TextProps["tx"]
  /**
   * Options for text translation.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * Style preset.
   * @default "outlined"
   */
  preset?: ChipPreset
  /**
   * Style overrides for the container TouchableOpacity.
   */
  style?: ViewStyle | ViewStyle[]
  /**
   * Style overrides for the text component.
   */
  textStyle?: TextStyle | TextStyle[]
}

export const Chip: FC<ChipProps> = (props) => {
  const {
    text,
    tx,
    txOptions,
    preset = "outlined",
    style: styleOverride,
    textStyle: textStyleOverride,
    ...rest
  } = props

  const { themed } = useAppTheme()

  const $containerPresets: Record<ChipPreset, ThemedStyle<ViewStyle>> = {
    filled: ({ colors, spacing }) => ({
      backgroundColor: colors.palette.primary500,
      borderColor: colors.palette.primary500,
      borderRadius: 25,
      borderWidth: 1,
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.sm,
    }),
    outlined: ({ colors, spacing }) => ({
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 25,
      borderWidth: 1,
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.sm,
    }),
  }

  const $textPresets: Record<ChipPreset, ThemedStyle<TextStyle>> = {
    filled: ({ colors }) => ({
      color: colors.palette.primary200,
      fontSize: 12,
      fontWeight: "500",
    }),
    outlined: ({ colors }) => ({
      color: colors.text,
      fontSize: 12,
      fontWeight: "500",
    }),
  }

  return (
    <TouchableOpacity
      {...rest}
      style={[themed($containerPresets[preset]), styleOverride]}
      activeOpacity={0.7}
    >
      <Text
        text={text}
        tx={tx}
        txOptions={txOptions}
        style={[themed($textPresets[preset]), textStyleOverride]}
      />
    </TouchableOpacity>
  )
}
