import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"

export const LogsScreen: FC<HomeTabScreenProps<"Logs">> = observer(function LogsScreen() {
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text="logsScreen" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
