import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text, TextField } from "@/components"
import { spacing, ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Diet, FitnessGoal, Profile } from "@/services/api"
import { useStores } from "@/models"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { renderToast } from "@/utils/toastNotification"
import { Dropdown } from "react-native-element-dropdown"

interface GoalsScreenProps extends AppStackScreenProps<"Goals"> {}

export const GoalsScreen: FC<GoalsScreenProps> = observer(function GoalsScreen(_props) {
  const { navigation } = _props

  const { profileStore: { updateProfile }, authenticationStore: { userID }} = useStores()
  const queryClient = useQueryClient()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [weight, setWeight] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("strength")
  const [diet, setDiet] = useState<Diet>("anything")

  const fitnessGoalOptions = [
    { label: "Weight Loss", value: "WeightLoss" },
    { label: "Muscle Gain", value: "MuscleGain" },
    { label: "Endurance", value: "Endurance" },
    { label: "Strength", value: "Strength" },
    { label: "Maintenance", value: "Maintenance" },
  ]

  const dietOptions = [
    { label: "Anything", value: "Anything" },
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Vegan", value: "Vegan" },
    { label: "Keto", value: "Keto" },
  ]

  const saveInformation = useMutation({
    mutationFn: (data: Partial<Profile>) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userID] })
      renderToast("Success", "Onboarding Complete!", "success")
      navigation.navigate("Home", { screen: "Main" })
    },
    onError: () => renderToast("Error", "Failed to save information", "error"),
  })

  const onNext = () => {
    if (!weight || !height || !fitnessGoal || !diet) {
      renderToast("Missing Fields", "Please fill all fields", "error")
      return
    }

    saveInformation.mutate({ weight, height, fitness_goal: fitnessGoal, diet })
  }
  

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Text text="Let's Finish This" preset="heading" style={{ marginBottom: spacing.lg }} />

      <TextField
        label="Weight"
        placeholder="e.g. 70"
        keyboardType="number-pad"
        value={weight != null ? String(weight) : ""}
        onChangeText={(text) => setWeight(Number(text))}
        containerStyle={{ marginBottom: spacing.md }}
      />

      <TextField
        label="Height"
        placeholder="e.g. 170"
        keyboardType="number-pad"
        value={height != null ? String(height) : ""}
        onChangeText={(text) => setHeight(Number(text))}
        containerStyle={{ marginBottom: spacing.md }}
      />

      <Text style={themed($fieldLabel)}>Fitness Goal</Text>
      <Dropdown
        data={fitnessGoalOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Fitness Goal"
        value={fitnessGoal}
        onChange={(item) => setFitnessGoal(item.value as FitnessGoal)}
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

      <Text style={themed($fieldLabel)}>Diet Preference</Text>
      <Dropdown
        data={dietOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Diet"
        value={diet}
        onChange={(item) => setDiet(item.value as Diet)}
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
        text="Finish"
        onPress={onNext}
        style={{ marginBottom: spacing.sm, borderRadius: 120 }}
      />

      <Button
        text="Back"
        onPress={() => navigation.navigate("Public")}
        style={{ marginBottom: spacing.lg, borderRadius: 120 }}
      />
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

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})