import { FC } from "react"
import { observer } from "mobx-react-lite" 
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "@/models" 


export const MainScreen: FC<HomeTabScreenProps<"Main">> = observer(function MainScreen() {
  
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContentContainer)}>
      <Text text="Hypertrophy" preset="heading" />

      <Text text="Welcome!" />
    </Screen>
  )

})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $root: ViewStyle = {
  flex: 1,
}
