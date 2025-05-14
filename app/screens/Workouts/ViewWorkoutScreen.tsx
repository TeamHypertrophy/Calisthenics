import { Button, InfoChip, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, Exercise } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { formatDuration } from "@/utils/strings"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import {
  FlatList,
  ImageBackground,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

interface ViewWorkoutScreenProps extends AppStackScreenProps<"ViewWorkout"> {}

export const ViewWorkoutScreen: FC<ViewWorkoutScreenProps> = observer(
  function ViewWorkoutScreen(_props) {
    const { navigation } = _props

    const queryClient = useQueryClient()
    const workoutID = _props.route.params?.workoutID
    
    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      data: workout,
      isLoading,
      isError,
      error,
    } = useQuery({
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
          renderToast("Error", "Some Exercises Were Not Fetched", "error")
        }

        return {
          ...workoutResponse.data,
          fullExercises: exercises.filter((exercise) => exercise !== null),
        }
      },
    })

    const handleLogWorkout = () => {
      if (!workout) {
        renderToast("Error", "Workout Not Found", "error")
        return
      }

      navigation.navigate("CreateWorkoutLog", {
        workoutID: workout.workout_id,
      })
    }

    const handleEditWorkout = () => {
      if (!workout) {
        renderToast("Error", "Workout Not Found", "error")
        return
      }

      navigation.navigate("EditWorkout", {
        workoutID: workout.workout_id,
      })
    }

    const createLog = useMutation({
      mutationFn: async (data: any) => {
        const response = await api.createWorkoutLog(data)
        if (!response.ok) {
          throw new Error("Failed Creating Workout Log")
        }
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workoutLogs", userID] })
        renderToast("Success", "Workout Log Created Successfully", "success")
        navigation.navigate("ViewWorkoutLogs")
      },
      onError: (error) => {
        console.error("Error Creating Workout Log:", error)
        renderToast("Error", "Failed to create workout log", "error")
      },
    })

    const handleCreateLog = async () => {
      createLog.mutate({
        user_id: userID,
        workout_id: workout?.workout_id
      })
    }

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
      <TouchableOpacity
        style={themed($exerciseCard)}
        onPress={() => navigation.navigate("ViewExercise", { exerciseID: item.exercise_id })}
      >
        <ImageBackground
          source={
            item.image_url
              ? { uri: item.image_url }
              : { uri: process.env.PLACEHOLDER_EXERCISE_IMAGE }
          }
          style={themed($exerciseImage)}
          resizeMode="cover"
        >
          <View style={themed($exerciseNameOverlay)}>
            <Text
              text={item.name}
              preset="subheading"
              style={themed($exerciseNameText)}
              numberOfLines={2}
            />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )

    if (isLoading || createLog.isPending) {
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

    if (!workout) {
      return (
        <ErrorScreen title="Error" message="Workout Not Found" onBack={() => navigation.goBack()} />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($headerContainer)}>
          <Text
            preset="heading"
            text={workout.name}
            style={themed($workoutNameHeader)}
            numberOfLines={2}
            ellipsizeMode="tail"
          />
          <View style={$headerButtons}>
            <Button
              preset="filled"
              onPress={handleEditWorkout}
              style={themed($actionButton)}
              LeftAccessory={() => (
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={colors.text}
                  style={{ marginRight: spacing.xxs }}
                />
              )}
            >
              <Text text="Edit" style={themed($actionButtonText)} />
            </Button>
            <Button
              preset="filled"
              onPress={handleLogWorkout}
              style={themed([$actionButton, $logButtonSpecial])}
              LeftAccessory={() => (
                <MaterialIcons
                  name="fitness-center"
                  size={18}
                  color={colors.text}
                  style={{ marginRight: spacing.xxs }}
                />
              )}
            >
              <Text text="Log Workout" style={themed($logButtonText)} onPress={handleCreateLog}/>
            </Button>
          </View>
        </View>

        <View style={themed($detailsContainer)}>
          {workout.description && (
            <View style={themed($detailSection)}>
              <Text preset="subheading" text="Description" />
              <Text text={workout.description} style={themed($detailText)} />
            </View>
          )}

          {workout.difficulty && (
            <>
              <View style={themed($separator)} />
              <View style={themed($detailSection)}>
                <InfoChip label="Difficulty" value={workout.difficulty} />
              </View>
            </>
          )}

          {workout.duration && (
            <>
              <View style={themed($separator)} />
              <View style={themed($detailSection)}>
                <InfoChip label="Duration" value={formatDuration(workout.duration)} />
              </View>
            </>
          )}

          <View style={themed($separator)} />

          <View style={themed($detailSection)}>
            <Text preset="subheading" text="Exercises" />
            {workout.exercises && workout.exercises.length > 0 ? (
              <FlatList
                data={workout.fullExercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item, index) => `${item.exercise_id}-${index}`}
                ItemSeparatorComponent={() => <View style={themed($exerciseSeparator)} />}
                style={themed($exerciseList)}
                numColumns={2}
              />
            ) : (
              <Text text="No Exercises Found For This Workout." style={themed($detailText)} />
            )}
          </View>
        </View>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $workoutNameHeader: ThemedStyle<TextStyle> = ({ spacing }) => ({
  flexShrink: 1,
  marginBottom: spacing.sm,
  textAlign: "left",
})

const $headerButtons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
}

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 120,
  marginHorizontal: spacing.xs,
  backgroundColor: colors.palette.primary500,
  minHeight: 36,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
})

const $actionButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
})
const $logButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "bold",
})

const $logButtonSpecial: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette?.primary500 || colors.tint,
})

const $detailsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  paddingTop: spacing.md,
})

const $detailSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $detailText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  lineHeight: 20,
  color: colors.textDim,
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginTop: spacing.xxl,
  marginVertical: spacing.lg,
})

const $exerciseList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $exerciseSeparator: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginVertical: spacing.xxs,
})

const $exerciseImage: ThemedStyle<ViewStyle> = ({}) => ({
  flex: 1,
  justifyContent: "flex-end",
})

const $exerciseNameOverlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "rgba(0,0,0,0.5)",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
})

const $exerciseNameText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 13,
})

const $exerciseCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  maxWidth: "48%",
  margin: "1%",
  height: 180,
  borderRadius: spacing.sm,
  overflow: "hidden",
  backgroundColor: colors.background,
  elevation: 2,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
})
