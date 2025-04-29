import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ScrollView, TextStyle, View, ViewStyle, ImageStyle } from "react-native"
import { AutoImage, Button, Card, Screen, Text, Icon } from "@/components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { useStores } from "@/models"
import { api } from "@/services/api"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { Loading } from "@/components/Loader"
import { ErrorScreen } from "@/components/ErrorScreen"

export const ProfileScreen: FC<HomeTabScreenProps<"Profile">> = observer(
  function ViewProfileScreen(props) {
    const { navigation } = props

    const {
      profileStore,
      authenticationStore: { userID },
    } = useStores()

    const { profileID } = props.route.params ? props.route.params : { profileID: userID }

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      isFetching,
      isError,
      data: profile,
    } = useQuery({
      queryKey: ["profile", profileID],
      queryFn: async () => {
        if (profileID === userID) {
          return await profileStore.getProfile()
        }

        const res = await api.getProfileByID(profileID)

        if (res.ok && res.data) {
          return res.data
        } else {
          throw new Error("Failed to load profile")
        }
      },
      staleTime: 1000 * 60 * 5,
      initialData: () => (profileID === userID ? profileStore.getProfile() : null),
    })

    const isOwnProfile = profileID === userID
    const canViewProfile = isOwnProfile || (profile?.public ?? false)

    const navigateToEditProfile = () => {
      navigation.navigate("EditProfile")
    }

    // Helper functions to format data for display
    function formatActivityLevel(level: string): string {
      const mapping: Record<string, string> = {
        light: "Light",
        moderate: "Moderate",
        very: "Very Active",
        extremely: "Extremely Active",
      }
      return mapping[level] || level
    }

    function formatFitnessGoal(goal: string): string {
      const mapping: Record<string, string> = {
        WeightLoss: "Weight Loss",
        MuscleGain: "Muscle Gain",
        Endurance: "Endurance",
        Strength: "Strength",
        Maintenance: "Maintenance",
      }
      return mapping[goal] || goal
    }

    function formatDiet(diet: string): string {
      const mapping: Record<string, string> = {
        Anything: "No Restrictions",
        Vegetarian: "Vegetarian",
        Vegan: "Vegan",
        Keto: "Keto",
      }
      return mapping[diet] || diet
    }

    if (isFetching) return <Loading />

    if (isError || !profile) {
      return (
        <ErrorScreen
          title="Profile"
          message="There was an error loading this profile."
          onBack={() => navigation.goBack()}
        />
      )
    }

    if (!canViewProfile) {
      return (
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <Text text="Profile" preset="heading" />
          <View style={themed($errorContainer)}>
            <MaterialIcons name="privacy-tip" size={60} color={colors.palette.neutral700} />
            <Text
              text="This profile is private"
              preset="subheading"
              style={themed($privacyTitle)}
            />
            <Text
              text="The user has set this profile to private mode."
              style={themed($privacyText)}
            />
            <Button text="Go Back" onPress={() => navigation.goBack()} style={themed($button)} />
          </View>
        </Screen>
      )
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <View style={themed($headerContainer)}>
          <Text text="Profile" preset="heading" />
          {isOwnProfile && (
            <Button
              text="Edit Profile"
              onPress={navigateToEditProfile}
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
          )}
        </View>

        <ScrollView
          contentContainerStyle={themed($contentContainer)}
          showsVerticalScrollIndicator={false}
        >
          <View style={themed($profileHeader)}>
            <View style={themed($avatarContainer)}>
              {profile.avatar_url ? (
                <AutoImage
                  source={{ uri: profile.avatar_url }}
                  style={$avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={themed($avatarPlaceholder)}>
                  <Text
                    text={`${profile.first_name?.charAt(0) || ""}${profile.last_name?.charAt(0) || ""}`}
                    style={themed($avatarInitials)}
                  />
                </View>
              )}
            </View>

            <View style={themed($profileNameContainer)}>
              <Text
                text={`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"}
                preset="heading"
                style={$profileName}
              />

              {profile.streak > 0 && (
                <View style={themed($streakContainer)}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={16}
                    color={colors.palette.accent500}
                    style={$streakIcon}
                  />
                  <Text text={`${profile.streak} day streak`} style={themed($streakText)} />
                </View>
              )}

              {!profile.public && (
                <View style={themed($privateContainer)}>
                  <MaterialIcons name="privacy-tip" size={16} color={colors.palette.neutral100} />
                  <Text text="Private Profile" style={themed($privateText)} />
                </View>
              )}
            </View>
          </View>

          {profile.bio && (
            <Card
              style={themed($sectionCard)}
              ContentComponent={
                <View>
                  <Text text="Bio" preset="subheading" style={themed($sectionTitle)} />
                  <Text text={profile.bio} style={themed($bioText)} />
                </View>
              }
            />
          )}

          <Card
            style={themed($sectionCard)}
            ContentComponent={
              <View>
                <Text
                  text="Personal Information"
                  preset="subheading"
                  style={themed($sectionTitle)}
                />

                <View style={themed($infoRow)}>
                  <View style={themed($infoItem)}>
                    <AntDesign
                      name="calendar"
                      size={18}
                      color={colors.palette.primary500}
                      style={$infoIcon}
                    />
                    <View>
                      <Text text="Age" style={themed($infoLabel)} />
                      <Text text={`${profile.age || "Not specified"}`} style={themed($infoValue)} />
                    </View>
                  </View>

                  <View style={themed($infoItem)}>
                    <AntDesign
                      name="user"
                      size={18}
                      color={colors.palette.primary500}
                      style={$infoIcon}
                    />
                    <View>
                      <Text text="Gender" style={themed($infoLabel)} />
                      <Text
                        text={
                          profile.gender
                            ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                            : "Not specified"
                        }
                        style={themed($infoValue)}
                      />
                    </View>
                  </View>
                </View>

                <View style={themed($infoRow)}>
                  <View style={themed($infoItem)}>
                    <MaterialIcons
                      name="fitness-center"
                      size={18}
                      color={colors.palette.primary500}
                      style={$infoIcon}
                    />
                    <View>
                      <Text text="Weight" style={themed($infoLabel)} />
                      <Text
                        text={
                          profile.weight
                            ? `${profile.weight} ${profile.preferred_weight_unit}`
                            : "Not specified"
                        }
                        style={themed($infoValue)}
                      />
                    </View>
                  </View>

                  <View style={themed($infoItem)}>
                    <MaterialIcons
                      name="height"
                      size={18}
                      color={colors.palette.primary500}
                      style={$infoIcon}
                    />
                    <View>
                      <Text text="Height" style={themed($infoLabel)} />
                      <Text
                        text={
                          profile.height
                            ? `${profile.height} ${profile.preferred_height_unit}`
                            : "Not specified"
                        }
                        style={themed($infoValue)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            }
          />

          <Card
            style={themed($sectionCard)}
            ContentComponent={
              <View>
                <Text text="Fitness Details" preset="subheading" style={themed($sectionTitle)} />

                <View style={themed($detailItem)}>
                  <AntDesign
                    name="heart"
                    size={18}
                    color={colors.palette.primary500}
                    style={$detailIcon}
                  />
                  <View style={$detailContent}>
                    <Text text="Activity Level" style={themed($detailLabel)} />
                    <Text
                      text={
                        profile.activity_level
                          ? formatActivityLevel(profile.activity_level)
                          : "Not specified"
                      }
                      style={themed($detailValue)}
                    />
                  </View>
                </View>

                <View style={themed($detailItem)}>
                  <AntDesign
                    name="barchart"
                    size={18}
                    color={colors.palette.primary500}
                    style={$detailIcon}
                  />
                  <View style={$detailContent}>
                    <Text text="Fitness Goal" style={themed($detailLabel)} />
                    <Text
                      text={
                        profile.fitness_goal
                          ? formatFitnessGoal(profile.fitness_goal)
                          : "Not specified"
                      }
                      style={themed($detailValue)}
                    />
                  </View>
                </View>

                <View style={themed($detailItem)}>
                  <AntDesign
                    name="bells"
                    size={18}
                    color={colors.palette.primary500}
                    style={$detailIcon}
                  />
                  <View style={$detailContent}>
                    <Text text="Dietary Preference" style={themed($detailLabel)} />
                    <Text
                      text={profile.diet ? formatDiet(profile.diet) : "Not specified"}
                      style={themed($detailValue)}
                    />
                  </View>
                </View>
              </View>
            }
          />
        </ScrollView>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
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

const $profileHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $avatarContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginRight: 16,
})

const $avatar: ImageStyle = {
  width: 100,
  height: 100,
  borderRadius: 50,
}

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.palette.primary200,
  justifyContent: "center",
  alignItems: "center",
})

const $avatarInitials: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 36,
  fontWeight: "bold",
  color: colors.palette.primary500,
})

const $profileNameContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $profileName: TextStyle = {
  marginBottom: 4,
}

const $streakContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  paddingVertical: 2,
  paddingHorizontal: 8,
  alignSelf: "flex-start",
  marginTop: spacing.xs,
})

const $streakIcon: ImageStyle = {
  marginRight: 4,
}

const $streakText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.text,
})

const $privateContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral700,
  borderRadius: 12,
  paddingVertical: 2,
  paddingHorizontal: 8,
  alignSelf: "flex-start",
  marginTop: spacing.xs,
})

const $privateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.neutral100,
  marginLeft: 4,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  borderRadius: 12,
  overflow: "hidden",
  elevation: 2,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $bioText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  lineHeight: 22,
})

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
})

const $infoItem: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  width: "48%",
})

const $infoIcon: ViewStyle = {
  marginRight: 8,
}

const $infoLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $infoValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "500",
})

const $detailItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: spacing.md,
})

const $detailIcon: ViewStyle = {
  marginRight: 8,
  marginTop: 2,
}

const $detailContent: ViewStyle = {
  flex: 1,
}

const $detailLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $detailValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "500",
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  marginTop: spacing.md,
})

const $privacyTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginTop: spacing.md,
})

const $privacyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginVertical: spacing.sm,
})
