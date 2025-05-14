import { Button, FilterChip, FilterChipItem, Loading, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { AppStackScreenProps } from "@/navigators"
import { api, Difficulty, Equipment, Exercise, ExerciseType, MuscleGroup } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

interface SearchExercisesScreenProps extends AppStackScreenProps<"SearchExercises"> {}

export const EQUIPMENT_VALUES: Equipment[] = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "bodyweight",
  "resistance_band",
  "other",
]

export const MUSCLE_GROUP_VALUES: MuscleGroup[] = [
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
]

export const EXERCISE_TYPE_VALUES: ExerciseType[] = [
  "strength",
  "cardio",
  "flexibility",
  "plyometric",
  "bodyweight",
]

export const DIFFICULTY_VALUES: Difficulty[] = ["beginner", "intermediate", "advanced"]

export const createFilterOptions = (values: string[]): FilterChipItem[] => {
  return values.map((inputValue) => {
    const displayLabel = inputValue
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    const serverValue = inputValue
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")

    return {
      label: displayLabel,
      value: serverValue,
    }
  })
}

export const equipmentOptions = createFilterOptions(EQUIPMENT_VALUES)
export const muscleGroupOptions = createFilterOptions(MUSCLE_GROUP_VALUES)
export const exerciseTypeOptions = createFilterOptions(EXERCISE_TYPE_VALUES)
export const difficultyOptions = createFilterOptions(DIFFICULTY_VALUES)

export interface ActiveFilters {
  equipment: string | null
  muscle_group: string | null
  exercise_type: string | null
  difficulty: string | null
}

export const SearchExercisesScreen: FC<SearchExercisesScreenProps> = observer(
  function SearchExercisesScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const placeholderExerciseImage = process.env.PLACEHOLDER_EXERCISE_IMAGE

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [debouncedQuery, setDebouncedQuery] = useState<string>("")
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
      equipment: null,
      muscle_group: null,
      exercise_type: null,
      difficulty: null,
    })

    const workoutID = _props.route.params?.workoutID
    const sourceScreen = _props.route.params?.source
    const isSelectionMode = _props.route.params?.selectionMode || false
    const existingExerciseIds = _props.route.params?.existingExcercises || []
    const [selectedForWorkout, setSelectedForWorkout] = useState<Set<number>>(new Set())

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedQuery(searchQuery)
      }, 4000)

      return () => {
        clearTimeout(handler)
      }
    }, [searchQuery])

    const {
      data: exercises = [],
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
    } = useQuery({
      queryKey: ["exercises", debouncedQuery, activeFilters],
      queryFn: async () => {
        const params: any = {}
        if (debouncedQuery.trim()) params.name = searchQuery.trim()
        if (activeFilters.equipment) params.equipment = activeFilters.equipment
        if (activeFilters.muscle_group) params.muscle_group = activeFilters.muscle_group
        if (activeFilters.exercise_type) params.exercise_type = activeFilters.exercise_type
        if (activeFilters.difficulty) params.difficulty = activeFilters.difficulty

        let response

        if (debouncedQuery.trim() || Object.values(activeFilters).some((v) => v !== null)) {
          response = await api.searchExercises(params)
        } else {
          response = await api.getAllExercises()
        }

        if (!response.ok && !response.data) {
          console.error("Error Fetching Exercises: ", response.problem)
          throw new Error("Failed Fetching Exercises")
        }

        return response.data
      },
    })

    const handleFilterChange = (filterType: keyof ActiveFilters, item: FilterChipItem | null) => {
      setActiveFilters((prev) => ({ ...prev, [filterType]: item ? item.value : null }))
    }

    const clearFilters = () => {
      setSearchQuery("")
      setActiveFilters({
        equipment: null,
        muscle_group: null,
        exercise_type: null,
        difficulty: null,
      })
    }

    const handleExercisePress = (item: Exercise) => {
      if (isSelectionMode) {
        if (existingExerciseIds.includes(item.exercise_id)) {
          renderToast("Info", `${item.name} is already in the workout.`, "info")
          return
        }
        setSelectedForWorkout((prev) => {
          const newSet = new Set(prev)
          if (newSet.has(item.exercise_id)) {
            newSet.delete(item.exercise_id)
          } else {
            newSet.add(item.exercise_id)
          }
          return newSet
        })
      } else {
        navigation.navigate("ViewExercise", { exerciseID: item.exercise_id })
      }
    }

    const handleDoneSelection = () => {
      const exercisesToReturn = exercises.filter((ex) => selectedForWorkout.has(ex.exercise_id))
      
      if (sourceScreen === "EditWorkout") {
        navigation.navigate("EditWorkout", {
          workoutID: workoutID || "",
          selectedExercises: exercisesToReturn,
        })
      } else if (sourceScreen === "CreateWorkout") {
        navigation.navigate("CreateWorkout", {
          selectedExercises: exercisesToReturn,
        })
      } else {
        renderToast("Error", "Unexpected Error When Selecting Exercises, Please Reset The Application", "error")
        navigation.goBack()
      }
    }

    const renderExerciseItem = ({ item }: { item: Exercise }) => {
      const isSelected = selectedForWorkout.has(item.exercise_id)
      const isExisting = existingExerciseIds.includes(item.exercise_id)

      return (
        <TouchableOpacity
          style={[
            themed($exerciseCard),
            isSelectionMode && isSelected && themed($selectedCard),
            isSelectionMode && isExisting && themed($existingCard),
          ]}
          onPress={() => handleExercisePress(item)}
          disabled={isSelectionMode && isExisting}
        >
          <ImageBackground
            source={item.image_url ? { uri: item.image_url } : { uri: placeholderExerciseImage }}
            style={themed($exerciseImage)}
            resizeMode="cover"
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
    }

    const CustomHeader = () => {
      if (isSelectionMode) {
        return (
            <View style={themed($headerContainer)}>
              <Text
                preset="subheading"
                text="Select Exercises"
                style={themed($customHeaderTitle)}
              />
              <Button
                text="Cancel"
                preset="filled"
                style={themed([$customHeaderButton, $cancelButton])}
                onPress={() => navigation.goBack()}
              />
              <Button
                text="Done"
                preset="filled"
                style={themed([$customHeaderButton, $doneButton])}
                onPress={handleDoneSelection}
              />
            </View>
        )
      }

      return (
          <View style={themed($headerContainer)}>
            <Text preset="heading" text="Exercises" style={themed($customHeaderTitle)} />
            <Button
              text="Custom"
              preset="filled"
              onPress={() => navigation.navigate("ViewCustomExercises")}
              style={themed($customButton)}
              LeftAccessory={() => (
                <MaterialIcons
                  name="list-alt"
                  size={20}
                  color={colors.text}
                  style={{ marginRight: spacing.xs }}
                />
              )}
            />
          </View>
      )
    }

    if (isLoading && !isFetching && !exercises.length) {
      return <Loading />
    }

    if (isError) {
      console.error("Error fetching exercises: ", error)
      return (
        <ErrorScreen
          title="Error"
          message="There was an error fetching the exercises. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <CustomHeader />

        <SearchBar
          placeholder="Search Exercises"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={themed($searchBar)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={themed($filterScrollViewStyle)}
          contentContainerStyle={themed($filtersHorizontalScrollView)}
        >
          <FilterChip
            placeholder="Equipment"
            options={equipmentOptions}
            selectedValue={activeFilters.equipment}
            onValueChange={(item) => handleFilterChange("equipment", item)}
            style={themed($filterChipStyle)}
          />
          <FilterChip
            placeholder="Muscle Group"
            options={muscleGroupOptions}
            selectedValue={activeFilters.muscle_group}
            onValueChange={(item) => handleFilterChange("muscle_group", item)}
            style={themed($filterChipStyle)}
          />
          <FilterChip
            placeholder="Type"
            options={exerciseTypeOptions}
            selectedValue={activeFilters.exercise_type}
            onValueChange={(item) => handleFilterChange("exercise_type", item)}
            style={themed($filterChipStyle)}
          />
          <FilterChip
            placeholder="Difficulty"
            options={difficultyOptions}
            selectedValue={activeFilters.difficulty}
            onValueChange={(item) => handleFilterChange("difficulty", item)}
            style={themed($filterChipStyle)}
          />
        </ScrollView>

        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => String(item.exercise_id)}
          style={$list}
          contentContainerStyle={themed($listContentContainer)}
          numColumns={2}
          ListEmptyComponent={
            <View style={themed($emptyStateContainer)}>
              <Text text="No exercises found." style={themed($emptyStateText)} />
              {(searchQuery || Object.values(activeFilters).some((v) => v !== null)) && (
                <Button
                  text="Clear Search & Filters"
                  onPress={() => {
                    clearFilters()
                  }}
                  style={themed($customButton)}
                  preset="filled"
                />
              )}
            </View>
          }
          onRefresh={refetch}
          refreshing={isFetching}
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $customButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
  alignSelf: "center",
  flexShrink: 0,
  minWidth: spacing.xxl + spacing.lg, 
})

const $searchBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $filtersHorizontalScrollView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.md,
})

const $filterChipStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xxs,
})

const $list: ViewStyle = {
  flex: 1,
}

const $filterScrollViewStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 1,
}

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
  paddingHorizontal: spacing.sm,
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
  fontSize: 16,
})

const $customHeaderTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  fontWeight: "600",
  color: colors.text,
  marginHorizontal: spacing.xs,
})

const $customHeaderButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 0,
  flexShrink: 0,
  paddingHorizontal: spacing.md,
  minWidth: spacing.xxl,
  borderRadius: 120,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.angry500
})

const $doneButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.primary500
})

const $selectedCard: ThemedStyle<ViewStyle> = ({ colors}) => ({
  borderColor: colors.tint || "blue",
  borderWidth: 2,
})

const $existingCard: ThemedStyle<ViewStyle> = ({}) => ({
  borderColor: "lightgreen",
  borderWidth: 1,
  opacity: 0.7,
})

const $selectionIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.xs,
  right: spacing.xs,
  backgroundColor: "rgba(255,255,255,0.7)",
  borderRadius: 12,
  padding: spacing.xxs,
  zIndex: 1,
})
