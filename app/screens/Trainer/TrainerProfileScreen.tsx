import { AutoImage, Button, Card, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api, WorkoutPlan } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseISO } from "date-fns/parseISO"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import {
  Dimensions,
  FlatList,
  ImageStyle,
  RefreshControl,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

import { formatSpecialization, Trainer } from "./ListTrainersScreen"
import { AppAnnouncement } from "./TrainerScreen"

interface TrainerProfileScreenProps extends AppStackScreenProps<"TrainerProfile"> {}

const screenWidth = Dimensions.get("window").width

export const TrainerProfileScreen: FC<TrainerProfileScreenProps> = observer(
  function TrainerProfileScreen(_props) {
    const { navigation } = _props

    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      authenticationStore: { userID },
    } = useStores()

    const queryClient = useQueryClient()
    const trainerID = _props.route.params.trainerID

    const {
      data: trainerData,
      isLoading: trainerLoading,
      isError: trainerIsError,
      error: trainerError,
    } = useQuery({
      queryKey: ["trainer", trainerID],
      queryFn: async () => {
        const response = await api.getTrainerByID(trainerID)

        const followResponse = await api.getTrainerIsFollowedByUser(trainerID, userID)

        if (response.ok && response.data) {
          return {
            ...response.data,
            id: response.data.user_id,
            first_name: "",
            last_name: "",
            avatar_url: "",
            isFollowed: followResponse.ok && followResponse.data?.followed,
          }
        } else {
          throw new Error("Failed Fetching Trainer Data")
        }
      },
    })

    const {
      data: profileData,
      isLoading: profileLoading,
      isError: profileIsError,
      error: profileError,
    } = useQuery({
      queryKey: ["profile", trainerID],
      queryFn: async () => {
        const response = await api.getProfileByID(trainerID)

        if (response.ok && response.data) {
          return response.data
        } else {
          throw new Error("Failed Fetching Profile Data")
        }
      },
    })

    const {
      data: workoutPlanData,
      isLoading: workoutPlanLoading,
      isError: workoutPlanIsError,
      error: workoutPlanError,
      isFetching: isFetchingWorkoutPlans,
      refetch: refetchWorkoutPlans,
    } = useQuery({
      queryKey: ["workout-plans", trainerID],
      queryFn: async () => {
        const response = await api.getAllUserWorkoutPlans(trainerID)

        if (response.ok && response.data) {
          return response.data
        } else {
          throw new Error("Failed Fetching Workout Plans")
        }
      },
    })

    const {
      data: announcementData = [],
      isLoading: announcementLoading,
      isError: announcementIsError,
      error: announcementError,
      isFetching: isFetchingAnnouncements,
      refetch: refetchAnnouncements,
    } = useQuery({
      queryKey: ["announcements", trainerID],
      queryFn: async () => {
        const response = await api.getAllTrainerAnnouncements(trainerID)

        if (response.ok && response.data) {
          let firstName = "Unknown"
          let lastName = "Trainer"
          let avatar_url = ""

          if (profileData) {
            firstName = profileData.first_name || firstName
            lastName = profileData.last_name || lastName
            avatar_url = profileData.avatar_url || avatar_url
          }

          return response.data.map(
            (announcement): AppAnnouncement => ({
              id: announcement.announcement_id,
              title: announcement.title,
              content: announcement.content,
              created_at: parseISO(announcement.created_at),
              trainer: {
                id: announcement.trainer_id,
                user_id: announcement.trainer_id,
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatar_url,
              },
            }),
          )
        } else {
          throw new Error("Failed Fetching Announcements")
        }
      },
    })

    const followMutation = useMutation({
      mutationFn: async (trainerID: string) => {
        const response = await api.followTrainer(trainerID, userID)
        if (!response.ok) {
          throw new Error("Failed to follow trainer")
        }
      },
      onSuccess: () => {
        renderToast("Success", "Trainer Followed Successfully", "success")
        queryClient.invalidateQueries({ queryKey: ["trainers", userID] })
        queryClient.invalidateQueries({ queryKey: ["trainerProfile", trainerID] })
      },
      onError: (error) => {
        console.error("Error Following Trainer:", error)
        renderToast("Error", "Failed Following User", "error")
      },
    })

    const unfollowMutation = useMutation({
      mutationFn: async (trainerID: string) => {
        const response = await api.unfollowTrainer(trainerID, userID)
        if (!response.ok) {
          throw new Error("Failed to unfollow trainer")
        }
        return response.data
      },
      onSuccess: () => {
        renderToast("Success", "Trainer Unfollowed Successfully", "success")
        queryClient.invalidateQueries({ queryKey: ["trainers", userID] })
        queryClient.invalidateQueries({ queryKey: ["trainerProfile", trainerID] })
      },
      onError: (error) => {
        console.error("Error Unfollowing Trainer:", error)
        renderToast("Error", "Failed Unfollowing User", "error")
      },
    })

    const handleFollowToggle = (trainer: Trainer | undefined) => {
      if (!trainer) {
        console.error("[TrainerProfile] Trainer Data Unavailable: ", trainerData)
        renderToast("Error", "Trainer Data Unavailable To Follow", "error")
        return
      }

      if (trainer.isFollowed) {
        unfollowMutation.mutate(trainer.id)
      } else {
        followMutation.mutate(trainer.id)
      }
    }

    const renderAnnouncementCard = ({ item }: { item: AppAnnouncement }) => {
      const firstInitial = item.trainer.first_name ? item.trainer.first_name[0].toUpperCase() : ""
      const lastInitial = item.trainer.last_name ? item.trainer.last_name[0].toUpperCase() : ""
      const initials = `${firstInitial}${lastInitial}`

      const cardContent = (
        <View>
          <View style={themed($cardHeader)}>
            <TouchableOpacity style={themed($avatarContainer)}>
              {item.trainer.avatar_url ? (
                <AutoImage
                  source={{ uri: item.trainer.avatar_url }}
                  style={themed($avatar)}
                  resizeMode="cover"
                />
              ) : (
                <View style={themed($avatarPlaceholder)}>
                  <Text text={initials} style={themed($avatarInitials)} />
                </View>
              )}
              <View style={$trainerInfo}>
                <Text text={item.created_at?.toDateString()} style={themed($timestamp)} />
              </View>
            </TouchableOpacity>
          </View>
          <Text
            text={item.title || "No Title"}
            preset="subheading"
            style={[themed($trainerName), { marginVertical: spacing.xs }]}
          />
          <Text text={item.content || "No Content"} style={themed($announcementContent)} />
        </View>
      )

      return <Card style={themed($announcementCard)} ContentComponent={cardContent} />
    }

    const renderWorkoutPlanCard = ({ item }: { item: WorkoutPlan }) => {
      const cardContent = (
        <View>
          <View>
            <Text
              text={item.name || "No Title"}
              preset="subheading"
              style={[themed($trainerName), { marginVertical: spacing.xs }]}
            />
            <Text text={`Difficulty: ${item.difficulty}`} style={themed($planDetail)} />
            <Text text={`Goal: ${item.goal}`} style={themed($planDetail)} />
          </View>
        </View>
      )

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("ViewWorkoutPlan", { planID: item.plan_id || "" })}
        >
          <Card style={themed($workoutPlanCard)} ContentComponent={cardContent} />
        </TouchableOpacity>
      )
    }

    if (
      trainerLoading ||
      profileLoading ||
      announcementLoading ||
      workoutPlanLoading ||
      followMutation.isPending ||
      unfollowMutation.isPending
    ) {
      return <Loading />
    }

    if (trainerIsError || profileIsError || announcementIsError || workoutPlanIsError) {
      console.error("[Error] Trainer: ", trainerError)
      console.error("[Error] Profile: ", profileError)
      console.error("[Error] Announcement: ", announcementError)
      console.error("[Error] Workout Plan: ", workoutPlanError)
      return (
        <ErrorScreen
          title="Error Loading Trainer"
          message="There was an error loading the trainer profile. Please try again later."
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen
        style={$root}
        preset="fixed"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <ScrollView
          style={$scrollViewStyle}
          contentContainerStyle={themed($scrollViewContentContainer)}
          refreshControl={
            <RefreshControl
              refreshing={isFetchingWorkoutPlans || isFetchingAnnouncements}
              onRefresh={() => {
                refetchWorkoutPlans()
                refetchAnnouncements()
              }}
            />
          }
        >
          <View style={themed($headerContainer)}>
            <Text text="Trainer" preset="heading" />
            <Button
              text={trainerData?.isFollowed ? "Unfollow" : "Follow"}
              preset="filled"
              onPress={() => handleFollowToggle(trainerData)}
              style={themed($followButton)}
              LeftAccessory={() => (
                <Ionicons
                  name="person"
                  color={colors.palette.secondary400}
                  size={20}
                  style={{ paddingRight: 5 }}
                />
              )}
            />
          </View>

          {profileData && trainerData && (
            <View style={themed($profileSectionContainer)}>
              <View style={themed($profileHeader)}>
                {profileData.avatar_url ? (
                  <AutoImage
                    source={{ uri: profileData.avatar_url }}
                    style={themed($profileAvatar)}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={themed($profileAvatarPlaceholder)}>
                    <Text
                      text={`${profileData.first_name ? profileData.first_name[0] : ""}${
                        profileData.last_name ? profileData.last_name[0] : ""
                      }`}
                      style={themed($profileAvatarInitials)}
                    />
                  </View>
                )}
                <View style={$profileInfo}>
                  <Text
                    text={`${profileData.first_name || ""} ${profileData.last_name || ""}`}
                    preset="subheading"
                    style={themed($profileName)}
                  />
                  {trainerData.specialization && (
                    <Text
                      text={`Specialty: ${formatSpecialization(trainerData.specialization)}`}
                      style={themed($profileDetail)}
                    />
                  )}
                </View>
              </View>
              {profileData.bio && <Text text={profileData.bio} style={themed($profileBio)} />}
            </View>
          )}

          <View style={themed($sectionHeaderContainer)}>
            <Text preset="subheading" text="Workout Plans" style={themed($sectionHeaderText)} />
          </View>

          <FlatList
            data={workoutPlanData}
            renderItem={renderWorkoutPlanCard}
            keyExtractor={(item: WorkoutPlan, index: number) => {
              if (item.plan_id !== null && item.plan_id !== undefined) {
                return String(item.plan_id)
              }

              console.warn(`[FlatList] ${index} Is Invalid`)
              return `workout-plan-${index}`
            }}
            contentContainerStyle={themed($listContentContainer)}
            ListEmptyComponent={
              <View style={themed($emptyStateContainer)}>
                <Text text="No Workout Plans Available" style={themed($emptyStateText)} />
              </View>
            }
            scrollEnabled={true}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />

          <View style={themed($sectionHeaderContainer)}>
            <Text preset="subheading" text="Announcements" style={themed($sectionHeaderText)} />
          </View>

          <FlatList
            data={announcementData}
            renderItem={renderAnnouncementCard}
            keyExtractor={(item: AppAnnouncement, index: number) => {
              if (item.id !== null && item.id !== undefined) {
                return String(item.id)
              }

              console.warn(`[FlatList] ${index} Is Invalid`)
              return `announcement-${index}`
            }}
            contentContainerStyle={themed($listContentContainer)}
            ListEmptyComponent={
              <View style={themed($emptyStateContainer)}>
                <Text text="No Announcements Posted" style={themed($emptyStateText)} />
              </View>
            }
            scrollEnabled={false}
          />
        </ScrollView>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $scrollViewStyle: ViewStyle = {
  flex: 1,
}

const $scrollViewContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $sectionHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $sectionHeaderText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "bold",
  color: colors.text,
})

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.1)",
})

const $followButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $announcementCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 8,
  elevation: 3,
})

const $cardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $avatarContainer: ThemedStyle<ViewStyle> = ({}) => ({
  flexDirection: "row",
  alignItems: "center",
})

const $avatar: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
}

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 10,
})

const $avatarInitials: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.text,
})

const $trainerInfo: ViewStyle = {
  justifyContent: "center",
}

const $trainerName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: "bold",
  color: colors.text,
})

const $timestamp: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $announcementContent: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  color: colors.text,
  lineHeight: 20,
})

const $emptyStateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
  marginTop: spacing.xxl,
})

const $emptyStateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  fontSize: 16,
})

const $profileSectionContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  marginBottom: spacing.md,
})

const $profileHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $profileAvatar: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginRight: 15,
}

const $profileAvatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 15,
})

const $profileAvatarInitials: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.text,
})

const $profileInfo: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $profileName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: "bold",
  fontSize: 18,
  color: colors.text,
  marginBottom: 4,
})

const $profileDetail: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $profileBio: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.text,
  marginTop: spacing.sm,
  lineHeight: 20,
})

const $workoutPlanCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: screenWidth * 0.75,
  marginRight: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 8,
  elevation: 2,
  maxWidth: 170,
})

const $planDetail: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  fontStyle: "italic",
})
