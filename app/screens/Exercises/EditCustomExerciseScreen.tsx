import { Button, Loading, Screen, Text, TextField } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { AppStackScreenProps } from "@/navigators"
import {
  api,
  CustomExercise,
  Difficulty,
  Equipment,
  ExerciseType,
  MuscleGroup,
} from "@/services/api"
import { ThemedStyle } from "@/theme"
import { formatAPI, formatLabel, toFirstLetterUpperCase } from "@/utils/strings"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { AntDesign } from "@expo/vector-icons"
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { ImageStyle, TextStyle, ViewStyle } from "react-native"
import { Dropdown } from "react-native-element-dropdown"

interface EditCustomExerciseScreenProps extends AppStackScreenProps<"EditCustomExercise"> {}

export const EQUIPMENT_OPTIONS = (
  [
    "barbell",
    "dumbbell",
    "kettlebell",
    "machine",
    "cable",
    "bodyweight",
    "resistance_band",
    "other",
  ] as Equipment[]
).map((val) => ({
  label: formatLabel(val),
  value: formatAPI(val),
}))

export const MUSCLE_GROUP_OPTIONS = (
  [
    "chest",
    "shoulders",
    "biceps",
    "triceps",
    "forearms",
    "upper_back",
    "lower_back",
    "lats",
    "abs",
    "obliques",
    "quads",
    "hamstrings",
    "calves",
    "glutes",
  ] as MuscleGroup[]
).map((val) => ({
  label: formatLabel(val),
  value: formatAPI(val),
}))

export const EXERCISE_TYPE_OPTIONS = (
  ["strength", "cardio", "flexibility", "plyometric", "bodyweight"] as ExerciseType[]
).map((val) => ({
  label: formatLabel(val),
  value: formatAPI(val),
}))

export const DIFFICULTY_OPTIONS = (["beginner", "intermediate", "advanced"] as Difficulty[]).map(
  (val) => ({
    label: formatLabel(val),
    value: formatAPI(val),
  }),
)

export type CustomExerciseData = Omit<
  CustomExercise,
  "exercise_id" | "user_id" | "created_at" | "updated_at"
>

export const EditCustomExerciseScreen: FC<EditCustomExerciseScreenProps> = observer(
  function EditCustomExerciseScreen(_props) {
    const { navigation } = _props

    const exerciseID = _props.route.params?.exerciseID
    const queryClient = useQueryClient()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const [data, setData] = useState<Partial<CustomExerciseData>>({})

    const [isFocusEquipment, setIsFocusEquipment] = useState(false)
    const [isFocusMuscleGroup, setIsFocusMuscleGroup] = useState(false)
    const [isFocusDifficulty, setIsFocusDifficulty] = useState(false)
    const [isFocusExerciseType, setIsFocusExerciseType] = useState(false)

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
          throw new Error("Failed Fetching Exercise Data")
        }
      },
    })

    useEffect(() => {
      if (exercise) {
        setData({
          name: exercise.name,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          muscle_group: exercise.muscle_group,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_time,
          exercise_type: exercise.exercise_type,
        })
      }
    }, [exercise])

    const editExercise = useMutation({
      mutationFn: async (data: CustomExerciseData) => {
        const response = await api.editCustomExercise(exerciseID, data)

        if (!response.ok && !response.data) {
          throw new Error("Failed Editing Exercise Data")
        }
      },
      onSuccess: () => {
        renderToast("Success", "Exercise Edited Successfully", "success")
        queryClient.invalidateQueries({ queryKey: ["customExercise", exerciseID] })
        navigation.goBack()
      },
      onError: (error) => {
        console.error("Error Editing Exercise:", error)
        renderToast("Error", "Failed Editing Exercise Data", "error")
      },
    })

    const handleInputChange = (name: keyof CustomExerciseData, value: any) => {
      setData((prev) => ({ ...prev, [name]: value }))
    }

    const handleNumericInputChange = (name: "sets" | "reps" | "rest_time", value: string) => {
      const numValue = value === "" ? undefined : parseInt(value, 10)
      if (value === "" || (numValue !== undefined && !isNaN(numValue) && numValue >= 0)) {
        setData((prev) => ({ ...prev, [name]: numValue }))
      }
    }

    const handleSubmit = () => {
      if (
        !data.name ||
        !data.equipment ||
        !data.difficulty ||
        !data.muscle_group ||
        !data.exercise_type
      ) {
        renderToast("Error", "Please fill all required fields", "error")
        return
      }

      const payload: CustomExerciseData = {
        name: data.name,
        equipment: data.equipment,
        difficulty: data.difficulty,
        muscle_group: data.muscle_group,
        exercise_type: data.exercise_type,
        sets: Number(data.sets),
        reps: Number(data.reps),
        rest_time: Number(data.rest_time),
      }

      editExercise.mutate(payload)
    }

    if (isLoading || editExercise.isPending) {
      return <Loading />
    }

    if (isError) {
      console.error("Error Fetching Exercise:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Exercise Data"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text preset="heading" text="Edit Custom Exercise" style={themed($title)} />

        <TextField
          label="Exercise Name"
          placeholder="e.g., Custom Bicep Curl"
          value={data.name || ""}
          onChangeText={(text) => handleInputChange("name", text)}
          containerStyle={themed($textField)}
          autoCapitalize="words"
        />

        <Text style={themed($fieldLabel)}>Equipment</Text>
        <Dropdown
          style={themed([$dropdown, isFocusEquipment && { borderColor: colors.background }])}
          placeholderStyle={themed($placeholderStyle)}
          selectedTextStyle={themed($selectedTextStyle)}
          iconStyle={$iconStyle}
          itemContainerStyle={themed($itemContainerStyle)}
          itemTextStyle={themed($itemTextStyle)}
          data={EQUIPMENT_OPTIONS}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={
            exercise?.equipment
          }
          value={data.equipment}
          onFocus={() => setIsFocusEquipment(true)}
          onBlur={() => setIsFocusEquipment(false)}
          onChange={(item) => {
            handleInputChange("equipment", item.value as Equipment)
            setIsFocusEquipment(false)
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={$icon}
              color={isFocusEquipment ? colors.background : colors.textDim}
              name="tool"
              size={20}
            />
          )}
        />

        <Text style={themed($fieldLabel)}>Muscle Group</Text>
        <Dropdown
          style={themed([$dropdown, isFocusMuscleGroup && { borderColor: colors.background }])}
          placeholderStyle={themed($placeholderStyle)}
          selectedTextStyle={themed($selectedTextStyle)}
          iconStyle={$iconStyle}
          itemContainerStyle={themed($itemContainerStyle)}
          itemTextStyle={themed($itemTextStyle)}
          data={MUSCLE_GROUP_OPTIONS}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={
            exercise?.muscle_group
          }
          value={data.muscle_group}
          onFocus={() => setIsFocusMuscleGroup(true)}
          onBlur={() => setIsFocusMuscleGroup(false)}
          onChange={(item) => {
            handleInputChange("muscle_group", item.value as MuscleGroup)
            setIsFocusMuscleGroup(false)
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={$icon}
              color={isFocusMuscleGroup ? colors.background : colors.textDim}
              name="rocket1"
              size={20}
            />
          )}
        />

        <Text style={themed($fieldLabel)}>Difficulty</Text>
        <Dropdown
          style={themed([$dropdown, isFocusDifficulty && { borderColor: colors.background }])}
          placeholderStyle={themed($placeholderStyle)}
          selectedTextStyle={themed($selectedTextStyle)}
          iconStyle={$iconStyle}
          itemContainerStyle={themed($itemContainerStyle)}
          itemTextStyle={themed($itemTextStyle)}
          data={DIFFICULTY_OPTIONS}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={
            exercise?.difficulty
          }
          value={data.difficulty}
          onFocus={() => setIsFocusDifficulty(true)}
          onBlur={() => setIsFocusDifficulty(false)}
          onChange={(item) => {
            handleInputChange("difficulty", item.value as Difficulty)
            setIsFocusDifficulty(false)
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={$icon}
              color={isFocusDifficulty ? colors.background : colors.textDim}
              name="staro"
              size={20}
            />
          )}
        />

        <Text style={themed($fieldLabel)}>Exercise Type</Text>
        <Dropdown
          style={themed([$dropdown, isFocusExerciseType && { borderColor: colors.background }])}
          placeholderStyle={themed($placeholderStyle)}
          selectedTextStyle={themed($selectedTextStyle)}
          iconStyle={themed($iconStyle)}
          itemContainerStyle={themed($itemContainerStyle)}
          itemTextStyle={themed($itemTextStyle)}
          data={EXERCISE_TYPE_OPTIONS}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={
            exercise?.exercise_type
          }
          value={data.exercise_type}
          onFocus={() => setIsFocusExerciseType(true)}
          onBlur={() => setIsFocusExerciseType(false)}
          onChange={(item: any) => {
            handleInputChange("exercise_type", item.value as ExerciseType)
            setIsFocusExerciseType(false)
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={themed($icon)}
              color={isFocusExerciseType ? colors.background : colors.textDim}
              name="tagso"
              size={20}
            />
          )}
        />

        <TextField
          label="Recommended Sets"
          placeholder="e.g., 3"
          value={data.sets !== undefined ? String(data.sets) : ""}
          onChangeText={(text) => handleNumericInputChange("sets", text)}
          keyboardType="number-pad"
          containerStyle={themed($textField)}
        />
        <TextField
          label="Recommended Reps"
          placeholder="e.g., 10"
          value={data.reps !== undefined ? String(data.reps) : ""}
          onChangeText={(text) => handleNumericInputChange("reps", text)}
          keyboardType="number-pad"
          containerStyle={themed($textField)}
        />
        <TextField
          label="Recommended Rest Time (seconds)"
          placeholder="e.g., 60"
          value={data.rest_time !== undefined ? String(data.rest_time) : ""}
          onChangeText={(text) => handleNumericInputChange("rest_time", text)}
          keyboardType="number-pad"
          containerStyle={themed($textField)}
        />

        <Button
          text="Save Changes"
          preset="filled"
          onPress={handleSubmit}
          style={themed($submitButton)}
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
  paddingBottom: spacing.xxl,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "left",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
  fontSize: spacing.sm,
  marginLeft: spacing.xxs,
})

const $submitButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  backgroundColor: colors.palette?.primary500,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }, isFocused?: boolean) => ({
  height: 50,
  borderColor: isFocused ? colors.background : colors.border,
  borderWidth: 1,
  borderRadius: spacing.xs,
  paddingHorizontal: spacing.sm,
  marginBottom: spacing.md,
  backgroundColor: colors.background,
})

const $icon: TextStyle = {
  marginRight: 5,
}

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
