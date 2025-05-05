import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

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
