import { Button, InfoChip, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useRef, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Modalize } from "react-native-modalize"

interface ViewCustomExerciseScreenProps extends AppStackScreenProps<"ViewCustomExercise"> {}

export const ViewCustomExerciseScreen: FC<ViewCustomExerciseScreenProps> = observer(
  function ViewCustomExerciseScreen(_props) {
    const { navigation } = _props
    const exerciseID = _props.route.params?.exerciseID

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const deleteModalRef = useRef<Modalize>(null)
    const queryClient = useQueryClient()

    const {
      data: exercise,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["customExercise", exerciseID],
      queryFn: async () => {
        const response = await api.getCustomExerciseByID(exerciseID)

        if (response.ok && response.data) {
          return response.data
        } else {
          throw new Error("Failed Fetching Custom Exercise Data")
        }
      },
    })

    const deleteMutation = useMutation({
      mutationFn: async (id: number) => {
        const response = await api.deleteCustomExercise(id)
        if (!response.ok) {
          throw new Error("Failed Deleting Custom Exercise")
        }
        return response.data
      },
      onSuccess: () => {
        deleteModalRef.current?.close()
        renderToast("Success", "Custom Exercise Deleted Successfully.", "success")
        queryClient.removeQueries({ queryKey: ["customExercise", exerciseID] })
        queryClient.invalidateQueries({ queryKey: ["customExercises", userID] })
        navigation.goBack()
      },
      onError: (e: Error) => {
        deleteModalRef.current?.close()
        renderToast("Error", "There Was An Error Deleting Your Custom Exercise", "error")
      },
    })

    const openDeleteModal = () => {
      deleteModalRef.current?.open()
    }

    const confirmDelete = () => {
      deleteMutation.mutate(exerciseID)
    }

    const handleEdit = () => {
      navigation.navigate("EditCustomExercise", { exerciseID: exerciseID })
    }

    if (isLoading || deleteMutation.isPending) {
      return <Loading />
    }

    if (isError) {
      console.error("Error Fetching Custom Exercise:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Custom Exercise Data"
          onBack={() => navigation.goBack()}
        />
      )
    }

    if (!exercise) {
      renderToast("Not Available", "Custom Exercise Data Missing", "error")
      console.error("Custom Exercise Data Not Available")
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Custom Exercise Data"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <>
        <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
          <View style={themed($headerContainer)}>
            <Text
              preset="heading"
              text={exercise.name}
              style={themed($exerciseNameHeader)}
              numberOfLines={2}
              ellipsizeMode="tail"
            />
            <View style={themed($headerButtonsContainer)}>
              <Button
                preset="filled"
                onPress={handleEdit}
                style={themed($actionButton)}
                LeftAccessory={() => (
                  <MaterialIcons
                    name="edit"
                    size={25}
                    color={colors.palette.secondary400}
                  />
                )}
              />
              <Button
                preset="filled"
                onPress={openDeleteModal}
                style={themed([$actionButton, $deleteButton])}
                textStyle={themed($deleteButtonText)}
                LeftAccessory={() => (
                  <MaterialIcons
                    name="delete-forever"
                    size={25}
                    color={colors.palette.secondary400}
                  />
                )}
              />
            </View>
          </View>

          <View style={themed($detailsContainer)}>
            <View style={themed($detailRow)}>
              <InfoChip label="Equipment" value={exercise.equipment} />
              <InfoChip label="Difficulty" value={exercise.difficulty} />
            </View>
            <View style={themed($detailRow)}>
              <InfoChip label="Muscle Group" value={exercise.muscle_group} />
              <InfoChip label="Type" value={exercise.exercise_type} />
            </View>

            {(exercise.sets || exercise.reps || exercise.rest_time) && (
              <>
                <View style={themed($separator)} />
                <View style={themed($detailSection)}>
                  <Text preset="subheading" text="Recommendations" />
                  {exercise.sets && (
                    <Text text={`Sets: ${exercise.sets}`} style={themed($detailText)} />
                  )}
                  {exercise.reps && (
                    <Text text={`Reps: ${exercise.reps}`} style={themed($detailText)} />
                  )}
                  {exercise.rest_time && (
                    <Text text={`Rest: ${exercise.rest_time}s`} style={themed($detailText)} />
                  )}
                </View>
              </>
            )}
          </View>
        </Screen>

        <Modalize
          ref={deleteModalRef}
          adjustToContentHeight
          modalStyle={themed($modalStyle)}
          handleStyle={{ width: 60, alignSelf: "center", backgroundColor: colors.border }}
        >
          <View style={themed($modalContent)}>
            <View style={themed($modalIconContainer)}>
              <MaterialIcons name="delete-forever" size={40} color={colors.error} />
            </View>

            <Text text="Delete Exercise" preset="subheading" style={themed($modalTitle)} />
            <Text
              text={`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`}
              style={themed($modalMessage)}
            />

            <View style={$modalButtonsContainer}>
              <Button
                text="Cancel"
                style={themed($cancelButton)}
                textStyle={themed($cancelButtonText)}
                preset="filled"
                onPress={() => deleteModalRef.current?.close()}
              />
              <Button
                text="Delete"
                style={themed($confirmDeleteButton)}
                textStyle={$confirmButtonText}
                preset="filled"
                onPress={confirmDelete}
              />
            </View>
          </View>
        </Modalize>
      </>
    )
  },
)

const $root: ViewStyle = { flex: 1 }

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $exerciseNameHeader: ThemedStyle<TextStyle> = ({ spacing }) => ({
  flexShrink: 1,
  marginRight: spacing.md,
  fontSize: spacing.lg,
})

const $headerButtonsContainer: ThemedStyle<ViewStyle> = ({}) => ({
  justifyContent: "space-between",
  flexDirection: "row",
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 50,
  height: 50,
  padding: spacing.xxs,
  marginLeft: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 50,
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  alignItems: "center",
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})

const $deleteButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.secondary400,
})

const $detailsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
})

const $detailSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $detailText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  lineHeight: 20,
  color: colors.textDim,
})

const $detailRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginVertical: spacing.lg,
})

const $modalStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: spacing.xl,
})

const $modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
  alignItems: "center",
})

const $modalIconContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.error + "20",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
  fontSize: spacing.lg,
  color: colors.text,
})

const $modalMessage: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
  fontSize: spacing.sm,
  lineHeight: spacing.sm,
})

const $modalButtonsContainer: ViewStyle = {
  flexDirection: "row",
  width: "100%",
  justifyContent: "space-between",
}

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginRight: spacing.sm,
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 120,
})

const $cancelButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $confirmDeleteButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginLeft: spacing.sm,
  backgroundColor: colors.error,
  borderRadius: 120,
})

const $confirmButtonText: TextStyle = {
  color: "white",
}
