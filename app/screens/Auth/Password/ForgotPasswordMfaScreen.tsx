import { FC, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { TextInput } from "react-native-gesture-handler"
import { api } from "@/services/api"
import { Loading } from "@/components/Loader"

interface ForgotPasswordMfaScreenProps extends AppStackScreenProps<"ForgotPasswordMfa"> {}

export const ForgotPasswordMfaScreen: FC<ForgotPasswordMfaScreenProps> = observer(
  function ForgotPasswordMfaScreen(_props) {
    const { navigation, route } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const email = route.params?.emailAddress

    const [mfaCode, setMfaCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true)
    const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true)

    const newPasswordInput = useRef<TextInput>(null)
    const confirmPasswordInput = useRef<TextInput>(null)

    const canSubmit = mfaCode.length > 0 && newPassword.length > 0 && confirmPassword.length > 0

    const handlePasswordReset = async () => {
      setError("")

      if (!canSubmit) {
        setError("Please Fill in all Fields")
        return
      }


      if (newPassword !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      setIsSubmitting(true)

      let user_id = ""

      try {
        const response = await api.getUserByEmail(email)

        if (response.ok && response.data) {
          user_id = response.data.user_id
        } else {
          setError("Failed to fetch user data. Please try again.")
          return
        }
      } catch (error) {
        console.error("Error fetching user by email: ", error)
        setError("An error occurred while fetching user data. Please try again.")
        return
      }

      try {
        const response = await api.checkPasswordResetCode(mfaCode, user_id)

        if (response.data?.status == 401) {
          setError("Invalid MFA code. Please try again.")
          return
        }

        if (response.ok) {
          const resetResponse = await api.resetPassword(newPassword, email)

          if (resetResponse.ok) {
            navigation.navigate("Login")
          } else {
            setError("Failed to reset password. Please try again.")
            return
          }
        } else {
          setError("Failed to verify MFA code. Please try again.")
          return
        }
      } catch (error) {
        console.error("Error resetting password:", error)
        setError("An error occurred while resetting the password. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    const PasswordRightAccessory = useMemo(
      () =>
        function PasswordRightAccessory(
          props: TextFieldAccessoryProps & {
            hidden: boolean
            setVisible: (visible: boolean) => void
          },
        ) {
          const { style, hidden, setVisible } = props
          return (
            <Icon
              icon={hidden ? "view" : "hidden"}
              color={colors.textDim}
              containerStyle={style}
              size={20}
              onPress={() => setVisible(!hidden)}
            />
          )
        },
      [colors.textDim],
    )

    if (isSubmitting) return <Loading />

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Reset Password" preset="heading" style={themed($title)} />
        <Text
          text="Please enter the MFA code sent to your email and your new password."
          style={themed($description)}
        />

        <TextField
          value={mfaCode}
          onChangeText={setMfaCode}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          label="Reset Code"
          placeholder="123456"
          onSubmitEditing={() => newPasswordInput.current?.focus()}
          returnKeyType="next"
          maxLength={6}
        />

        <TextField
          ref={newPasswordInput}
          value={newPassword}
          onChangeText={setNewPassword}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          secureTextEntry={isNewPasswordHidden}
          label="New Password"
          placeholder="strong!password123"
          onSubmitEditing={() => confirmPasswordInput.current?.focus()}
          returnKeyType="next"
          RightAccessory={(props) => (
            <PasswordRightAccessory
              {...props}
              hidden={isNewPasswordHidden}
              setVisible={setIsNewPasswordHidden}
            />
          )}
        />

        <TextField
          ref={confirmPasswordInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          secureTextEntry={isConfirmPasswordHidden}
          label="Confirm Password"
          placeholder="strong!password123"
          onSubmitEditing={handlePasswordReset}
          returnKeyType="done"
          RightAccessory={(props) => (
            <PasswordRightAccessory
              {...props}
              hidden={isConfirmPasswordHidden}
              setVisible={setIsConfirmPasswordHidden}
            />
          )}
        />

        {error && <Text text={error} style={themed($errorText)} preset="formHelper" />}

        <Button
          text="Reset Password"
          style={themed($button)}
          preset="reversed"
          onPress={handlePasswordReset}
          disabled={!canSubmit || isSubmitting}
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $description: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.lg,
  color: colors.textDim,
  textAlign: "center",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
})