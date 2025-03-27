import { observer } from "mobx-react-lite"
import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, ViewStyle, ImageStyle } from "react-native"
import {
  AutoImage,
  Button,
  Icon,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from "../../components"
import { setupRootStore, useStores } from "../../models"
import { AppStackScreenProps } from "../../navigators"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { api } from "@/services/api"
import { loadString, saveString } from "@/utils/storage"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
  const authPasswordInput = useRef<TextInput>(null)
  const { navigation } = _props

  const [authPassword, setAuthPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      authUsername,
      setAuthUsername,
      setAuthToken,
      distributeAuthToken,
      setUserID,
      setUserData,
      validationError,
    },
  } = useStores()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    setAuthUsername(loadString("authUsername") || "")
    setAuthPassword(loadString("authPassword") || "")

    return () => {
      setAuthPassword("")
      setAuthUsername("")
    }
  }, [setAuthUsername])

  const error = isSubmitted ? validationError : ""

  async function login() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    const response = await api.login(authUsername, authPassword)

    saveString("authUsername", authUsername)
    saveString("authPassword", authPassword)

    if (!response.ok) {
      setLoginError("Internal Error, Try Again")
      return
    }

    if (response.status == 401) {
      setLoginError("Invalid Email or Password")
      return
    }

    if (!response.data?.user_id) {
      setLoginError("Could Not Find User ID")
      return
    } else {
      setUserID(response.data?.user_id)
    }

    if (response.data?.message == "MFA Code Required & Sent") {
      navigation.navigate("MFA")
    }

    if (response.data?.user) {
      try {
        setUserData(response.data?.user)
      } catch (error) {
        console.error("Failed to set user data:", error)
        setLoginError("Failed Setting User Data")
        return
      }
    } else {
      setLoginError("Could Not Find User Data")
      return
    }

    setIsSubmitted(false)
    setAuthPassword("")
    setAuthUsername("")

    setAuthToken(response.data?.api_key)
    distributeAuthToken(response.data?.api_key)
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral800],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="login-heading" tx="loginScreen:logIn" preset="heading" style={themed($logIn)} />

      <AutoImage
        source={{ uri: "https://files.catbox.moe/025e3m.png" }}
        maxHeight={200}
        maxWidth={200}
        style={themed($loginLogo)}
      />

      <Text tx="loginScreen:enterDetails" preset="subheading" style={themed($enterDetails)} />
      {attemptsCount > 2 && (
        <Text tx="loginScreen:hint" size="sm" weight="light" style={themed($hint)} />
      )}

      <TextField
        value={authUsername}
        onChangeText={setAuthUsername}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="username"
        autoCorrect={false}
        keyboardType="default"
        labelTx="loginScreen:emailFieldLabel"
        placeholderTx="loginScreen:emailFieldPlaceholder"
        helper={error}
        status={error ? "error" : undefined}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
      />

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="loginScreen:passwordFieldLabel"
        placeholderTx="loginScreen:passwordFieldPlaceholder"
        onSubmitEditing={login}
        RightAccessory={PasswordRightAccessory}
      />

      <Text
        text="New To Hypertrophy?"
        style={themed($signUpText)}
        onPress={() => navigation.navigate("Signup")}
      />

      {loginError ? (
        <Text text={loginError} style={themed($errorText)} preset="formHelper" />
      ) : null}
      <Button
        testID="login-button"
        tx="loginScreen:tapToLogIn"
        style={themed($tapButton)}
        preset="reversed"
        onPress={login}
      />
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $loginLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  overflow: "hidden",
  borderRadius: 25,
  margin: "auto",
})

const $signUpText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  textAlign: "left",
  fontWeight: "normal",
  fontSize: 15,
  color: colors.textDim,
  textDecorationLine: "underline",
})

const $enterDetails: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "center",
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
  textAlign: "center",
})
