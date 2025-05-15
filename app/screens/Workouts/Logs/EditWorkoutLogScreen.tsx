import { Button, Loading, Screen, Text } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { createProteinDate } from "@/utils/formatDate"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useRef, useState } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Modalize } from "react-native-modalize"

interface EditWorkoutLogScreenProps extends AppStackScreenProps<"EditWorkoutLog"> {}

export const EditWorkoutLogScreen: FC<EditWorkoutLogScreenProps> = observer(
  function EditWorkoutLogScreen(_props) {
    const { navigation } = _props

    const { logID, workoutName, initialDate } = _props.route.params

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const queryClient = useQueryClient()
    const deleteModalRef = useRef<Modalize>(null)

    const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate) : new Date())
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

    const editLog = useMutation({
      mutationFn: async (data: any) => {
        const response = await api.editWorkoutLog(logID, data)
        if (!response.ok || !response.data) {
          throw new Error("Failed Updating Workout Log")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workoutLogs", userID] })
        queryClient.invalidateQueries({ queryKey: ["workoutLog", logID] })
        renderToast("Success", "Workout Log Updated Successfully", "success")
        navigation.goBack()
      },
      onError: (error) => {
        console.error("Error Updating Workout Log:", error)
        renderToast("Error", "Failed to update workout log", "error")
      },
    })

    const deleteLog = useMutation({
      mutationFn: async () => {
        const response = await api.deleteWorkoutLog(logID)

        if (!response.ok) {
          throw new Error("Failed to delete workout log")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workoutLogs", userID] })
        renderToast("Success", "Workout log deleted successfully", "success")
        deleteModalRef.current?.close()
        navigation.goBack()
      },
      onError: (error) => {
        console.error("Error deleting workout log:", error)
        renderToast("Error", "Failed to delete workout log", "error")
        deleteModalRef.current?.close()
      },
    })

    const handleSave = () => {
      if (!date) {
        renderToast("Error", "Please Select A Valid Date", "error")
        return
      }

      editLog.mutate({
        date: createProteinDate(date),
      })
    }

    const openDeleteModal = () => {
      deleteModalRef.current?.open()
    }

    const handleConfirmDelete = () => {
      deleteLog.mutate()
    }

    const showDatePicker = () => {
      setIsDatePickerVisible(true)
    }

    const hideDatePicker = () => {
      setIsDatePickerVisible(false)
    }

    const handleConfirmDate = (selectedDate: Date) => {
      setDate(selectedDate)
      hideDatePicker()
    }

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
            <Text preset="heading" text={`Edit Log: ${workoutName}`} style={themed($title)} />

            <View style={themed($dateContainer)}>
              <Text preset="formLabel" text="Workout Date" />
              <Text style={themed($dateText)}>{format(date, "MMM d, yyyy 'at' h:mm a")}</Text>
              <Button
                text="Change Date"
                preset="filled"
                onPress={showDatePicker}
                style={themed($changeDateButton)}
              />
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              date={date}
              onConfirm={handleConfirmDate}
              onCancel={hideDatePicker}
            />

            <Button
              text="Save Changes"
              preset="filled"
              onPress={handleSave}
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
            <Text preset="subheading" text="Delete Workout Log" style={themed($modalTitle)} />
            <Text style={themed($modalText)}>
              Are you sure you want to delete this workout log? This action cannot be undone.
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

const $dateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $dateText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: spacing.md,
  color: colors.text,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.xs,
  paddingHorizontal: spacing.sm,
  textAlign: "center",
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
})

const $changeDateButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  borderColor: colors.palette.primary500,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
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
  borderRadius: 120,
})

const $modalDeleteConfirmButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})
