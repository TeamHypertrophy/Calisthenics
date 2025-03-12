import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "@/models"

export const LogsScreen: FC<HomeTabScreenProps<"Logs">> = observer(function LogsScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text="logsScreen" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
