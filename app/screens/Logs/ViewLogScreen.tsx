import { Button, Card, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, CalorieLog, ProteinLog, SleepLog, WaterLog } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { capitalize } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"
import { AntDesign } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

interface ViewLogScreenProps extends AppStackScreenProps<"ViewLog"> {}

export const ViewLogScreen: FC<ViewLogScreenProps> = observer(function ViewLogScreen(_props) {
  const { navigation } = _props
  const { logID, logType } = _props.route.params

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const {
    authenticationStore: { userID },
  } = useStores()

  const navigateToEditLog = () => {
    navigation.navigate("EditLog", {
      logID: logID,
      logType: logType,
    })
  }

  const {
    data: log,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["log", logType, logID, userID],
    queryFn: async () => {
      const response = await api.getLog(logType, logID)
      return response.data
    },
    enabled: !!logID && !!logType,
  })

  if (isPending) return <Loading />

  if (isError) {
    console.error("[Nutrition] Error Fetching Log:", error)
    return (
      <ErrorScreen
        title="Error Fetching Log"
        message="There was an error fetching the log. Please try again."
        onBack={() => {
          navigation.goBack()
        }}
      />
    )
  }

  const renderLogDetails = () => {
    const DetailCard = ({ label, value }: { label: string; value: string | number }) => (
      <Card
        style={themed($detailCard)}
        heading={label}
        headingStyle={themed($detailCardHeading)}
        content={`${value}`}
        contentStyle={themed($detailCardContent)}
      />
    )

    const commonDetails = (
      <>
        {log.date && <DetailCard label="Date" value={format(new Date(log.date), "PPP p")} />}
        {log.updated_at && (
          <DetailCard label="Last Updated" value={format(new Date(log.updated_at), "PPP p")} />
        )}
      </>
    )

    switch (logType) {
      case "protein":
      case "water":
      case "calorie":
        const amountLog = log as ProteinLog | WaterLog | CalorieLog
        return (
          <>
            {commonDetails}
            <DetailCard
              label="Amount"
              value={`${amountLog.amount} ${logType === "protein" ? "g" : logType === "water" ? "ml" : "kcal"}`}
            />
          </>
        )
      case "sleep":
        const sleepLog = log as SleepLog
        return (
          <>
            {commonDetails}
            <DetailCard label="Start Time" value={format(new Date(sleepLog.beginning), "PPP p")} />
            <DetailCard label="End Time" value={format(new Date(sleepLog.end), "PPP p")} />
            <DetailCard label="Duration" value={`${sleepLog.amount} hours`} />
          </>
        )
      default:
        return (
          <ErrorScreen
            title=""
            message="The log type is not recognized."
            onBack={() => navigation.goBack()}
          />
        )
    }
  }

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <View style={themed($headerContainer)}>
        <Text text={capitalize(logType) + " Log"} preset="heading" />
        <Button
          text="Edit"
          onPress={navigateToEditLog}
          style={themed($editButton)}
          LeftAccessory={() => (
            <AntDesign
              name="edit"
              size={16}
              color={colors.palette.neutral100}
              style={$buttonIcon}
            />
          )}
        />
      </View>

      {renderLogDetails()}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $headerContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
})

const $editButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: 12,
  height: 10,
  borderRadius: 18,
})

const $buttonIcon: ViewStyle = {
  marginRight: 5,
}

const $detailCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  overflow: "hidden",
  elevation: 2,
})

const $detailCardHeading: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "bold",
})

const $detailCardContent: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
