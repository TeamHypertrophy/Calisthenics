import { Screen, Text } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

interface WorkoutPlanTemplatesScreenProps extends AppStackScreenProps<"WorkoutPlanTemplates"> {}

export const WorkoutPlanTemplatesScreen: FC<WorkoutPlanTemplatesScreenProps> = observer(
  function WorkoutPlanTemplatesScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
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
        <Text text="workoutPlanTemplates" />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})
