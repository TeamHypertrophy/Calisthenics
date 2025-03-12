import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "@/services/api"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authUsername: "",
    authEmail: "",
    userID: "",
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
    get validationError() {
      if (store.authUsername.length === 0) return "can't be blank"
      return ""
    },
    get getUserID() {
      return store.userID
    },
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setAuthUsername(value: string) {
      store.authUsername = value.replace(/ /g, "")
    },
    setAuthEmail(value: string) {
      store.authEmail = value
    },
    setUserID(value: string) {
      store.userID = value
    },
    distributeAuthToken(value?: string) {
      const token = value
      console.log(`token is ${token}`)
      api.apisauce.setHeader("API_KEY", `${token}`)
      api.user_id = store.userID
    },
    logout() {
      store.authToken = undefined
      store.authUsername = ""
      store.authEmail = ""
      store.userID = ""
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
