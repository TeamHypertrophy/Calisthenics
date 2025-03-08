import { FC } from "react"
import { observer } from "mobx-react-lite" 
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text, TextField } from "@/components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "@/models" 
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { View } from "react-native"

interface MfaScreenProps extends AppStackScreenProps<"MFA"> {}


export const MfaScreen: FC<MfaScreenProps> = observer(function MfaScreen(_props) {
  
  const { navigation } = _props
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  function validateMFA() {
    navigation.navigate("Home", { screen: "Main" })
  }

  const {
      themed,
      theme: { colors },
    } = useAppTheme()
  

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll" contentContainerStyle={themed($screenContentContainer)}>
      <Text text="MFA Code" preset="heading" style={themed($mfaHeading)}/>

      

      <View style={themed($buttonContainer)}>
        <Button style={themed($button)} text="Submit" onPress={validateMFA} />
      </View>

    </Screen>

  )

})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $mfaHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  marginBottom: spacing.xs,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $root: ViewStyle = {
  flex: 1,
}
