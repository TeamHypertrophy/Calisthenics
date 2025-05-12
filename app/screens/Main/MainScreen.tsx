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

      <Button
        text="Exercises"
        style={themed($button)}
        preset="filled"
        onPress={() => {
          navigation.navigate("SearchExercises")
        }}
      />

      <Button
        text="Custom Exercises"
        style={themed($button)}
        preset="filled"
        onPress={() => {
          navigation.navigate("SearchExercises")
        }}
      />

      <Button
        text="Workout Plans"
        style={themed($button)}
        preset="filled"
        onPress={() => {
          navigation.navigate("WorkoutPlans")
        }}
      />

      <Button
        text="Workouts"
        style={themed($button)}
        preset="filled"
        onPress={() => {
          navigation.navigate("Workouts")
        }}
      />
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 120,
  marginTop: spacing.lg,
  marginBottom: spacing.lg,
})

const $root: ViewStyle = {
  flex: 1,
}
