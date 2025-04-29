import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"

interface TrainerAnnouncementScreenProps extends AppStackScreenProps<"TrainerAnnouncement"> {}

export const TrainerAnnouncementScreen: FC<TrainerAnnouncementScreenProps> = observer(
  function TrainerAnnouncementScreen() {
    return (
      <Screen style={$root} preset="auto">
        <Text text="trainerAnnouncement" />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
