import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { api, Gender, Profile } from "@/services/api"

/**
 * Model description here for TypeScript hints.
 */
export const ProfileStoreModel = types
  .model("ProfileStore")
  .props({
    profile_id: types.maybe(types.number),
    first_name: types.maybe(types.string),
    last_name: types.maybe(types.string),
    age: types.maybe(types.number),
    weight: types.optional(types.number, 0),
    height: types.optional(types.number, 0),
    gender: types.optional(types.string, "male"),
    preferred_weight_unit: types.optional(types.string, "lbs"),
    preferred_height_unit: types.optional(types.string, "in"),
    public: types.optional(types.boolean, true),
    bio: types.optional(types.string, ""),
    streak: types.optional(types.number, 0),
    avatar_url: types.optional(types.string, ""),
    activity_level: types.optional(types.string, "moderate"),
    fitness_goal: types.optional(types.string, "strength"),
    diet: types.optional(types.string, "anything"),
  })
  .actions(withSetPropAction)
  .views((store) => ({
    get fullName() {
      return `${store.first_name} ${store.last_name}`
    },
    get isOnboarded() {
      return !!store.profile_id
    },
  }))
  .actions((store) => ({
    updateStoreFromProfileData(data: any) {
      store.setProp("profile_id", data.profile_id)
      store.setProp("first_name", data.first_name)
      store.setProp("last_name", data.last_name)
      store.setProp("age", data.age)
      store.setProp("weight", data.weight)
      store.setProp("height", data.height)
      store.setProp("gender", data.gender)
      store.setProp("preferred_weight_unit", data.preferred_weight_unit)
      store.setProp("preferred_height_unit", data.preferred_height_unit)
      store.setProp("public", data.public)
      store.setProp("bio", data.bio)
      store.setProp("streak", data.streak)
      store.setProp("avatar_url", data.avatar_url)
      store.setProp("activity_level", data.activity_level)
      store.setProp("fitness_goal", data.fitness_goal)
      store.setProp("diet", data.diet)
    },
    getProfile() {
      return {
        profile_id: store.profile_id,
        first_name: store.first_name,
        last_name: store.last_name,
        age: store.age,
        weight: store.weight,
        height: store.height,
        gender: store.gender,
        preferred_weight_unit: store.preferred_weight_unit,
        preferred_height_unit: store.preferred_height_unit,
        public: store.public,
        bio: store.bio,
        streak: store.streak,
        avatar_url: store.avatar_url,
        activity_level: store.activity_level,
        fitness_goal: store.fitness_goal,
        diet: store.diet,
      } as Profile
    },
    async updateProfile(formData: any) {
      const response = await api.updateProfile(formData as Profile)

      if (response.ok && response.data) {
        const data = response.data

        this.updateStoreFromProfileData(data)
        return data
      } else {
        console.error("Error Updating Profile")
        return null
      }
    },
    async createProfile(data: any) {
      const response = await api.createProfile(data as Profile)

      if (response.ok && response.data) {
        const data = response.data

        this.updateStoreFromProfileData(data)
        return data
      } else {
        console.error("Error Creating Profile")
        return new Error("Error Creating Profile")
      }
    },
    updateAvatarUrl(avatar_url: string) {
      store.setProp("avatar_url", avatar_url)
    },
    updateSpecific(value: string) {
      store.setProp("avatar_url", value)
    },
    setProfileId(value: number) {
      store.setProp("profile_id", value)
    },
    clear() {
      store.profile_id = undefined
    },
  }))

export interface ProfileStore extends Instance<typeof ProfileStoreModel> {}
export interface ProfileStoreSnapshotOut extends SnapshotOut<typeof ProfileStoreModel> {}
export interface ProfileStoreSnapshotIn extends SnapshotIn<typeof ProfileStoreModel> {}
