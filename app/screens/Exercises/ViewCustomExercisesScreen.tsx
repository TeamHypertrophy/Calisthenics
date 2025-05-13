import { Button, FilterChip, FilterChipItem, Loading, Screen, SearchBar, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { AppStackScreenProps } from "@/navigators"
import { api, CustomExercise } from "@/services/api"
import { spacing, ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { FlatList, ScrollView, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import {
  ActiveFilters,
  difficultyOptions,
  equipmentOptions,
  exerciseTypeOptions,
  muscleGroupOptions,
} from "./SearchExercisesScreen"
import { useStores } from "@/models"

interface ViewCustomExercisesScreenProps extends AppStackScreenProps<"ViewCustomExercises"> {}

export const ViewCustomExercisesScreen: FC<ViewCustomExercisesScreenProps> = observer(
  function ViewCustomExercisesScreen(_props) {
    const { navigation } = _props

    const { authenticationStore: { userID } } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [debouncedQuery, setDebouncedQuery] = useState<string>("")
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
      equipment: null,
      muscle_group: null,
      exercise_type: null,
      difficulty: null,
    })

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
      queryKey: ["customExercises", userID],
      queryFn: async () => {
        const params: any = {}
        if (debouncedQuery.trim()) params.name = searchQuery.trim()
        if (activeFilters.equipment) params.equipment = activeFilters.equipment
        if (activeFilters.muscle_group) params.muscle_group = activeFilters.muscle_group
        if (activeFilters.exercise_type) params.exercise_type = activeFilters.exercise_type
        if (activeFilters.difficulty) params.difficulty = activeFilters.difficulty

        let response

        if (debouncedQuery.trim() || Object.values(activeFilters).some((v) => v !== null)) {
          response = await api.searchCustomExercises(params)
        } else {
          response = await api.getCustomExercises()
        }


        if (!response.ok && !response.data) {
          console.error("Error Fetching Custom Exercises: ", response.problem)
          throw new Error("Failed Fetching Custom Exercises")
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

    const renderCustomExerciseItem = ({ item }: { item: CustomExercise }) => (
      <TouchableOpacity
        style={themed($customExerciseCard)}
        onPress={() => navigation.navigate("ViewCustomExercise", { exerciseID: item.exercise_id })}
      >
        <Text
          text={item.name}
          preset="subheading"
          style={themed($customExerciseNameText)}
          numberOfLines={2}
        />
        <View style={themed($chipRow)}>
          <Text
            text={`Group: ${item.muscle_group.replace(/_/g, " ")}`}
            style={themed($customExerciseDetailText)}
          />
        </View>
      </TouchableOpacity>
    )

    if (isLoading && !isFetching && !exercises.length) {
      return <Loading />
    }

    if (isError) {
      console.error("Error Fetching Custom Exercises:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Custom Exercises"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($headerContainer)}>
          <Text preset="heading" text="Custom" />
          <Button
            text="Create"
            preset="filled"
            onPress={() => navigation.navigate("CreateCustomExercise")}
            style={themed($createButton)}
            LeftAccessory={() => (
              <MaterialIcons
                name="add"
                size={20}
                color={colors.palette.secondary400}
                style={{ marginRight: spacing.xs }}
              />
            )}
          />
        </View>

        <SearchBar
          placeholder="Search My Exercises"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={themed($searchBar)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={$filterScrollViewStyle}
          contentContainerStyle={themed($filtersHorizontalScrollContentContainer)}
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
          renderItem={renderCustomExerciseItem}
          keyExtractor={(item) => String(item.exercise_id)}
          style={$list}
          contentContainerStyle={themed($listContentContainer)}
          numColumns={1}
          ListEmptyComponent={
            <View style={themed($emptyStateContainer)}>
              <Text text="No custom exercises found." style={themed($emptyStateText)} />
              {(searchQuery || Object.values(activeFilters).some((v) => v !== null)) && (
                <Button
                  text="Clear Search & Filters"
                  onPress={clearFilters}
                  style={themed($clearButton)}
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

const $root: ViewStyle = { flex: 1 }

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $createButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $filterScrollViewStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 1,
}

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

const $customExerciseCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  elevation: 1,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 1,
})

const $customExerciseNameText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.primary400,
  fontWeight: "bold",
  fontSize: spacing.md,
  marginBottom: spacing.sm,
})

const $customExerciseDetailText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.md,
  marginRight: spacing.sm,
})

const $chipRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.xxs,
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

const $clearButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  marginTop: spacing.md,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})
