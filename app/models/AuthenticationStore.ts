import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api, User } from "@/services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { remove, saveString } from "@/utils/storage"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authUsername: "",
    authEmail: "",
    userID: "",
    email_verified: false,
    email_verified_at: types.maybeNull(types.Date),
    email_verification_token: types.maybe(types.string),
    mfa_enabled: false,
    mfa_code: types.maybeNull(types.string),
    mfa_verified: false,
    mfa_verification_token: types.maybe(types.string),
    mfa_code_expires_at: types.maybeNull(types.Date),
    password_updated_at: types.maybe(types.Date),
    created_at: types.maybe(types.Date),
    updated_at: types.maybe(types.Date),
    last_login: types.maybe(types.Date),
    last_login_ip: types.maybe(types.string),
    ip_address: types.maybe(types.string),
    role: types.maybe(types.string),
    status: types.maybe(types.string),
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
      saveString("userID", value)
    },
    setUserData(data: User) {
      store.email_verified = data.email_verified
      store.email_verified_at = data.email_verified_at ? new Date(data.email_verified_at) : null
      store.email_verification_token = data.email_verification_token
      store.mfa_enabled = data.mfa_enabled ?? false
      store.mfa_code = data.mfa_code ?? ""
      store.mfa_verified = data.mfa_verified ?? false
      store.mfa_verification_token = data.mfa_verification_token
      store.mfa_code_expires_at = data.mfa_code_expires_at ? new Date(data.mfa_code_expires_at) : null
      store.password_updated_at = data.password_updated_at ? new Date(data.password_updated_at) : undefined
      store.created_at = data.created_at ? new Date(data.created_at) : undefined
      store.updated_at = data.updated_at ? new Date(data.updated_at) : undefined
      store.last_login = data.last_login ? new Date(data.last_login) : undefined
      store.last_login_ip = data.last_login_ip
      store.ip_address = data.ip_address
      store.role = data.role
      store.status = data.status
    },
    distributeAuthToken(value: string) {
      const token = value
      saveString("API_KEY", token)
      api.apisauce.setHeader("API_KEY", `${token}`)
      api.user_id = store.userID
    },
    logout() {
      store.authToken = undefined
      store.authUsername = ""
      store.authEmail = ""
      store.userID = ""

      remove("API_KEY")
      remove("userID")
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
