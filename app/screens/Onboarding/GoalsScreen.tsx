import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface GoalsScreenProps extends AppStackScreenProps<"Goals"> {}

export const GoalsScreen: FC<GoalsScreenProps> = observer(function GoalsScreen(_props) {
  const { navigation } = _props

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  /*
  - what is your weight
  - what is your height
  - set fitness goal
  - set diet
  */

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Text text="What Are Your Goals?" preset="heading" />

      <Button text="Next" onPress={() => navigation.navigate("Goals")} />
      <Button text="Back To Main" onPress={() => navigation.navigate("Home", { screen: "Main" })} />
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
