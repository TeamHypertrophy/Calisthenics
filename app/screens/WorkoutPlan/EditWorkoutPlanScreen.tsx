import { Button, Loading, Screen, Switch, Text, TextField } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, Difficulty, FitnessGoal, Workout, WorkoutInterval } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { createProteinDate } from "@/utils/formatDate"
import { cancelPlanNotification, schedulePlanNotification } from "@/utils/notifications"
import { getLabel } from "@/utils/strings"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Modalize } from "react-native-modalize"

import { difficultyOptions } from "../Exercises/SearchExercisesScreen"
import { PlanForm } from "./CreateWorkoutPlanScreen"
import { goalOptions, intervalOptions } from "./WorkoutPlansScreen"

interface EditWorkoutPlanScreenProps extends AppStackScreenProps<"EditWorkoutPlan"> {}

export const EditWorkoutPlanScreen: FC<EditWorkoutPlanScreenProps> = observer(
  function EditWorkoutPlanScreen(_props) {
    const { navigation } = _props

    const planID = _props.route.params.planID

    const {
      authenticationStore: { userID },
    } = useStores()

    const removeWorkoutModalRef = useRef<Modalize>(null)
    const deletePlanRef = useRef<Modalize>(null)

    const queryClient = useQueryClient()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [goal, setGoal] = useState<FitnessGoal | null>(null)
    const [repeats, setRepeats] = useState<WorkoutInterval | null>(null)
    const [isPublic, setIsPublic] = useState(false)
    const [startTime, setStartTime] = useState<Date | null>(new Date())
    const [currentWorkouts, setCurrentWorkouts] = useState<Workout[]>([])
    const [workoutToRemove, setWorkoutToRemove] = useState<Workout | null>(null)

    const [focusDifficulty, setFocusDifficulty] = useState(false)
    const [focusGoal, setFocusGoal] = useState(false)
    const [focusRepeats, setFocusRepeats] = useState(false)
    const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState(false)

    const workoutsToAdd = _props.route.params?.selectedWorkouts
    const returningFormData = _props.route.params?.formData as PlanForm | undefined

    const {
      data: plan,
      isLoading: isLoadingPlan,
      isError: isErrorPlan,
      error: errorPlan,
    } = useQuery({
      queryKey: ["workoutPlan", planID],
      queryFn: async () => {
        const response = await api.getWorkoutPlan(planID)
        if (!response.ok || !response.data) {
          throw new Error("Failed Fetching Workout Plan")
        }
        return response.data
      },
    })

    const workoutIDs = useMemo(() => plan?.workouts || [], [plan])

    const queriesConfig = useMemo(() => {
      return workoutIDs.map((id) => ({
        queryKey: ["workout", id],
        queryFn: async () => {
          const response = await api.getWorkout(id)
          if (!response.ok || !response.data) {
            console.error(`Failed fetching workout ${id} for plan edit: ${response.problem}`)
            return null
          }
          return response.data
        },
      }))
    }, [workoutIDs, plan])

    const workoutQueries = useQueries({
      queries: queriesConfig,
    })

    const isLoadingWorkoutDetails = workoutQueries.some((query) => query.isLoading)

    useEffect(() => {
      if (returningFormData) {
        setName(returningFormData.name)
        setDescription(returningFormData.description)
        setDifficulty(returningFormData.difficulty)
        setGoal(returningFormData.goal)
        setRepeats(returningFormData.repeats)
        setIsPublic(returningFormData.isPublic)

        const newStartTimeFromForm = returningFormData.startTime
          ? new Date(returningFormData.startTime)
          : new Date()
        setStartTime((currentStartTime) => {
          if (
            currentStartTime === null ||
            currentStartTime.getTime() !== newStartTimeFromForm.getTime()
          ) {
            return newStartTimeFromForm
          }
          return currentStartTime
        })

        navigation.setParams({ formData: undefined })
      } else if (plan && !isLoadingWorkoutDetails) {
        setName(plan.name)
        setDescription(plan.description || "")
        setDifficulty(plan.difficulty)
        setGoal(plan.goal || null)
        setRepeats(plan.repeats || null)
        setIsPublic(plan.is_public || false)

        const newStartTimeValue = plan.start_time ? new Date(plan.start_time) : new Date()
        setStartTime((currentStartTime) => {
          if (
            currentStartTime === null ||
            currentStartTime.getTime() !== newStartTimeValue.getTime()
          ) {
            return newStartTimeValue
          }
          return currentStartTime
        })

        const newFetchedWorkouts = workoutQueries
          .filter((query) => query.isSuccess && query.data)
          .map((query) => query.data as Workout)

        setCurrentWorkouts((currentLocalWorkouts) => {
          const newWorkoutIdsString = newFetchedWorkouts
            .map((w) => w.workout_id)
            .sort()
            .join(",")
          const currentWorkoutIdsString = currentLocalWorkouts
            .map((w) => w.workout_id)
            .sort()
            .join(",")

          if (newWorkoutIdsString !== currentWorkoutIdsString) {
            return newFetchedWorkouts
          }
          return currentLocalWorkouts
        })
      }
    }, [plan, isLoadingWorkoutDetails, returningFormData, navigation])

    const updatePlanMutation = useMutation({
      mutationFn: async (payload: any) => {
        const response = await api.updateWorkoutPlan(planID, payload)
        if (!response.ok || !response.data) {
          throw new Error("Failed Updating Workout Plan")
        }
        return response.data
      },
      onSuccess: async (updatedPlan) => {
        queryClient.invalidateQueries({ queryKey: ["workoutPlan", planID] })
        queryClient.invalidateQueries({ queryKey: ["workoutPlans", userID] })
        await cancelPlanNotification(planID)
        await schedulePlanNotification(updatedPlan)
        renderToast("Success", "Workout plan updated successfully!", "success")
        navigation.goBack()
      },
      onError: (error: Error) => {
        console.error("Error Updating Workout Plan:", error)
        renderToast("Error", "Could Not Update Plan.", "error")
      },
    })

    const deletePlanMutation = useMutation({
      mutationFn: async () => {
        const response = await api.deleteWorkoutPlan(planID)
        if (!response.ok) {
          throw new Error(response.data?.message || "Failed to delete workout plan")
        }
        return response.data
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["workoutPlans", userID] })
        await queryClient.removeQueries({ queryKey: ["workoutPlan", planID] })
        await cancelPlanNotification(planID)
        renderToast("Success", "Workout plan deleted successfully!", "success")
        navigation.navigate("WorkoutPlans")
      },
      onError: (error: Error) => {
        console.error("Error Deleting Workout Plan:", error)
        renderToast("Error", "Could not delete workout plan.", "error")
        deletePlanRef.current?.close()
      },
    })

    const addWorkoutToPlanMutation = useMutation({
      mutationFn: async (workoutID: string) => {
        const response = await api.addWorkoutToPlan(planID, workoutID)
        if (!response.ok) {
          throw new Error("Failed Adding Workout to Plan")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workoutPlan", planID] })
        renderToast("Success", "Workout Added To Plan", "success")
      },
      onError: (error: Error) => {
        console.error("Error Adding Workout to Plan:", error)
        renderToast("Error", "Failed Adding Workout to Plan", "error")
      },
    })

    const openDeletePlanModal = () => {
      deletePlanRef.current?.open()
    }

    const confirmDeletePlan = () => {
      deletePlanMutation.mutate()
    }

    useEffect(() => {
      if (workoutsToAdd && workoutsToAdd.length > 0 && planID) {
        const newWorkoutsToActuallyAdd = workoutsToAdd.filter(
          (sw) => !currentWorkouts.some((cw) => cw.workout_id === sw.workout_id),
        )

        if (newWorkoutsToActuallyAdd.length > 0) {
          newWorkoutsToActuallyAdd.forEach((workout) => {
            addWorkoutToPlanMutation.mutate(workout.workout_id)
          })
        }
        navigation.setParams({ selectedWorkouts: undefined })
      }
    }, [workoutsToAdd, planID, navigation, currentWorkouts, addWorkoutToPlanMutation])

    const removeWorkoutFromPlan = useMutation({
      mutationFn: async (workoutIdToRemove: string) => {
        const response = await api.removeWorkoutFromPlan(planID, workoutIdToRemove)
        if (!response.ok) {
          throw new Error("Failed Removing Workout From Plan")
        }
        return { ...response.data, removedWorkoutId: workoutIdToRemove }
      },
      onSuccess: (data) => {
        setCurrentWorkouts((prev) => prev.filter((w) => w.workout_id !== data.removedWorkoutId))
        queryClient.invalidateQueries({ queryKey: ["workoutPlan", planID] })
        renderToast("Success", "Workout Removed From Plan", "success")
        removeWorkoutModalRef.current?.close()
        setWorkoutToRemove(null)
      },
      onError: (error: Error) => {
        console.error("Error Removing Workout From Plan:", error)
        renderToast("Error", "Failed Removing Workout From Plan", "error")
        removeWorkoutModalRef.current?.close()
      },
    })

    const handleSaveChanges = () => {
      if (!name.trim()) {
        renderToast("Validation Error", "Plan name is required.", "error")
        return
      }
      if (!difficulty) {
        renderToast("Validation Error", "Please select a difficulty.", "error")
        return
      }
      if (!startTime) {
        renderToast("Validation Error", "Please select a start time.", "error")
        return
      }

      if (currentWorkouts.length === 0) {
        if (!addWorkoutToPlanMutation.isPending && (!workoutsToAdd || workoutsToAdd.length === 0)) {
          renderToast("Validation Error", "Please add at least one workout to the plan.", "error")
          return
        }
      }

      const workoutIDsToSave = currentWorkouts.map((w) => w.workout_id)

      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        difficulty,
        goal: goal || undefined,
        repeats: repeats || undefined,
        is_public: isPublic,
        start_time: startTime ? createProteinDate(startTime) : undefined,
        workouts: workoutIDsToSave,
      }
      updatePlanMutation.mutate(payload)
    }

    const navigateToSelectWorkouts = () => {
      const currentForm: PlanForm = {
        name,
        description,
        difficulty,
        goal,
        repeats,
        isPublic,
        startTime: startTime ? startTime.toISOString() : new Date().toISOString(),
      }
      navigation.navigate("Workouts", {
        selectionMode: true,
        source: "EditWorkoutPlan",
        planID,
        existingWorkouts: currentWorkouts.map((w) => w.workout_id),
        formData: currentForm,
      })
    }

    const openRemoveWorkoutModal = (workout: Workout) => {
      setWorkoutToRemove(workout)
      removeWorkoutModalRef.current?.open()
    }

    const confirmRemoveWorkout = () => {
      if (workoutToRemove) {
        removeWorkoutFromPlan.mutate(workoutToRemove.workout_id)
      }
    }

    const showStartTimePicker = () => setIsStartTimePickerVisible(true)
    const hideStartTimePicker = () => setIsStartTimePickerVisible(false)
    const handleStartTimeConfirm = (date: Date) => {
      setStartTime(date)
      hideStartTimePicker()
    }

    const renderSelectedWorkoutItem = ({ item }: { item: Workout }) => (
      <View style={themed($selectedWorkoutItem)}>
        <Text text={item.name} style={themed($selectedWorkoutName)} numberOfLines={1} />
        <TouchableOpacity onPress={() => openRemoveWorkoutModal(item)}>
          <MaterialIcons name="remove-circle-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    )

    const isMutatingData =
      updatePlanMutation.isPending ||
      addWorkoutToPlanMutation.isPending ||
      removeWorkoutFromPlan.isPending ||
      deletePlanMutation.isPending

    if (isLoadingPlan || isMutatingData) {
      return <Loading />
    }

    if (isErrorPlan && !plan) {
      console.error("Error Fetching Workout Plan:", errorPlan)
      return (
        <ErrorScreen
          title="Error Fetching Plan"
          message={errorPlan?.message || "Could not load the workout plan."}
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <>
        <Screen
          style={$root}
          preset="scroll"
          safeAreaEdges={["top", "bottom"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <View style={themed($headerSectionView)}>
            <Text preset="heading" text="Edit Workout Plan" style={themed($titleStyle)} />
          </View>

          <View style={themed($formContainer)}>
            <TextField
              label="Plan Name"
              placeholder="e.g., Summer Shred"
              value={name}
              onChangeText={setName}
              containerStyle={themed($textField)}
              editable={!isMutatingData}
            />
            <TextField
              label="Description"
              placeholder="e.g., A plan to get lean for the summer"
              value={description}
              onChangeText={setDescription}
              containerStyle={themed($textField)}
              multiline
              editable={!isMutatingData}
            />

            <Text style={themed($fieldLabel)}>Difficulty</Text>
            <Dropdown
              style={themed([
                $dropdown,
                focusDifficulty && { borderColor: colors.palette.primary500 },
                isMutatingData && $disabledInput,
              ])}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              iconStyle={$iconStyle}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={difficultyOptions}
              maxHeight={200}
              labelField="label"
              valueField="value"
              placeholder={
                !focusDifficulty
                  ? difficulty
                    ? getLabel(difficulty, difficultyOptions)
                    : "Select Difficulty"
                  : "..."
              }
              value={difficulty}
              onFocus={() => !isMutatingData && setFocusDifficulty(true)}
              onBlur={() => !isMutatingData && setFocusDifficulty(false)}
              onChange={(item) => {
                setDifficulty(item.value as Difficulty)
                setFocusDifficulty(false)
              }}
              disable={isMutatingData}
            />

            <Text style={themed($fieldLabel)}>Goal</Text>
            <Dropdown
              style={themed([
                $dropdown,
                focusGoal && { borderColor: colors.palette.primary500 },
                isMutatingData && $disabledInput,
              ])}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              iconStyle={$iconStyle}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={goalOptions}
              maxHeight={200}
              labelField="label"
              valueField="value"
              placeholder={
                !focusGoal ? (goal ? getLabel(goal, goalOptions) : "Select Goal (Optional)") : "..."
              }
              value={goal}
              onFocus={() => !isMutatingData && setFocusGoal(true)}
              onBlur={() => !isMutatingData && setFocusGoal(false)}
              onChange={(item) => {
                setGoal(item.value as FitnessGoal)
                setFocusGoal(false)
              }}
              disable={isMutatingData}
            />

            <Text style={themed($fieldLabel)}>Repeats (Interval)</Text>
            <Dropdown
              style={themed([
                $dropdown,
                focusRepeats && { borderColor: colors.palette.primary500 },
                isMutatingData && $disabledInput,
              ])}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              iconStyle={$iconStyle}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={intervalOptions}
              maxHeight={200}
              labelField="label"
              valueField="value"
              placeholder={
                !focusRepeats
                  ? repeats
                    ? getLabel(repeats, intervalOptions)
                    : "Select Interval (Optional)"
                  : "..."
              }
              value={repeats}
              onFocus={() => !isMutatingData && setFocusRepeats(true)}
              onBlur={() => !isMutatingData && setFocusRepeats(false)}
              onChange={(item) => {
                setRepeats(item.value as WorkoutInterval)
                setFocusRepeats(false)
              }}
              disable={isMutatingData}
            />

            <Text style={themed($fieldLabel)}>Start: {format(startTime ?? new Date(), "Pp")}</Text>
            <Button
              text="Change Start Time"
              onPress={showStartTimePicker}
              style={themed($changeTimeButton)}
              preset="filled"
              disabled={isMutatingData}
            />
            <DateTimePickerModal
              isVisible={isStartTimePickerVisible}
              mode="datetime"
              date={startTime || new Date()}
              onConfirm={handleStartTimeConfirm}
              onCancel={hideStartTimePicker}
            />

            <View style={themed($toggleContainer)}>
              <Text text="Make Plan Public" style={themed($toggleLabel)} />
              <Switch value={isPublic} onValueChange={setIsPublic} disabled={isMutatingData} />
            </View>

            <View style={themed($workoutsHeaderContainer)}>
              <Text preset="subheading" text="Workouts" />
              <Button
                text="Add Workout"
                preset="filled"
                onPress={navigateToSelectWorkouts}
                style={themed($addWorkoutButton)}
                LeftAccessory={() => (
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color={colors.palette.secondary400}
                    style={{ marginRight: spacing.xs }}
                  />
                )}
                disabled={isMutatingData}
              />
            </View>

            {isLoadingWorkoutDetails && plan && <Loading />}
            {!isLoadingWorkoutDetails && currentWorkouts.length > 0 && (
              <FlatList
                data={currentWorkouts}
                renderItem={renderSelectedWorkoutItem}
                keyExtractor={(item) => item.workout_id.toString()}
                style={themed($workoutList)}
                scrollEnabled={false}
              />
            )}
            {!isLoadingWorkoutDetails && currentWorkouts.length === 0 && (
              <Text style={themed($noWorkoutsText)}>
                No workouts added. Click "Add Workout" to get started.
              </Text>
            )}

            <Button
              text="Save Changes"
              preset="filled"
              onPress={handleSaveChanges}
              style={themed($saveButton)}
              disabled={isMutatingData || isLoadingWorkoutDetails}
            />

            <Button
              text="Delete Plan"
              preset="filled"
              onPress={openDeletePlanModal}
              style={themed($deletePlanButton)}
              disabled={isMutatingData}
            />
          </View>
        </Screen>

        <Modalize ref={removeWorkoutModalRef} adjustToContentHeight>
          <View style={themed($modalContentContainer)}>
            <Text preset="subheading" style={themed($modalTitle)}>
              Remove Workout
            </Text>
            <Text style={themed($modalMessage)}>
              Are you sure you want to remove "{workoutToRemove?.name}" from this plan?
            </Text>
            <View style={themed($modalButtonContainer)}>
              <Button
                text="Cancel"
                preset="filled"
                onPress={() => removeWorkoutModalRef.current?.close()}
                style={themed($modalButton)}
              />
              <Button
                text="Remove"
                preset="filled"
                onPress={confirmRemoveWorkout}
                style={themed([$modalButton, $removeConfirmButton])}
                disabled={removeWorkoutFromPlan.isPending}
              />
            </View>
          </View>
        </Modalize>

        <Modalize ref={deletePlanRef} adjustToContentHeight>
          <View style={themed($modalContentContainer)}>
            <Text preset="subheading" style={themed($modalTitle)}>
              Delete Workout Plan
            </Text>
            <Text style={themed($modalMessage)}>
              Are you sure you want to permanently delete the workout plan "
              {plan?.name || "this plan"}"? This action cannot be undone.
            </Text>
            <View style={themed($modalButtonContainer)}>
              <Button
                text="Cancel"
                preset="filled"
                onPress={() => deletePlanRef.current?.close()}
                style={themed($modalButton)}
                disabled={deletePlanMutation.isPending}
              />
              <Button
                text="Delete"
                preset="filled"
                onPress={confirmDeletePlan}
                style={themed([$modalButton, $removeConfirmButton])}
                disabled={deletePlanMutation.isPending}
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
  paddingBottom: spacing.xxl,
})

const $headerSectionView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.sm,
})

const $titleStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "left",
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 14,
  marginBottom: spacing.xs,
  color: colors.textDim,
  fontWeight: "500",
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

const $iconStyle: ImageStyle = { width: 20, height: 20 }

const $itemContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
})

const $itemTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
})

const $changeTimeButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.lg,
  borderColor: colors.palette.primary500,
})

const $toggleContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginVertical: spacing.lg,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.background,
  borderRadius: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $toggleLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  fontWeight: "500",
})

const $workoutsHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xl,
  marginBottom: spacing.md,
})

const $addWorkoutButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 120,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
})

const $workoutList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $selectedWorkoutItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.background,
  borderRadius: spacing.xs,
  marginBottom: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $selectedWorkoutName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  flex: 1,
  marginRight: spacing.sm,
})

const $noWorkoutsText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginVertical: spacing.lg,
  color: colors.textDim,
  fontStyle: "italic",
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.xl,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing.md,
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

const $removeConfirmButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})

const $disabledInput: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  opacity: 0.7,
})

const $deletePlanButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  backgroundColor: colors.error,
  borderRadius: 120,
  paddingVertical: spacing.md,
})
