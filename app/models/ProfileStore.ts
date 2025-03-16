import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { api, Profile } from "@/services/api"
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
    }
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
    async getProfile() {
        let prof = await api.getProfile()

        if (prof.ok && prof.data) {
          let data = prof.data
    
          this.updateStoreFromProfileData(data)
          return data
        }
      else {
        console.error("Error Fetching Profile")
        return null
      }
    },
    async updateProfile(formData: any) {
      let response = await api.updateProfile(formData as Profile)
      
      if (response.ok && response.data) {
        let data = response.data
        
        this.updateStoreFromProfileData(data)
        return data
      } else {
        console.error("Error Updating Profile")
        return null
      }
    }
  }))

export interface ProfileStore extends Instance<typeof ProfileStoreModel> {}
export interface ProfileStoreSnapshotOut extends SnapshotOut<typeof ProfileStoreModel> {}
export interface ProfileStoreSnapshotIn extends SnapshotIn<typeof ProfileStoreModel> {}

