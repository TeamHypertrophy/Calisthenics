import { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "@/navigators"
import { Button, Loading, Screen, Text, TextField } from "@/components"
import { api, Difficulty, Exercise } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  FlatList,
  ImageBackground,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Modalize } from "react-native-modalize"
import { renderToast } from "@/utils/toastNotification"
import { MaterialIcons } from "@expo/vector-icons"
import { DIFFICULTY_OPTIONS } from "../Exercises/EditCustomExerciseScreen"
import { Dropdown } from "react-native-element-dropdown"

interface CreateWorkoutScreenProps extends AppStackScreenProps<"CreateWorkout"> {}

export const CreateWorkoutScreen: FC<CreateWorkoutScreenProps> = observer(
  function CreateWorkoutScreen(_props) {
    const { navigation } = _props
    const queryClient = useQueryClient()

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const removeExerciseModalRef = useRef<Modalize>(null)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [duration, setDuration] = useState("")
    const [focusDifficulty, setFocusDifficulty] = useState<boolean>(false)
    const [currentExercises, setCurrentExercises] = useState<Exercise[]>([])
    const [exerciseToRemove, setExerciseToRemove] = useState<Exercise | null>(null)

    const exercisesToAdd = _props.route.params?.selectedExercises

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

    const createWorkoutMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await api.createWorkout(data)

        if (!response.ok && !response.data) {
          throw new Error("Failed Creating Workout")
        }

        return response.data
      },
      onSuccess: () => {
        renderToast("Success", "Workout Created Successfully", "success")
        queryClient.invalidateQueries({ queryKey: ["workouts", userID] })
        navigation.navigate("Workouts", {})
      },
      onError: (error) => {
        console.error("Error Creating Workout:", error)
        renderToast("Error", "Failed Creating Workout", "error")
      },
    })

    const openRemoveExerciseModal = (exercise: Exercise) => {
      setExerciseToRemove(exercise)
      removeExerciseModalRef.current?.open()
    }

    const confirmRemoveExercise = () => {
      if (exerciseToRemove) {
        setCurrentExercises((prev) =>
          prev.filter((ex) => ex.exercise_id !== exerciseToRemove.exercise_id),
        )
        removeExerciseModalRef.current?.close()
        setExerciseToRemove(null)
        renderToast("Success", `${exerciseToRemove.name} Removed Successfully`, "success")
      }
    }

    const handleCreateWorkout = () => {
      if (!name.trim()) {
        renderToast("Error", "Workout Name Cannot Be Empty.", "error")
        return
      }

      if (!difficulty) {
        renderToast("Error", "Please Select A Difficulty.", "error")
        return
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        duration: Number(duration),
        user_id: userID,
        exercises: currentExercises.map((ex) => ex.exercise_id),
      }
      createWorkoutMutation.mutate(payload)
    }

    const navigateToSearchExercises = () => {
      navigation.navigate("SearchExercises", {
        source: "CreateWorkout",
        selectionMode: true,
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

    if (createWorkoutMutation.isPending) {
      return <Loading />
    }

    return (
      <>
        <Screen
          style={$root}
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <View style={themed($headerSectionView)}>
            <Text preset="heading" text="Create" style={themed($titleStyle)} />
            <TextField
              label="Workout Name"
              placeholder="e.g., Pull Day"
              value={name}
              onChangeText={setName}
              containerStyle={themed($textField)}
            />
            <TextField
              label="Description"
              placeholder="e.g., A Workout Focused on Pulling Muscles"
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
              iconStyle={$iconStyle}
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
              style={themed($exerciseListFixed)}
              contentContainerStyle={themed($exerciseListContentContainer)}
            />
          ) : (
            <View style={themed($emptyStateContainerFixed)}>
              <Text style={themed($noExercisesText)}>
                No exercises added yet. Click "Add Exercise" to get started.
              </Text>
            </View>
          )}

          <View style={themed($footerSectionFixed)}>
            <Button
              text="Create Workout"
              preset="filled"
              onPress={handleCreateWorkout}
              style={themed($saveButton)}
              disabled={createWorkoutMutation.isPending}
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
                textStyle={{ color: colors.text }}
              />
              <Button
                text="Remove"
                preset="filled"
                onPress={confirmRemoveExercise}
                style={themed($modalButton)}
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
  flex: 1,
  flexDirection: "column",
})

const $headerSectionView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.sm,
  flexShrink: 0,
})

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

const $iconStyle: ImageStyle = {
  width: 20,
  height: 20,
}

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

const $exerciseListFixed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginHorizontal: spacing.lg,
})

const $exerciseListContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.sm,
})

const $emptyStateContainerFixed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginHorizontal: spacing.lg,
})

const $noExercisesText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginVertical: spacing.lg,
  color: colors.textDim,
  fontSize: 16,
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

const $footerSectionFixed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
  flexShrink: 0,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
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
