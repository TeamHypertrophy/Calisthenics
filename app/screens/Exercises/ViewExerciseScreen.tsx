import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface ViewExerciseScreenProps extends AppStackScreenProps<"ViewExercise"> {}

export const ViewExerciseScreen: FC<ViewExerciseScreenProps> = observer(
  function ViewExerciseScreen(_props) {
    const { navigation } = _props

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
        <Text text="viewExercise" />
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
