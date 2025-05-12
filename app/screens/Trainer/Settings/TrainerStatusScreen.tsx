import { Button, Card, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { RefreshControl, ScrollView, TextStyle, View, ViewStyle } from "react-native"

interface TrainerStatusScreenProps extends AppStackScreenProps<"TrainerStatus"> {}

export const TrainerStatusScreen: FC<TrainerStatusScreenProps> = observer(
  function TrainerStatusScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      authenticationStore: { userID },
    } = useStores()

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
      queryKey: ["trainer", userID],
      queryFn: async () => {
        const response = await api.getTrainerByID(userID)
        console.log(response)

        if (response.ok && response.data) {
          return response.data
        } else if (!response.ok && response.status === 500) {
          // Trainer Not Found, therefore never been created, return null to ignore react-query isError case
          return null
        } else {
          throw new Error("Failed Fetching Trainer Data")
        }
      },
    })

    if (isLoading) {
      return <Loading />
    }

    if (isError) {
      console.error("[Trainer Status] Error Loading Trainer Status Screen", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Your Trainer Status"
          onBack={() => navigation.goBack()}
        />
      )
    }

    const renderStatusContent = () => {
      if (data === null) {
        return (
        <View style={$contentWrapper}>
          <Ionicons
            name="person-circle-sharp" 
            size={spacing.xxxl}
            color={colors.palette.neutral500}
            style={themed($iconStyle)}
          />
          <Text
            text="Trainer Profile Not Found"
            preset="subheading"
            style={themed($statusTextUnverified)}
          />
          <Text
            text="No Trainer Profile Found. Please Request Verification To Become A Trainer"
            style={themed($statusSubText)}
          />
          <Button
          text="Request Trainer Verification"
          onPress={() => navigation.navigate("TrainerRequest")}
          style={themed($requestButton)}
          preset="filled"
          textStyle={themed($requestButtonText)}
          /> 
          </View>
        )
      }


      if (data?.verified) {
        return (
          <View style={$contentWrapper}>
            <Ionicons
              name="shield-checkmark"
              size={spacing.xxxl}
              color={colors.palette.primary500}
              style={themed($iconStyle)}
            />
            <Text
              text="You are a verified trainer!"
              preset="subheading"
              style={themed($statusTextVerified)}
            />
            <Text
              text="Your profile is now visible to users seeking trainers."
              style={themed($statusSubText)}
            />
          </View>
        )
      } else {
        return (
          <View style={$contentWrapper}>
            <Ionicons
              name="shield-outline"
              size={spacing.xxxl}
              color={colors.palette.neutral500}
              style={themed($iconStyle)}
            />
            <Text
              text="You Are Not Verified"
              preset="subheading"
              style={themed($statusTextUnverified)}
            />
            <Text
              text="Hypertrophy Admins Are Currently Reviewing Your Request"
              style={themed($statusSubText)}
            />
          </View>
        )
      }
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <ScrollView
          contentContainerStyle={themed($scrollViewContainer)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={[colors.tint]}
            />
          }
        >
          <Text text="Trainer Status" preset="heading" style={themed($heading)} />
          <Card
            style={themed($statusCardStyle)}
            ContentComponent={renderStatusContent()}
            verticalAlignment="center"
          />
        </ScrollView>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $scrollViewContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
  alignItems: "center",
  flexGrow: 1,
})

const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
  textAlign: "left",
})

const $statusCardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 400,
  marginBottom: spacing.xl,
  elevation: 3,
  shadowOpacity: 0,
})

const $contentWrapper: ViewStyle = {
  alignItems: "center",
  width: "100%",
}

const $iconStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $statusTextBase: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 18,
  textAlign: "center",
  marginBottom: spacing.sm,
  color: colors.text,
  fontWeight: "600",
})

const $statusTextVerified: ThemedStyle<TextStyle> = (theme) => ({
  ...$statusTextBase(theme),
  color: theme.colors.palette.primary500,
})

const $statusTextUnverified: ThemedStyle<TextStyle> = (theme) => ({
  ...$statusTextBase(theme),
  color: theme.colors.palette.angry500,
})

const $statusSubText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 14,
  textAlign: "center",
  marginBottom: spacing.lg,
  color: colors.textDim,
  lineHeight: 20,
})

const $requestButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.md,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing.sm + 2,
  paddingHorizontal: spacing.lg,
  borderRadius: 120,
  width: "100%",
})

const $requestButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.secondary400,
  fontWeight: "bold",
})
