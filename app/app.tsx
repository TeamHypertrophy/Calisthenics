import "./utils/gestureHandler"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./utils/ignoreWarnings"

import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { NetworkProvider } from "react-native-offline"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import Toast, { BaseToast, BaseToastProps, ErrorToast } from "react-native-toast-message"

import Config from "./config"
import { initI18n } from "./i18n"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import { customFontsToLoad, colors } from "./theme"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

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

  const queryClient = new QueryClient()

  const toastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "green" }}
        text1Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: colors.palette.primary500,
        }}
        text2Style={{
          fontSize: 13,
          color: colors.text,
        }}
      />
    ),

    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "red" }}
        text1Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: colors.palette.primary500,
        }}
        text2Style={{
          fontSize: 13,
          color: colors.text,
        }}
      />
    ),
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ErrorBoundary catchErrors={Config.catchErrors}>
              <KeyboardProvider>
                <AppNavigator
                  initialState={initialNavigationState}
                  onStateChange={onNavigationStateChange}
                />
                <Toast config={toastConfig}/>
              </KeyboardProvider>
            </ErrorBoundary>
          </SafeAreaProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
