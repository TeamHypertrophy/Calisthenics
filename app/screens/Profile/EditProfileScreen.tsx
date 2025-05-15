import type { ThemedStyle } from "@/theme"

import { AutoImage, Button, Screen, Switch, Text, TextField } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { Loading } from "@/components/Loader"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import {
  ActivityLevel,
  Diet,
  FitnessGoal,
  Gender,
  PreferredHeight,
  PreferredWeight,
  Profile,
  api,
} from "@/services/api"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { AntDesign } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiResponse } from "apisauce"
import * as ImagePicker from "expo-image-picker"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { Modalize } from "react-native-modalize"
import { useIsConnected } from "react-native-offline"

interface EditProfileScreenProps extends AppStackScreenProps<"EditProfile"> {}

export const EditProfileScreen: FC<EditProfileScreenProps> = observer(
  function EditProfileScreen(_props) {
    const { navigation } = _props

    const {
      profileStore: { getProfile, updateProfile, updateAvatarUrl },
      authenticationStore: { userID },
    } = useStores()

    const [isFocus, setIsFocus] = useState(false)

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

    const modalizeRef = useRef<Modalize>(null)

    const isConnected = useIsConnected()
    const isOffline = !isConnected

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const queryClient = useQueryClient()
    const {
      data: profile,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["profile", userID],
      queryFn: () => getProfile(),
    })

    const saveMutation = useMutation({
      mutationFn: (updates: Partial<Profile>) => updateProfile(updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile", userID] })
        renderToast("Profile Updated", "Your profile has been saved", "success")
        navigation.goBack()
      },
      onError: () => renderToast("Error", "Failed to save profile", "error"),
    })

    const uploadAvatarMutation = useMutation<
      ApiResponse<Profile>,
      Error,
      ImagePicker.ImagePickerAsset
    >({
      mutationFn: async (file) => await api.uploadAvatar(file),
      onSuccess: (res) => {
        if (res.ok && res.data) {
          const data = res.data

          onChange("avatar_url", data.avatar_url)
          updateAvatarUrl(data.avatar_url)

          queryClient.setQueryData<Profile>(["profile", userID], (old) =>
            old ? { ...old, avatar_url: data.avatar_url } : old,
          )

          renderToast("Avatar Uploaded", "Your avatar has been uploaded successfully", "success")
          navigation.goBack()
        } else {
          renderToast("Error Uploading Avatar", "Failed to upload avatar", "error")
        }
      },
      onError: () => renderToast("Error Uploading Avatar", "Failed to upload avatar", "error"),
    })

    const [form, setForm] = useState<Partial<Profile>>({})

    useEffect(() => {
      if (profile)
        setForm({
          first_name: profile.first_name,
          last_name: profile.last_name,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          gender: profile.gender,
          bio: profile.bio,
          public: profile.public,
          activity_level: profile.activity_level,
          fitness_goal: profile.fitness_goal,
          diet: profile.diet,
          preferred_weight_unit: profile.preferred_weight_unit,
          preferred_height_unit: profile.preferred_height_unit,
          avatar_url: profile.avatar_url,
        })
    }, [profile])

    const handleAvatarSelection = async () => {
      if (isUploadingAvatar) return

      modalizeRef.current?.open()
    }

    const pickImageFromCamera = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()

      if (cameraStatus !== "granted") {
        renderToast(
          "Permissions Required",
          "Camera permissions are required to take a photo",
          "error",
        )
      }

      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        })

        if (!result.canceled) {
          setIsUploadingAvatar(true)
          uploadAvatarMutation.mutate(result.assets[0])
        }
      } catch (error) {
        console.error("Error picking image from camera:", error)
        renderToast("Error Picking Image", "Failed to pick image from camera", "error")
      }
    }

    const pickImageFromGallery = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        })

        if (!result.canceled) {
          setIsUploadingAvatar(true)
          uploadAvatarMutation.mutate(result.assets[0])
        }
      } catch (error) {
        console.error("Error picking image from gallery:", error)
        renderToast("Error Picking Image", "Failed to pick image from gallery", "error")
      }
    }

    const onChange = <K extends keyof Profile>(key: K, value: Profile[K]) => {
      setForm((curr) => ({ ...curr, [key]: value }))
    }

    const saveProfile = () => {
      saveMutation.mutate(form)
    }

    const weightUnitOptions = [
      { label: "Kilograms (kg)", value: "Kg" },
      { label: "Pounds (lbs)", value: "Lbs" },
    ]

    const heightUnitOptions = [
      { label: "Centimeters (cm)", value: "cm" },
      { label: "Inches (in)", value: "in" },
    ]

    const activityLevelOptions = [
      { label: "Light", value: "light" },
      { label: "Moderate", value: "moderate" },
      { label: "Very", value: "very" },
      { label: "Extremely", value: "extremely" },
    ]

    const fitnessGoalOptions = [
      { label: "Weight Loss", value: "weight_loss" },
      { label: "Muscle Gain", value: "muscle_gain" },
      { label: "Endurance", value: "endurance" },
      { label: "Strength", value: "strength" },
      { label: "Maintenance", value: "maintenance" },
    ]

    const dietOptions = [
      { label: "Anything", value: "anything" },
      { label: "Vegetarian", value: "vegetarian" },
      { label: "Vegan", value: "vegan" },
      { label: "Keto", value: "keto" },
    ]

    const genderOptions = [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ]

    if (isLoading) return <Loading />

    if (saveMutation.isPending) return <Loading />

    if (isError || !profile) {
      return (
        <ErrorScreen
          title="Error Loading Profile"
          message="There was an error loading your profile. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <>
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <Text text="Profile" preset="heading" />

          {isOffline && (
            <View style={themed($offlineMessage)}>
              <Text
                text="You're currently offline. Profile editing is disabled."
                style={themed($offlineMessageText)}
              />
            </View>
          )}

          <View style={themed($formContainer)}>
            <Text text="Personal Information" preset="subheading" style={themed($sectionTitle)} />

            <View style={themed($avatarContainer)}>
              <TouchableOpacity
                style={themed($avatarWrapper)}
                onPress={handleAvatarSelection}
                disabled={isUploadingAvatar || isOffline}
              >
                {isUploadingAvatar ? (
                  <View style={themed($avatarLoading)}>
                    <ActivityIndicator size="small" color={colors.palette.primary500} />
                  </View>
                ) : form.avatar_url ? (
                  <AutoImage
                    source={{ uri: form.avatar_url }}
                    style={themed($avatar)}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={themed($avatarPlaceholder)}>
                    <Text
                      text={`${form.first_name?.charAt(0) || ""}${form.last_name?.charAt(0) || ""}`}
                      style={themed($avatarInitials)}
                    />
                  </View>
                )}
                <View style={themed($editIconContainer)}>
                  <AntDesign name="camera" size={18} color={colors.palette.neutral100} />
                </View>
              </TouchableOpacity>
              <Text text="Edit Profile Photo" style={themed($avatarHelperText)} />
            </View>

            <TextField
              label="First Name"
              value={form.first_name}
              onChangeText={(v) => onChange("first_name", v)}
              containerStyle={themed($textField)}
              editable={!isOffline}
              status={isOffline ? "disabled" : undefined}
            />

            <TextField
              label="Last Name"
              value={form.last_name}
              onChangeText={(v) => onChange("last_name", v)}
              containerStyle={themed($textField)}
              editable={!isOffline}
              status={isOffline ? "disabled" : undefined}
            />

            <TextField
              label="Age"
              value={form.age?.toString()}
              onChangeText={(v) => onChange("age", Number(v))}
              containerStyle={themed($textField)}
              keyboardType="numeric"
              editable={!isOffline}
              status={isOffline ? "disabled" : undefined}
            />

            <TextField
              label="Bio"
              value={form.bio}
              onChangeText={(v) => onChange("bio", v)}
              containerStyle={themed($bioTextField)}
              multiline={true}
              numberOfLines={4}
              style={$bioInput}
              maxLength={500}
              editable={!isOffline}
              status={isOffline ? "disabled" : undefined}
            />

            <View style={themed($row)}>
              <TextField
                label={`Weight (${form.preferred_weight_unit})`}
                value={form.weight?.toString()}
                onChangeText={(v) => onChange("weight", Number(v))}
                containerStyle={[themed($textField), $halfWidth]}
                keyboardType="decimal-pad"
                editable={!isOffline}
                status={isOffline ? "disabled" : undefined}
              />

              <TextField
                label={`Height (${form.preferred_height_unit})`}
                value={form.height?.toString()}
                onChangeText={(v) => onChange("height", Number(v))}
                containerStyle={[themed($textField), $halfWidth]}
                keyboardType="decimal-pad"
                editable={!isOffline}
                status={isOffline ? "disabled" : undefined}
              />
            </View>

            <Text style={themed($fieldLabel)}>Gender</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={genderOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.gender}
              value={form.gender}
              onChange={(item) => {
                onChange("gender", item.value as Gender)
              }}
              disable={isOffline}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="user"
                  size={20}
                />
              )}
            />

            <Text text="Preferences" preset="subheading" style={themed($sectionTitle)} />

            {/* Weight Unit Dropdown */}
            <Text style={themed($fieldLabel)}>Preferred Weight Unit</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={weightUnitOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.preferred_weight_unit}
              value={form.preferred_weight_unit}
              disable={isOffline}
              onChange={(item) => {
                onChange("preferred_weight_unit", item.value as PreferredWeight)
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="filter"
                  size={20}
                />
              )}
            />

            {/* Height Unit Dropdown */}
            <Text style={themed($fieldLabel)}>Preferred Height Unit</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={heightUnitOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.preferred_height_unit}
              value={form.preferred_height_unit}
              disable={isOffline}
              onChange={(item) => {
                onChange("preferred_height_unit", item.value as PreferredHeight)
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="filter"
                  size={20}
                />
              )}
            />

            {/* Activity Level Dropdown */}
            <Text style={themed($fieldLabel)}>Activity Level</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={activityLevelOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.activity_level}
              value={form.activity_level}
              disable={isOffline}
              onChange={(item) => {
                onChange("activity_level", item.value as ActivityLevel)
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="heart"
                  size={20}
                />
              )}
            />

            {/* Fitness Goal Dropdown */}
            <Text style={themed($fieldLabel)}>Fitness Goal</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={fitnessGoalOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.fitness_goal}
              value={form.fitness_goal}
              disable={isOffline}
              onChange={(item) => {
                onChange("fitness_goal", item.value as FitnessGoal)
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="barchart"
                  size={20}
                />
              )}
            />

            {/* Diet Dropdown */}
            <Text style={themed($fieldLabel)}>Dietary Preference</Text>
            <Dropdown
              style={themed($dropdown)}
              placeholderStyle={themed($placeholderStyle)}
              selectedTextStyle={themed($selectedTextStyle)}
              itemContainerStyle={themed($itemContainerStyle)}
              itemTextStyle={themed($itemTextStyle)}
              data={dietOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={form.diet}
              value={form.diet}
              disable={isOffline}
              onChange={(item) => {
                onChange("diet", item.value as Diet)
              }}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              renderLeftIcon={() => (
                <AntDesign
                  style={{ marginRight: 10 }}
                  color={isFocus ? "white" : "black"}
                  name="bells"
                  size={20}
                />
              )}
            />

            <Text text="Privacy" preset="subheading" style={themed($sectionTitle)} />
            <View style={themed($toggleContainer)}>
              <Text text="Public Profile" style={themed($toggleLabel)} />
              <Switch value={form.public} onValueChange={(v) => onChange("public", v)} />
            </View>

            <Button
              text={isOffline ? "Offline - Can't Save" : "Save Changes"}
              style={themed($saveButton)}
              preset="filled"
              disabled={isOffline}
              onPress={saveProfile}
            />
          </View>
        </Screen>

        <Modalize
          ref={modalizeRef}
          adjustToContentHeight
          handleStyle={{ width: 60 }}
          modalStyle={themed($modalStyle)}
        >
          <View style={themed($modalContent)}>
            <Text preset="heading" text="Choose Avatar" style={themed($modalTitle)} />

            <TouchableOpacity
              style={themed($modalOption)}
              onPress={() => {
                modalizeRef.current?.close()
                pickImageFromCamera()
              }}
            >
              <View style={themed($modalIconContainer)}>
                <AntDesign name="camera" size={24} color={colors.palette.primary500} />
              </View>
              <View style={$modalTextContainer}>
                <Text text="Take Photo" preset="subheading" style={themed($modalOptionTitle)} />
                <Text
                  text="Use your camera to take a new photo"
                  style={themed($modalOptionSubtitle)}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={themed($modalOption)}
              onPress={() => {
                modalizeRef.current?.close()
                pickImageFromGallery()
              }}
            >
              <View style={themed($modalIconContainer)}>
                <AntDesign name="picture" size={24} color={colors.palette.primary500} />
              </View>
              <View style={$modalTextContainer}>
                <Text
                  text="Choose from Library"
                  preset="subheading"
                  style={themed($modalOptionTitle)}
                />
                <Text
                  text="Select a photo from your gallery"
                  style={themed($modalOptionSubtitle)}
                />
              </View>
            </TouchableOpacity>

            <Button
              text="Cancel"
              style={themed($modalCancelButton)}
              onPress={() => modalizeRef.current?.close()}
            />
          </View>
        </Modalize>
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $modalStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
})

const $modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.lg,
})

const $modalOption: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
})

const $modalIconContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
})

const $modalTextContainer: ViewStyle = {
  flex: 1,
}

const $modalOptionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $modalOptionSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $modalCancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
})

const $avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.md,
  marginBottom: spacing.lg,
})

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "relative",
})

const $avatar: ImageStyle = {
  width: 120,
  height: 120,
  borderRadius: 60,
}

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: colors.palette.primary200,
  justifyContent: "center",
  alignItems: "center",
})

const $avatarInitials: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 40,
  fontWeight: "bold",
  color: colors.palette.primary500,
})

const $avatarLoading: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
})

const $editIconContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: colors.palette.primary500,
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 3,
  borderColor: colors.background,
})

const $avatarHelperText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  color: colors.palette.primary500,
  fontSize: 14,
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $row: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
})

const $halfWidth: ViewStyle = {
  width: "48%",
}

const $toggleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginVertical: spacing.md,
})

const $toggleLabel: ThemedStyle<TextStyle> = () => ({})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
  borderRadius: 8,
  backgroundColor: colors.palette.primary500,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 50,
  borderColor: colors.palette.neutral400,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  marginBottom: spacing.md,
  backgroundColor: colors.background,
})

const $placeholderStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

const $selectedTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
})

const $bioTextField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $bioInput: TextStyle = {
  minHeight: 100,
  textAlignVertical: "top",
  paddingTop: 5,
}

const $itemContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 5,
  backgroundColor: colors.palette.neutral500,
})

const $itemTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.background,
})

const $offlineMessage: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.angry100,
  padding: spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.md,
})

const $offlineMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.angry500,
  textAlign: "center",
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginVertical: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  marginTop: spacing.md,
})
