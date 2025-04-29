import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import Toast from "react-native-toast-message"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NetworkProvider } from "react-native-offline"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    Login: {
      path: "",
    },
    Home: {
      screens: {
        Profile: "profile",
      },
    },
  },
}

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const { rehydrated } = useInitialRootStore(() => {
    setTimeout(SplashScreen.hideAsync, 500)
  })

  if (
    !rehydrated ||
    !isNavigationStateRestored ||
    !isI18nInitialized ||
    (!areFontsLoaded && !fontLoadError)
  ) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  const toastConfig = {} // TODO: Add custom toast configuration here

  const queryClient = new QueryClient()

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ErrorBoundary catchErrors={Config.catchErrors}>
              <KeyboardProvider>
                <AppNavigator
                  linking={linking}
                  initialState={initialNavigationState}
                  onStateChange={onNavigationStateChange}
                />
                <Toast />
              </KeyboardProvider>
            </ErrorBoundary>
          </SafeAreaProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
