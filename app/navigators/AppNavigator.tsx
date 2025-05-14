import * as Screens from "@/screens"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"
/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native"
import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { ComponentProps } from "react"

import Config from "../config"
import { useStores } from "../models"
import { HomeNavigator, HomeTabParamList } from "./HomeNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { Exercise, Workout } from "@/services/api"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Login: undefined
  Home: NavigatorScreenParams<HomeTabParamList>
  // 🔥 Your screens go here
  Profile: undefined
  Logs: undefined
  Main: undefined
  Trainer: undefined
  Settings: undefined
  MFA: undefined
  Signup: undefined
  EditProfile: undefined
  PersonalInfo: undefined
  Preferences: undefined
  Public: undefined
  Goals: undefined
  SearchExercises: { workoutID?: string, selectionMode?: boolean, existingExcercises?: number[], source?: "CreateWorkout" | "EditWorkout" }
  ViewExercise: { exerciseID: number }
  CreateCustomExercise: undefined
  ViewExerciseLogs: undefined
  CreateExerciseLog: { exerciseID: number, exerciseName: string }
  ViewLog: { logID: number; logType: string }
  CreateLog: undefined
  EditLog: { logID: number; logType: string }
  EditCustomExercise: { exerciseID: number }
  EditExerciseLog: { logID: number, exerciseName: string, setsCompleted: number, repsCompleted: number }
  ForgotPassword: undefined
  UpdatePassword: undefined
  MfaSettings: undefined
  ListTrainers: undefined
  TrainerProfile: { trainerID: string }
  TrainerRequest: undefined
  ViewWorkout: { workoutID: string }
  Workouts: { source?: "CreateWorkoutPlan" | "EditWorkoutPlan", selectionMode?: boolean, existingWorkouts?: string[], planID?: string, formData?: Screens.PlanForm }
  EditWorkout: { workoutID: string, selectedExercises?: Exercise[] }
  WorkoutPlans: undefined
  ViewWorkoutPlan: { planID: string }
  EditWorkoutPlan: { planID: string, selectedWorkouts?: Workout[] }
  CreateWorkoutLog: { workoutID: string }
  EditWorkoutLog: { logID: number, workoutName: string, initialDate: string }
  ViewWorkoutPlanLog: { logID: number }
  EditWorkoutPlanLog: { logID: number }
  ViewWorkoutPlanLogs: undefined
  ForgotPasswordMfa: { emailAddress: string }
  Developer: undefined
  TrainerStatus: undefined
  ViewCustomExercises: undefined
  ViewCustomExercise: { exerciseID: number }
  ViewWorkoutLogs: undefined
	CreateWorkout: { selectedExercises?: Exercise[] }
	WorkoutPlanTemplates: undefined
	WorkoutTemplates: undefined
	CreateWorkoutPlan: { selectedWorkouts?: Workout[], formData?: Screens.PlanForm }
	// IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    authenticationStore: { isAuthenticated },
    profileStore: { isOnboarded },
  } = useStores()

  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={!isAuthenticated ? "Login" : !isOnboarded ? "PersonalInfo" : "Home"}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
          <Stack.Screen name="MFA" component={Screens.MfaScreen} />
          <Stack.Screen name="Signup" component={Screens.SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={Screens.ForgotPasswordScreen} />
          <Stack.Screen name="ForgotPasswordMfa" component={Screens.ForgotPasswordMfaScreen} />
        </>
      ) : !isOnboarded ? (
        <Stack.Screen name="PersonalInfo" component={Screens.PersonalInfoScreen} />
      ) : (
        <Stack.Screen name="Home" component={HomeNavigator} />
      )}

      {/** 🔥 Your screens go here */}
      <Stack.Screen name="Main" component={Screens.MainScreen} />
      <Stack.Screen name="Profile" component={Screens.ProfileScreen} />
      <Stack.Screen name="Logs" component={Screens.LogsScreen} />
      <Stack.Screen name="Trainer" component={Screens.TrainerScreen} />
      <Stack.Screen name="Settings" component={Screens.SettingsScreen} />
      <Stack.Screen name="EditProfile" component={Screens.EditProfileScreen} />
      <Stack.Screen name="Preferences" component={Screens.PreferencesScreen} />
      <Stack.Screen name="Public" component={Screens.PublicScreen} />
      <Stack.Screen name="Goals" component={Screens.GoalsScreen} />
      <Stack.Screen name="SearchExercises" component={Screens.SearchExercisesScreen} />
      <Stack.Screen name="ViewExercise" component={Screens.ViewExerciseScreen} />
      <Stack.Screen name="CreateCustomExercise" component={Screens.CreateCustomExerciseScreen} />
      <Stack.Screen name="ViewExerciseLogs" component={Screens.ViewExerciseLogsScreen} />
      <Stack.Screen name="CreateExerciseLog" component={Screens.CreateExerciseLogScreen} />
      <Stack.Screen name="ViewLog" component={Screens.ViewLogScreen} />
      <Stack.Screen name="CreateLog" component={Screens.CreateLogScreen} />
      <Stack.Screen name="EditLog" component={Screens.EditLogScreen} />
      <Stack.Screen name="EditCustomExercise" component={Screens.EditCustomExerciseScreen} />
      <Stack.Screen name="EditExerciseLog" component={Screens.EditExerciseLogScreen} />
      <Stack.Screen name="UpdatePassword" component={Screens.UpdatePasswordScreen} />
      <Stack.Screen name="MfaSettings" component={Screens.MfaSettingsScreen} />
      <Stack.Screen name="ListTrainers" component={Screens.ListTrainersScreen} />
      <Stack.Screen name="TrainerProfile" component={Screens.TrainerProfileScreen} />
      <Stack.Screen name="TrainerRequest" component={Screens.TrainerRequestScreen} />
      <Stack.Screen name="ViewWorkout" component={Screens.ViewWorkoutScreen} />
      <Stack.Screen name="Workouts" component={Screens.WorkoutsScreen} />
      <Stack.Screen name="EditWorkout" component={Screens.EditWorkoutScreen} />
      <Stack.Screen name="WorkoutPlans" component={Screens.WorkoutPlansScreen} />
      <Stack.Screen name="ViewWorkoutPlan" component={Screens.ViewWorkoutPlanScreen} />
      <Stack.Screen name="EditWorkoutPlan" component={Screens.EditWorkoutPlanScreen} />
      <Stack.Screen name="EditWorkoutLog" component={Screens.EditWorkoutLogScreen} />
      <Stack.Screen name="ViewWorkoutPlanLog" component={Screens.ViewWorkoutPlanLogScreen} />
      <Stack.Screen name="EditWorkoutPlanLog" component={Screens.EditWorkoutPlanLogScreen} />
      <Stack.Screen name="ViewWorkoutPlanLogs" component={Screens.ViewWorkoutPlanLogsScreen} />
      <Stack.Screen name="Developer" component={Screens.DeveloperScreen} />
      <Stack.Screen name="TrainerStatus" component={Screens.TrainerStatusScreen} />
      <Stack.Screen name="ViewCustomExercises" component={Screens.ViewCustomExercisesScreen} />
      <Stack.Screen name="ViewCustomExercise" component={Screens.ViewCustomExerciseScreen} />
      <Stack.Screen name="ViewWorkoutLogs" component={Screens.ViewWorkoutLogsScreen} />
			<Stack.Screen name="CreateWorkout" component={Screens.CreateWorkoutScreen} />
			<Stack.Screen name="WorkoutPlanTemplates" component={Screens.WorkoutPlanTemplatesScreen} />
			<Stack.Screen name="WorkoutTemplates" component={Screens.WorkoutTemplatesScreen} />
			<Stack.Screen name="CreateWorkoutPlan" component={Screens.CreateWorkoutPlanScreen} />
			{/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
})

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <AppStack />
      </NavigationContainer>
    </ThemeProvider>
  )
})
