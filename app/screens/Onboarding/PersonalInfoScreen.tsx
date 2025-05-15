import { Button, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { Gender, Profile } from "@/services/api"
import { ThemedStyle, spacing } from "@/theme"
import { clear } from "@/utils/storage"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { useIsConnected } from "react-native-offline"

interface PersonalInfoScreenProps extends AppStackScreenProps<"PersonalInfo"> {}

export const PersonalInfoScreen: FC<PersonalInfoScreenProps> = observer(
  function PersonalInfoScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      profileStore: { createProfile },
      authenticationStore: { userID },
    } = useStores()

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState(0)
    const [gender, setGender] = useState<Gender>("male")

    const queryClient = useQueryClient()
    const isConnected = useIsConnected()

    const saveData = useMutation({
      mutationFn: (updates: Partial<Profile>) => createProfile(updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile", userID] })
        renderToast("Success", "Profile Created", "success")
        navigation.navigate("Preferences")
      },
      onError: () => {
        renderToast("Error", "Failed to Create Profile", "error")
      },
    })

    const onNext = () => {
      if (!firstName || !lastName || !age || !gender) {
        renderToast("Missing Fields", "Please fill all fields", "error")
        return
      }

      saveData.mutate({
        user_id: userID,
        first_name: firstName,
        last_name: lastName,
        age: age,
        gender: gender,
      })
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
        <Text text="Let's Get You Started" preset="heading" style={{ marginBottom: spacing.lg }} />

        <TextField
          label="First Name"
          placeholder="John"
          value={firstName}
          onChangeText={setFirstName}
          containerStyle={{ marginBottom: spacing.md }}
        />
        <TextField
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
          containerStyle={{ marginBottom: spacing.md }}
        />

        <TextField
          label="Age"
          placeholder="e.g. 30"
          keyboardType="number-pad"
          value={age != null ? String(age) : ""}
          onChangeText={(text) => setAge(Number(text))}
          containerStyle={{ marginBottom: spacing.md }}
        />

        <Text style={themed($fieldLabel)}>Gender</Text>
        <Dropdown
          data={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select Gender"
          value={gender}
          onChange={(item) => setGender(item.value as Gender)}
          containerStyle={{ marginBottom: spacing.lg }}
          style={themed($dropdown)}
          placeholderStyle={{ color: colors.textDim }}
          selectedTextStyle={{ color: colors.text }}
        />

        <Button
          text="Next"
          onPress={onNext}
          style={{ marginBottom: spacing.lg, borderRadius: 120 }}
        />

        <Button onPress={() => clear()} preset="reversed" text="Skip" />
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

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: spacing.md,
  height: 48,
  marginBottom: spacing.md,
})
