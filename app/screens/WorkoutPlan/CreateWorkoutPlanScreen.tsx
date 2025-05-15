import { FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "@/navigators"
import {
  Button,
  FilterChip,
  FilterChipItem,
  Loading,
  Screen,
  SearchBar,
  Switch,
  Text,
  TextField,
} from "@/components"
import {
  api,
  Difficulty,
  Exercise,
  FitnessGoal,
  Workout,
  WorkoutInterval,
  WorkoutPlan,
} from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FlatList,
  ImageBackground,
  ImageStyle,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Modalize } from "react-native-modalize"
import { renderToast } from "@/utils/toastNotification"
import { MaterialIcons } from "@expo/vector-icons"
import { difficultyOptions } from "../Exercises/SearchExercisesScreen"
import { ErrorScreen } from "@/components/ErrorScreen"
import { Dropdown } from "react-native-element-dropdown"
import { goalOptions, intervalOptions } from "./WorkoutPlansScreen"
import { createProteinDate } from "@/utils/formatDate"
import { format } from "date-fns/format"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { schedulePlanNotification } from "@/utils/notifications"

interface CreateWorkoutPlanScreenProps extends AppStackScreenProps<"CreateWorkoutPlan"> {}

export type PlanForm = {
  name: string
  description: string
  difficulty: Difficulty | null
  goal: FitnessGoal | null
  repeats: WorkoutInterval | null
  isPublic: boolean
  startTime: string
}

export const CreateWorkoutPlanScreen: FC<CreateWorkoutPlanScreenProps> = observer(
  function CreateWorkoutPlanScreen(_props) {
    const { navigation } = _props

    const returningFormData = _props.route.params?.formData as PlanForm
    const selectedWorkouts = _props.route.params?.selectedWorkouts
    const queryClient = useQueryClient()

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [goal, setGoal] = useState<FitnessGoal | null>(null)
    const [repeats, setRepeats] = useState<WorkoutInterval | null>(null)
    const [isPublic, setIsPublic] = useState(false)
    const [currentWorkouts, setCurrentWorkouts] = useState<Workout[]>([])

    const [focusDifficulty, setFocusDifficulty] = useState(false)
    const [focusGoal, setFocusGoal] = useState(false)
    const [focusRepeats, setFocusRepeats] = useState(false)

    const [startTime, setStartTime] = useState<Date | null>(null)
    const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState(false)

    const showStartTimePicker = () => {
      setIsStartTimePickerVisible(true)
    }

    const hideStartTimePicker = () => {
      setIsStartTimePickerVisible(false)
    }

    const handleStartTimeConfirm = (date: Date) => {
      setStartTime(date)
      hideStartTimePicker()
    }

    useEffect(() => {
      if (selectedWorkouts && selectedWorkouts.length > 0) {
        setCurrentWorkouts((prevWorkouts) => {
          const newWorkoutsMap = new Map(prevWorkouts.map((w) => [w.workout_id, w]))
          selectedWorkouts.forEach((sw) => {
            if (!newWorkoutsMap.has(sw.workout_id)) {
              newWorkoutsMap.set(sw.workout_id, sw)
            }
          })
          return Array.from(newWorkoutsMap.values())
        })
        navigation.setParams({ selectedWorkouts: undefined })
      }

      if (returningFormData) {
        setName(returningFormData.name)
        setDescription(returningFormData.description)
        setDifficulty(returningFormData.difficulty)
        setGoal(returningFormData.goal)
        setRepeats(returningFormData.repeats)
        setIsPublic(returningFormData.isPublic)
        setStartTime(startTime ? new Date(returningFormData.startTime) : new Date())

        navigation.setParams({ formData: undefined })
      }
    }, [selectedWorkouts, navigation, returningFormData])

    const createPlan = useMutation({
      mutationFn: async (data: any) => {
        const response = await api.createWorkoutPlan(data)
        if (!response.ok || !response.data) {
          throw new Error("Failed Creating Workout Plan")
        }
        return response.data
      },
      onSuccess: async (newPlan) => {
        queryClient.invalidateQueries({ queryKey: ["workoutPlans", userID] })
        renderToast("Success", "Workout plan created successfully!", "success")

        await schedulePlanNotification(newPlan)

        navigation.navigate("WorkoutPlans")
      },
      onError: (error) => {
        renderToast("Error", "Could Not Create Plan.", "error")
      },
    })

    const handleCreatePlan = () => {
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
        renderToast("Validation Error", "Please add at least one workout to the plan.", "error")
        return
      }

      const workoutIDs = currentWorkouts.map((w) => w.workout_id)

      const data: any = {
        user_id: userID,
        name: name.trim(),
        description: description.trim() || undefined,
        difficulty,
        goal: goal || undefined,
        repeats: repeats || undefined,
        is_public: isPublic,
        workouts: workoutIDs,
        start_time: createProteinDate(startTime),
      }
      createPlan.mutate(data)
    }

    const navigteToSelectWorkouts = () => {
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
        source: "CreateWorkoutPlan",
        existingWorkouts: currentWorkouts.map((w) => w.workout_id),
        formData: currentForm,
      })
    }

    const removeWorkoutFromPlan = (workoutID: string) => {
      setCurrentWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutID))
    }

    const renderSelectedWorkoutItem = ({ item }: { item: Workout }) => (
      <View style={themed($selectedWorkoutItem)}>
        <Text text={item.name} style={themed($selectedWorkoutName)} numberOfLines={1} />
        <TouchableOpacity onPress={() => removeWorkoutFromPlan(item.workout_id)}>
          <MaterialIcons name="remove-circle-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    )

    if (createPlan.isPending) {
      return <Loading />
    }

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["top", "bottom"]}>
        <View style={themed($headerSectionView)}>
          <Text preset="heading" text="Create Workout Plan" style={themed($titleStyle)} />
        </View>

        <View style={themed($formContainer)}>
          <TextField
            label="Plan Name"
            placeholder="e.g., Winter Arc"
            value={name}
            onChangeText={setName}
            containerStyle={themed($textField)}
          />

          <TextField
            label="Description"
            placeholder="e.g., A plan to get fit for the winter"
            value={description}
            onChangeText={setDescription}
            containerStyle={themed($textField)}
            multiline
            numberOfLines={1}
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
            data={difficultyOptions}
            maxHeight={200}
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

          <Text style={themed($fieldLabel)}>Goal</Text>
          <Dropdown
            style={themed([$dropdown, focusGoal && { borderColor: colors.palette.primary500 }])}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            iconStyle={$iconStyle}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={goalOptions}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={!focusGoal ? "Select Goal" : "..."}
            value={goal}
            onFocus={() => setFocusGoal(true)}
            onBlur={() => setFocusGoal(false)}
            onChange={(item) => {
              setGoal(item.value as FitnessGoal)
              setFocusGoal(false)
            }}
          />

          <Text style={themed($fieldLabel)}>Repeats (Interval)</Text>
          <Dropdown
            style={themed([$dropdown, focusRepeats && { borderColor: colors.palette.primary500 }])}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            iconStyle={themed($iconStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={intervalOptions}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={!focusRepeats ? "Select Interval" : "..."}
            value={repeats}
            onFocus={() => setFocusRepeats(true)}
            onBlur={() => setFocusRepeats(false)}
            onChange={(item) => {
              setRepeats(item.value as WorkoutInterval)
              setFocusRepeats(false)
            }}
          />

          <Text style={themed($fieldLabel)}>Start: {format(startTime ?? new Date(), "Pp")}</Text>
          <Button
            text="Change Start Time"
            onPress={showStartTimePicker}
            style={themed($saveButton)}
          />
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="datetime"
            onConfirm={handleStartTimeConfirm}
            onCancel={hideStartTimePicker}
          />

          <View style={themed($toggleContainer)}>
            <Text text="Make Plan Public" style={themed($toggleLabel)} />
            <Switch value={isPublic} onValueChange={setIsPublic} />
          </View>

          <View style={themed($exercisesHeaderContainer)}>
            <Text preset="subheading" text="Workouts" />
            <Button
              text="Add"
              preset="filled"
              onPress={navigteToSelectWorkouts}
              style={themed($addExerciseButton)}
              LeftAccessory={() => (
                <MaterialIcons name="fitness-center" size={20} color={colors.palette.primary500} style={{ marginRight: 5}}/>
              )}
            />
          </View>

          {currentWorkouts.length > 0 ? (
            <FlatList
              data={currentWorkouts}
              renderItem={renderSelectedWorkoutItem}
              keyExtractor={(item) => item.workout_id.toString()}
              style={themed($exerciseList)}
              scrollEnabled={false}
            />
          ) : (
            <Text style={themed($noExercisesText)}>No workouts added to this plan yet.</Text>
          )}

          <Button
            text="Create Workout Plan"
            preset="filled"
            onPress={handleCreatePlan}
            style={themed($saveButton)}
            disabled={createPlan.isPending}
          />
        </View>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
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
  paddingBottom: spacing.xxl,
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
const $exercisesHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xl,
  marginBottom: spacing.md,
})
const $addExerciseButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.palette.primary500,
  borderRadius: 120,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
})
const $exerciseList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  maxHeight: 250,
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
const $noExercisesText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
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