import { Button, Loading, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Dropdown } from "react-native-element-dropdown"

interface TrainerRequestScreenProps extends AppStackScreenProps<"TrainerRequest"> {}

export const TrainerRequestScreen: FC<TrainerRequestScreenProps> = observer(
  function TrainerRequestScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const queryClient = useQueryClient()

    const [specialization, setSpecialization] = useState<string>("")
    const [experience, setExperience] = useState<string>("")

    const specializationOptions = [
      { label: "Weight Loss", value: "WeightLoss" },
      { label: "Muscle Gain", value: "MuscleGain" },
      { label: "Endurance", value: "Endurance" },
      { label: "Strength", value: "Strength" },
      { label: "Maintenance", value: "Maintenance" },
    ]

    const requestTrainer = useMutation({
      mutationFn: async (data: { user_id: string; specialization: string; experience: string }) => {
        const response = await api.requestTrainer(data)

        if (!response.ok) {
          throw new Error("Failed to request trainer")
        }
      },
      onSuccess: () => {
        renderToast("Success", "Trainer Request Submitted Successfully", "success")
        queryClient.invalidateQueries({ queryKey: ["trainer", userID] })
        navigation.goBack()
      },
      onError: (error) => {
        console.error("[Trainer Request] Error Submitting Request", error)
        renderToast("Error", "Failed to Submit Trainer Request", "error")
      },
    })

    const handleRequest = () => {
      if (!specialization || !experience) {
        renderToast("Missing Fields", "Please Fill All Fields", "error")
        console.error("Missing Fields")
        return
      }

      requestTrainer.mutate({
        user_id: userID,
        specialization,
        experience,
      })
    }

    if (requestTrainer.isPending) {
      return <Loading />
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Request Trainer Verification" preset="heading" />
        <Text
          text="Please Provide Your Specialization and Experience As A Trainer"
          style={themed($subheading)}
        />

        <View style={themed($formGroup)}>
          <Text style={themed($fieldLabel)} text="Specialization" />
          <Dropdown
            data={specializationOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Specialization"
            value={specialization}
            onChange={(item) => setSpecialization(item.value)}
            containerStyle={{ marginBottom: spacing.md }}
            style={themed($dropdown)}
            placeholderStyle={{ color: colors.textDim }}
            selectedTextStyle={{ color: colors.text }}
          />
        </View>

        <View style={themed($formGroup)}>
          <Text text="Experience" preset="formLabel" style={themed($fieldLabel)} />
          <TextField
            placeholder="Describe Your Experience As A Trainer"
            value={experience}
            onChangeText={setExperience}
            multiline
            numberOfLines={4}
            containerStyle={themed($textFieldContainer)}
            style={themed($textInputStyle)}
          />
        </View>

        <Button
          text="Submit Request"
          onPress={handleRequest}
          style={themed($requestButton)}
          preset="filled"
          disabled={requestTrainer.isPending}
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
  color: colors.text,
})

const $formGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $subheading: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  marginBottom: spacing.xl,
  textAlign: "left",
  color: colors.textDim,
  fontSize: 16,
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

const $textFieldContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: spacing.xs,
})

const $textInputStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  minHeight: 100,
  textAlignVertical: "top",
  padding: spacing.sm,
  color: colors.text,
  fontSize: 16,
})

const $requestButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})
