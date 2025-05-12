import {
  AutoImage,
  Button,
  Icon,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { loadString, saveString } from "@/utils/storage"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { ImageStyle, TextInput, TextStyle, ViewStyle } from "react-native"

interface SignupScreenProps extends AppStackScreenProps<"Signup"> {}

export const SignupScreen: FC<SignupScreenProps> = observer(function SignupScreen(_props) {
  const authPasswordInput = useRef<TextInput>(null)
  const confirmPasswordInput = useRef<TextInput>(null)

  const { navigation } = _props

  const [authPassword, setAuthPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordsMatch] = useState(true)
  const [loginError, setLoginError] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      authEmail,
      authUsername,
      setAuthUsername,
      setAuthEmail,
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
    setAuthEmail(loadString("authEmail") || "")
    setAuthPassword(loadString("authPassword") || "")

    return () => {
      setAuthPassword("")
      setAuthEmail("")
      setAuthUsername("")
    }
  }, [setAuthUsername, setAuthEmail])

  const error = isSubmitted ? validationError : ""

  const validatePasswords = () => {
    const match = authPassword === confirmPassword
    setPasswordsMatch(match)
    return match
  }

  async function signup() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    if (!validatePasswords()) {
      setLoginError("Passwords don't match")
      return
    }

    const response = await api.signup(authUsername, authEmail, authPassword)

    saveString("authUsername", authUsername)
    saveString("authEmail", authEmail)
    saveString("authPassword", authPassword)

    if (!response.ok) {
      setLoginError("Internal Error, Try Again")
      return
    }

    if (response.status == 401) {
      setLoginError("Invalid Email")
      return
    }

    if (!response.data?.user.user_id) {
      setLoginError("Could Not Find User ID")
      return
    } else {
      setUserID(response.data?.user.user_id)
    }

    if (response.data?.user) {
      setUserData(response.data.user)
    } else {
      setLoginError("Internal Error Setting User Data")
      return
    }

    setIsSubmitted(false)
    setAuthPassword("")
    setAuthUsername("")

    setAuthToken(response.data?.api_key)
    distributeAuthToken(response.data?.api_key)

    return navigation.navigate("PersonalInfo")
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
        value={authEmail}
        onChangeText={setAuthEmail}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="default"
        label="Email"
        placeholder="mail@gmail.com"
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
        onSubmitEditing={signup}
        RightAccessory={PasswordRightAccessory}
      />

      <TextField
        ref={confirmPasswordInput}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        label="Confirm Password"
        placeholder="Confirm your password"
        status={!validatePasswords && isSubmitted ? "error" : undefined}
        helper={!validatePasswords && isSubmitted ? "Passwords don't match" : undefined}
        onSubmitEditing={signup}
        RightAccessory={PasswordRightAccessory}
      />

      <Text
        text="Already Have An Account?"
        style={themed($signUpText)}
        onPress={() => navigation.navigate("Login")}
      />

      {loginError ? (
        <Text text={loginError} style={themed($errorText)} preset="formHelper" />
      ) : null}

      <Button
        testID="login-button"
        text="Sign Up"
        style={themed($tapButton)}
        preset="filled"
        onPress={signup}
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
