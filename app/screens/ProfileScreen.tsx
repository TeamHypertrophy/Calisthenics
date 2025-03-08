import { FC } from "react"
import { observer } from "mobx-react-lite" 
import { View, ViewStyle } from "react-native"
import { $styles } from "@/theme"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { useStores } from "@/models"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
// import { useNavigation } from "@react-navigation/native"

export const ProfileScreen: FC<HomeTabScreenProps<"Profile">> = observer(
  function ProfileScreen(_props) {
  
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const {
    authenticationStore: { logout },
  } = useStores()
  
  const {
      themed,
      theme: { colors },
  } = useAppTheme()


  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContentContainer)}>
      <Text text="Profile" preset="heading" />

      <View style={themed($buttonContainer)}>
        <Button style={themed($button)} tx="common:logOut" onPress={logout} />
      </View>

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

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  marginBottom: spacing.xs,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})
