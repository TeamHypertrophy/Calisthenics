import { FC } from "react"
import { observer } from "mobx-react-lite" 
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "@/models" 

interface ListTrainersScreenProps extends AppStackScreenProps<"ListTrainers"> {}


export const ListTrainersScreen: FC<ListTrainersScreenProps> = observer(function ListTrainersScreen(_props) {
  
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const  { navigation } = _props

  const {
      themed,
      theme: { colors },
  } = useAppTheme()
  

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContentContainer)}>
      <Text text="listTrainers" />
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