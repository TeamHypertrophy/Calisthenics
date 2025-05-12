import { Button, Card, Chip, Icon, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { Loading } from "@/components/Loader"
import { useStores } from "@/models"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { api, type CalorieLog, type ProteinLog, type SleepLog, type WaterLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { capitalize } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useState } from "react"
import { FlatList, TextStyle, View, ViewStyle } from "react-native"

export type LogType = "protein" | "sleep" | "water" | "calories"
interface AppBaseLog {
  id: number
  user_id: string
  type: LogType
  date: Date
  updated_at?: Date
}
interface AppProteinLog extends AppBaseLog, Omit<ProteinLog, "log_id" | "date" | "updated_at"> {
  type: "protein"
  date: Date
}
interface AppSleepLog
  extends AppBaseLog,
    Omit<SleepLog, "log_id" | "beginning" | "end" | "updated_at" | "amount"> {
  type: "sleep"
  date: Date
  beginning: Date
  end: Date
  duration?: number
}

interface AppWaterLog extends AppBaseLog, Omit<WaterLog, "log_id" | "date" | "updated_at"> {
  type: "water"
  date: Date
}

interface AppCalorieLog extends AppBaseLog, Omit<CalorieLog, "log_id" | "date" | "updated_at"> {
  type: "calories"
  date: Date
}

type AppLog = AppProteinLog | AppSleepLog | AppWaterLog | AppCalorieLog

export const LOG_TYPES: LogType[] = ["protein", "sleep", "water", "calories"]

export const LogsScreen: FC<HomeTabScreenProps<"Logs">> = observer(function LogsScreen(_props) {
  const { navigation } = _props

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const {
    authenticationStore: { userID },
  } = useStores()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<LogType | null>(null)

  const {
    data: combinedLogs = [],
    isLoading,
    isFetching,
    isError,
    refetch,
    error,
  } = useQuery<AppLog[]>({
    queryKey: ["logs", userID],
    queryFn: async () => {
      try {
        const [calorieRes, proteinRes, waterRes, sleepRes] = await Promise.all([
          api.getCalorieLogs(),
          api.getProteinLogs(),
          api.getWaterLogs(),
          api.getSleepLogs(),
        ])

        const safeNewDate = (d: Date | string | undefined | null): Date | undefined => {
          if (!d) return undefined
          try {
            return new Date(d)
          } catch {
            return undefined
          }
        }

        const calorieLogs: AppCalorieLog[] =
          calorieRes.ok && calorieRes.data
            ? calorieRes.data
                .filter((log) => log.log_id != null && log.date != null)
                .map((log) => ({
                  ...log,
                  id: log.log_id!,
                  type: "calories",
                  date: safeNewDate(log.date)!,
                  updated_at: safeNewDate(log.updated_at),
                }))
            : []

        const proteinLogs: AppProteinLog[] =
          proteinRes.ok && proteinRes.data
            ? proteinRes.data
                .filter((log) => log.log_id != null && log.date != null)
                .map((log) => ({
                  ...log,
                  id: log.log_id!,
                  type: "protein",
                  date: safeNewDate(log.date)!,
                  updated_at: safeNewDate(log.updated_at),
                }))
            : []

        const waterLogs: AppWaterLog[] =
          waterRes.ok && waterRes.data
            ? waterRes.data
                .filter((log) => log.log_id != null && log.date != null)
                .map((log) => ({
                  ...log,
                  id: log.log_id!,
                  type: "water",
                  date: safeNewDate(log.date)!,
                  updated_at: safeNewDate(log.updated_at),
                }))
            : []

        const sleepLogs: AppSleepLog[] =
          sleepRes.ok && sleepRes.data
            ? sleepRes.data
                .filter((log) => log.log_id != null && log.beginning != null && log.end != null)
                .map((log) => ({
                  ...log,
                  id: log.log_id!,
                  type: "sleep",
                  date: safeNewDate(log.beginning)!,
                  beginning: safeNewDate(log.beginning)!,
                  end: safeNewDate(log.end)!,
                  duration: log.amount,
                  updated_at: safeNewDate(log.updated_at),
                }))
            : []

        const allLogs: AppLog[] = [...calorieLogs, ...proteinLogs, ...waterLogs, ...sleepLogs]

        allLogs.sort((a, b) => {
          const dateA = a.updated_at || a.date
          const dateB = b.updated_at || b.date
          return dateB.getTime() - dateA.getTime()
        })
        return allLogs
      } catch (error) {
        console.error("Error Fetching Logs: ", error)
        throw new Error("Failed to Fetch Logs")
      }
    },
  })

  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((log) => {
      const lowerCaseQuery = searchQuery.toLowerCase()
      const matchesType = selectedFilter ? log.type === selectedFilter : true
      const matchesSearch =
        !searchQuery ||
        log.type.toLowerCase().includes(lowerCaseQuery) ||
        format(log.date, "PPP").toLowerCase().includes(lowerCaseQuery)
      return matchesType && matchesSearch
    })
  }, [combinedLogs, searchQuery, selectedFilter])

  const handleCreateLog = () => {
    navigation.navigate("CreateLog")
  }

  const handleViewLog = (logID: number, logType: LogType) => {
    navigation.navigate("ViewLog", { logID, logType })
  }

  const renderLogItem = ({ item }: { item: AppLog }) => {
    let details = ""
    let emoji = ""

    switch (item.type) {
      case "protein":
        details = `${item.amount}g`
        emoji = "🥩"
        break
      case "water":
        details = `${item.amount}ml`
        emoji = "💧"
        break
      case "calories":
        details = `${item.amount}kcal`
        emoji = "🔥"
        break
      case "sleep":
        emoji = "💤"
        details = `${format(item.beginning, "p")} - ${format(item.end, "p")}`
        break
    }

    const heading = `${emoji} ${capitalize(item.type)}`

    return (
      <Card
        style={themed($logCard)}
        heading={heading}
        content={`${details} - ${format(item.date, "PPP")}`}
        onPress={() => handleViewLog(item.id, item.type)}
        RightComponent={<Icon icon="caretRight" size={20} color={colors.palette.primary200} />}
      />
    )
  }

  if (isLoading) return <Loading />

  if (isError) {
    console.log("Error Fetching Logs:", error)
    return (
      <ErrorScreen
        title="Error"
        message="An error occurred while fetching logs."
        onBack={() => navigation.goBack()}
      />
    )
  }

  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
      <View style={themed($headerContainer)}>
        <Text preset="heading" text="Nutrition" />
        <Button
          text="Create"
          preset="filled"
          onPress={handleCreateLog}
          style={themed($createButton)}
          LeftAccessory={() => (
            <MaterialIcons
              name="add"
              size={20}
              color={colors.palette.secondary400}
              style={{ marginRight: 4 }}
            />
          )}
        />
      </View>

      <SearchBar
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={themed($searchBar)}
      />

      <View style={themed($filterContainer)}>
        <Chip
          text="All"
          preset={selectedFilter === null ? "filled" : "outlined"}
          onPress={() => setSelectedFilter(null)}
          style={themed($chip)}
        />
        {LOG_TYPES.map((type) => (
          <Chip
            key={type}
            text={capitalize(type)}
            preset={selectedFilter === type ? "filled" : "outlined"}
            onPress={() => setSelectedFilter(type)}
            style={themed($chip)}
          />
        ))}
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        style={$list}
        contentContainerStyle={themed($listContentContainer)}
        ListEmptyComponent={
          <View style={themed($emptyStateContainer)}>
            <Text text="No Logs, Create One!" style={themed($emptyStateText)} />
          </View>
        }
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $createButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing.xxs,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.md,
  marginBottom: spacing.sm,
})

const $filterContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
})

const $chip: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
  marginBottom: spacing.xs,
})

const $list: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $logCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  overflow: "hidden",
  elevation: 2,
})

const $emptyStateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
  marginTop: spacing.xxl,
})

const $emptyStateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})
