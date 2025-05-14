import { Button, Loading, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, UpdateExerciseLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { Modalize } from "react-native-modalize"

interface EditExerciseLogScreenProps extends AppStackScreenProps<"EditExerciseLog"> {}

export const EditExerciseLogScreen: FC<EditExerciseLogScreenProps> = observer(
  function EditExerciseLogScreen(_props) {
    const { navigation, route } = _props

    const { logID, exerciseName, setsCompleted, repsCompleted } = route.params

    const {
      authenticationStore: { userID },
    } = useStores()

    const queryClient = useQueryClient()
    const deleteModalRef = useRef<Modalize>(null)

    const [sets, setSets] = useState("")
    const [reps, setReps] = useState("")

    useEffect(() => {
      setSets(setsCompleted.toString())
      setReps(repsCompleted.toString())
    }, [setsCompleted, repsCompleted])

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const openDeleteModal = () => {
      deleteModalRef.current?.open()
    }

    const handleConfirmDelete = () => {
      deleteLog.mutate()
    }

    const saveLog = () => {
      const setsNum = parseInt(sets, 10)
      const repsNum = parseInt(reps, 10)

      if (isNaN(setsNum) || setsNum <= 0 || isNaN(repsNum) || repsNum <= 0) {
        renderToast("Error", "Please Enter Valid Sets and Reps", "error")
        return
      }

      editLog.mutate({ sets_completed: setsNum, reps_completed: repsNum })
    }

    const editLog = useMutation({
      mutationFn: async (data: UpdateExerciseLog) => {
        const response = await api.editExerciseLog(logID, data)

        if (!response.ok) {
          throw new Error("Failed Updating Exercise Log")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exerciseLogs", userID] })
        renderToast("Success", "Exercise Log Updated Successfully", "success")
        navigation.navigate("ViewExerciseLogs")
      },
      onError: (error) => {
        console.error("Error Updating Exercise Log:", error)
        renderToast("Error", "Failed Updating Exercise Log", "error")
      },
    })

    const deleteLog = useMutation({
      mutationFn: async () => {
        const response = await api.deleteExerciseLog(logID)

        if (!response.ok) {
          throw new Error("Failed Deleting Exercise Log")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exerciseLogs", userID] })
        renderToast("Success", "Exercise Log Deleted Successfully", "success")
        navigation.navigate("ViewExerciseLogs")
      },
      onError: (error) => {
        console.error("Error Deleting Exercise Log:", error)
        renderToast("Error", "Failed Deleting Exercise Log", "error")
      },
    })

    if (editLog.isPending || deleteLog.isPending) {
      return <Loading />
    }

    return (
      <>
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text
              preset="heading"
              text={`Edit Log: ${exerciseName}`}
              style={themed($title)}
            />

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

            <Button
              text="Save Changes"
              preset="filled"
              onPress={saveLog}
              style={themed($button)}
              disabled={editLog.isPending || deleteLog.isPending}
            />

            <Button
              text="Delete Log"
              preset="filled"
              onPress={openDeleteModal}
              style={themed($deleteButton)}
              textStyle={$deleteButtonText}
              disabled={editLog.isPending || deleteLog.isPending}
            />
          </ScrollView>
        </Screen>

          <Modalize ref={deleteModalRef} adjustToContentHeight>
            <View style={themed($modalContainer)}>
              <Text preset="subheading" text="Delete Exercise Log" style={themed($modalTitle)} />
              <Text style={themed($modalText)}>
                Are you sure you want to delete this exercise log? This action cannot be undone.
              </Text>
              <View style={$modalButtonContainer}>
                <Button
                  text="Cancel"
                  preset="filled"
                  onPress={() => deleteModalRef.current?.close()}
                  style={themed($modalButton)}
                  disabled={deleteLog.isPending}
                />
                
                <Button
                  text="Delete"
                  preset="filled"
                  onPress={handleConfirmDelete}
                  style={themed([$modalButton, $modalDeleteConfirmButton])}
                  textStyle={$deleteButtonText}
                  disabled={deleteLog.isPending}
                />
              </View>
            </View>
          </Modalize>
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
  flexGrow: 1,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
  textAlign: "left",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing , colors}) => ({
  marginTop: spacing.md,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 120,
  backgroundColor: colors.error,
})

const $deleteButtonText: TextStyle = {
  color: "#FFFFFF",
}

const $modalContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.lg,
  backgroundColor: colors.background,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  textAlign: "center",
})

const $modalText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
  textAlign: "center",
  lineHeight: 20,
})

const $modalButtonContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
}

const $modalButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginHorizontal: spacing.sm,
  borderRadius: 120
})

const $modalDeleteConfirmButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})