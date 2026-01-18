import type { ThemedStyle } from "@/theme"

import { AutoImage, Button, Card, Loading, Screen, Text } from "@/components"
import { useStores } from "@/models"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import {
  api,
  CalorieLog,
  Exercise,
  ExerciseLog,
  Profile,
  ProteinLog,
  SleepLog,
  WaterLog,
  WorkoutLog,
  WorkoutPlan,
} from "@/services/api"
import { motivationalQuotes } from "@/utils/quotes"
import { load, save } from "@/utils/storage"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useMemo, useState } from "react"
import {
  Dimensions,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import { Calendar } from "react-native-calendars"
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking"
import Carousel from "react-native-reanimated-carousel"

const screenWidth = Dimensions.get("window").width

export const MainScreen: FC<HomeTabScreenProps<"Main">> = observer(function MainScreen(_props) {
  const { navigation } = _props

  const {
    authenticationStore: { userID },
  } = useStores()

  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const queryClient = useQueryClient()

  const [currentQuote, setCurrentQuote] = useState("")

  const [isIncrementingStreak, setIsIncrementingStreak] = useState(false)
  const [isResettingStreak, setIsResettingStreak] = useState(false)

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [])

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | undefined>({
    queryKey: ["profile", userID],
    queryFn: async () => {
      if (!userID) return undefined
      const response = await api.getProfile()
      return response.ok ? response.data : undefined
    },
    enabled: !!userID,
  })

  const { data: workoutPlans, isLoading: isLoadingWorkoutPlans } = useQuery<
    WorkoutPlan[] | undefined
  >({
    queryKey: ["workoutPlans", userID],
    queryFn: async () => {
      if (!userID) return undefined
      const response = await api.getAllUserWorkoutPlans(userID)
      return response.ok ? response.data : undefined
    },
    enabled: !!userID,
  })

  const currentWorkoutPlan = useMemo(() => {
    if (!workoutPlans || workoutPlans.length === 0) return null
    return workoutPlans.sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    )[0]
  }, [workoutPlans])

  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[] | undefined>({
    queryKey: ["allExercisesSample"],
    queryFn: async () => {
      const response = await api.getAllExercises()
      return response.ok && response.data ? response.data.slice(0, 20) : []
    },
  })

  const { data: workoutLogs, isLoading: isLoadingWorkoutLogs } = useQuery<WorkoutLog[] | undefined>(
    {
      queryKey: ["workoutLogs", userID],
      queryFn: async () => {
        if (!userID) return []
        const response = await api.getWorkoutLogs()
        return response.ok ? response.data : []
      },
      enabled: !!userID,
    },
  )
  const { data: exerciseLogs, isLoading: isLoadingExerciseLogs } = useQuery<
    ExerciseLog[] | undefined
  >({
    queryKey: ["exerciseLogs", userID],
    queryFn: async () => {
      if (!userID) return []
      const response = await api.getExerciseLogs()
      return response.ok ? response.data : []
    },
    enabled: !!userID,
  })

  const { data: calorieLogs, isLoading: isLoadingCalorieLogs } = useQuery<CalorieLog[] | undefined>(
    {
      queryKey: ["calorieLogs", userID],
      queryFn: async () => {
        if (!userID) return []
        const response = await api.getCalorieLogs()
        return response.ok ? response.data : []
      },
      enabled: !!userID,
    },
  )

  const { data: proteinLogs, isLoading: isLoadingProteinLogs } = useQuery<ProteinLog[] | undefined>(
    {
      queryKey: ["proteinLogs", userID],
      queryFn: async () => {
        if (!userID) return []
        const response = await api.getProteinLogs()
        return response.ok ? response.data : []
      },
      enabled: !!userID,
    },
  )

  const { data: waterLogs, isLoading: isLoadingWaterLogs } = useQuery<WaterLog[] | undefined>({
    queryKey: ["waterLogs", userID],
    queryFn: async () => {
      if (!userID) return []
      const response = await api.getWaterLogs()
      return response.ok ? response.data : []
    },
    enabled: !!userID,
  })

  const { data: sleepLogs, isLoading: isLoadingSleepLogs } = useQuery<SleepLog[] | undefined>({
    queryKey: ["sleepLogs", userID],
    queryFn: async () => {
      if (!userID) return []
      const response = await api.getSleepLogs()
      return response.ok ? response.data : []
    },
    enabled: !!userID,
  })

  const incrementStreak = useMutation({
    mutationFn: async () => {
      if (!userID) return
      setIsIncrementingStreak(true)
      const response = await api.incrementStreak()

      if (!response.ok) {
        console.error("[Streak] Error Incrementing Streak", response.problem)
        setIsIncrementingStreak(false)
        return
      }

      return response
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userID] })
      const today = new Date().toISOString().split("T")[0]
      await save("lastProcessedDate", today)
    },
    onError: (error) => {
      console.error("[Streak] Error Incrementing Streak", error)
      setIsIncrementingStreak(false)
    },
  })

  const resetStreak = useMutation({
    mutationFn: async () => {
      if (!userID) return
      setIsResettingStreak(true)
      const response = await api.resetStreak()

      if (!response.ok) {
        console.error("[Streak] Error Resetting Streak", response.problem)
        setIsResettingStreak(false)
        return
      }

      return response
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userID] })
      const today = new Date().toISOString().split("T")[0]
      await save("lastProcessedDate", today)
    },
    onError: (error) => {
      console.error("[Streak] Error Resetting Streak", error)
      setIsResettingStreak(false)
    },
  })

  useEffect(() => {
    if (profile && userID && !isIncrementingStreak && !isResettingStreak) {
      const lastProcessedDate = load<string>("lastProcessedDate")

      const today = new Date()
      const todayDateStr = today.toISOString().split("T")[0]

      console.log("[Streak Debug] Current state:")
      console.log("- Today's date:", todayDateStr)
      console.log("- Last processed date:", lastProcessedDate)
      console.log("- Current server streak:", profile.streak)
      console.log("- User ID:", userID)
      console.log("- isIncrementingStreak:", isIncrementingStreak)
      console.log("- isResettingStreak:", isResettingStreak)

      if (lastProcessedDate === todayDateStr) {
        // Already Processed For Today
        console.log("[Streak] Already Processed For Today")
        return
      }

      if (!lastProcessedDate) {
        console.log("[Streak] No Last Processed Date Found")
        if ((profile.streak || 0) === 0) {
          // First Time User, Reset Streak
          console.log("[Streak] Server Streak Is 0 - Resetting Streak")
          resetStreak.mutate()
        } else {
          // User Logged In For The First Time, Increment Streak
          console.log("[Streak] Incrementing Streak For First Time User")
          incrementStreak.mutate()
        }
      } else {
        const lastProcessed = new Date(lastProcessedDate)
        const today = new Date()

        const diffTime = today.getTime() - lastProcessed.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // User Logged In Today, Increment Streak
          console.log("[Streak] Incrementing Streak")
          incrementStreak.mutate()
        } else if (diffDays > 1) {
          // User Missed A Day, Reset Streak
          console.log("[Streak] Resetting Streak")
          resetStreak.mutate()
        } else if (diffDays < 0) {
          // Anomaly, Maybe User Is Being Malicious, Reset Streak
          console.log("[Streak] Anomaly Detected, Resetting Streak")
          resetStreak.mutate()
        }
      }
    }
  }, [profile, userID, incrementStreak, resetStreak, isIncrementingStreak, isResettingStreak])

  const markedDates = useMemo(() => {
    const marks: { [date: string]: MarkingProps } = {}

    const addMark = (dateStr: string, color: string, existingMark?: MarkingProps) => {
      if (!marks[dateStr]) {
        marks[dateStr] = { dots: [] }
      }
      if (!marks[dateStr].dots) {
        marks[dateStr].dots = []
      }
      if (!marks[dateStr].dots?.find((dot) => dot.color === color)) {
        marks[dateStr].dots?.push({ key: color, color: color, selectedDotColor: color })
      }
      marks[dateStr].marked = true
    }

    workoutLogs?.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.primary500)
    })
    exerciseLogs?.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.secondary500)
    })
    calorieLogs?.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.angry500)
    })
    proteinLogs?.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.accent300)
    })
    waterLogs?.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.neutral400)
    })
    sleepLogs?.forEach((log) => {
      const dateStr = new Date(log.end).toISOString().split("T")[0]
      addMark(dateStr, colors.palette.accent300)
    })

    if (currentWorkoutPlan?.start_time) {
      const planStartDateStr = new Date(currentWorkoutPlan.start_time).toISOString().split("T")[0]
      marks[planStartDateStr] = {
        ...(marks[planStartDateStr] || {}),
        selected: true,
        selectedColor: colors.palette.accent500,
        activeOpacity: 0.5,
      }
    }
    return marks
  }, [
    workoutLogs,
    exerciseLogs,
    calorieLogs,
    proteinLogs,
    waterLogs,
    sleepLogs,
    currentWorkoutPlan,
    colors,
  ])

  const renderCarouselItem = ({ item }: { item: Exercise }) => {
    return (
      <TouchableOpacity
        style={themed($carouselItem)}
        onPress={() => {
          navigation.navigate("ViewExercise", { exerciseID: item.exercise_id })
        }}
      >
        <Card
          style={{
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: colors.background,
            padding: 0,
          }}
          ContentComponent={
            <View style={$carouselCardContent}>
              {item.image_url ? (
                <AutoImage
                  source={{ uri: item.image_url }}
                  style={$carouselImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={themed($carouselImagePlaceholder)}>
                  <Text style={{ color: colors.textDim }}>No Image</Text>
                </View>
              )}
              <View style={themed($carouselTextContainer)}>
                <Text
                  preset="subheading"
                  numberOfLines={1}
                  style={{ color: colors.text, textAlign: "center" }}
                >
                  {item.name}
                </Text>
              </View>
            </View>
          }
        />
      </TouchableOpacity>
    )
  }

  if (
    isLoadingProfile ||
    isLoadingWorkoutPlans ||
    isLoadingExercises ||
    isLoadingWorkoutLogs ||
    isLoadingExerciseLogs ||
    isLoadingCalorieLogs ||
    isLoadingProteinLogs ||
    isLoadingWaterLogs ||
    isLoadingSleepLogs
  ) {
    return <Loading />
  }

  return (
    <>
      <Screen
        style={$root}
        preset="scroll"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text style={themed($headerText)} preset="heading">
          Welcome Back,{"\n"}
          <Text style={{ color: colors.tint }}>{profile?.first_name || "User"}!</Text>
        </Text>

        <Card
          style={themed($sectionCard)}
          heading="Activity Calendar"
          headingStyle={themed($sectionTitle)}
          ContentComponent={
            <Calendar
              current={new Date().toISOString().split("T")[0]}
              markedDates={markedDates}
              theme={{
                "backgroundColor": colors.background,
                "calendarBackground": colors.background,
                "textSectionTitleColor": colors.textDim,
                "selectedDayBackgroundColor": colors.tint,
                "selectedDayTextColor": colors.palette.neutral100,
                "todayTextColor": colors.tint,
                "dayTextColor": colors.text,
                "textDisabledColor": colors.textDim,
                "dotColor": colors.tint,
                "selectedDotColor": colors.palette.neutral100,
                "arrowColor": colors.tint,
                "disabledArrowColor": colors.textDim,
                "monthTextColor": colors.text,
                "indicatorColor": colors.text,
                "textDayFontWeight": "300",
                "textMonthFontWeight": "bold",
                "textDayHeaderFontWeight": "300",
                "textDayFontSize": 16,
                "textMonthFontSize": 16,
                "textDayHeaderFontSize": 14,
                "stylesheet.calendar.header": {
                  week: {
                    marginTop: spacing.sm,
                    flexDirection: "row",
                    justifyContent: "space-around",
                  },
                },
              }}
            />
          }
        />

        <Card
          style={themed($sectionCard)}
          ContentComponent={
            <View style={$streakAndQuoteContainer}>
              <View style={themed($streakContainer)}>
                <Text preset="subheading" text="🔥" />
                <Text
                  preset="bold"
                  text={`${profile?.streak || 0} Day Streak`}
                  style={{ marginLeft: spacing.xs, color: colors.text }}
                />
              </View>
              <Text style={themed($quoteText)}>{currentQuote}</Text>
            </View>
          }
        />

        {currentWorkoutPlan && (
          <Card
            style={themed($sectionCard)}
            heading="Current Workout Plan"
            headingStyle={themed($sectionTitle)}
            ContentComponent={
              <View>
                <Text
                  preset="bold"
                  text={currentWorkoutPlan.name}
                  style={{ color: colors.text, marginTop: spacing.xxs }}
                />
                <Text
                  text={currentWorkoutPlan.description || ""}
                  numberOfLines={2}
                  style={{ color: colors.textDim, marginVertical: spacing.xs }}
                />
              </View>
            }
            FooterComponent={
              <Button
                text="View Plan"
                preset="reversed"
                style={{ marginTop: spacing.sm }}
                onPress={() =>
                  currentWorkoutPlan.plan_id &&
                  navigation.navigate("ViewWorkoutPlan", { planID: currentWorkoutPlan.plan_id })
                }
              />
            }
          />
        )}

        {exercises && exercises.length > 0 && (
          <Card
            style={themed($sectionCard)}
            heading="Discover Exercises"
            headingStyle={themed($sectionTitle)}
            ContentComponent={
              <Carousel
                loop
                width={screenWidth - spacing.lg * 2 - spacing.md * 2}
                height={screenWidth / 2.5}
                autoPlay={true}
                data={exercises}
                scrollAnimationDuration={1000}
                renderItem={renderCarouselItem}
              />
            }
          />
        )}

        <Card
          style={themed($sectionCard)}
          heading="Quick Navigation"
          headingStyle={themed($sectionTitle)}
          ContentComponent={
            <View>
              <Button
                text="All Exercises"
                preset="default"
                onPress={() => navigation.navigate("SearchExercises", {})}
                style={themed($navButton)}
              />
              <Button
                text="All Workouts"
                preset="default"
                onPress={() => navigation.navigate("Workouts", {})}
                style={themed($navButton)}
              />
              <Button
                text="All Workout Plans"
                preset="default"
                onPress={() => navigation.navigate("WorkoutPlans")}
                style={themed($navButton)}
              />
              <Button
                text="Workout Logs"
                preset="default"
                onPress={() => navigation.navigate("ViewWorkoutLogs")}
                style={themed($navButton)}
              />
              <Button
                text="Exercise Logs"
                preset="default"
                onPress={() => navigation.navigate("ViewExerciseLogs")}
                style={themed($navButton)}
              />
            </View>
          }
        />
      </Screen>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
})

const $headerText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.lg,
  marginTop: spacing.md,
  marginBottom: spacing.lg,
  color: colors.text,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.background,
  borderRadius: spacing.sm,
  elevation: 2,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  color: colors.text,
})

const $streakAndQuoteContainer: ViewStyle = {
  alignItems: "center",
}

const $streakContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $quoteText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontStyle: "italic",
  textAlign: "center",
  color: colors.textDim,
  fontSize: spacing.sm + 2,
})

const $carouselItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  borderRadius: spacing.sm,
  marginHorizontal: spacing.xs,
  height: screenWidth / 2.5,
  overflow: "hidden",
})

const $carouselCardContent: ViewStyle = {
  flex: 1,
  alignItems: "center",
  width: "100%",
}

const $carouselImage: ImageStyle = {
  width: "100%",
  height: screenWidth / 3.5,
}

const $carouselImagePlaceholder: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "100%",
  height: screenWidth / 3.5,
  backgroundColor: colors.background,
  justifyContent: "center",
})

const $carouselTextContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
  width: "100%",
  alignItems: "center",
})

const $navButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  backgroundColor: colors.palette.primary500,
  borderRadius: 120,
})