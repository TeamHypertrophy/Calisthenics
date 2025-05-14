import { FC, useState } from "react"
import { observer } from "mobx-react-lite" 
import { AppStackScreenProps } from "@/navigators"
import { Button, Loading, Screen, Text } from "@/components"
import { api } from "@/services/api"
import { ErrorScreen } from "@/components/ErrorScreen"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useQuery } from "@tanstack/react-query"
import { ViewStyle } from "react-native"

interface WorkoutTemplatesScreenProps extends AppStackScreenProps<"WorkoutTemplates"> {}


export const WorkoutTemplatesScreen: FC<WorkoutTemplatesScreenProps> = observer(function WorkoutTemplatesScreen(_props) {

  const  { navigation } = _props

  const {
    authenticationStore: { userID },
  } = useStores()

  const {
      themed,
      theme: { colors },
  } = useAppTheme()
  

  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContentContainer)}>
      <Text text="workoutTemplates" />
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