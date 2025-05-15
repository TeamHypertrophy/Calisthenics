import { Button, Loading, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, WorkoutPlanLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useState } from "react"
import { FlatList, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

interface ViewWorkoutPlanLogsScreenProps extends AppStackScreenProps<"ViewWorkoutPlanLogs"> {}

interface AppWorkoutPlanlog extends WorkoutPlanLog {
  planName: string
}

export const ViewWorkoutPlanLogsScreen: FC<ViewWorkoutPlanLogsScreenProps> = observer(
  function ViewWorkoutPlanLogsScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
    } = useStores()

    const [search, setSearch] = useState("")

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      data: workoutPlanLogs = [],
      isLoading: isLoadingLogs,
      isError: isErrorLogs,
      error: errorLogs,
      refetch: refetchLogs,
    } = useQuery({
      queryKey: ["workoutPlanLogs", userID],
      queryFn: async () => {
        const response = await api.getWorkoutPlanlogs()

        if (response.ok && response.data) {
          return response.data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
        }
        throw new Error("Failed Fetching Workout Plan Logs")
      },
    })

    const {
      data: allWorkoutPlans = [],
      isLoading: isLoadingPlans,
      isError: isErrorPlans,
      error: errorPlans,
      refetch: refetchPlans,
    } = useQuery({
      queryKey: ["workoutPlans", userID],
      queryFn: async () => {
        const response = await api.getAllUserWorkoutPlans(userID)

        if (response.ok && response.data) {
          return response.data
        }
        throw new Error("Failed Fetching Workout Plans")
      },
    })

    const workoutPlanNames = useMemo(() => {
      const map = new Map<string, string>()
      allWorkoutPlans.forEach((plan) => {
        if (plan.plan_id) {
          map.set(plan.plan_id, plan.name)
        }
      })
      return map
    }, [allWorkoutPlans])

    const filteredLogs = useMemo(() => {
      if (!workoutPlanLogs.length || !allWorkoutPlans.length) return []

      const combined = workoutPlanLogs.map((log) => ({
        ...log,
        planName: workoutPlanNames.get(log.plan_id) || "Unknown Workout Plan",
      }))

      if (!search.trim()) {
        return combined
      }

      return combined.filter((log) =>
        log.planName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    }, [workoutPlanLogs, workoutPlanNames, search, allWorkoutPlans.length])

    const renderLogItem = ({ item }: { item: AppWorkoutPlanlog }) => (
      <TouchableOpacity
        onPress={() => {
          if (item.log_id) {
            navigation.navigate("EditWorkoutPlanLog", {
              logID: item.log_id,
              planName: item.planName,
              initialDate: new Date(item.date).toISOString(),
            })
          }
        }}
        style={themed($logItemContainer)}
      >
        <View style={themed($logItemHeader)}>
          <Text preset="subheading" text={item.planName} style={themed($logItemName)} />
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

    if (isLoadingLogs || isLoadingPlans) {
      return <Loading />
    }

    if (isErrorLogs || isErrorPlans) {
      console.error("Error Fetching Workout Plan Logs:", errorLogs)
      console.error("Error Fetching Workout Plans:", errorPlans)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Workout Plan Logs"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <Text preset="heading" text="Logs" style={themed($screenTitle)} />

        <SearchBar
          placeholder="Search by plan name"
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
              <Text style={themed($emptyListText)}>No Workout Plan Logs Found.</Text>
            </View>
          }
          refreshing={isLoadingLogs || isLoadingPlans}
          onRefresh={() => {
            refetchPlans()
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

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

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
