import { translate } from "@/i18n" // Assuming i18n setup
import { ThemedStyle, typography } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import React, { FC } from "react"
import { TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native"

import { Icon, IconTypes } from "./Icon"
import { Text } from "./Text"

export interface SearchBarProps extends Omit<TextInputProps, "placeholder"> {
  /**
   * Optional placeholder text translation key.
   */
  placeholderTx?: string
  /**
   * Optional placeholder text direct string.
   */
  placeholder?: string
  /**
   * Style overrides for the container view.
   */
  style?: ViewStyle | ViewStyle[]
  /**
   * Style overrides for the input element.
   */
  inputStyle?: TextStyle | TextStyle[]
  /**
   * Icon to display on the left.
   * @default "search"
   */
  leftIcon?: IconTypes
}

export const SearchBar: FC<SearchBarProps> = (props) => {
  const {
    placeholderTx,
    placeholder: placeholderProp,
    style: styleOverride,
    inputStyle: inputStyleOverride,
    leftIcon = "search",
    ...rest
  } = props

  const { themed } = useAppTheme()

  return (
    <View style={[themed($container), styleOverride]}>
      {leftIcon && <MaterialIcons icon={leftIcon} style={themed($icon)} size={20} />}
      <TextInput
        placeholder={placeholderProp}
        placeholderTextColor={themed($placeholder).color}
        underlineColorAndroid="transparent"
        {...rest}
        style={[themed($input), inputStyleOverride]}
      />
    </View>
  )
}

// --- Styles ---
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.background,
  borderRadius: 25,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $icon: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginRight: spacing.sm,
  color: colors.palette.primary300,
})

const $input: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  color: colors.text,
  paddingVertical: 0, // Remove default padding
})

const $placeholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
