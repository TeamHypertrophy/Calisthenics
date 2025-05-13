import { Button, Loading, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, CreateExerciseLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { ScrollView, TextStyle, ViewStyle } from "react-native"

interface CreateExerciseLogScreenProps extends AppStackScreenProps<"CreateExerciseLog"> {}

export const CreateExerciseLogScreen: FC<CreateExerciseLogScreenProps> = observer(
  function CreateExerciseLogScreen(_props) {
    const { navigation } = _props

    const exercideID = _props.route.params?.exerciseID
    const exerciseName = _props.route.params?.exerciseName
    const queryClient = useQueryClient()

    const {
      authenticationStore: { userID },
    } = useStores()
    
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const [sets, setSets] = useState("")
    const [reps, setReps] = useState("")

    const createLog = useMutation({
      mutationFn: async (data: CreateExerciseLog) => {
        const response = await api.createExerciseLog(data)

        if (!response.ok && !response.data) {
          renderToast("Error", "Failed Creating Exercise Log", "error")
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exerciseLogs", userID] })
        renderToast("Success", "Exercise Log Created Successfully", "success")
        navigation.navigate("ViewExerciseLogs")
      },
      onError: (error) => {
        console.error("Error Creating Exercise Log:", error)
        renderToast("Error", "Failed Creating Exercise Log", "error")
      },
    })

    const handleCreate = () => {
      const setsCompleted = parseInt(sets, 10)
      const repsCompleted = parseInt(reps, 10)

      if (
        setsCompleted <= 0 ||
        repsCompleted <= 0
      ) {
        renderToast("Error", "Please Enter Valid Sets and Reps", "error")
        return
      }

      const payload: CreateExerciseLog = {
        user_id: userID,
        exercise_id: exercideID,
        sets_completed: setsCompleted,
        reps_completed: repsCompleted,
      }

      createLog.mutate(payload)
    }

    if (createLog.isPending) {
      return <Loading />
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text preset="heading" text={`Log ${exerciseName}`} style={themed($title)} />

          <TextField
            label="Sets Completed"
            placeholder="e.g., 3"
            keyboardType="number-pad"
            value={sets}
            onChangeText={setSets}
            containerStyle={themed($textField)}
          />

          <TextField
            label="Reps Completed (per set)"
            placeholder="e.g., 10"
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            containerStyle={themed($textField)}
          />
        </ScrollView>

        <Button
          text="Save"
          preset="filled"
          onPress={handleCreate}
          style={themed($saveButton)}
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  flexGrow: 1,
  justifyContent: "space-between",
})

const $title: ThemedStyle<TextStyle> = ({ spacing, typography }) => ({
  marginBottom: spacing.xl,
  textAlign: "left",
  fontSize: spacing.xxl,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})