import { FC, useRef } from "react"
import { observer } from "mobx-react-lite"
import { Linking, TextStyle, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Button, Screen, Switch, Text } from "@/components"
import { spacing, ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Modalize } from "react-native-modalize"
import { api, User } from "@/services/api"
import { renderToast } from "@/utils/toastNotification"
import { MaterialIcons } from "@expo/vector-icons"
import { Loading } from "@/components/Loader"
import { ErrorScreen } from "@/components/ErrorScreen"
import { openInbox } from "react-native-email-link"

interface MfaSettingsScreenProps extends AppStackScreenProps<"MfaSettings"> {}

export const MfaSettingsScreen: FC<MfaSettingsScreenProps> = observer(
  function MfaSettingsScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: {
        mfa_enabled: store_mfa_enabled,
        mfa_verified: store_mfa_verified,
        userID,
        setUserData,
      },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const queryClient = useQueryClient()
    const enableModalRef = useRef<Modalize>(null)
    const disableModalRef = useRef<Modalize>(null)

    const {
      data: userData,
      isPending: isLoadingUser,
      isError: isErrorUser,
    } = useQuery({
      queryKey: ["user", userID],
      queryFn: async () => {
        const response = await api.getUser()
        if (response.ok && response.data) {
          setUserData(response.data)
          return response.data
        } else {
          throw new Error(response.problem || "Failed to fetch user data")
        }
      },
      staleTime: 1000 * 60,
    })

    const mfa_enabled = userData?.mfa_enabled ?? store_mfa_enabled
    const mfa_verified = userData?.mfa_verified ?? store_mfa_verified

    const enableMfaMutation = useMutation({
      mutationFn: () => api.enableMFA(),
      onSuccess: (res) => {
        if (res.ok && res.data) {
          setUserData(res.data)
          queryClient.invalidateQueries({ queryKey: ["user", userID] })
          renderToast("MFA Enabled", "Please check your email for a verification link.", "success")
          enableModalRef.current?.close()
        } else {
          renderToast("Error", "Failed to enable MFA.", "error")
        }
      },
      onError: () => {
        renderToast("Error", "Network error enabling MFA.", "error")
      },
    })

    const disableMfaMutation = useMutation({
      mutationFn: () => api.disableMFA(),
      onSuccess: (res) => {
        if (res.ok && res.data) {
          setUserData(res.data)
          queryClient.invalidateQueries({ queryKey: ["user", userID] })
          renderToast("MFA Disabled", "Multi-Factor Authentication has been disabled.", "success")
          disableModalRef.current?.close()
        } else {
          renderToast("Error", "Failed to disable MFA.", "error")
        }
      },
      onError: (err) => {
        renderToast("Error", "Network error disabling MFA.", "error")
      },
    })

    const handleToggleMfa = (value: boolean) => {
      if (value) {
        enableModalRef.current?.open()
      } else {
        disableModalRef.current?.open()
      }
    }

    const confirmEnableMfa = () => {
      enableMfaMutation.mutate()
    }

    const confirmDisableMfa = () => {
      disableMfaMutation.mutate()
    }

    const openEmailClient = async () => {
      openInbox({
        title: "Open Verification Email",
        cancelLabel: "Go Back to MFA Settings"
      })
    }

    if (isLoadingUser) {
      return <Loading/>
    }

    if (isErrorUser) {
      return <ErrorScreen
        title="Error"
        message="Failed to load user data. Please try again."
        onBack={() => navigation.goBack()}
      />
    }

    return (
      <>
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <Text text="MFA Settings" preset="heading" style={themed($title)} />

          <View style={themed($section)}>
            <Text text="Enable Multi-Factor Authentication" preset="subheading" />
            <View style={themed($settingRow)}>
              <Text
                style={themed($settingLabel)}
                text={mfa_enabled ? "MFA is Currently Enabled" : "MFA is Currently Disabled"}
              />
              <Switch
                onValueChange={handleToggleMfa}
                value={mfa_enabled}
                disabled={enableMfaMutation.isPending || disableMfaMutation.isPending}
              />
            </View>
            <Text
              style={themed($description)}
              text="Enhance your account security by requiring a code from your authenticator app upon
              login."
            />
          </View>

          {mfa_enabled && (
            <View style={themed($section)}>
              <Text text="Verification Status" preset="subheading" />
              {mfa_verified ? (
                <>
                  <View style={themed($statusRow)}>
                    <MaterialIcons icon="check" color={colors.palette.primary500} size={20} />
                    <Text style={themed($verifiedText)} text="MFA Verified"/>
                  </View>
                </>
              ) : (
                <>
                  <View style={themed($statusRow)}>
                    <MaterialIcons icon="mail" color={colors.palette.angry500} size={20} />
                    <Text style={themed($notVerifiedText)} text="Verification Pending" />
                  </View>
                  <Text
                    style={themed($description)}
                    text="A verification link has been sent to your email address. Please click the link
                    to complete MFA setup."
                  />
                  <Button
                    text="Open Email Client"
                    onPress={openEmailClient}
                    style={themed($verifyButton)}
                    preset="reversed"
                    LeftAccessory={() => (
                      <MaterialIcons
                        icon="mail"
                        size={16}
                        color={colors.palette.neutral100}
                        style={$buttonIcon}
                      />
                    )}
                  />
                </>
              )}
            </View>
          )}

          <Button
            text="Back to Settings"
            onPress={() => navigation.goBack()}
            style={themed($backButton)}
            preset="default"
          />

          <Modalize
            ref={enableModalRef}
            adjustToContentHeight
            modalStyle={themed($modalStyle)}
            handleStyle={{ width: 60 }}
          >
            <View style={themed($modalContent)}>
              <View style={themed($modalIconContainer(colors.palette.primary500))}>
                <MaterialIcons name="security" size={40} color={colors.palette.primary500} />
              </View>
              <Text text="Enable MFA" preset="heading" style={themed($modalTitle)} />
              <Text
                text="Are you sure you want to enable Multi-Factor Authentication? A verification link will be sent to your email." // Updated modal text
                style={themed($modalMessage)}
              />
              <View style={$modalButtonsContainer}>
                <Button
                  text="Cancel"
                  style={themed($cancelButton)}
                  textStyle={themed($cancelButtonText)}
                  preset="default"
                  onPress={() => enableModalRef.current?.close()}
                />
                <Button
                  text="Enable MFA"
                  style={themed($confirmButton(colors.palette.primary500))}
                  textStyle={$confirmButtonText}
                  preset="default"
                  onPress={confirmEnableMfa}
                  disabled={enableMfaMutation.isPending}
                />
              </View>
            </View>
          </Modalize>

          <Modalize
            ref={disableModalRef}
            adjustToContentHeight
            modalStyle={themed($modalStyle)}
            handleStyle={{ width: 60 }}
          >
            <View style={themed($modalContent)}>
              <View style={themed($modalIconContainer(colors.error))}>
                <MaterialIcons name="gpp-bad" size={40} color={colors.error} />
              </View>
              <Text text="Disable MFA" preset="heading" style={themed($modalTitle)} />
              <Text
                text="Are you sure you want to disable Multi-Factor Authentication? This will reduce your account security."
                style={themed($modalMessage)}
              />
              <View style={$modalButtonsContainer}>
                <Button
                  text="Cancel"
                  style={themed($cancelButton)}
                  textStyle={themed($cancelButtonText)}
                  preset="default"
                  onPress={() => disableModalRef.current?.close()}
                />
                <Button
                  text="Disable MFA"
                  style={themed($confirmButton(colors.error))}
                  textStyle={$confirmButtonText}
                  preset="default"
                  onPress={confirmDisableMfa}
                  disabled={disableMfaMutation.isPending}
                />
              </View>
            </View>
          </Modalize>
        </Screen>
      </>
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
  marginBottom: spacing.xl,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xl,
  paddingBottom: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $settingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.md,
  marginBottom: spacing.xs,
})

const $settingLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  flexShrink: 1, // Allow text to wrap if needed
  marginRight: spacing.md,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginTop: spacing.xs,
})

const $statusRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.md,
})

const $verifiedText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.primary500,
  marginLeft: spacing.xs,
  fontWeight: "bold",
})

const $notVerifiedText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.angry500, // Changed color to warning
  marginLeft: spacing.xs,
  fontWeight: "bold",
})

const $verifyButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  alignSelf: "flex-start", // Align button to the left
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $modalStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
})

const $modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xl,
  alignItems: "center",
})

const $modalIconContainer =
  (iconColor: string): ThemedStyle<ViewStyle> =>
  ({ spacing, colors }) => ({
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: iconColor + "20", // 20% opacity version of icon color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  })

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $modalMessage: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.xl,
})

const $modalButtonsContainer: ViewStyle = {
  flexDirection: "row",
  width: "100%",
}

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginRight: spacing.xs,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 120,
})

const $cancelButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $confirmButton =
  (buttonColor: string): ThemedStyle<ViewStyle> =>
  ({ spacing }) => ({
    flex: 1,
    marginLeft: spacing.xs,
    backgroundColor: buttonColor,
    borderRadius: 120,
  })

const $confirmButtonText: TextStyle = {
  color: "white",
}

const $buttonIcon: ViewStyle = {
  marginRight: 5,
}