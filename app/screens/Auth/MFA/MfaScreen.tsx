import type { ThemedStyle } from "@/theme"

import { Button, Screen, Text } from "@/components"
import { Loading } from "@/components/Loader"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { OtpInput } from "react-native-otp-entry"

interface MfaScreenProps extends AppStackScreenProps<"MFA"> {}

export const MfaScreen: FC<MfaScreenProps> = observer(function MfaScreen(_props) {
  const { navigation } = _props

  const [mfaError, setMfaError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [retryDisabled, setRetryDisabled] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    authenticationStore: { setAuthToken, distributeAuthToken, setUserData, userID },
    profileStore: { updateStoreFromProfileData },
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
    const response = await api.validateMFA(text, userID)

    if (!response.ok) {
      setIsVerifying(false)
      setMfaError("Invalid MFA code. Please Try Again.")
      return
    }

    if (response.data) {
      setIsVerifying(false)
      distributeAuthToken(response.data?.api_key)

      try {
        const profileResponse = await api.getProfile()
        if (profileResponse.ok && profileResponse.data) {
          updateStoreFromProfileData(profileResponse.data)
          console.log("Profile data fetched and store updated.")
        } else if (profileResponse.status === 500) {
          console.log("No profile found for user, proceeding to onboarding.")
        } else {
          console.error("Error fetching profile:", profileResponse.problem)
          setIsVerifying(false)
          setMfaError("Failed to fetch profile data.")
          return
        }
      } catch (error) {
        console.error("Exception fetching profile:", error)
        setIsVerifying(false)
        setMfaError("An error occurred while fetching profile.")
        return
      }

      setUserData(response.data.user)
      setAuthToken(response.data?.api_key)
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
    return <Loading />
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
  marginTop: -60,
  paddingBottom: spacing.lg,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 200,
  borderRadius: 25,
})
