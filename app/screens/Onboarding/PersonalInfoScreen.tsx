import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text, TextField } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Gender } from "@/services/api"
import { useIsConnected } from "react-native-offline"
import { MaterialIcons } from "@expo/vector-icons"
import { renderToast } from "@/utils/toastNotification"
import { api } from "@/services/api"
import { saveString } from "@/utils/storage"
import { Dropdown } from "react-native-element-dropdown"

interface PersonalInfoScreenProps extends AppStackScreenProps<"PersonalInfo"> {}

export const PersonalInfoScreen: FC<PersonalInfoScreenProps> = observer(
  function PersonalInfoScreen(_props) {
    const { navigation } = _props

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState(0)
    const [gender, setGender] = useState<Gender>("male")

    const [isSaving, setIsSaving] = useState(false)

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const isConnected = useIsConnected()

    /*
  - what is your first name
  - what is your last name
  - what is your age
  - what is your gender
  */

    const saveAndgoNext = async () => {
      setIsSaving(true)

      try {
        const data = {
          first_name: firstName,
          last_name: lastName,
          age: age,
          gender: gender,
        }

        await api.createProfile({
          ...data,
        })

        saveString("firstName", firstName)
        saveString("lastName", lastName)
        saveString("age", age.toString())
        saveString("gender", gender)

        navigation.navigate("Preferences")
      } catch (error) {
        console.error("Error Saving Personal Information:", error)
        renderToast("Error", "Failed Saving Personal Information", "error")
      } finally {
        setIsSaving(false)
      }
    }

    if (!isConnected) {
      return (
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <View style={themed($errorContainer)}>
            <MaterialIcons
              name="signal-wifi-connected-no-internet-4"
              size={60}
              color={colors.palette.neutral700}
            />
            <Text
              text="No Internet Connectivity"
              preset="subheading"
              style={themed($privacyTitle)}
            />
            <Text text="This Action Requires An Internet Connection" style={themed($privacyText)} />
            <Button text="Go Back" onPress={() => navigation.goBack()} style={themed($button)} />
          </View>
        </Screen>
      )
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Let's Get You Started" preset="heading" />

        <TextField />
        <TextField />

        <TextField />

        {/* Dropdown */}

        <Button text="Next" onPress={saveAndgoNext} disabled={isSaving} />
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

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $privacyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginVertical: spacing.sm,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  marginTop: spacing.md,
})

const $privacyTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginTop: spacing.md,
})
