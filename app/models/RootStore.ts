import { Instance, SnapshotOut, types } from "mobx-state-tree"

import { AuthenticationStoreModel } from "./AuthenticationStore"
import { ProfileStoreModel } from "./ProfileStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  profileStore: types.optional(ProfileStoreModel, {} as any),
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
