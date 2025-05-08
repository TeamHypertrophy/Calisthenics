import { Button, Screen, Text } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { logEverything, storage } from "@/utils/storage"
import { useAppTheme } from "@/utils/useAppTheme"
import notifee from "@notifee/react-native"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

interface DeveloperScreenProps extends AppStackScreenProps<"Developer"> {}

export const DeveloperScreen: FC<DeveloperScreenProps> = observer(function DeveloperScreen(_props) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
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
      name: "Default Channel",
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

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Button
        text="Clear Local Stoage"
        onPress={() => storage.clearAll()}
        style={themed($button)}
      />
      <Button
        text="Set Avatar"
        style={themed($button)}
        onPress={() =>
          updateSpecific(
            "https://live-pig-nearby.ngrok-free.app//assets/avatars/47c1f63e-adb6-4fe8-be69-6b079f2d9baf/872826.png",
          )
        }
      />
      <Button text="Log Local Storage" onPress={() => logEverything()} style={themed($button)} />
      <Button
        text="Display Notification"
        onPress={() => onDisplayNotification()}
        style={themed($button)}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  marginBottom: spacing.xl,
  borderRadius: 120,
  padding: 10,
})
