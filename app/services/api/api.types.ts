/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */

export type ActivityLevel = "light" | "moderate" | "very" | "extremely"
export type Diet = "anything" | "keto" | "vegan" | "vegetarian"
export type Difficulty = "advanced" | "beginner" | "intermediate"
export type Equipment =
  | "barbell"
  | "bodyweight"
  | "cable"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "other"
  | "resistance_band"
export type ExerciseType = "bodyweight" | "cardio" | "flexibility" | "plyometric" | "strength"
export type FitnessGoal = "endurance" | "maintenance" | "muscle_gain" | "strength" | "weight_loss"
export type Gender = "female" | "male"
export type MuscleGroup =
  | "abs"
  | "biceps"
  | "calves"
  | "chest"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "lower_back"
  | "obliques"
  | "quads"
  | "shoulders"
  | "triceps"
  | "upper_back"
export type PreferredHeight = "cm" | "in"
export type PreferredWeight = "kg" | "lbs"
export type Role = "admin" | "developer" | "trainer" | "user"
export type Specialization =
  | "endurance"
  | "maintenance"
  | "muscle_gain"
  | "strength"
  | "weight_loss"
export type Status = "active" | "expired" | "revoked"
export type UserStatus = "active" | "pending"
export type WorkoutInterval = "daily" | "monthly" | "weekly"

export interface ApiKey {
  key_id?: number
  user_id: string
  api_key?: string
  created_at?: Date
  updated_at?: Date
  expires_at?: Date
  role?: Role
  revoked_reason?: string
  status?: Status
  quota?: number
}

export interface CalorieLog {
  log_id?: number
  user_id: string
  date?: Date
  amount: number
  updated_at?: Date
}

export interface CustomExercise {
  exercise_id: number
  user_id: string
  name: string
  equipment: Equipment
  difficulty: Difficulty
  muscle_group: MuscleGroup
  sets?: number
  reps?: number
  rest_time?: number
  exercise_type: ExerciseType
  created_at?: Date
  updated_at?: Date
}

export interface Exercise {
  exercise_id: number
  name: string
  description?: string
  instructions?: string
  equipment: Equipment
  difficulty: Difficulty
  muscle_group: MuscleGroup
  sets?: number
  reps?: number
  rest_time?: number
  exercise_type: ExerciseType
  image_url?: string
  video_url?: string
  created_at?: Date
  updated_at?: Date
}

export interface ExerciseLog {
  log_id?: number
  user_id: string
  exercise_id: number
  sets_completed: number
  reps_completed: number
  date?: Date
  updated_at?: Date
}

export interface Profile {
  profile_id: number
  user_id: string
  first_name: string
  last_name: string
  age: number
  weight: number
  height: number
  gender: Gender
  preferred_weight_unit: PreferredWeight
  preferred_height_unit: PreferredHeight
  public: boolean
  bio: string
  streak: number
  avatar_url: string
  activity_level: ActivityLevel
  fitness_goal: FitnessGoal
  diet: Diet
  created_at: Date
  updated_at: Date
}

export interface ProteinLog {
  log_id?: number
  user_id: string
  date?: Date
  amount: number
  updated_at?: Date
}

export interface SleepLog {
  log_id?: number
  user_id: string
  beginning: Date
  end: Date
  amount?: number
  updated_at?: Date
}

export interface TrainerAnnouncement {
  announcement_id?: number
  trainer_id: string
  title: string
  visibility?: boolean
  content?: string
  pinned?: boolean
  created_at?: Date
  updated_at?: Date
}

export interface Trainer {
  trainer_id?: number
  user_id: string
  clients?: string[]
  specialization?: Specialization
  verified?: boolean
  verified_at?: Date | null
  created_at?: Date
  updated_at?: Date
}

export interface User {
  user_id?: string
  username: string
  password: string
  email: string
  email_verified: boolean
  email_verified_at?: Date | null
  email_verification_token?: string
  mfa_enabled?: boolean
  mfa_code?: string | null
  mfa_verified?: boolean
  mfa_verification_token?: string
  mfa_code_expires_at?: Date | null
  password_updated_at?: Date
  created_at?: Date
  updated_at?: Date
  last_login?: Date
  last_login_ip: string
  ip_address: string
  role?: Role
  status?: UserStatus
}

export interface WaterLog {
  log_id?: number
  user_id: string
  date?: Date
  amount: number
  updated_at?: Date
}

export interface WorkoutLog {
  log_id?: number
  user_id: string
  workout_id: string
  date?: Date
  updated_at?: Date
}

export interface WorkoutPlan {
  plan_id?: string
  user_id: string
  name: string
  description?: string
  workouts?: string[]
  created_at?: Date
  updated_at?: Date
  start_time?: Date
  repeats?: WorkoutInterval
  goal?: FitnessGoal
  difficulty: Difficulty
  is_public?: boolean
}

export interface Workout {
  workout_id?: string
  name: string
  description?: string
  duration?: number
  difficulty: Difficulty
  created_at?: Date
  updated_at?: Date
  user_id: string
  exercises?: number[]
}

export interface MFAResendResponse {
  status: number
  user_id: string
  message: string
}

export interface MFACheckResponse {
  status: number
  message: string
  user: User
  api_key: string
}

export interface LoginResponse {
  status?: boolean
  message?: string
  user?: User
  user_id: string
  api_key: string
}

export interface SignupResponse {
  user: User
  api_key: string
}

export interface VersionResponse {
  postgres: string
  redis: string
  version: string
  status: number
}

export interface HealthResponse {
  is_healthy: boolean,
  status: number,
}

export interface DeleteResponse {
  status: number,
  message: string,
  user: User
}