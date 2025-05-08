import { AutoImage, Button, Card, Loading, Screen, Text } from "@/components"
import { ErrorScreen } from "@/components/ErrorScreen"
import { useStores } from "@/models"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { api } from "@/services/api"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { parseISO } from "date-fns/parseISO"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { FlatList, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

export interface AppAnnouncement {
  id: string
  title: string
  content: string
  created_at: Date
  trainer: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export const TrainerScreen: FC<HomeTabScreenProps<"Trainer">> = observer(
  function TrainerScreen(_props) {
    const { navigation } = _props
    const {
      themed,
      theme: { colors, spacing },
    } = useAppTheme()

    const {
      authenticationStore: { userID },
    } = useStores()

    const {
      data: announcements = [],
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
    } = useQuery({
      queryKey: ["followedAnnouncements", userID],
      queryFn: async () => {
        const response = await api.getAnnouncementsForUser()

        if (response.ok && response.data) {
          const rawAnnouncements: any[] = response.data

          const processedAnnouncements = await Promise.all(
            rawAnnouncements.map(async (raw) => {
              let trainerID = raw.trainer_id
              let trainerFirstName = "Unknown"
              let trainerLastName = "Trainer"
              let avatar_url: string | undefined = undefined

              try {
                const [trainerResponse, profileResponse] = await Promise.all([
                  api.getTrainerByID(trainerID),
                  api.getProfileByID(trainerID),
                ])

                if (trainerResponse.ok && trainerResponse.data) {
                  trainerID = trainerResponse.data.trainer_id
                } else {
                  throw new Error("Failed Fetching Trainer Details")
                }

                if (profileResponse.ok && profileResponse.data) {
                  trainerFirstName = profileResponse.data.first_name || trainerFirstName
                  trainerLastName = profileResponse.data.last_name || trainerLastName
                  avatar_url = profileResponse.data.avatar_url
                } else {
                  throw new Error("Failed Fetching Profile Details")
                }
              } catch (error) {
                console.error("Error Fetching Details: ", error)
                throw new Error("Failed Fetching Trainer Details")
              }

              return {
                id: raw.announcement_id,
                title: raw.title,
                content: raw.content,
                created_at: parseISO(raw.created_at),
                trainer: {
                  id: trainerID,
                  first_name: trainerFirstName,
                  last_name: trainerLastName,
                  avatar_url: avatar_url,
                },
              }
            }),
          )
          return processedAnnouncements
        } else {
          throw new Error("Failed Fetching Announcements")
        }
      },
    })

    const navigateToViewTrainers = () => {
      navigation.navigate("ListTrainers")
    }

    const navigateToTrainerProfile = (trainerID: string) => {
      navigation.navigate("TrainerProfile", { trainerID })
    }

    const renderAnnouncementCard = ({ item }: { item: AppAnnouncement }) => {
      const firstInitial = item.trainer.first_name ? item.trainer.first_name[0].toUpperCase() : ""
      const lastInitial = item.trainer.last_name ? item.trainer.last_name[0].toUpperCase() : ""
      const initials = `${firstInitial}${lastInitial}`

      const cardContent = (
        <View>
          <View style={themed($cardHeader)}>
            <TouchableOpacity
              style={themed($avatarContainer)}
              onPress={() => navigateToTrainerProfile(item.trainer.id)}
            >
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
                <Text
                  text={`${item.trainer.first_name} ${item.trainer.last_name}`}
                  preset="subheading"
                  style={themed($trainerName)}
                />
                <Text text={item.created_at.toDateString()} style={themed($timestamp)} />
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

    if (isLoading) {
      return <Loading />
    }

    if (isError) {
      console.log("[Trainers] Error Loading Trainer Screen: ", error)
      return (
        <ErrorScreen
          title="Error"
          message="Could Not Load Trainer Screen"
          onBack={() => navigation.goBack()}
        />
      )
    }

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($headerContainer)}>
          <Text text="Trainers" preset="heading" />
          <Button
            text="View Trainers"
            preset="filled"
            onPress={navigateToViewTrainers}
            style={themed($viewTrainersButton)}
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
          data={announcements}
          renderItem={renderAnnouncementCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themed($listContentContainer)}
          ListEmptyComponent={
            <View style={themed($emptyStateContainer)}>
              <Text
                text="No Announcements From Followed Trainers"
                style={themed($emptyStateText)}
              />
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

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.1)",
})

const $viewTrainersButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
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
