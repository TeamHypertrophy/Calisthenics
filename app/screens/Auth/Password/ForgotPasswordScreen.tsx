import { Button, Screen, Text, TextField } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { api } from "@/services/api"
import { renderToast } from "@/utils/toastNotification"
import { Loading } from "@/components/Loader"

interface ForgotPasswordScreenProps extends AppStackScreenProps<"ForgotPassword"> {}

export const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = observer(
  function ForgotPasswordScreen(_props) {
    const { navigation } = _props

    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)


    const handleForgotPasswordRequest = async () => {
      setError("")

      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address")
        return
      }

      setIsSubmitting(true)
      try {
        const response = await api.requestPasswordReset(email)

        if (response.ok && response.data?.status == 200) {
          renderToast("Success", "Email Sent Successfully", "success")        
          
          return navigation.navigate("ForgotPasswordMfa", {
            emailAddress: email,
          })
        } else {
          setError("Failed to send password reset email. Please try again.")
          return
        }
      } catch (error) {
        console.error("Error sending forgot password request:", error)
        setError("An error occurred while sending the request. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    if (isSubmitting) return <Loading />

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Forgot Password" preset="heading" style={themed($title)} />

        <Text
          text="Please enter your email address to reset your password."
          style={themed($description)}
        />

        <TextField
          value={email}
          onChangeText={setEmail}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email Address"
          placeholder="john@gmail.com"
          onSubmitEditing={handleForgotPasswordRequest}
          returnKeyType="send"
        />

        {error && <Text text={error} style={themed($errorText)} preset="formHelper" />}

        <Button
          text="Request Password Reset"
          style={themed($button)}
          preset="reversed"
          onPress={handleForgotPasswordRequest}
          disabled={isSubmitting || !email}
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
  borderRadius: 120
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
})
