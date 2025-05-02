import { FC, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TouchableOpacity, TextStyle, Platform } from "react-native"
import Clipboard from "@react-native-clipboard/clipboard"
import { Screen, Text, Button, Icon, Card } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { Modalize } from "react-native-modalize"
import { api } from "@/services/api"
import Constants from "expo-constants"
import { useQuery } from "@tanstack/react-query"
import { Loading } from "@/components/Loader"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useIsConnected } from "react-native-offline"
import { clear } from "@/utils/storage"

export const SettingsScreen: FC<HomeTabScreenProps<"Settings">> = observer(
  function SettingsScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { logout, deleteAccount },
    } = useStores()

    const logoutModalRef = useRef<Modalize>(null)
    const deleteAccountRef = useRef<Modalize>(null)
    const [isDebugExpanded, setIsDebugExpanded] = useState(false)

    const appVersion = Constants.expoConfig?.version || "1.0.0"
    const isConnected = useIsConnected()

    const handleLogoutPress = () => {
      logoutModalRef.current?.open()
    }

    const handleDeleteAccountPress = () => {
      deleteAccountRef.current?.open()
    }

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const { isFetching, isError, data } = useQuery({
      queryKey: ["version"],
      queryFn: async () => {
        const response = await api.getVersionInfo()
        return response.data
      },
    })

    const { data: redisData} = useQuery({
      queryKey: ["health", "redis"],
      queryFn: async () => {
        const response = await api.checkRedis()
        return response.data
      }
    })

    const { data: postgresData } = useQuery({
      queryKey: ["health", "postgres"],
      queryFn: async () => {
        const response = await api.checkPostgres()
        return response.data
      }
    })

    const copyDebugInfo = () => {
      const debugInfo = `Hypertrophy Debug Info:
App Version: ${appVersion}
Backend Version: ${data?.version}
Database Version: ${data?.postgres}
Database Status: ${postgresData?.status}
Redis Version: ${data?.redis}
Redis Status: ${redisData?.status}
Device: ${Constants.deviceName}
OS: ${Constants.platform?.os} ${Constants.systemVersion}
Current Time: ${new Date().toLocaleString()}
Network Status: ${isConnected ? "Online" : "Offline"}
`
      Clipboard.setString(debugInfo)
    }

    const toggleDebugSection = () => {
      setIsDebugExpanded(!isDebugExpanded)
    }

    const representStatus = (status: boolean | undefined) => {
      switch (status) {
        case true:
          return "Healthy"
        case false:
          return "Not Healthy"
        default:
          return "Unknown"
      }
    }

    if (isFetching) return <Loading />

    if (isError) {
      return (
        <ErrorScreen
          title="Error Loading Settings"
          message="Unable to load settings. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <>
        <Screen
          style={$root}
          preset="scroll"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <View style={$headerContainer}>
            <Text text="Settings" preset="heading" />

            <TouchableOpacity style={themed($logoutButton)} onPress={handleLogoutPress}>
              <AntDesign name="logout" size={20} color={colors.error} />
              <Text text="Log Out" style={themed($logoutText)} />
            </TouchableOpacity>
          </View>

          <View style={themed($settingsContainer)}>
            <View style={themed($settingsSection)}>
              <Text text="Password" preset="subheading" style={themed($sectionTitle)}/>
              <Button
                text="Change Password"
                onPress={() => navigation.navigate("UpdatePassword")}
                style={themed($button)}
              />
              <Button
                text="Reset Password"
                onPress={() => navigation.navigate("ForgotPassword")}
                style={themed($button)}
              />

              <Text text="Multi-Factor Authentication" preset="subheading" style={themed($sectionTitle)} />
              <Button
                text="MFA Settings"
                onPress={() => navigation.navigate("MfaSettings")}
                style={themed($button)}
              />

              <Text text="Account" preset="subheading" style={themed($sectionTitle)} />
              <Button text="Delete Account" style={themed($button)} onPress={handleDeleteAccountPress}/>

              <TouchableOpacity style={themed($debugSectionHeader)} onPress={toggleDebugSection}>
                <Text text="Debug Information" preset="subheading" style={themed($sectionTitle)} />
                <MaterialIcons
                  name={isDebugExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color={colors.textDim}
                />
              </TouchableOpacity>

              {isDebugExpanded && (
                <Card
                  style={themed($settingsCard)}
                  ContentComponent={
                    <View>
                      <View style={themed($versionItem)}>
                        <Text text="App Version" style={themed($versionLabel)} />
                        <Text text={appVersion} style={themed($versionValue)} />
                      </View>

                      <View style={themed($versionItem)}>
                        <Text text="Backend Version" style={themed($versionLabel)} />
                        <Text text={data?.version} style={themed($versionValue)} />
                      </View>

                      <View style={themed($versionItem)}>
                        <Text text="Database Version" style={themed($versionLabel)} />
                        <Text text={data?.postgres} style={themed($versionValue)} />
                      </View>

                      <View style={themed($versionItem)}>
                        <Text text="Database Status" style={themed($versionLabel)} />
                        <Text
                          text={representStatus(postgresData?.is_healthy)}
                          style={themed($versionValue)}
                        />
                      </View>

                      <View style={themed($versionItem)}>
                        <Text text="Redis Version" style={themed($versionLabel)} />
                        <Text text={data?.redis} style={themed($versionValue)} />
                      </View>

                      <View style={themed($versionItem)}>
                        <Text text="Redis Status" style={themed($versionLabel)} />
                        <Text
                          text={representStatus(redisData?.is_healthy)}
                          style={themed($versionValue)}
                        />
                      </View>

                      <TouchableOpacity style={themed($copyButton)} onPress={copyDebugInfo}>
                        <AntDesign name="copy1" size={16} color={colors.palette.neutral100} />
                        <Text text="Copy Debug Info" style={themed($copyButtonText)} />
                      </TouchableOpacity>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Screen>

        <Modalize
          ref={logoutModalRef}
          adjustToContentHeight
          modalStyle={themed($modalStyle)}
          handleStyle={{ width: 60 }}
        >
          <View style={themed($modalContent)}>
            <View style={themed($modalIconContainer)}>
              <MaterialIcons name="logout" size={40} color={colors.error} />
            </View>

            <Text text="Log Out" preset="heading" style={themed($modalTitle)} />
            <Text
              text="Are you sure you want to log out from your account?"
              style={themed($modalMessage)}
            />

            <View style={$modalButtonsContainer}>
              <Button
                text="Cancel"
                style={themed($cancelButton)}
                textStyle={themed($cancelButtonText)}
                preset="default"
                onPress={() => logoutModalRef.current?.close()}
              />

              <Button
                text="Log Out"
                style={themed($confirmButton)}
                textStyle={$confirmButtonText}
                preset="default"
                onPress={() => {
                  logoutModalRef.current?.close()
                  logout()
                }}
              />
            </View>
          </View>
        </Modalize>

        <Modalize
          ref={deleteAccountRef}
          adjustToContentHeight
          modalStyle={themed($modalStyle)}
          handleStyle={{ width: 60 }}
        >
          <View style={themed($modalContent)}>
            <View style={themed($modalIconContainer)}>
              <MaterialIcons name="delete" size={40} color={colors.error} />
            </View>

            <Text text="Delete Account" preset="heading" style={themed($modalTitle)} />
            <Text
              text="Are You Sure You Want To Delete Your Account? This Action is Irreversible."
              style={themed($modalMessage)}
            />

            <View style={$modalButtonsContainer}>
              <Button
                text="Cancel"
                style={themed($cancelButton)}
                textStyle={themed($cancelButtonText)}
                preset="default"
                onPress={() => deleteAccountRef.current?.close()}
              />

              <Button
                text="Delete Account"
                style={themed($confirmButton)}
                textStyle={$confirmButtonText}
                preset="default"
                onPress={async () => {
                  deleteAccountRef.current?.close()
                  await deleteAccount()
                  clear()
                  logout()
                }}
              />
            </View>
          </View>
        </Modalize>
      </>
    )
  },
)

// Styles
const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
}

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
})

const $logoutText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginLeft: spacing.xs,
  fontSize: 14,
})

const $settingsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginTop: spacing.sm,
})

const $settingsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $settingsCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: colors.background,
  ...Platform.select({
    ios: {
      shadowColor: colors.palette.neutral800,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.palette.neutral300,
    },
  }),
})

const $debugSectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $versionItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.xs,
})

const $versionLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: "500",
  color: colors.textDim,
})

const $versionValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontFamily: "monospace",
})

const $copyButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "center",
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  borderRadius: 20,
  marginTop: spacing.md,
})

const $copyButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral100,
  marginLeft: spacing.xs,
  fontSize: 14,
})

// Modal styles
const $modalStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
})

const $modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xl,
  alignItems: "center",
})

const $modalIconContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.error + "20", // 20% opacity version of error color
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
})

const $cancelButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $confirmButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginLeft: spacing.xs,
  backgroundColor: colors.error,
})

const $confirmButtonText: TextStyle = {
  color: "white",
}

const $button: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  borderRadius: 120,
})

