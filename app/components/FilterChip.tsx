import { ThemedStyle, typography } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import React, { FC, useState } from "react"
import { ViewStyle, TextStyle, View } from "react-native"
import { Dropdown, MultiSelect } from "react-native-element-dropdown"

import { Text } from "./Text"

export interface FilterChipItem {
  label: string
  value: string
}

export interface FilterChipProps {
  /**
   * Array of options for the dropdown.
   */
  options: FilterChipItem[]
  /**
   * The currently selected value.
   */
  selectedValue: string | null
  /**
   * Callback when an item is selected.
   */
  onValueChange: (item: FilterChipItem | null) => void
  /**
   * Placeholder text when no value is selected.
   */
  placeholder?: string
  /**
   * Style overrides for the container.
   */
  style?: ViewStyle | ViewStyle[]
  /**
   * Style overrides for the text displayed on the chip.
   */
  selectedTextStyle?: TextStyle | TextStyle[]
  /**
   * Style overrides for the placeholder text.
   */
  placeholderStyle?: TextStyle | TextStyle[]
  /**
   * Style overrides for the dropdown container itself (the list).
   */
  dropdownContainerStyle?: ViewStyle | ViewStyle[]
  /**
   * Style overrides for individual items in the dropdown list.
   */
  itemTextStyle?: TextStyle | TextStyle[]
  /**
   * Optional label to display above or next to the chip.
   */
  label?: string
  /**
   * Style for the optional label.
   */
  labelStyle?: TextStyle | TextStyle[]
  /**
   * Determines if the chip is in an error state.
   */
  error?: boolean
}

export const FilterChip: FC<FilterChipProps> = (props) => {
  const {
    options,
    selectedValue,
    onValueChange,
    placeholder = "Select...",
    style: styleOverride,
    selectedTextStyle: selectedTextStyleOverride,
    placeholderStyle: placeholderStyleOverride,
    dropdownContainerStyle: dropdownContainerStyleOverride,
    itemTextStyle: itemTextStyleOverride,
    label,
    labelStyle: labelStyleOverride,
    error,
  } = props

  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const [isFocus, setIsFocus] = useState(false)

  const $chipBaseStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
    height: 36,
    backgroundColor: colors.background,
    borderColor: error ? colors.error : isFocus ? colors.palette.primary500 : colors.border,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: 150,
  })

  const $selectedTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
    fontSize: 13,
    color: colors.text,
    marginRight: spacing.xs,
  })

  const $placeholderStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
    fontSize: 13,
    color: colors.textDim,
    marginRight: spacing.xs,
  })

  const $dropdownContainerStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
    backgroundColor: colors.background,
    borderRadius: spacing.xs,
    marginTop: spacing.xxs,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: "hidden",
  })

  const $itemTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.text,
    fontSize: 14,
  })

  const $labelStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
    fontSize: 12,
    color: colors.textDim,
    marginBottom: spacing.xxs,
  })

  const renderRightIcon = () => (
    <Ionicons name={isFocus ? "chevron-up" : "chevron-down"} size={18} color={colors.textDim} />
  )

  return (
    <View style={{ alignSelf: "flex-start" }}>
      {label && <Text text={label} style={[themed($labelStyle), labelStyleOverride]} />}
      <Dropdown
        style={[themed($chipBaseStyle), styleOverride]}
        placeholderStyle={[themed($placeholderStyle), placeholderStyleOverride]}
        selectedTextStyle={[themed($selectedTextStyle), selectedTextStyleOverride]}
        inputSearchStyle={{ height: 40, fontSize: 14 }}
        iconStyle={{ width: 20, height: 20 }}
        containerStyle={[themed($dropdownContainerStyle), dropdownContainerStyleOverride]}
        itemTextStyle={[themed($itemTextStyle), itemTextStyleOverride]}
        data={options}
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={selectedValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onValueChange(item ? item : null)
          setIsFocus(false)
        }}
        renderRightIcon={renderRightIcon}
      />
    </View>
  )
}
