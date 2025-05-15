import { Button, Chip, Loading, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import {
  api,
  CreateCalorieLog,
  CreateProteinLog,
  CreateSleepLog,
  CreateWaterLog,
} from "@/services/api"
import { ThemedStyle } from "@/theme"
import { capitalize, createProteinDate } from "@/utils/formatDate"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns/format"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"

import { LOG_TYPES, LogType } from "./LogsScreen"

interface CreateLogScreenProps extends AppStackScreenProps<"CreateLog"> {}

export const CreateLogScreen: FC<CreateLogScreenProps> = observer(function CreateLogScreen(_props) {
  const { navigation } = _props

  const {
    authenticationStore: { userID },
  } = useStores()

  const queryClient = useQueryClient()

  const [selectedType, setSelectedType] = useState<LogType | null>(null)

  const [amount, setAmount] = useState(0)

  const [sleepStart, setSleepStart] = useState(new Date())
  const [sleepEnd, setSleepEnd] = useState(new Date())

  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false)
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false)

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true)
  }

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false)
  }

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true)
  }

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false)
  }

  const handleStartDateConfirm = (date: Date) => {
    setSleepStart(date)
    hideStartDatePicker()
  }

  const handleEndDateConfirm = (date: Date) => {
    setSleepEnd(date)
    hideEndDatePicker()
  }

  const createLogMutation = useMutation({
    mutationFn: async (log: { type: LogType; payload: any }) => {
      switch (log.type) {
        case "protein":
          return api.createProteinLog(log.payload as CreateProteinLog)
        case "water":
          return api.createWaterLog(log.payload as CreateWaterLog)
        case "calories":
          return api.createCalorieLog(log.payload as CreateCalorieLog)
        case "sleep":
          return api.createSleepLog(log.payload as CreateSleepLog)
        default:
          throw new Error("Invalid Log Type")
      }
    },
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["logs", userID] })
        renderToast("Success", "Log Created", "success")
        navigation.goBack()
      } else {
        console.error("Error Creating Log: ", response)
        renderToast("Error", "Failed Creating Log", "error")
      }
    },
    onError: (error) => {
      console.error("Error Creating Log: ", error)
      renderToast("Error", "Failed Creating Log", "error")
    },
  })

  const handleCreateLog = () => {
    if (!selectedType) {
      renderToast("Error", "Please select a log type", "error")
      return
    }

    if (amount == 0) {
      renderToast("Error", "Amount Cannot Be Empty", "error")
      return
    }

    let payload: any = { user_id: userID }
    const now = new Date()

    switch (selectedType) {
      case "protein":
        payload = { ...payload, amount, date: now.toISOString() }
        break
      case "water":
        payload = { ...payload, amount, date: now.toISOString() }
        break
      case "calories":
        payload = { ...payload, amount, date: now.toISOString() }
        break
      case "sleep":
        if (sleepEnd <= sleepStart) {
          renderToast("Error", "Sleep end time must be after start time", "error")
          return
        }

        payload = {
          ...payload,
          beginning: createProteinDate(sleepStart),
          end: createProteinDate(sleepEnd),
          amount: amount,
        }
        break
      default:
        renderToast("Error", "Invalid Log Type", "error")
        return
    }

    createLogMutation.mutate({ type: selectedType, payload: payload })
  }

  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  if (createLogMutation.isPending) return <Loading />

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text preset="subheading" text="Select Log Type" style={themed($label)} />
        <View style={themed($chipContainer)}>
          {LOG_TYPES.map((type) => (
            <Chip
              key={type}
              text={capitalize(type)}
              preset={selectedType === type ? "filled" : "outlined"}
              onPress={() => setSelectedType(type)}
              style={themed($chip)}
            />
          ))}
        </View>

        {selectedType && (
          <>
            {selectedType === "sleep" && (
              <>
                <Text style={themed($inputLabel)}>Start: {format(sleepStart, "Pp")}</Text>
                <Button
                  text="Change Start Time"
                  onPress={showStartDatePicker}
                  style={themed($formButton)}
                />
                <DateTimePickerModal
                  isVisible={isStartDatePickerVisible}
                  mode="datetime"
                  onConfirm={handleStartDateConfirm}
                  onCancel={hideStartDatePicker}
                />

                <Text style={themed($inputLabel)}>End: {format(sleepEnd, "Pp")}</Text>
                <Button
                  text="Change End Time"
                  onPress={showEndDatePicker}
                  style={themed($formButton)}
                />
                <DateTimePickerModal
                  isVisible={isEndDatePickerVisible}
                  mode="datetime"
                  onConfirm={handleEndDateConfirm}
                  onCancel={hideEndDatePicker}
                />
              </>
            )}

            {selectedType === "protein" ||
            selectedType === "water" ||
            selectedType === "sleep" ||
            selectedType === "calories" ? (
              <TextField
                label="Amount"
                placeholder={
                  selectedType === "protein"
                    ? "e.g., 30 (grams)"
                    : selectedType === "sleep"
                      ? "e.g., 8 (hours)"
                      : selectedType === "water"
                        ? "e.g., 500 (ml)"
                        : "e.g., 250 (kcal)"
                }
                keyboardType="numeric"
                value={String(amount)}
                onChangeText={(text) => {
                  const value = parseFloat(text)
                  if (!isNaN(value)) {
                    setAmount(value)
                  } else {
                    setAmount(0)
                  }
                }}
                containerStyle={themed($textField)}
              />
            ) : null}
          </>
        )}
      </ScrollView>

      {selectedType && (
        <Button
          text="Save Log"
          preset="filled"
          onPress={handleCreateLog}
          style={themed($saveButton)}
          disabled={createLogMutation.isPending}
        />
      )}
    </Screen>
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

const $label: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  marginTop: spacing.md,
  fontWeight: "bold",
})

const $inputLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  marginTop: spacing.sm,
  color: colors.text,
})

const $chipContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: spacing.md,
})

const $chip: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
  marginBottom: spacing.sm,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $formButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  marginTop: spacing.xs,
  alignSelf: "flex-start",
  borderRadius: 120,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
  borderRadius: 120,
})
