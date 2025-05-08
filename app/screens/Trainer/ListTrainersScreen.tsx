import { AutoImage, Button, Card, Icon, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { AppStackScreenProps } from "@/navigators"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { renderToast } from "@/utils/toastNotification"
import { useAppTheme } from "@/utils/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { observer } from "mobx-react-lite"
import { FC, useMemo } from "react"
import { ActivityIndicator, FlatList, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

export interface Trainer {
  id: string
  first_name: string
  last_name: string
  specialization?: string
  avatar_url?: string
  isFollowed?: boolean
}

export const formatSpecialization = (specialization: string) => {
  if (specialization === "WeightLoss") return "Weight Loss"
  if (specialization === "MuscleGain") return "Muscle Gain"
  return specialization
}

interface ListTrainersScreenProps extends AppStackScreenProps<"ListTrainers"> {}

export const ListTrainersScreen: FC<ListTrainersScreenProps> = observer(
  function ListTrainersScreen(_props) {
    const { navigation } = _props

    const {
      authenticationStore: { userID },
    } = useStores()
    const queryClient = useQueryClient()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    const {
      data: trainers = [],
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
    } = useQuery({
      queryKey: ["trainers", userID],
      queryFn: async () => {
        const response = await api.getAllTrainers()

        if (!response.ok || !response.data) {
          throw new Error("Failed Fetching Trainers")
        }

        const trainers = await Promise.all(
          response.data.map(async (trainer) => {
            try {
              const followResponse = await api.getTrainerIsFollowedByUser(trainer.user_id, userID)
              const profileResponse = await api.getProfileByID(trainer.user_id)

              return {
                ...trainer,
                id: trainer.user_id,
                first_name: profileResponse.data?.first_name ?? "Unknown",
                last_name: profileResponse.data?.last_name ?? "Trainer",
                avatar_url: profileResponse.data?.avatar_url,
                isFollowed: followResponse.ok && followResponse.data?.followed,
              }
            } catch (error) {
              console.log("Error Fetching Trainer Details:", error)
              throw new Error("Failed Fetching Trainer Details")
            }
          }),
        )
        return trainers
      },
    })

    const sortedTrainers = useMemo(() => {
      if (!trainers) return []
      return [...trainers].sort((a, b) => {
        if (a.isFollowed && !b.isFollowed) return -1
        if (!a.isFollowed && b.isFollowed) return 1
        return 0
      })
    }, [trainers])

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
        refetch()
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
        refetch()
      },
      onError: (error) => {
        console.error("Error Unfollowing Trainer:", error)
        renderToast("Error", "Failed Unfollowing User", "error")
      },
    })

    const handleFollowToggle = (trainer: Trainer) => {
      if (trainer.isFollowed) {
        unfollowMutation.mutate(trainer.id)
      } else {
        followMutation.mutate(trainer.id)
      }
    }

    const navigateToTrainerProfile = (trainerID: string) => {
      navigation.navigate("TrainerProfile", {
        trainerID,
      })
    }

    const navigateToTrainerStatus = () => {
      navigation.navigate("TrainerStatus")
    }

    const renderTrainerItem = ({ item }: { item: Trainer }) => {
      const initials =
        `${item.first_name ? item.first_name[0] : ""}${item.last_name ? item.last_name[0] : ""}`.toUpperCase()

      const isMutating =
        (followMutation.variables === item.id && followMutation.isPending) ||
        (unfollowMutation.variables === item.id && unfollowMutation.isPending)

      const cardContent = (
        <View style={themed($trainerItemContainer)}>
          {item.avatar_url ? (
            <AutoImage source={{ uri: item.avatar_url }} style={$avatar} />
          ) : (
            <View style={themed($avatarPlaceholder)}>
              <Text text={initials} style={themed($avatarInitials)} />
            </View>
          )}
          <View style={$trainerInfo}>
            <Text
              text={`${item.first_name} ${item.last_name}`}
              preset="subheading"
              style={themed($trainerName)}
            />
            {item.specialization && (
              <Text
                text={formatSpecialization(item.specialization)}
                style={themed($trainerSpecialization)}
              />
            )}
          </View>
          <View style={$actionContainer}>
            {isMutating ? (
              <ActivityIndicator size="small" color={colors.tint} />
            ) : (
              <Button
                text={item.isFollowed ? "Unfollow" : "Follow"}
                preset="filled"
                style={themed($followButton)}
                textStyle={themed(item.isFollowed ? $unfollowButtonText : $followButtonText)}
                onPress={() => handleFollowToggle(item)}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              />
            )}
          </View>
        </View>
      )

      return (
        <Card
          style={themed($trainerCard)}
          onPress={() => navigateToTrainerProfile(item.id)}
          ContentComponent={cardContent}
        />
      )
    }

    if (isLoading) return <Loading />

    if (isError) {
      return (
        <ErrorScreen
          message="Error Fetching Trainers"
          title="Error"
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
        <View style={themed($headerContainer)}>
          <Text text="Trainers" preset="heading" />
          <Button
            text="Status"
            preset="filled"
            onPress={navigateToTrainerStatus}
            style={themed($headerButton)}
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

        <FlatList
          data={sortedTrainers}
          renderItem={renderTrainerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themed($listContentContainer)}
          ListEmptyComponent={
            <View style={themed($emptyStateContainer)}>
              <Text text="No Trainers Found." style={themed($emptyStateText)} />
            </View>
          }
          onRefresh={refetch}
          refreshing={isFetching}
        />
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

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.1)",
})

const $headerButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $listContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $trainerCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  elevation: 3,
})

const $trainerItemContainer: ThemedStyle<ViewStyle> = ({}) => ({
  flexDirection: "row",
  alignItems: "center",
})

const $avatar: ImageStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 12,
}

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
})

const $avatarInitials: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral800,
  fontSize: 18,
  fontWeight: "bold",
})

const $trainerInfo: ViewStyle = {
  flex: 1,
}

const $trainerName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  marginBottom: 2,
})

const $trainerSpecialization: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 13,
})

const $actionContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $followButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  minHeight: 36,
  marginLeft: spacing.sm,
  borderRadius: 120,
  backgroundColor: colors.palette.primary500,
})

const $followButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.secondary400,
})

const $unfollowButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.secondary400,
})

const $emptyStateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.md,
  minHeight: 200,
})

const $emptyStateText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  fontSize: 16,
})
