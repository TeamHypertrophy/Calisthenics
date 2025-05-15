import { FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "@/navigators"
import {
  Button,
  FilterChip,
  FilterChipItem,
  Loading,
  Screen,
  SearchBar,
  Text,
  TextField,
} from "@/components"
import { api, Difficulty, Exercise, WorkoutPlan } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FlatList,
  ImageBackground,
  ImageStyle,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Modalize } from "react-native-modalize"
import { renderToast } from "@/utils/toastNotification"
import { MaterialIcons } from "@expo/vector-icons"
import { ErrorScreen } from "@/components/ErrorScreen"
import DateTimePickerModal from "react-native-modal-datetime-picker"

interface ViewWorkoutPlanLogScreenProps extends AppStackScreenProps<"ViewWorkoutPlanLog"> {}

export const ViewWorkoutPlanLogScreen: FC<ViewWorkoutPlanLogScreenProps> = observer(
  function ViewWorkoutPlanLogScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="viewWorkoutPlanLog" />
      </Screen>
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
