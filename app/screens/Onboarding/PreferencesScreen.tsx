import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { spacing, ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PreferredHeight, PreferredWeight, Profile } from "@/services/api"
import { renderToast } from "@/utils/toastNotification"
import { Dropdown } from "react-native-element-dropdown"
import { useStores } from "@/models"

interface PreferencesScreenProps extends AppStackScreenProps<"Preferences"> {}

export const PreferencesScreen: FC<PreferencesScreenProps> = observer(
  function PreferencesScreen(_props) {
    const { navigation } = _props

    const { profileStore: { updateProfile } , authenticationStore: { userID }} = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const queryClient = useQueryClient()

    const [weightUnit, setWeightUnit] = useState<PreferredWeight>("kg")
    const [heightUnit, setHeightUnit] = useState<PreferredHeight>("cm")
    const [isPublic, setIsPublic] = useState<boolean>(false)

    const savePrefrences = useMutation({
      mutationFn: (data: Partial<Profile>) => updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile", userID] })
        renderToast("Success", "Preferences Updated", "success")
        navigation.navigate("Public")
      },
      onError: () => renderToast("Error", "Failed to Update Preferences", "error"),
    })
    
    const onNext = () => {
      if (!weightUnit || !heightUnit || isPublic === undefined) {
        renderToast("Missing Fields", "Please fill all fields", "error")
        return
      }

      savePrefrences.mutate({ preferred_weight_unit: weightUnit, preferred_height_unit: heightUnit, public: isPublic })
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Your Preferences" preset="heading" style={{ marginBottom: spacing.lg }} />

        <Text style={themed($fieldLabel)}>Preferred Weight Unit</Text>
        <Dropdown
          data={[
            { label: "Kilograms (Kg)", value: "Kg" },
            { label: "Pounds (Lbs)", value: "Lbs" },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Weight Unit"
          value={weightUnit}
          onChange={(item) => setWeightUnit(item.value)}
          containerStyle={{ marginBottom: spacing.md }}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: spacing.md,
            height: 48,
            marginBottom: spacing.md,
          }}
          placeholderStyle={{ color: colors.textDim }}
          selectedTextStyle={{ color: colors.text }}
        />

        <Text style={themed($fieldLabel)}>Preferred Height Unit</Text>
        <Dropdown
          data={[
            { label: "Centimeters (Cm)", value: "Cm" },
            { label: "Inches (In)", value: "In" },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Height Unit"
          value={heightUnit}
          onChange={(item) => setHeightUnit(item.value)}
          containerStyle={{ marginBottom: spacing.md }}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: spacing.md,
            height: 48,
            marginBottom: spacing.md,
          }}
          placeholderStyle={{ color: colors.textDim }}
          selectedTextStyle={{ color: colors.text }}
        />

        <Text style={themed($fieldLabel)}>Profile Visibility</Text>
        <Dropdown
          data={[
            { label: "Public Profile", value: true },
            { label: "Private Profile", value: false },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Profile Visibility"
          value={isPublic}
          onChange={(item) => setIsPublic(item.value)}
          containerStyle={{ marginBottom: spacing.lg }}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: spacing.md,
            height: 48,
            marginBottom: spacing.md,
          }}
          placeholderStyle={{ color: colors.textDim }}
          selectedTextStyle={{ color: colors.text }}
        />

        <Button
          text="Next"
          onPress={onNext}
          style={{ marginBottom: spacing.sm, borderRadius: 120 }}
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

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})