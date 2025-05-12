import { AutoImage, Button, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { ActivityLevel, api, Profile } from "@/services/api"
import { spacing, ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Dropdown } from "react-native-element-dropdown"

interface PublicScreenProps extends AppStackScreenProps<"Public"> {}

export const PublicScreen: FC<PublicScreenProps> = observer(function PublicScreen(_props) {
  const { navigation } = _props

  const {
    profileStore: { updateProfile, clear },
    authenticationStore: { userID, logout },
  } = useStores()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [bio, setBio] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("light")

  const activityLevelOptions = [
    { label: "Light", value: "Light" },
    { label: "Moderate", value: "Moderate" },
    { label: "Very", value: "Very" },
    { label: "Extremely", value: "Extremely" },
  ]

  const queryClient = useQueryClient()

  const uploadAvatar = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) => api.uploadAvatar(asset),
    onSuccess: (res) => {
      if (res.ok && res.data) {
        setAvatarUrl(res.data.avatar_url)
        renderToast("Avatar Uploaded", "Your avatar has been uploaded", "success")
      } else {
        renderToast("Error", "Failed to upload avatar", "error")
      }
    },
    onError: () => renderToast("Error", "Failed to upload avatar", "error"),
  })

  const savePublic = useMutation({
    mutationFn: (data: Partial<Profile>) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userID] })
      renderToast("Success", "Public info saved", "success")
      navigation.navigate("Goals")
    },
    onError: () => renderToast("Error", "Network error", "error"),
  })

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    })

    if (!result.canceled && result.assets.length) {
      uploadAvatar.mutate(result.assets[0])
    }
  }

  const onNext = () => {
    if (!bio || !avatarUrl || !activityLevel) {
      renderToast("Missing Fields", "Please complete all fields", "error")
      return
    }
    savePublic.mutate({
      bio,
      avatar_url: avatarUrl,
      activity_level: activityLevel,
    })
  }

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($screenContentContainer)}
    >
      <Text text="Public Information" preset="heading" style={{ marginBottom: spacing.lg }} />

      <TouchableOpacity onPress={pickAvatar} style={themed($avatarWrapper)}>
        {avatarUrl ? (
          <AutoImage source={{ uri: avatarUrl }} style={themed($avatar)} />
        ) : (
          <View style={themed($avatarPlaceholder)}>
            <Text text="Add Avatar" style={themed($avatarText)} />
          </View>
        )}
      </TouchableOpacity>

      <TextField
        label="Bio"
        placeholder="Tell us about yourself"
        value={bio}
        onChangeText={setBio}
        multiline
        containerStyle={{ marginBottom: spacing.md }}
      />

      <Text style={themed($fieldLabel)}>Activity Level</Text>
      <Dropdown
        data={activityLevelOptions}
        labelField="label"
        valueField="value"
        placeholder="Activity Level"
        value={activityLevel}
        onChange={(item) => setActivityLevel(item.value as ActivityLevel)}
        containerStyle={{ marginBottom: spacing.lg }}
        style={themed($dropdown)}
        placeholderStyle={{ color: colors.textDim }}
        selectedTextStyle={{ color: colors.text }}
      />

      <Button
        text="Next"
        onPress={onNext}
        style={{ marginBottom: spacing.sm, borderRadius: 120 }}
      />

      <Button
        text="Back"
        onPress={() => navigation.navigate("Preferences")}
        style={{ marginBottom: spacing.lg, borderRadius: 120 }}
      />
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

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "center",
  marginBottom: spacing.lg,
})

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: 100,
  height: 100,
  borderRadius: 50,
})

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.border,
  justifyContent: "center",
  alignItems: "center",
})

const $avatarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: spacing.md,
  height: 48,
  marginBottom: spacing.md,
})