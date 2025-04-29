import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface PublicScreenProps extends AppStackScreenProps<"Public"> {}

export const PublicScreen: FC<PublicScreenProps> = observer(function PublicScreen(_props) {
  const { navigation } = _props

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  /*
  - set a bio
  - upload avatar
  - set activity level
  */

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Text text="Public Information" preset="heading" />

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
