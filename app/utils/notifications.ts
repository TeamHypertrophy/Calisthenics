import { WorkoutPlan } from "@/services/api"
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  Notification,
  RepeatFrequency,
  TimestampTrigger,
  TriggerNotification,
  TriggerType,
} from "@notifee/react-native"
import { Platform } from "react-native"
import { renderToast } from "./toastNotification"

export async function setupNotifee() {
  await notifee.requestPermission()

  await notifee.createChannel({
    id: "workout-plans",
    name: "Workout Plans",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  })
}

export async function schedulePlanNotification(plan: WorkoutPlan) {
  try {
    if (!plan) {
      renderToast("Error", "No Plan Found", "error")
      return
    }

    let repeatFrequency: RepeatFrequency | undefined = undefined
    switch (plan.repeats) {
      case "daily":
        repeatFrequency = RepeatFrequency.DAILY
        break
      case "weekly":
        repeatFrequency = RepeatFrequency.WEEKLY
        break
      case "monthly":
        renderToast("Error", "Monthly Repeats Not Supported Yet", "error")
        break
      default:
        repeatFrequency = RepeatFrequency.WEEKLY
    }

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: new Date(plan.start_time).getTime(),
        repeatFrequency: repeatFrequency,
    }

    const details: Notification = {
      id: plan.plan_id?.toString(),
      title: `🏋️ Time For Your Workout: ${plan.name}`,
      body: "Don't Forgot To Log Your Workout!",
      android: {
        channelId: "workout-plans"
      }
    }

    await notifee.createTriggerNotification(details, trigger)

    renderToast("Success", "Notification Scheduled Successfully", "success")
    console.log("Notification scheduled successfully:", details)
  } catch (error) {
    console.error("Error scheduling notification:", error)
    renderToast("Error", "There Was An Error Scheduling The Notification", "error")
  }
}

export async function cancelPlanNotification(id: string) {
  try {
    await notifee.cancelNotification(id)

    renderToast("Success", "Notification Cancelled Successfully", "success")
    console.log("Notification cancelled successfully:", id)
  } catch (error) {
    console.error("Error cancelling notification:", error)
    renderToast("Error", "There Was An Error Cancelling The Notification", "error")
  }
}