import { Button, Loading, Screen, Text, TextField } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, Difficulty, Exercise } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import {
  FlatList,
  ImageBackground,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { Modalize } from "react-native-modalize"

import { DIFFICULTY_OPTIONS } from "../Exercises/EditCustomExerciseScreen"

interface EditWorkoutScreenProps extends AppStackScreenProps<"EditWorkout"> {}

export const EditWorkoutScreen: FC<EditWorkoutScreenProps> = observer(
  function EditWorkoutScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      authenticationStore: { userID },
    } = useStores()

    const workoutID = _props.route.params?.workoutID
    const exercisesToAdd = _props.route.params?.selectedExercises

    const queryClient = useQueryClient()
    const removeExerciseModalRef = useRef<Modalize>(null)

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [duration, setDuration] = useState<string>("")
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [focusDifficulty, setFocusDifficulty] = useState<boolean>(false)
    const [currentExercises, setCurrentExercises] = useState<Exercise[]>([])
    const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(null)

    const { data, isLoading, isError, error } = useQuery({
      queryKey: ["workout", workoutID],
      queryFn: async () => {
        const workoutResponse = await api.getWorkout(workoutID)

        if (!workoutResponse.data) {
          throw new Error("Failed Fetching Workout")
        }

        const exerciseIDs = workoutResponse.data.exercises || []

        const exercisePromises = exerciseIDs.map((id) =>
          api.getExerciseByID(id).then((res) => {
            if (res.ok && res.data) return res.data
            console.error(`Failed Fetching Exercise ${id}: ${res.problem} ${res.status}`)
            return null
          }),
        )

        let exercises = await Promise.all(exercisePromises)
        exercises = exercises.filter((ex) => ex !== null) as Exercise[]

        if (exercises.length !== exerciseIDs.length) {
          console.error("Not all exercises were fetched successfully")
          renderToast("Error", "Not all exercises were fetched successfully", "error")
        }

        setCurrentExercises(exercises?.filter((exercise) => exercise !== null) ?? [])
        setName(workoutResponse.data.name)
        setDescription(workoutResponse.data.description || "")
        setDifficulty((workoutResponse.data.difficulty as Difficulty) || null)

        return { ...workoutResponse.data, fullExercises: exercises }
      },
    })

    useEffect(() => {
      if (exercisesToAdd && exercisesToAdd.length > 0) {
        setCurrentExercises((prevExercises) => {
          const newExercises = exercisesToAdd.filter(
            (addedEx) =>
              !prevExercises.some((existingEx) => existingEx.exercise_id === addedEx.exercise_id),
          )
          return [...prevExercises, ...newExercises]
        })
        navigation.setParams({ selectedExercises: undefined })
      }
    }, [exercisesToAdd, navigation])

    const addExerciseMutation = useMutation({
      mutationFn: async (exerciseID: number) => {
        const response = await api.addExerciseToWorkout(workoutID, exerciseID)

        if (!response.ok) {
          throw new Error("Failed Adding Exercise")
        }

        return response.data
      },
      onSuccess: (_, exerciseID) => {
        const exerciseToAdd = exercisesToAdd?.find((ex) => ex.exercise_id === exerciseID)
        if (exerciseToAdd) {
          setCurrentExercises((prev) => {
            if (!prev.find((e) => e.exercise_id === exerciseID)) {
              return [...prev, exerciseToAdd]
            }
            return prev
          })
        }
        queryClient.invalidateQueries({ queryKey: ["workout", workoutID] })
        renderToast("Success", "Exercise Added To Workout", "success")
      },
      onError: (error: Error) => {
        console.error("Error Adding Exercise:", error)
        renderToast("Error", "Failed Adding Exercise", "error")
      },
    })

    useEffect(() => {
      if (exercisesToAdd && exercisesToAdd.length > 0 && workoutID) {
        const exercisesActuallyAdded: Exercise[] = []
        exercisesToAdd.forEach((exercise) => {
          if (
            !currentExercises.some((existingEx) => existingEx.exercise_id === exercise.exercise_id)
          ) {
            addExerciseMutation.mutate(exercise.exercise_id)
            exercisesActuallyAdded.push(exercise)
          }
        })
        navigation.setParams({ selectedExercises: undefined })
      }
    }, [exercisesToAdd, workoutID, navigation, currentExercises])

    const removeExerciseMutation = useMutation({
      mutationFn: async (exerciseId: number) => {
        const response = await api.removeExerciseFromWorkout(workoutID, exerciseId)

        if (!response.ok) {
          throw new Error("Failed Removing Exercise")
        }

        return response.data
      },
      onSuccess: (_, exerciseId) => {
        setCurrentExercises((prev) => prev.filter((ex) => ex.exercise_id !== exerciseId))
        queryClient.invalidateQueries({ queryKey: ["workout", workoutID] })
        renderToast("Success", "Exercise Removed From Workout", "success")
        removeExerciseModalRef.current?.close()
        setExerciseToRemove(null)
      },
      onError: (error: Error) => {
        console.error("Error Removing Exercise:", error)
        renderToast("Error", "Failed Removing Exercise", "error")
        removeExerciseModalRef.current?.close()
      },
    })

    const openRemoveExerciseModal = (exercise: Exercise) => {
      setExerciseToRemove(exercise)
      removeExerciseModalRef.current?.open()
    }

    const confirmRemoveExercise = () => {
      if (exerciseToRemove) {
        removeExerciseMutation.mutate(exerciseToRemove.exercise_id)
      }
    }

    const editWorkoutMutation = useMutation({
      mutationFn: async (payload: any) => {
        const updatePayload: any = {
          ...payload,
        }

        const response = await api.updateWorkout(workoutID, updatePayload)

        if (!response.ok) {
          throw new Error("Failed Updating Workout")
        }

        return response.data
      },
      onSuccess: () => {
        renderToast("Success", "Workout Updated Successfully!", "success")
        queryClient.invalidateQueries({ queryKey: ["workouts", userID] })
        queryClient.invalidateQueries({ queryKey: ["workout", workoutID] })
        navigation.goBack()
      },
      onError: (error: Error) => {
        console.error("Error Updating Workout:", error)
        renderToast("Error", "Failed Updating Workout", "error")
      },
    })

    const handleSaveChanges = () => {
      if (!name.trim()) {
        renderToast("Error", "Workout Name Cannot Be Empty.", "error")
        return
      }
      if (!difficulty) {
        renderToast("Error", "Please Select A Difficulty.", "error")
        return
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        difficulty: difficulty,
        duration: Number(duration),
      }
      editWorkoutMutation.mutate(payload)
    }

    const navigateToSearchExercises = () => {
      navigation.navigate("SearchExercises", {
        source: "EditWorkout",
        selectionMode: true,
        workoutID: workoutID,
        existingExcercises: currentExercises.map((ex) => ex.exercise_id),
      })
    }

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
      <View style={themed($exerciseItemContainer)}>
        <ImageBackground
          source={
            item.image_url
              ? { uri: item.image_url }
              : { uri: process.env.PLACEHOLDER_EXERCISE_IMAGE }
          }
          style={themed($exerciseItemImage)}
          imageStyle={{ borderRadius: spacing.xs }}
        >
          <View style={themed($exerciseItemOverlay)}>
            <Text style={themed($exerciseItemText)} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </ImageBackground>
        <TouchableOpacity
          onPress={() => openRemoveExerciseModal(item)}
          style={themed($removeButton)}
        >
          <MaterialIcons name="remove-circle" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    )

    if (
      isLoading ||
      editWorkoutMutation.isPending ||
      addExerciseMutation.isPending ||
      removeExerciseMutation.isPending
    ) {
      return <Loading />
    }

    if (isError) {
      console.error("Error Fetching Workout:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Workout"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <>
        <Screen
          style={$root}
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainerFixed)}
        >
          <View style={themed($headerSectionView)}>
            <Text preset="heading" text="Edit" style={themed($titleStyle)} />
            <TextField
              label="Workout Name"
              placeholder="e.g., Push Day"
              value={name}
              onChangeText={setName}
              containerStyle={themed($textField)}
            />
            <TextField
              label="Description"
              placeholder="e.g., A Workout For Upper Body"
              value={description}
              onChangeText={setDescription}
              containerStyle={themed($textField)}
              multiline
            />

            <TextField
              label="Duration (seconds)"
              placeholder="e.g., 3600"
              value={duration}
              onChangeText={setDuration}
              containerStyle={themed($textField)}
            />
            <Text style={themed($fieldLabel)}>Difficulty</Text>
            <Dropdown
              style={themed([
                $dropdown,
                focusDifficulty && { borderColor: colors.palette.primary500 },
              ])}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              iconStyle={themed($iconStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={DIFFICULTY_OPTIONS}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!focusDifficulty ? "Select Difficulty" : "..."}
              value={difficulty}
              onFocus={() => setFocusDifficulty(true)}
              onBlur={() => setFocusDifficulty(false)}
              onChange={(item) => {
                setDifficulty(item.value as Difficulty)
                setFocusDifficulty(false)
              }}
            />
            <View style={themed($exercisesHeaderContainer)}>
              <Text preset="subheading" text="Exercises" />
              <Button
                text="Add Exercise"
                preset="filled"
                onPress={navigateToSearchExercises}
                style={themed($addExerciseButton)}
                LeftAccessory={() => (
                  <MaterialIcons name="add" size={20} color={colors.palette.secondary400} />
                )}
              />
            </View>
          </View>

          {currentExercises.length > 0 ? (
            <FlatList
              data={currentExercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.exercise_id.toString()}
              style={themed($exerciseList)}
              contentContainerStyle={themed($exerciseListContentContainer)}
            />
          ) : (
            <View style={themed($emptyStateContainer)}>
              <Text style={themed($noExercisesText)}>
                No Exercises Added. Click "Add Exercise" To Get Started.
              </Text>
            </View>
          )}

          <View style={themed($footerSection)}>
            <Button
              text="Save Workout"
              preset="filled"
              onPress={handleSaveChanges}
              style={themed($saveButton)}
              disabled={
                editWorkoutMutation.isPending ||
                addExerciseMutation.isPending ||
                removeExerciseMutation.isPending
              }
            />
          </View>
        </Screen>

        <Modalize ref={removeExerciseModalRef} adjustToContentHeight>
          <View style={themed($modalContentContainer)}>
            <Text preset="subheading" style={themed($modalTitle)}>
              Remove Exercise
            </Text>
            <Text style={themed($modalMessage)}>
              Are you sure you want to remove "{exerciseToRemove?.name}" from this workout?
            </Text>
            <View style={themed($modalButtonContainer)}>
              <Button
                text="Cancel"
                preset="filled"
                onPress={() => removeExerciseModalRef.current?.close()}
                style={themed($modalButton)}
              />
              <Button
                text="Remove"
                preset="filled"
                onPress={confirmRemoveExercise}
                style={themed([$modalButton, $cancelButton])}
                disabled={removeExerciseMutation.isPending}
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

const $titleStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "left",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 16,
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $headerSectionView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.sm,
  flexShrink: 1,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 50,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: spacing.xs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.background,
  marginBottom: spacing.md,
})

const $placeholderStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $selectedTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
})

const $iconStyle: ThemedStyle<ImageStyle> = ({}) => ({
  width: 20,
  height: 20,
})

const $itemContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
})

const $itemTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
})

const $exercisesHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
})

const $addExerciseButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 120,
  paddingVertical: spacing.xs,
})

const $exerciseItemContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.background,
  borderRadius: spacing.xs,
  marginBottom: spacing.sm,
  elevation: 1,
})

const $exerciseItemImage: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 80,
  height: 60,
  borderRadius: spacing.xs,
  marginRight: spacing.sm,
  justifyContent: "flex-end",
})

const $exerciseItemOverlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "rgba(0,0,0,0.4)",
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xs,
  borderBottomLeftRadius: spacing.xs,
  borderBottomRightRadius: spacing.xs,
})

const $exerciseItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.palette?.neutral100 || "#FFFFFF",
  fontWeight: "500",
})

const $removeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $noExercisesText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginVertical: spacing.lg,
  color: colors.textDim,
  fontSize: 16,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.lg,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $modalContentContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.lg,
  backgroundColor: colors.background,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
  color: colors.text,
})

const $modalMessage: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.lg,
  textAlign: "center",
  color: colors.textDim,
  fontSize: 16,
})

const $modalButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
})

const $modalButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginHorizontal: spacing.xs,
  borderRadius: 120,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.angry500,
  marginRight: spacing.sm,
})

const $screenContentContainerFixed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "column",
})

const $exerciseList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginHorizontal: spacing.lg,
})

const $exerciseListContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.sm,
})

const $emptyStateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginHorizontal: spacing.lg,
})

const $footerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
})
