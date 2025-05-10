import { loadString } from "@/utils/storage"
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { SleepLogs } from "schema"

import type {
  ApiConfig,
  CalorieLog,
  CreateCalorieLog,
  CreateProteinLog,
  CreateSleepLog,
  CreateWaterLog,
  DeleteResponse,
  HealthResponse,
  LoginResponse,
  MFACheckResponse,
  MFAResendResponse,
  Profile,
  ProteinLog,
  SignupResponse,
  SleepLog,
  Trainer,
  TrainerAnnouncement,
  TrainerIsFollowedResponse,
  User,
  UserResponse,
  VersionResponse,
  WaterLog,
  WorkoutPlan,
} from "./api.types"

import Config from "../../config"

export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  user_id: string

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

  // AUTH FUNCTIONS

  async getUser(): Promise<ApiResponse<User>> {
    const response: ApiResponse<User> = await this.apisauce.get(`/users/?user_id=${this.user_id}`)
    return response
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<User>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<User> = await this.apisauce.post(
      `/users/update/password?user_id=${this.user_id}`,
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
    )
    return response
  }

  async getUserByEmail(email: string): Promise<ApiResponse<UserResponse>> {
    const response: ApiResponse<UserResponse> = await this.apisauce.get(
      `/users/auth/email?email=${email}`,
    )
    return response
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<UserResponse>> {
    const response: ApiResponse<UserResponse> = await this.apisauce.get(
      `/users/auth/request-password-reset?email=${email}`,
    )
    return response
  }

  async checkPasswordResetCode(code: string, user_id: string): Promise<ApiResponse<UserResponse>> {
    const response: ApiResponse<UserResponse> = await this.apisauce.get(
      `/users/mfa/request/${code}?user_id=${user_id}`,
    )
    return response
  }

  async resetPassword(password: string, email: string): Promise<ApiResponse<UserResponse>> {
    const response: ApiResponse<UserResponse> = await this.apisauce.post(
      `/users/auth/reset-password`,
      {
        password,
        email,
      },
    )
    return response
  }

  async validateMFA(code: string, user_id: string): Promise<ApiResponse<MFACheckResponse>> {
    const response: ApiResponse<MFACheckResponse> = await this.apisauce.get(
      `/users/mfa/check/${code}?user_id=${user_id}`,
    )
    return response
  }

  async enableMFA(): Promise<ApiResponse<User>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<User> = await this.apisauce.get(
      `/users/mfa/enable?user_id=${this.user_id}`,
    )
    return response
  }

  async disableMFA(): Promise<ApiResponse<User>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<User> = await this.apisauce.get(
      `/users/mfa/disable?user_id=${this.user_id}`,
    )
    return response
  }

  async resendMFA(): Promise<ApiResponse<MFAResendResponse>> {
    const response: ApiResponse<MFAResendResponse> = await this.apisauce.get(
      `/users/mfa/resend?user_id=${this.user_id}`,
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

  async delete(): Promise<ApiResponse<DeleteResponse>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<DeleteResponse> = await this.apisauce.get(
      `/users/delete?user_id=${this.user_id}`,
    )
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

  // PROFILE FUNCTIONS
  async getProfile(): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.get(
      `/profile?user_id=${this.user_id}`,
    )
    return response
  }

  async getProfileByID(profile_id: string): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.get(`/profile?user_id=${profile_id}`)
    return response
  }

  async createProfile(data: any): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.post(
      `/profile/create?user_id=${this.user_id}`,
      data,
    )
    return response
  }

  async updateProfile(profile: Profile): Promise<ApiResponse<Profile>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<Profile> = await this.apisauce.post(
      `/profile/update?user_id=${this.user_id}`,
      profile,
    )
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

    formData.append("avatar", fileObject as any)

    const response: ApiResponse<Profile> = await this.apisauce.post(
      `/profile/avatar/upload?user_id=${this.user_id}`,
      formData,
      {
        // Special config for form data uploads
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
        // Add timeout extension for uploads
        timeout: 30000, // 30 seconds
      },
    )

    console.log("Upload response:", response)

    if (response.ok && response.data) {
      console.log("Upload successful")
      return response
    } else {
      console.error("Upload failed")
      return response
    }
  }

  // SYSTEM FUNCTIONS
  async getVersionInfo(): Promise<ApiResponse<VersionResponse>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<VersionResponse> = await this.apisauce.get("/health/version")
    return response
  }

  async checkRedis(): Promise<ApiResponse<HealthResponse>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<HealthResponse> = await this.apisauce.get("/health/redis")
    return response
  }

  async checkPostgres(): Promise<ApiResponse<HealthResponse>> {
    await this.ensureAuthLoaded()
    const response: ApiResponse<HealthResponse> = await this.apisauce.get("/health/postgres")
    return response
  }

  // Log Functions

  async getProteinLogs(): Promise<ApiResponse<ProteinLog[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<ProteinLog[]> = await this.apisauce.get(
      `/protein/user/all?user_id=${this.user_id}`,
    )
    return response
  }

  async getCalorieLogs(): Promise<ApiResponse<CalorieLog[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<CalorieLog[]> = await this.apisauce.get(
      `/calories/user/all?user_id=${this.user_id}`,
    )
    return response
  }

  async getWaterLogs(): Promise<ApiResponse<WaterLog[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<WaterLog[]> = await this.apisauce.get(
      `/water/user/all?user_id=${this.user_id}`,
    )
    return response
  }

  async getSleepLogs(): Promise<ApiResponse<SleepLogs[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<SleepLogs[]> = await this.apisauce.get(
      `/sleep/user/all?user_id=${this.user_id}`,
    )
    return response
  }

  async createProteinLog(log: CreateProteinLog): Promise<ApiResponse<ProteinLog>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<ProteinLog> = await this.apisauce.post(
      `/protein/create?user_id=${this.user_id}`,
      log,
    )
    return response
  }

  async createCalorieLog(log: CreateCalorieLog): Promise<ApiResponse<CalorieLog>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<CalorieLog> = await this.apisauce.post(
      `/calories/create?user_id=${this.user_id}`,
      log,
    )
    return response
  }

  async createWaterLog(log: CreateWaterLog): Promise<ApiResponse<WaterLog>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<WaterLog> = await this.apisauce.post(
      `/water/create?user_id=${this.user_id}`,
      log,
    )
    return response
  }

  async createSleepLog(log: CreateSleepLog): Promise<ApiResponse<SleepLog>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<SleepLog> = await this.apisauce.post(
      `/sleep/create?user_id=${this.user_id}`,
      log,
    )
    return response
  }

  async getLog(logType: string, logID: number): Promise<ApiResponse<any>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<any> = await this.apisauce.get(
      `/${logType}/get/${logID}?user_id=${this.user_id}`,
    )
    return response
  }

  async deleteLog(logType: string, logID: number): Promise<ApiResponse<any>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<any> = await this.apisauce.get(
      `/${logType}/delete/${logID}?user_id=${this.user_id}`,
    )
    return response
  }

  async updateLog(logType: string, logID: number, data: any): Promise<ApiResponse<any>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<any> = await this.apisauce.post(
      `/${logType}/update/${logID}?user_id=${this.user_id}`,
      data,
    )
    return response
  }

  async getTrainersForUser(): Promise<ApiResponse<Trainer[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<Trainer[]> = await this.apisauce.get(
      `/trainers/for?user_id=${this.user_id}`,
    )
    return response
  }

  async getAllTrainers(): Promise<ApiResponse<Trainer[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<Trainer[]> = await this.apisauce.get(`/trainers/all`)
    return response
  }

  async getTrainerIsFollowedByUser(
    trainerID: string,
    userID: string,
  ): Promise<ApiResponse<TrainerIsFollowedResponse>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<TrainerIsFollowedResponse> = await this.apisauce.get(
      `/trainers/is-followed-by/${trainerID}?user_id=${userID}`,
    )
    return response
  }

  async followTrainer(trainerID: string, userID: string): Promise<ApiResponse<Trainer>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<Trainer> = await this.apisauce.get(
      `/trainers/add-client/${trainerID}?user_id=${userID}`,
    )
    return response
  }

  async unfollowTrainer(trainerID: string, userID: string): Promise<ApiResponse<Trainer>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<Trainer> = await this.apisauce.get(
      `/trainers/remove-client/${trainerID}?user_id=${userID}`,
    )
    return response
  }

  async getTrainerByID(user: string): Promise<ApiResponse<Trainer>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<Trainer> = await this.apisauce.get(
      `/trainers/by?user_id=${this.user_id}`,
    )
    return response
  }

  async getAnnouncementsForUser(): Promise<ApiResponse<TrainerAnnouncement[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<TrainerAnnouncement[]> = await this.apisauce.get(
      `/trainers/announcement/for?user_id=${this.user_id}`,
    )
    return response
  }

  async getAllTrainerAnnouncements(trainer: string): Promise<ApiResponse<TrainerAnnouncement[]>> {
    if (trainer === "") {
      throw new Error("Trainer ID is NULL")
    }

    await this.ensureAuthLoaded()

    const response: ApiResponse<TrainerAnnouncement[]> = await this.apisauce.get(
      `/trainers/announcement/all?trainer_id=${trainer}`,
    )
    return response
  }

  async getAllUserWorkoutPlans(user: string): Promise<ApiResponse<WorkoutPlan[]>> {
    await this.ensureAuthLoaded()

    const response: ApiResponse<WorkoutPlan[]> = await this.apisauce.get(
      `/workout/plans/user/all?user_id=${user}`,
    )
    return response
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
