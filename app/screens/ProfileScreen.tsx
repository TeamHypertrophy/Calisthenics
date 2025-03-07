import { FC } from "react"
import { observer } from "mobx-react-lite" 
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "@/models" 


export const ProfileScreen: FC<HomeTabScreenProps<"Profile">> = observer(
  function ProfileScreen(_props) {
  
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
      <Text text="profile" />
    </Screen>
  )

})

const $root: ViewStyle = {
  flex: 1,
}
