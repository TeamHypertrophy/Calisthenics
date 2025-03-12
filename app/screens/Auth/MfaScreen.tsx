import { FC, useState } from "react"
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

interface MfaScreenProps extends AppStackScreenProps<"MFA"> {}

export const MfaScreen: FC<MfaScreenProps> = observer(function MfaScreen(_props) {
  const { navigation } = _props
  const [mfaError, setMfaError] = useState("")

  const {
    authenticationStore: {setAuthToken, distributeAuthToken},
  } = useStores()

  async function validateMFA(text: string) {
    const mfa_res = await api.validateMFA(text)

    if (mfa_res.data?.status == 200) {
      setAuthToken(mfa_res.data?.api_key)
      distributeAuthToken(mfa_res.data?.api_key)

      return navigation.navigate("Home", { screen: "Main" })
    } else {
      setMfaError("Invalid MFA code. Please Try Again.")
      return
    }
  }

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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
