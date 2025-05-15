import { Button, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, Workout } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { createProteinDate } from "@/utils/formatDate"
import { getLabel } from "@/utils/strings"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useMemo } from "react"
import { FlatList, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { difficultyOptions } from "../Exercises/SearchExercisesScreen"
import { goalOptions, intervalOptions } from "./WorkoutPlansScreen"

interface ViewWorkoutPlanScreenProps extends AppStackScreenProps<"ViewWorkoutPlan"> {}

export const ViewWorkoutPlanScreen: FC<ViewWorkoutPlanScreenProps> = observer(
  function ViewWorkoutPlanScreen(_props) {
    const { navigation } = _props

    const queryClient = useQueryClient()
    const planID = _props.route.params.planID

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const { data, isLoading, isError, error, refetch } = useQuery({
      queryKey: ["workoutPlan", planID],
      queryFn: async () => {
        const response = await api.getWorkoutPlan(planID)

        if (!response.ok && !response.data) {
          throw new Error("Error Fetching Workout Plan")
        }

        return response.data
      },
    })

    const workoutIDs = useMemo(() => data?.workouts || [], [data])

    const workoutQueries = useQueries({
      queries: workoutIDs.map((id) => ({
        queryKey: ["workout", id],
        queryFn: async () => {
          const response = await api.getWorkout(id)

          if (!response.ok && !response.data) {
            throw new Error("Error Fetching Workout")
          }

          return response.data
        },
      })),
    })

    const logWorkoutPlan = useMutation({
      mutationFn: async (data: any) => {
        const response = await api.createWorkoutPlanLog(data)

        if (!response.ok && !response.data) {
          throw new Error("Error Logging Workout Plan")
        }

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workoutPlanLogs", userID] })
        renderToast("Success", "Workout Plan Logged Successfully", "success")
        navigation.goBack()
      },
      onError: (error) => {
        console.log("Error Logging Workout Plan:", error)
        renderToast("Error", "Failed to log workout plan. Please try again.", "error")
      },
    })

    const handleLogWorkoutPlan = () => {
      logWorkoutPlan.mutate({
        user_id: userID,
        plan_id: planID,
        date: createProteinDate(new Date()),
      })
    }

    const isLoadingWorkouts = workoutQueries.some((query) => query.isLoading)
    const workoutsDetails = useMemo(() => {
      return workoutQueries
        .filter((query) => query.isSuccess && query.data)
        .map((query) => query.data as Workout)
    }, [workoutQueries])

    const renderWorkoutItem = ({ item }: { item: Workout }) => (
      <TouchableOpacity
        style={themed($workoutItemCard)}
        onPress={() => navigation.navigate("ViewWorkout", { workoutID: item.workout_id })}
      >
        <Text text={item.name} preset="subheading" style={themed($workoutItemName)} />
        {item.description && (
          <Text text={item.description} style={themed($workoutItemDescription)} numberOfLines={2} />
        )}
        <Text
          text={`Difficulty: ${getLabel(item.difficulty, difficultyOptions)}`}
          style={themed($workoutItemDescription)}
        />
        {item.exercises && (
          <Text
            text={`${item.exercises.length} exercise${item.exercises.length === 1 ? "" : "s"}`}
            style={themed($workoutItemDetailText)}
          />
        )}
      </TouchableOpacity>
    )

    if (isLoading || isLoadingWorkouts || logWorkoutPlan.isPending) {
      return <Loading />
    }

    if (!data) {
      return (
        <ErrorScreen
          title="Error"
          message="There was an error fetching the workout plan. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    if (isError) {
      console.log("Error fetching workout plan:", error)
      return (
        <ErrorScreen
          title="Error"
          message="There was an error fetching the workout plan. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
        <View style={themed($headerSection)}>
          <Text
            preset="heading"
            text={data.name}
            style={themed($planNameHeader)}
            numberOfLines={2}
            ellipsizeMode="tail"
          />
          <Button
            preset="filled"
            onPress={handleLogWorkoutPlan}
            style={themed($editButton)}
            LeftAccessory={() => (
              <MaterialIcons
                name="lightbulb-outline"
                size={18}
                color={colors.text}
                style={{ marginRight: spacing.xs }}
              />
            )}
          >
            <Text text="Log" style={themed($editButtonText)} />
          </Button>
          <Button
            preset="filled"
            onPress={() => navigation.navigate("EditWorkoutPlan", { planID })}
            style={themed($editButton)}
            LeftAccessory={() => (
              <MaterialIcons
                name="edit"
                size={18}
                color={colors.text}
                style={{ marginRight: spacing.xs }}
              />
            )}
          >
            <Text text="Edit Plan" style={themed($editButtonText)} />
          </Button>
        </View>

        <View style={themed($contentCard)}>
          <View style={themed($detailsSection)}>
            {data.description && (
              <>
                <Text preset="subheading" text="Description" style={themed($sectionTitle)} />
                <Text text={data.description} style={themed($descriptionText)} />
                <View style={themed($separator)} />
              </>
            )}

            <Text preset="subheading" text="Plan Information" style={themed($sectionTitle)} />
            <View style={themed($detailItemRow)}>
              <MaterialIcons
                name="fitness-center"
                size={20}
                color={colors.textDim}
                style={$iconStyle}
              />
              <Text style={themed($detailLabel)}>Difficulty:</Text>
              <Text style={themed($detailValue)}>
                {getLabel(data.difficulty, difficultyOptions)}
              </Text>
            </View>

            {data.goal && (
              <View style={themed($detailItemRow)}>
                <MaterialIcons name="flag" size={20} color={colors.textDim} style={$iconStyle} />
                <Text style={themed($detailLabel)}>Goal:</Text>
                <Text style={themed($detailValue)}>{getLabel(data.goal, goalOptions)}</Text>
              </View>
            )}

            {data.repeats && (
              <View style={themed($detailItemRow)}>
                <MaterialIcons name="repeat" size={20} color={colors.textDim} style={$iconStyle} />
                <Text style={themed($detailLabel)}>Repeats:</Text>
                <Text style={themed($detailValue)}>{getLabel(data.repeats, intervalOptions)}</Text>
              </View>
            )}

            {data.start_time && (
              <View style={themed($detailItemRow)}>
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={colors.textDim}
                  style={$iconStyle}
                />
                <Text style={themed($detailLabel)}>Starts:</Text>
                <Text style={themed($detailValue)}>
                  {format(new Date(data.start_time), "MMM d, yyyy 'at' h:mm a")}
                </Text>
              </View>
            )}

            <View style={themed($detailItemRow)}>
              <MaterialIcons
                name="visibility"
                size={20}
                color={colors.textDim}
                style={$iconStyle}
              />
              <Text style={themed($detailLabel)}>Visibility:</Text>
              <Text style={themed($detailValue)}>{data.is_public ? "Public" : "Private"}</Text>
            </View>
          </View>

          <View style={themed($separator)} />

          <View style={themed($detailsSection)}>
            <Text preset="subheading" text="Workouts in this Plan" style={themed($sectionTitle)} />
            {!isLoadingWorkouts && workoutsDetails.length === 0 && workoutIDs.length > 0 && (
              <Text style={themed($emptyStateText)}>Could not load workout details.</Text>
            )}
            {!isLoadingWorkouts && workoutsDetails.length === 0 && workoutIDs.length === 0 && (
              <Text style={themed($emptyStateText)}>
                No workouts have been added to this plan yet.
              </Text>
            )}

            {!isLoadingWorkouts && workoutsDetails.length > 0 && (
              <FlatList
                data={workoutsDetails}
                renderItem={renderWorkoutItem}
                keyExtractor={(item) => item.workout_id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingTop: spacing.sm }}
              />
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
const $headerSection: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
})

const $planNameHeader: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: spacing.xl,
  color: colors.text,
  flexShrink: 1,
  marginRight: spacing.md,
})

const $editButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 20,
  minHeight: 36,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
})

const $editButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.secondary400,
  fontSize: spacing.sm,
})

const $contentCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.md,
  marginTop: spacing.md,
  marginBottom: spacing.xl,
  backgroundColor: colors.background,
  borderRadius: spacing.md,
  padding: spacing.lg,
  shadowColor: colors.palette?.neutral800 || "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $detailsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.lg,
  color: colors.text,
  marginBottom: spacing.md,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.textDim,
  marginBottom: spacing.md,
  lineHeight: spacing.md * 1.5,
})

const $detailItemRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
  paddingVertical: spacing.xs,
})

const $iconStyle: ViewStyle = {
  marginRight: 12,
}

const $detailLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.text,
  marginRight: spacing.xs,
})

const $detailValue: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.textDim,
  textTransform: "capitalize",
  flexShrink: 1,
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginVertical: spacing.lg,
})

const $workoutItemCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
})

const $workoutItemName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.md,
  marginBottom: 2,
})

const $workoutItemDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: spacing.sm,
  marginBottom: spacing.xs,
})

const $workoutItemDetailText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: spacing.sm,
  textTransform: "capitalize",
})

const $emptyStateText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginVertical: spacing.lg,
  fontStyle: "italic",
  fontSize: spacing.md,
})
