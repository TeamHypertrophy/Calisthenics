import type { ThemedStyle } from "@/theme"

import { Button, Screen, Text } from "@/components"
import { useStores } from "@/models"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { logEverything, storage } from "@/utils/storage"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

export const MainScreen: FC<HomeTabScreenProps<"Main">> = observer(function MainScreen(_props) {
  const { navigation } = _props

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Text text="Hypertrophy" preset="heading" />

      <Text text="Welcome!" />
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $root: ViewStyle = {
  flex: 1,
}
