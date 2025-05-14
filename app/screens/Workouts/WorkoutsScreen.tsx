import { Button, FilterChip, FilterChipItem, Loading, Screen, SearchBar, Text } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useState } from "react"
import { FlatList, ScrollView, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { difficultyOptions } from "../Exercises/SearchExercisesScreen"
import { useStores } from "@/models"
import { useQuery } from "@tanstack/react-query"
import { api, Workout } from "@/services/api"
import { ErrorScreen } from "@/components/ErrorScreen"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { formatDuration } from "@/utils/strings"
import { renderToast } from "@/utils/toastNotification"
import { PlanForm } from "../WorkoutPlan/CreateWorkoutPlanScreen"

interface WorkoutsScreenProps extends AppStackScreenProps<"Workouts"> {}

export const WorkoutsScreen: FC<WorkoutsScreenProps> = observer(function WorkoutsScreen(_props) {
  const { navigation } = _props

  const sourceScreen = _props.route.params?.source
  const isSelectionMode = _props.route.params?.selectionMode
  const existingWorkouts = _props.route.params?.existingWorkouts
  const passedFormData = _props.route.params.formData as PlanForm
  const planID = _props.route.params?.planID

  const [selectedForPlan, setSelectedForPlan] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null)

  const {
    authenticationStore: { userID },
  } = useStores()

  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const {
    data: workoutData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["workouts", userID],
    queryFn: async () => {
      const response = await api.getAllWorkouts()

      if (!response.ok && !response.data) {
        throw new Error("Failed Fetching Workouts")
      }

      return response.data
    },
  })

  const handleDifficultyFilterChange = (item: FilterChipItem | null) => {
    setActiveDifficulty(item ? item.value : null)
  }

  const filteredWorkouts = useMemo(() => {
    let workouts = workoutData
    if (search.trim()) {
      workouts = workouts.filter((workout) =>
        workout.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    }
    if (activeDifficulty) {
      workouts = workouts.filter((workout) => workout.difficulty === activeDifficulty)
    }
    return workouts
  }, [workoutData, search, activeDifficulty])

  const handleWorkoutPress = (item: Workout) => {
    if (isSelectionMode) {
      if (existingWorkouts?.includes(item.workout_id)) {
        renderToast("Error", "Workout already exists in the plan", "error")
        return
      }

      setSelectedForPlan((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(item.workout_id)) {
          newSet.delete(item.workout_id)
        } else {
          newSet.add(item.workout_id)
        }
        return newSet
      })
    } else {
      navigation.navigate("ViewWorkout", { workoutID: item.workout_id })
    }
  }

  const handleDoneSelection = () => {
    const workoutsToReturn = workoutData.filter((workout) =>
      selectedForPlan.has(workout.workout_id),
    )

    if (sourceScreen === "CreateWorkoutPlan") {
      navigation.navigate("CreateWorkoutPlan", { selectedWorkouts: workoutsToReturn, formData: passedFormData })
    } else if (sourceScreen === "EditWorkoutPlan" && planID) {
      navigation.navigate("EditWorkoutPlan", { selectedWorkouts: workoutsToReturn, planID: planID })
    } else {
      renderToast(
        "Error",
        "Unexpected Error When Selecting Workouts, Please Reset The Application",
        "error",
      )
      navigation.goBack()
    }
  }

  const renderWorkout = ({ item }: { item: Workout }) => {
    const isSelected = selectedForPlan.has(item.workout_id)
    const isExisting = existingWorkouts?.includes(item.workout_id)

    return (
      <TouchableOpacity
        style={[
          themed($workoutCard),
          isSelectionMode && isSelected && themed($selectedCardStyle),
          isSelectionMode && isExisting && themed($existingCardStyle),
        ]}
        onPress={() => handleWorkoutPress(item)}
        disabled={isSelectionMode && isExisting}
      >
        {isSelectionMode && (
          <View style={themed($selectionIconContainer)}>
            {isExisting ? (
              <AntDesign name="checkcircle" size={24} color={"green"} />
            ) : isSelected ? (
              <AntDesign name="checkcircle" size={24} color={colors.tint || "blue"} />
            ) : (
              <AntDesign name="pluscircleo" size={24} color={colors.textDim || "grey"} />
            )}
          </View>
        )}
        <Text text={item.name} preset="subheading" style={themed($NameText)} numberOfLines={2} />
        <View style={themed($chipRow)}>
          <Text text={`Difficulty: ${item.difficulty}`} style={themed($DetailText)} />
        </View>
        <View style={themed($chipRow)}>
          <Text text={`Duration: ${formatDuration(item.duration)}`} style={themed($DetailText)} />
        </View>
      </TouchableOpacity>
    )
  }

  const CustomHeader = () => {
    if (isSelectionMode) {
      return (
        <View style={themed($headerContainer)}>
          <Text preset="subheading" text="Select Workouts" style={themed($customHeaderTitle)} />
          <Button
            text="Cancel"
            preset="filled"
            style={themed([$customHeaderButton, $cancelButton])}
            onPress={() => navigation.goBack()}
          />
          <Button
            text={`Done (${selectedForPlan.size})`}
            preset="filled"
            style={themed([$customHeaderButton, $doneButton])}
            onPress={handleDoneSelection}
          />
        </View>
      )
    }
    return (
      <View style={themed($headerContainer)}>
        <Text preset="heading" text="Workouts" />
        <Button
          text="Create"
          preset="filled"
          onPress={() => navigation.navigate("CreateWorkout", {})}
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
    )
  }

  if (isLoading && !isFetching && !workoutData.length) {
    return <Loading />
  }

  if (isError) {
    console.error("Error Fetching Workouts:", error)
    return (
      <ErrorScreen
        title="Error"
        message="Failed Loading Workouts"
        onBack={() => navigation.goBack()}
      />
    )
  }

  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
      <CustomHeader />

      <SearchBar
        placeholder="Search"
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
      </ScrollView>

      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => String(item.workout_id)}
        style={$list}
        contentContainerStyle={themed($listContentContainer)}
        ListEmptyComponent={
          <View style={themed($emptyStateContainer)}>
            <Text text="No Workouts, Create One!" style={themed($emptyStateText)} />
          </View>
        }
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </Screen>
  )
})

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

const $customHeaderTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "left",
  fontWeight: "600",
  color: colors.text,
  flex: 1,
})

const $customHeaderButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 0,
  flexShrink: 0,
  paddingHorizontal: spacing.sm,
  marginLeft: spacing.xs,
  minWidth: 80,
  height: 36,
  justifyContent: "center",
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.error,
})

const $doneButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
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

const $workoutCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
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

const $DetailText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginRight: spacing.sm,
  marginBottom: spacing.xxs,
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

const $selectedCardStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary500,
  borderWidth: 2,
})

const $existingCardStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.neutral400,
  borderWidth: 1,
  opacity: 0.7,
})

const $selectionIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.sm,
  right: spacing.sm,
  backgroundColor: "rgba(255,255,255,0.8)",
  borderRadius: 12,
  padding: spacing.xxs,
  zIndex: 1,
})