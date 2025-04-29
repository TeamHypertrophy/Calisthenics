import React, { FC, useEffect } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Screen, Text, Button, Icon } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

interface ErrorScreenProps {
  title?: string
  message?: string
  onBack: () => void
}

export const ErrorScreen: FC<ErrorScreenProps> = ({
  title = "Error",
  message = "Something went wrong.",
  onBack,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    console.error(title, message)
  }, [title, message])

  return (
    <Screen
      style={{ flex: 1 }}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed(($) => ({
        paddingVertical: $.spacing.lg,
        paddingHorizontal: $.spacing.lg,
      }))}
    >
      <Text text={title} preset="heading" />
      <View style={themed($errorContainer)}>
        <Icon icon="view" size={50} color={colors.error} />
        <Text text={message} style={themed($errorText)} />
        <Button text="Go Back" onPress={onBack} style={themed($button)} />
      </View>
    </Screen>
  )
}

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginVertical: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  marginTop: spacing.md,
})
