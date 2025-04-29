import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface PreferencesScreenProps extends AppStackScreenProps<"Preferences"> {}

export const PreferencesScreen: FC<PreferencesScreenProps> = observer(
  function PreferencesScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    /*
  - do you prefer kg/lb
  - do you prefer in/cm
  - public/private profile
  */

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Preferences" preset="heading" />

        <Button text="Next" onPress={() => navigation.navigate("Public")} />
        <Button
          text="Back To Main"
          onPress={() => navigation.navigate("Home", { screen: "Main" })}
        />
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
