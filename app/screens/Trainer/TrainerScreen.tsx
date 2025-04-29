import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"

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
