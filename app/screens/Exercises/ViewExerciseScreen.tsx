import { AutoImage, Button, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"

interface ViewExerciseScreenProps extends AppStackScreenProps<"ViewExercise"> {}

export const ViewExerciseScreen: FC<ViewExerciseScreenProps> = observer(
  function ViewExerciseScreen(_props) {
    const { navigation } = _props

    const exerciseID = _props.route.params?.exerciseID

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      data: exercise,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["exercise", exerciseID],
      queryFn: async () => {
        const response = await api.getExerciseByID(exerciseID)

        if (response.ok && response.data) {
          return response.data
        } else {
          throw new Error("Failed Fetching Exercise Data")
        }
      },
    })

    const handleCreateLog = () => {
      if (!exercise) {
        renderToast("Not Available", "Exercise Data Missing", "error")
        console.error("Exercise Data Not Available")
        return
      }

      navigation.navigate("CreateExerciseLog", {
        exerciseID: exercise.exercise_id,
      })
    }

    if (isLoading) {
      return <Loading />
    }

    if (isError) {
      console.error("Error Fetching Exercise:", error)
      return (
        <ErrorScreen
          title="Error"
          message="Failed Loading Exercise Data"
          onBack={() => navigation.goBack()}
        />
      )
    }

    const InfoChip: FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
      if (!value) return null
      return (
        <View style={themed($infoChipContainer)}>
          <Text text={label} style={themed($infoChipLabel)} preset="formLabel" />
          <Text
            text={String(value)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
            style={themed($infoChipValue)}
          />
        </View>
      )
    }

    if (!exercise) {
      return (
        <ErrorScreen
          title="Error"
          message="Exercise Data Not Available"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
        <View style={themed($headerContainer)}>
          <Text
            preset="heading"
            text={exercise.name}
            style={themed($exerciseNameHeader)}
            numberOfLines={2}
            ellipsizeMode="tail"
          />
          <Button
            text="Log Exercise"
            preset="filled"
            onPress={handleCreateLog}
            style={themed($logButton)}
            LeftAccessory={() => (
              <MaterialIcons
                name="add-task"
                size={20}
                color={colors.palette.secondary400}
                style={{ marginRight: spacing.xs }}
              />
            )}
          />
        </View>

        <AutoImage
          source={{ uri: exercise.image_url || process.env.PLACEHOLDER_EXERCISE_IMAGE }}
          style={themed($exerciseImage)}
          resizeMode="cover"
        />

        <View style={themed($detailsContainer)}>
          {exercise.description && (
            <View style={themed($detailSection)}>
              <Text preset="subheading" text="Description" />
              <Text text={exercise.description} style={themed($detailText)} />
            </View>
          )}

          <View style={themed($separator)} />

          {exercise.instructions && (
            <View style={themed($detailSection)}>
              <Text preset="subheading" text="Instructions" />
              <Text text={exercise.instructions} style={themed($detailText)} />
            </View>
          )}

          <View style={themed($separator)} />

          <View style={themed($detailRow)}>
            <InfoChip label="Equipment" value={exercise.equipment} />
            <InfoChip label="Difficulty" value={exercise.difficulty} />
          </View>
          <View style={themed($detailRow)}>
            <InfoChip label="Muscle Group" value={exercise.muscle_group} />
            <InfoChip label="Type" value={exercise.exercise_type} />
          </View>

          <View style={themed($separator)} />

          {(exercise.sets || exercise.reps || exercise.rest_time) && (
            <View style={themed($detailSection)}>
              <Text preset="subheading" text="Recommendations" />
              {exercise.sets && (
                <Text text={`Sets: ${exercise.sets}`} style={themed($detailText)} />
              )}
              {exercise.reps && (
                <Text text={`Reps: ${exercise.reps}`} style={themed($detailText)} />
              )}
              {exercise.rest_time && (
                <Text text={`Rest: ${exercise.rest_time}s`} style={themed($detailText)} />
              )}
            </View>
          )}
        </View>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $exerciseNameHeader: ThemedStyle<TextStyle> = ({ spacing }) => ({
  flexShrink: 1,
  marginRight: spacing.md,
})

const $logButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $exerciseImage: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: "auto",
  height: 250,
  marginBottom: spacing.lg,
})

const $detailsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $detailSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $detailText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  lineHeight: 20,
  color: colors.palette.secondary400,
})

const $detailRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
})

const $infoChipContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  flex: 1,
  marginHorizontal: spacing.xs,
})

const $infoChipLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  marginBottom: 2,
})

const $infoChipValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "bold",
  fontSize: 14,
  textAlign: "center",
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginVertical: spacing.lg,
})
