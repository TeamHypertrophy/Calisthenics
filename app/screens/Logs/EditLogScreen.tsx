import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface EditLogScreenProps extends AppStackScreenProps<"EditLog"> {}

export const EditLogScreen: FC<EditLogScreenProps> = observer(function EditLogScreen(_props) {
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
      <Text text="editLog" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})
