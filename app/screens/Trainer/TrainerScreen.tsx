import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

export const TrainerScreen: FC<HomeTabScreenProps<"Trainer">> = observer(function TrainerScreen() {
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text="Trainers" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
