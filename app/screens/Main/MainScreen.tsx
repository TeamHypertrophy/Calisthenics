import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Button, Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { logEverything, storage } from "@/utils/storage"
import { useStores } from "@/models"
import notifee from "@notifee/react-native"

export const MainScreen: FC<HomeTabScreenProps<"Main">> = observer(function MainScreen(_props) {
  const { navigation } = _props

  const {
    profileStore: { updateSpecific },
  } = useStores()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  async function onDisplayNotification() {
    await notifee.requestPermission()

    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel"
    })

    await notifee.displayNotification({
      title: "Notification Title",
      body: "Main body content of the notification",
      android: {
        channelId,
        pressAction: {
          id: "default",
        },
      },
    })


  }

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
            "https://live-pig-nearby.ngrok-free.app//assets/avatars/47c1f63e-adb6-4fe8-be69-6b079f2d9baf/872826.png",
          )
        }
      />
      <Button text="Log Local Storage" onPress={() => logEverything()} />
      <Button text="Display Notification" onPress={() => onDisplayNotification()}/>
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
