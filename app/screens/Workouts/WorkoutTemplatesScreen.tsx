import { Screen, Text } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ViewStyle } from "react-native"

interface WorkoutTemplatesScreenProps extends AppStackScreenProps<"WorkoutTemplates"> {}

export const WorkoutTemplatesScreen: FC<WorkoutTemplatesScreenProps> = observer(
  function WorkoutTemplatesScreen(_props) {
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
        <Text text="workoutTemplates" />
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
