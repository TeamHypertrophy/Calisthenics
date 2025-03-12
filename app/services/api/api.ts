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
import type { ApiConfig, LoginResponse, MFACheckResponse, SignupResponse } from "./api.types"

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
}

// Singleton instance of the API for convenience
export const api = new Api()
