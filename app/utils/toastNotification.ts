import Toast from "react-native-toast-message"

export function renderToast(title: string, text: string, type: "success" | "error" | "info" = "success", visibilityTime: number = 4000, position: "top" | "bottom" = "top") {
  Toast.show({
    type,
    text1: title,
    text2: text,
    visibilityTime: visibilityTime,
    autoHide: true,
    position: position
  })
}