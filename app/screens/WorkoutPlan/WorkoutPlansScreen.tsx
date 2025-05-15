import { Button, FilterChip, FilterChipItem, Loading, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, WorkoutPlan } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useState } from "react"
import { FlatList, ScrollView, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { difficultyOptions } from "../Exercises/SearchExercisesScreen"

export const goalOptions: FilterChipItem[] = [
  { label: "Endurance", value: "Endurance" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Muscle Gain", value: "MuscleGain" },
  { label: "Strength", value: "Strength" },
  { label: "Weight Loss", value: "WeightLoss" },
]

export const intervalOptions: FilterChipItem[] = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
]

interface WorkoutPlansScreenProps extends AppStackScreenProps<"WorkoutPlans"> {}

export const WorkoutPlansScreen: FC<WorkoutPlansScreenProps> = observer(
  function WorkoutPlansScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const [search, setSearch] = useState("")
    const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null)
    const [activeGoal, setActiveGoal] = useState<string | null>(null)
    const [activeInterval, setActiveInterval] = useState<string | null>(null)

    const {
      data: workoutPlans = [],
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
    } = useQuery({
      queryKey: ["workoutPlans", userID],
      queryFn: async () => {
        const response = await api.getAllUserWorkoutPlans(userID)

        if (response.ok && response.data) {
          return response.data.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
        }
        throw new Error("Failed Fetching Workout Plans")
      },
    })

    const handleDifficultyFilterChange = (item: FilterChipItem | null) => {
      setActiveDifficulty(item ? item.value : null)
    }

    const handleGoalFilterChange = (item: FilterChipItem | null) => {
      setActiveGoal(item ? item.value : null)
    }

    const handleIntervalFilterChange = (item: FilterChipItem | null) => {
      setActiveInterval(item ? item.value : null)
    }

    const filteredWorkoutPlans = useMemo(() => {
      let plans = workoutPlans
      if (search.trim()) {
        plans = plans.filter((plan) =>
          plan.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
      }
      if (activeDifficulty) {
        plans = plans.filter((plan) => plan.difficulty === activeDifficulty)
      }
      if (activeGoal) {
        plans = plans.filter((plan) => plan.goal === activeGoal)
      }
      if (activeInterval) {
        plans = plans.filter((plan) => plan.repeats === activeInterval)
      }
      return plans
    }, [workoutPlans, search, activeDifficulty, activeGoal, activeInterval])

    const renderWorkoutPlanItem = ({ item }: { item: WorkoutPlan }) => (
      <TouchableOpacity
        style={themed($planCard)}
        onPress={() => {
          if (item.plan_id) {
            navigation.navigate("ViewWorkoutPlan", { planID: item.plan_id })
          }
        }}
      >
        <Text text={item.name} preset="subheading" style={themed($NameText)} numberOfLines={2} />
        {item.description && (
          <Text
            text={item.description}
            preset="default"
            style={themed($DescriptionText)}
            numberOfLines={3}
          />
        )}
        <View style={themed($chipRow)}>
          <Text text={`Difficulty: ${item.difficulty}`} style={themed($DetailText)} />
          {item.goal && <Text text={`Goal: ${item.goal}`} style={themed($DetailText)} />}
          {item.repeats && <Text text={`Repeats: ${item.repeats}`} style={themed($DetailText)} />}
        </View>
      </TouchableOpacity>
    )

    if (isLoading && !isFetching && !workoutPlans.length) {
      return <Loading />
    }

    if (isError) {
      console.error("Error fetching workout plans:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed to fetch workout plans. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($headerContainer)}>
          <Text preset="heading" text="Plans" />
          <Button
            text="Create"
            preset="filled"
            onPress={() => navigation.navigate("CreateWorkoutPlan", {})}
            style={themed($createButton)}
            LeftAccessory={() => (
              <MaterialIcons
                name="add"
                size={20}
                color={colors.palette?.secondary400 || colors.text}
                style={{ marginRight: spacing.xs }}
              />
            )}
          />
        </View>

        <SearchBar
          placeholder="Search Workout Plans"
          value={search}
          onChangeText={setSearch}
          style={themed($searchBar)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={themed($filterScrollViewStyle)}
          contentContainerStyle={themed($filtersHorizontalScrollContentContainer)}
        >
          <FilterChip
            placeholder="Difficulty"
            options={difficultyOptions}
            selectedValue={activeDifficulty}
            onValueChange={handleDifficultyFilterChange}
            style={themed($filterChipStyle)}
          />
          <FilterChip
            placeholder="Goal"
            options={goalOptions}
            selectedValue={activeGoal}
            onValueChange={handleGoalFilterChange}
            style={themed($filterChipStyle)}
          />
          <FilterChip
            placeholder="Interval"
            options={intervalOptions}
            selectedValue={activeInterval}
            onValueChange={handleIntervalFilterChange}
            style={themed($filterChipStyle)}
          />
        </ScrollView>

        <View style={themed($templatesComingSoonContainer)}>
          <Text style={themed($templatesComingSoonText)} preset="formHelper">
            ✨ Workout Plan Templates: Coming Soon!
          </Text>
        </View>

        <FlatList
          data={filteredWorkoutPlans}
          renderItem={renderWorkoutPlanItem}
          keyExtractor={(item) => String(item.plan_id)}
          style={$list}
          contentContainerStyle={themed($listContentContainer)}
          ListEmptyComponent={
            <View style={themed($emptyStateContainer)}>
              <Text text="No Workout Plans Found. Create One!" style={themed($emptyStateText)} />
            </View>
          }
          onRefresh={refetch}
          refreshing={isFetching}
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = { flex: 1 }

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $createButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginTop: spacing.md,
  marginBottom: spacing.sm,
})

const $filterScrollViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 0,
  flexShrink: 1,
  marginBottom: spacing.sm,
})

const $filtersHorizontalScrollContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.md,
})

const $filterChipStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
})

const $list: ViewStyle = { flex: 1 }

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $planCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  elevation: 2,
})

const $NameText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: spacing.xs,
})

const $DescriptionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: spacing.sm,
  lineHeight: 18,
})

const $DetailText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 12,
  marginRight: spacing.sm,
  marginBottom: spacing.xxs,
  textTransform: "capitalize",
})

const $chipRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  marginTop: spacing.xxs,
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

const $templatesComingSoonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.sm,
})

const $templatesComingSoonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontStyle: "italic",
})
