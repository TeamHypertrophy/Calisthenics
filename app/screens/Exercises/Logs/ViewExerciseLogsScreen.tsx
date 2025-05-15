import { Button, Loading, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, ExerciseLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useState } from "react"
import { FlatList, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

interface ViewExerciseLogsScreenProps extends AppStackScreenProps<"ViewExerciseLogs"> {}

interface AppExerciseLog extends ExerciseLog {
  exerciseName: string
}

export const ViewExerciseLogsScreen: FC<ViewExerciseLogsScreenProps> = observer(
  function ViewExerciseLogsScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      authenticationStore: { userID },
    } = useStores()

    const [search, setSearch] = useState<string>("")

    const {
      data: exerciseLogs = [],
      isLoading: isLoadingLogs,
      isError: isErrorLogs,
      error: errorLogs,
      refetch: refetchLogs,
    } = useQuery({
      queryKey: ["exerciseLogs", userID],
      queryFn: async () => {
        if (!userID) throw new Error("User ID not found")
        const response = await api.getExerciseLogs()
        if (response.ok && response.data) {
          return response.data.sort(
            (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime(),
          )
        }
        throw new Error(response.problem || "Failed to fetch exercise logs")
      },
      enabled: !!userID,
    })

    const {
      data: allExercises = [],
      isLoading: isLoadingExercises,
      isError: isErrorExercises,
      error: errorExercises,
      refetch: refetchExercises,
    } = useQuery({
      queryKey: ["allExercisesForLogNames"],
      queryFn: async () => {
        const response = await api.getAllExercises()
        if (response.ok && response.data) {
          return response.data
        }
        throw new Error(response.problem || "Failed to fetch exercises for names")
      },
    })

    const exerciseNameMap = useMemo(() => {
      const map = new Map<number, string>()
      allExercises.forEach((exercise) => {
        map.set(exercise.exercise_id, exercise.name)
      })
      return map
    }, [allExercises])

    const filteredAndCombinedLogs = useMemo(() => {
      if (!exerciseLogs.length || !allExercises.length) return []

      const combined = exerciseLogs.map((log) => ({
        ...log,
        exerciseName: exerciseNameMap.get(log.exercise_id) || "Unknown Exercise",
      }))

      if (!search.trim()) {
        return combined
      }

      return combined.filter((log) =>
        log.exerciseName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    }, [exerciseLogs, exerciseNameMap, search, allExercises.length])

    const renderLogItem = ({ item }: { item: AppExerciseLog }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("EditExerciseLog", {
            logID: item.log_id,
            exerciseName: item.exerciseName,
            setsCompleted: item.sets_completed,
            repsCompleted: item.reps_completed,
          })
        }
        style={themed($logItemContainer)}
      >
        <View style={themed($logItemHeader)}>
          <Text preset="subheading" text={item.exerciseName} style={themed($logItemName)} />
          {item.date && (
            <Text
              preset="formHelper"
              text={format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}
              style={themed($logItemDate)}
            />
          )}
        </View>
        <Text style={themed($logItemDetails)}>
          Sets: {item.sets_completed} &bull; Reps: {item.reps_completed}
        </Text>
      </TouchableOpacity>
    )

    if (isLoadingLogs || isLoadingExercises) {
      return <Loading />
    }

    if (isErrorLogs || isErrorExercises) {
      console.log("Error Fetching Exercise Logs:", errorLogs)
      console.log("Error Fetching Exercises:", errorExercises)
      return (
        <ErrorScreen
          title="Error"
          message={"Failed Loading Exercise Logs"}
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <Text preset="heading" text="Exercise Logs" style={themed($screenTitle)} />

        <SearchBar
          placeholder="Search Exercise Logs"
          value={search}
          onChangeText={setSearch}
          style={themed($searchBar)}
        />

        {search.trim() !== "" && (
          <Button
            text="Clear Search"
            onPress={() => setSearch("")}
            style={themed($clearButton)}
            textStyle={themed($clearButtonText)}
            preset="filled"
          />
        )}

        <FlatList
          data={filteredAndCombinedLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => String(item.log_id)}
          contentContainerStyle={themed($listContentContainer)}
          ListEmptyComponent={
            <View style={$emptyListContainer}>
              <Text style={themed($emptyListText)}>No exercise logs found.</Text>
            </View>
          }
          refreshing={isLoadingLogs || isLoadingExercises}
          onRefresh={() => {
            refetchExercises()
            refetchLogs()
          }}
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  fontSize: spacing.xxl,
  textAlign: "left",
})

const $searchBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $logItemContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
})

const $logItemHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $logItemName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.lg,
  flexShrink: 1,
  marginRight: spacing.sm,
})

const $logItemDate: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: spacing.xs,
})

const $logItemDetails: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.md,
})

const $emptyListContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 50,
}

const $emptyListText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.textDim,
})

const $clearButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
  backgroundColor: colors.palette.primary500,
  borderRadius: 120,
  marginTop: spacing.md,
  height: 30,
})

const $clearButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md,
  color: colors.palette.secondary400,
})
