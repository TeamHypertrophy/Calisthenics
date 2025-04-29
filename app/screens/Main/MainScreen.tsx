import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Button, Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { logEverything, storage } from "@/utils/storage"
import { useStores } from "@/models"

export const MainScreen: FC<HomeTabScreenProps<"Main">> = observer(function MainScreen(_props) {
  const { navigation } = _props

  const {
    profileStore: { updateSpecific },
  } = useStores()

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
      <Button text="Go to Onboarding" onPress={() => navigation.navigate("PersonalInfo")} />
      <Button text="Clear Local Stoage" onPress={() => storage.clearAll()} />
      <Button
        text="Set Avatar"
        onPress={() =>
          updateSpecific(
            "https://live-pig-nearby.ngrok-free.app//assets/avatars/3ef01c23-7484-4c5a-bed5-aa205c177bf8/891843.png",
          )
        }
      />
      <Button text="Log Local Storage" onPress={() => logEverything()} />
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
