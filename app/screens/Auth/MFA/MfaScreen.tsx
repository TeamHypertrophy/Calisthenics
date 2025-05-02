import { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Text, TextField } from "@/components"
import { api } from "@/services/api"
import { OtpInput } from "react-native-otp-entry"
import { useStores } from "@/models"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { View } from "react-native"
import { renderToast } from "@/utils/toastNotification"
import { Loading } from "@/components/Loader"

interface MfaScreenProps extends AppStackScreenProps<"MFA"> {}

export const MfaScreen: FC<MfaScreenProps> = observer(function MfaScreen(_props) {
  const { navigation } = _props

  const [mfaError, setMfaError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [retryDisabled, setRetryDisabled] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    authenticationStore: { setAuthToken, distributeAuthToken, setUserData },
  } = useStores()

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (cooldown === 0 && retryDisabled) {
      setRetryDisabled(false)
    }

    return () => {}
  }, [cooldown, retryDisabled])

  async function validateMFA(text: string) {
    setIsVerifying(true)
    const response = await api.validateMFA(text)

    if (!response.ok) {
      setIsVerifying(false)
      setMfaError("Invalid MFA code. Please Try Again.")
      return
    }

    if (response.data) {
      setUserData(response.data.user)
      setAuthToken(response.data?.api_key)
      distributeAuthToken(response.data?.api_key)

      setIsVerifying(false)
    }
  }

  const handleRetry = async () => {
    try {
      setRetryDisabled(true)
      setCooldown(60)

      const response = await api.resendMFA()

      if (response.ok && response.status == 200) {
        renderToast("MFA", "MFA Code Resent, Check Your Email!")
      } else {
        setMfaError("Failed to send new code. Please try again later.")
      }
    } catch (error) {
      setMfaError("An error occurred. Please try again later.")
      console.error("Error requesting new MFA code:", error)
    }
  }

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  if (isVerifying) {
    return <Loading/>
  }

  return (
    <Screen style={$root} preset="auto" contentContainerStyle={themed($screenContentContainer)}>
      <Text text="MFA Code" preset="heading" style={themed($mfaHeading)} />

      <Text
        text="Please enter the 6 digit code sent to your email"
        preset="subheading"
        style={themed($textContainer)}
      />

      {mfaError ? <Text text={mfaError} style={themed($errorText)} preset="formHelper" /> : null}

      <View style={themed($otpContainer)}>
        <OtpInput
          numberOfDigits={6}
          focusColor="white"
          hideStick={true}
          type="numeric"
          onFilled={(text) => validateMFA(text)}
          theme={{
            pinCodeTextStyle: {
              color: colors.text,
            },
          }}
        />
      </View>

      <View style={themed($retryContainer)}>
        <Button
          text={retryDisabled ? `Resend Code (${cooldown}s)` : "Resend Code"}
          preset="filled"
          style={themed($retryButton)}
          disabled={retryDisabled}
          onPress={handleRetry}
        />
      </View>
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $mfaHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
})

const $textContainer: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $otpContainer: ViewStyle = {
  alignItems: "center",
  marginVertical: 200,
  flex: 1,
}

const $root: ViewStyle = {
  flex: 1,
}

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $retryContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: -60, // Position it below the OTP input
  paddingBottom: spacing.lg,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 200,
  borderRadius: 25,
})
