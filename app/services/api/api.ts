/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, LoginResponse, MFACheckResponse, SignupResponse, Profile } from "./api.types"
import { loadString } from "@/utils/storage"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  user_id: string

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.user_id = ""
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })

    this.setupFromStorage()
  }

  setupFromStorage() {
    try {
      // Load user_id from storage
      const userId = loadString("userID")
      if (userId) {
        this.user_id = userId
      }
      
      // Load API key from storage
      const apiKey = loadString("API_KEY")
      if (apiKey) {
        this.setApiKey(apiKey)
      }
      
      console.log("API initialized with stored credentials")
    } catch (error) {
      console.error("Error loading API credentials from storage:", error)
    }
  }

  setApiKey(apiKey: string) {
    this.apisauce.setHeader("API_KEY", apiKey)
  }

  setUserId(userId: string) {
    this.user_id = userId
  }

  async ensureAuthLoaded() {
    if (!this.user_id || !this.apisauce.headers["API_KEY"]) {
      await this.setupFromStorage()
    }
  }

  async validateMFA(code: string): Promise<ApiResponse<MFACheckResponse>> {
    const response: ApiResponse<MFACheckResponse> = await this.apisauce.get(
      `/users/mfa/check/${code}?user_id=${this.user_id}`,
    )
    return response
  }

  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response: ApiResponse<LoginResponse> = await this.apisauce.post("/users/login", {
      username,
      password,
    })
    return response
  }

  async signup(
    username: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<SignupResponse>> {
    const response: ApiResponse<SignupResponse> = await this.apisauce.post("/users/signup", {
      username,
      email,
      password,
    })
    return response
  }

  async getProfile(): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.get(`/profile?user_id=${this.user_id}`)
    return response
  }

  async getProfileByID(profile_id: string): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.get(`/profile?user_id=${profile_id}`)
    return response
  }

  async updateProfile(
    profile: Profile,
  ): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.post(`/profile/update?user_id=${this.user_id}`, profile)
    return response
  }

  async uploadAvatar(file: any): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()

    const formData = new FormData()

    const fileObject = {
      uri: file.uri,
      type: "image/jpeg",
      name: "avatar.jpg",
    }

    formData.append('avatar', fileObject as any)

    const response: ApiResponse<Profile> = await this.apisauce.post(
      `/profile/avatar/upload?user_id=${this.user_id}`,
      formData,
      {
        // Special config for form data uploads
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout extension for uploads
        timeout: 30000, // 30 seconds
      }
    )

    console.log('Upload response:', response)

    if (response.ok && response.data) {
      console.log('Upload successful')
      return response
    } else {
      console.error('Upload failed')
      return response
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()

