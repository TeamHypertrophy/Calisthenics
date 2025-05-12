import { Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "@/components"
import { Button } from "@/components"
import { Loading } from "@/components/Loader"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, ViewStyle } from "react-native"

interface UpdatePasswordScreenProps extends AppStackScreenProps<"UpdatePassword"> {}

export const UpdatePasswordScreen: FC<UpdatePasswordScreenProps> = observer(
  function UpdatePasswordScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      authenticationStore: { logout },
    } = useStores()

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isOldPasswordHidden, setIsOldPasswordHidden] = useState(true)
    const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true)
    const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const newPasswordInput = useRef<TextInput>(null)
    const confirmPasswordInput = useRef<TextInput>(null)

    const canSubmit = oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0

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

    const updatePassword = async () => {
      setError("")

      if (!canSubmit) {
        setError("Missing Required Fields")
        return
      }

      if (newPassword != confirmPassword) {
        setError("Ensure New Passwords Match!")
        return
      }

      setIsSubmitting(true)
      try {
        const response = await api.updatePassword(oldPassword, newPassword)

        if (response.ok) {
          logout()

          setTimeout(() => {
            navigation.navigate("Login")
          }, 0)
        } else {
          setError("Failed to update password. Please try again.")
        }
      } catch (error) {
        console.error("[AUTH] Error updating password: ", error)
        setError("Failed to update password. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    if (isSubmitting) return <Loading />

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Change Password" preset="heading" style={themed($title)} />

        <Text
          text="Please enter your current password and the new password you want to set."
          style={themed($description)}
        />

        <TextField
          value={oldPassword}
          onChangeText={setOldPassword}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          secureTextEntry={isOldPasswordHidden}
          label="Old Password"
          placeholder="1234"
          onSubmitEditing={() => newPasswordInput.current?.focus()}
          returnKeyType="next"
          RightAccessory={(props) => (
            <PasswordRightAccessory
              {...props}
              hidden={isOldPasswordHidden}
              setVisible={setIsOldPasswordHidden}
            />
          )}
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
          placeholder="5678"
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
          placeholder="5678"
          onSubmitEditing={updatePassword}
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
          text="Change Password"
          style={themed($button)}
          preset="filled"
          onPress={updatePassword}
          disabled={isSubmitting}
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
  textAlign: "left",
  fontSize: 25,
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
  borderRadius: 120,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
})
