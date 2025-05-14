import { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "@/navigators"
import { Button, Loading, Screen, SearchBar, Text } from "@/components"
import { api, WorkoutLog } from "@/services/api"
import { ErrorScreen } from "@/components/ErrorScreen"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useQuery } from "@tanstack/react-query"
import { FlatList, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { format } from "date-fns/format"

interface ViewWorkoutLogsScreenProps extends AppStackScreenProps<"ViewWorkoutLogs"> {}

interface AppWorkoutLog extends WorkoutLog {
  workoutName: string
}

export const ViewWorkoutLogsScreen: FC<ViewWorkoutLogsScreenProps> = observer(
  function ViewWorkoutLogsScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const [search, setSearch] = useState("")

    const {
      data: workoutLogs = [],
      isLoading: isLoadingLogs,
      isError: isErrorLogs,
      error: errorLogs,
      refetch: refetchLogs,
    } = useQuery({
      queryKey: ["workoutLogs", userID],
      queryFn: async () => {
        const response = await api.getWorkoutLogs()

        if (response.ok && response.data) {
          return response.data.sort(
            (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime(),
          )
        }
        throw new Error("Failed Fetching Workout Logs")
      },
    })

    const {
      data: allWorkouts = [],
      isLoading: isLoadingWorkouts,
      isError: isErrorWorkouts,
      error: errorWorkouts,
      refetch: refetchWorkouts,
    } = useQuery({
      queryKey: ["workouts", userID],
      queryFn: async () => {
        const response = await api.getAllWorkouts()

        if (response.ok && response.data) {
          return response.data
        }
        throw new Error("Failed Fetching Workouts")
      },
    })

    const workoutNames = useMemo(() => {
      const map = new Map<string, string>()
      allWorkouts.forEach((workout) => {
        map.set(workout.workout_id, workout.name)
      })
      return map
    }, [allWorkouts])

    const filteredLogs = useMemo(() => {
      if (!workoutLogs.length || !allWorkouts.length) return []

      const combined = workoutLogs.map((log) => ({
        ...log,
        workoutName: workoutNames.get(log.workout_id) || "Unknown Workout",
      }))

      if (!search.trim()) {
        return combined
      }

      return combined.filter((log) =>
        log.workoutName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    }, [workoutLogs, workoutNames, search, allWorkouts.length])

    const renderLogItem = ({ item }: { item: AppWorkoutLog }) => (
      <TouchableOpacity
        onPress={() => {
          if (item.log_id) {
            navigation.navigate("EditWorkoutLog", {
              logID: item.log_id,
              workoutName: item.workoutName,
              initialDate: new Date(item.date).toISOString() || "", 
            })
          }
        }}
        style={themed($logItemContainer)}
      >
        <View style={themed($logItemHeader)}>
          <Text preset="subheading" text={item.workoutName} style={themed($logItemName)} />
          {item.date && (
            <Text
              preset="formHelper"
              text={format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}
              style={themed($logItemDate)}
            />
          )}
        </View>
      </TouchableOpacity>
    )

    if (isLoadingLogs || isLoadingLogs) {
      return <Loading/>
    }

    if (isErrorLogs || isErrorWorkouts) {
      console.error("Error Fetching Workout Logs:", errorLogs)
      console.error("Error Fetching Workouts:", errorWorkouts)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Workout Logs"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <Text preset="heading" text="Workout Logs" style={themed($screenTitle)} />

        <SearchBar
          placeholder="Search"
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
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => String(item.log_id)}
          contentContainerStyle={themed($listContentContainer)}
          ListEmptyComponent={
            <View style={$emptyListContainer}>
              <Text style={themed($emptyListText)}>No Workout Logs Found.</Text>
            </View>
          }
          refreshing={isLoadingLogs || isLoadingWorkouts}
          onRefresh={() => {
            refetchWorkouts()
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
  fontWeight: "bold",
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
  elevation: 1,
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
  fontWeight: "bold",
  flexShrink: 1,
  marginRight: spacing.sm,
})

const $logItemDate: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: spacing.xs,
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
  backgroundColor: colors.palette.primary300,
  borderRadius: 120,
  marginTop: spacing.xs,
  height: 30,
  alignSelf: "flex-start",
  paddingHorizontal: spacing.sm,
})

const $clearButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
})