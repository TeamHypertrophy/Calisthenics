import { Button, Loading, Screen, Text, TextField } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import {
  api,
  CalorieLog,
  ProteinLog,
  SleepLog,
  UpdateCalorieLog,
  UpdateProteinLog,
  UpdateSleepLog,
  UpdateWaterLog,
  WaterLog,
} from "@/services/api"
import { ThemedStyle } from "@/theme"
import { createProteinDate } from "@/utils/formatDate"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Modalize } from "react-native-modalize"

interface EditLogScreenProps extends AppStackScreenProps<"EditLog"> {}

export const EditLogScreen: FC<EditLogScreenProps> = observer(function EditLogScreen(_props) {
  const { navigation } = _props
  const { logID, logType } = _props.route.params

  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const {
    authenticationStore: { userID },
  } = useStores()
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date())
  const [sleepStart, setSleepStart] = useState(new Date())
  const [sleepEnd, setSleepEnd] = useState(new Date())

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [isSleepStartDatePickerVisible, setSleepStartDatePickerVisibility] = useState(false)
  const [isSleepEndDatePickerVisible, setSleepEndDatePickerVisibility] = useState(false)

  const deleteModalRef = useRef<Modalize>(null)

  const fetchLogDetails = async () => {
    let response
    switch (logType) {
      case "protein":
        response = await api.getLog(logType, logID)
        break
      case "water":
        response = await api.getLog(logType, logID)
        break
      case "calorie":
        response = await api.getLog(logType, logID)
        break
      case "sleep":
        response = await api.getLog(logType, logID)
        break
      default:
        throw new Error("Invalid Log Type")
    }
    if (response.ok && response.data) {
      return response.data
    } else {
      throw new Error("Failed Fetching Log Details")
    }
  }

  const {
    data: logData,
    isLoading: isLoadingLog,
    isError: isFetchError,
    error: fetchError,
  } = useQuery({
    queryKey: ["log", logType, logID, userID],
    queryFn: fetchLogDetails,
    enabled: !!logID && !!logType,
  })

  useEffect(() => {
    if (logData) {
      switch (logType) {
        case "protein":
        case "water":
        case "calorie":
          const amountLog = logData as ProteinLog | WaterLog | CalorieLog
          setAmount(String(amountLog.amount))
          if (amountLog.date) setDate(parseISO(amountLog.date as unknown as string))
          break
        case "sleep":
          const sleepLog = logData as SleepLog
          setAmount(String(sleepLog.amount))
          if (sleepLog.beginning) setSleepStart(parseISO(sleepLog.beginning as unknown as string))
          if (sleepLog.end) setSleepEnd(parseISO(sleepLog.end as unknown as string))
          break
      }
    }
  }, [logData, logType, navigation])

  const updateLogMutation = useMutation({
    mutationFn: async (payload: any) => {
      let response
      switch (logType) {
        case "protein":
          response = await api.updateLog(logType, logID, payload as UpdateProteinLog)
          break
        case "water":
          response = await api.updateLog(logType, logID, payload as UpdateWaterLog)
          break
        case "calorie":
          response = await api.updateLog(logType, logID, payload as UpdateCalorieLog)
          break
        case "sleep":
          response = await api.updateLog(logType, logID, payload as UpdateSleepLog)
          break
        default:
          throw new Error("Invalid log type for update")
      }
      if (!response.ok) {
        throw new Error("Failed Updating Log")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userID] })
      queryClient.invalidateQueries({ queryKey: ["log", logType, logID, userID] })
      renderToast("Success", "Log updated successfully!")
      navigation.goBack()
    },
    onError: () => {
      renderToast("Error", "Failed Updating Log")
    },
  })

  const deleteLogMutation = useMutation({
    mutationFn: async () => {
      let response
      switch (logType) {
        case "protein":
          response = await api.deleteLog(logType, logID)
          break
        case "water":
          response = await api.deleteLog(logType, logID)
          break
        case "calorie":
          response = await api.deleteLog(logType, logID)
          break
        case "sleep":
          response = await api.deleteLog(logType, logID)
          break
        default:
          throw new Error("Invalid Log Type")
      }
      if (!response.ok) {
        throw new Error("Failed Deleting Log")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userID] })
      renderToast("Success", "Log Deleted Successfully!")
      navigation.popToTop()
    },
    onError: (error: Error) => {
      renderToast("Error", "Failed Deleting Log")
    },
  })

  const handleSaveChanges = () => {
    let payload: any = {}

    const parsedAmount = parseFloat(amount)

    if (
      isNaN(parsedAmount) &&
      (logType === "protein" || logType === "water" || logType === "calorie" || logType === "sleep")
    ) {
      renderToast("Validation", "Please enter a valid amount.")
      return
    }

    switch (logType) {
      case "protein":
      case "water":
      case "calorie":
        payload = { amount: parsedAmount, date: createProteinDate(date) }
        break
      case "sleep":
        if (sleepEnd <= sleepStart) {
          renderToast("Validation Error", "End time must be after start time.")
          return
        }
        payload = {
          beginning: createProteinDate(sleepStart),
          end: createProteinDate(sleepEnd),
          amount: parsedAmount,
        }
        break
    }
    updateLogMutation.mutate(payload)
  }

  const handleDeletePress = () => {
    deleteModalRef.current?.open()
  }

  const handleDeleteConfirm = () => {
    console.log("[Nutrition] Deleting Log")
    deleteModalRef.current?.close()
    deleteLogMutation.mutate()
  }

  const showDatePicker = () => setDatePickerVisibility(true)
  const hideDatePicker = () => setDatePickerVisibility(false)
  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate)
    hideDatePicker()
  }

  const showSleepStartDatePicker = () => setSleepStartDatePickerVisibility(true)
  const hideSleepStartDatePicker = () => setSleepStartDatePickerVisibility(false)
  const handleSleepStartDateConfirm = (selectedDate: Date) => {
    setSleepStart(selectedDate)
    hideSleepStartDatePicker()
  }

  const showSleepEndDatePicker = () => setSleepEndDatePickerVisibility(true)
  const hideSleepEndDatePicker = () => setSleepEndDatePickerVisibility(false)
  const handleSleepEndDateConfirm = (selectedDate: Date) => {
    setSleepEnd(selectedDate)
    hideSleepEndDatePicker()
  }

  if (isLoadingLog) return <Loading />
  if (deleteLogMutation.isPending) return <Loading />
  if (updateLogMutation.isPending) return <Loading />

  if (isFetchError) {
    console.error("[Nutrition] Error Fetching Log: ", fetchError)
    return (
      <ErrorScreen
        title="Error Fetching Log"
        message={fetchError.message}
        onBack={() => {
          navigation.goBack()
        }}
      />
    )
  }

  return (
    <>
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top", "bottom"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {logType === "protein" || logType === "water" || logType === "calorie" ? (
            <>
              <Text preset="formLabel" text="Date" />

              <Button
                text={format(date, "PPP")}
                onPress={showDatePicker}
                style={themed($dateButton)}
              />

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                date={date}
              />

              <TextField
                label="Amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                containerStyle={themed($textField)}
                placeholder={
                  logType === "protein"
                    ? "e.g., 30 (grams)"
                    : logType === "water"
                      ? "e.g., 500 (ml)"
                      : "e.g., 250 (kcal)"
                }
              />
            </>
          ) : null}

          {logType === "sleep" ? (
            <>
              <Text preset="formLabel" text="Start Time" />

              <Button
                text={format(sleepStart, "PPP p")}
                onPress={showSleepStartDatePicker}
                style={themed($dateButton)}
              />

              <DateTimePickerModal
                isVisible={isSleepStartDatePickerVisible}
                mode="datetime"
                onConfirm={handleSleepStartDateConfirm}
                onCancel={hideSleepStartDatePicker}
                date={sleepStart}
              />

              <Text preset="formLabel" text="End Time" />

              <Button
                text={format(sleepEnd, "PPP p")}
                onPress={showSleepEndDatePicker}
                style={themed($dateButton)}
              />

              <DateTimePickerModal
                isVisible={isSleepEndDatePickerVisible}
                mode="datetime"
                onConfirm={handleSleepEndDateConfirm}
                onCancel={hideSleepEndDatePicker}
                date={sleepEnd}
              />

              <TextField
                label="Duration (hours)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                containerStyle={themed($textField)}
                placeholder="e.g., 8"
              />
            </>
          ) : null}
        </ScrollView>

        <View style={themed($buttonContainer)}>
          <Button
            text="Save Changes"
            preset="filled"
            onPress={handleSaveChanges}
            style={themed($saveButton)}
            disabled={updateLogMutation.isPending || deleteLogMutation.isPending}
          />
          <Button
            text="Delete"
            preset="filled"
            onPress={handleDeletePress}
            style={themed($deleteButton)}
            disabled={updateLogMutation.isPending || deleteLogMutation.isPending}
          />
        </View>
      </Screen>

      <Modalize
        ref={deleteModalRef}
        adjustToContentHeight
        modalStyle={themed($modalStyle)}
        handleStyle={{ width: 60, alignSelf: "center", backgroundColor: colors.border }}
      >
        <View style={themed($modalContent)}>
          <View style={themed($modalIconContainer)}>
            <MaterialIcons name="delete" size={40} color={colors.error} />
          </View>
          <Text text="Delete Log" preset="subheading" style={themed($modalTitle)} />
          <Text
            text="Are you sure you want to delete this log? This action is irreversible."
            style={themed($modalMessage)}
          />
          <View style={$modalButtonsContainer}>
            <Button
              text="Cancel"
              style={themed($modalCancelButton)}
              textStyle={themed($modalCancelButtonText)}
              preset="filled"
              onPress={() => deleteModalRef.current?.close()}
            />
            <Button
              text="Delete"
              style={themed($modalConfirmButton)}
              textStyle={$modalConfirmButtonText}
              preset="filled"
              onPress={handleDeleteConfirm}
            />
          </View>
        </View>
      </Modalize>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  flexGrow: 1,
  justifyContent: "space-between",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $dateButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.angry500,
  marginBottom: spacing.sm,
  borderRadius: 120,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
})

const $modalStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  paddingBottom: 20,
})

const $modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.md,
  alignItems: "center",
})

const $modalIconContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: colors.error + "20",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
  fontSize: 18,
  fontWeight: "bold",
  color: colors.text,
})

const $modalMessage: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
  fontSize: 14,
})

const $modalButtonsContainer: ViewStyle = {
  flexDirection: "row",
  width: "100%",
  justifyContent: "space-between",
}

const $modalCancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginRight: spacing.sm,
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
})

const $modalCancelButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $modalConfirmButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginLeft: spacing.sm,
  backgroundColor: colors.error,
})

const $modalConfirmButtonText: TextStyle = {
  color: "white",
}
