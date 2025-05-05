import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import React, { FC } from "react"
import { ActivityIndicator } from "react-native"

export const Loading: FC = () => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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
      <ActivityIndicator size="large" color={colors.palette.primary500} />
    </Screen>
  )
}
