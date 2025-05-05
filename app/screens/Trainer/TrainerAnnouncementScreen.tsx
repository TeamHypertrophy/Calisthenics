import { Screen, Text } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

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
