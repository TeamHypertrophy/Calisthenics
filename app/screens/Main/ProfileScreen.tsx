import { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, TextStyle, View, ViewStyle } from "react-native"
import { $styles } from "@/theme"
import { AppStackScreenProps } from "@/navigators"
import { Button, Radio, Screen, Switch, Text, TextField } from "@/components"
import { HomeTabScreenProps } from "@/navigators/HomeNavigator"
import { useStores } from "@/models"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import {
  ActivityLevel,
  Diet,
  FitnessGoal,
  Gender,
  PreferredHeight,
  PreferredWeight,
  Profile,
} from "@/services/api"
import { Toggle } from "@/components/Toggle/Toggle"
import { saveString } from "@/utils/storage"
import { Dropdown } from "react-native-element-dropdown"
import { AntDesign } from "@expo/vector-icons"
// import { useNavigation } from "@react-navigation/native"

export const ProfileScreen: FC<HomeTabScreenProps<"Profile">> = observer(
  function ProfileScreen(_props) {
    const { navigation } = _props

    const {
      profileStore: { getProfile, updateProfile },
      authenticationStore: { logout },
    } = useStores()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [isFocus, setIsFocus] = useState(false)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState(0)
    const [weight, setWeight] = useState(0)
    const [height, setHeight] = useState(0)
    const [gender, setGender] = useState<Gender>("male")
    const [preferredWeightUnit, setPreferredWeightUnit] = useState<PreferredWeight>("kg")
    const [preferredHeightUnit, setPreferredHeightUnit] = useState<PreferredHeight>("cm")
    const [publicProfile, setPublicProfile] = useState(true)
    const [bio, setBio] = useState("")
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate")
    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("strength")
    const [diet, setDiet] = useState<Diet>("anything")

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    useEffect(() => {
      const loadProfileData = async () => {
        setIsLoading(true)
        try {
          let store = await getProfile()

          if (store) {
            setFirstName(store.first_name)
            setLastName(store.last_name)
            setAge(store.age)
            setWeight(store.weight)
            setHeight(store.height)
            setGender(store.gender)
            setPreferredWeightUnit(store.preferred_weight_unit)
            setPreferredHeightUnit(store.preferred_height_unit)
            setPublicProfile(store.public)
            setBio(store.bio)
            setActivityLevel(store.activity_level)
            setFitnessGoal(store.fitness_goal)
            setDiet(store.diet)
          } else {
            await loadFromLocalStorage()
          }
        } catch (error) {
          console.error("Failed to load profile:", error)
          await loadFromLocalStorage()
        } finally {
          setIsLoading(false)
        }
      }

      loadProfileData()
    }, [])

    const loadFromLocalStorage = async () => {
      try {
        const { loadString } = require("@/utils/storage")

        setFirstName(loadString("firstName") || "")
        setLastName(loadString("lastName") || "")
        setAge(Number(loadString("age")) || 0)
        setWeight(Number(loadString("weight")) || 0)
        setHeight(Number(loadString("height")) || 0)
        setGender(loadString("gender") || "male")
        setPreferredWeightUnit((loadString("preferredWeightUnit") as PreferredWeight) || "lbs")
        setPreferredHeightUnit((loadString("preferredHeightUnit") as PreferredHeight) || "in")
        setPublicProfile(loadString("publicProfile") === "true")
        setBio(loadString("bio") || "")
        setActivityLevel((loadString("activityLevel") as ActivityLevel) || "moderate")
        setFitnessGoal((loadString("fitnessGoal") as FitnessGoal) || "strength")
        setDiet((loadString("diet") as Diet) || "anything")
      } catch (storageError) {
        console.error("Failed to load from local storage:", storageError)
        setDefaultValues()
      }
    }

    const setDefaultValues = () => {
      setFirstName("")
      setLastName("")
      setAge(0)
      setWeight(0)
      setHeight(0)
      setGender("male")
      setPreferredWeightUnit("lbs")
      setPreferredHeightUnit("in")
      setPublicProfile(true)
      setBio("")
      setActivityLevel("moderate")
      setFitnessGoal("strength")
      setDiet("anything")
    }

    const saveProfile = async () => {
      setIsSaving(true)
      setErrorMsg("")
      setSuccessMsg("")

      try {
        const profile = {
          first_name: firstName,
          last_name: lastName,
          age: age,
          weight: weight,
          height: height,
          gender: gender,
          preferred_weight_unit: preferredWeightUnit,
          preferred_height_unit: preferredHeightUnit,
          public: publicProfile,
          bio: bio,
          activity_level: activityLevel,
          fitness_goal: fitnessGoal,
          diet: diet,
        }

        await updateProfile({
          ...profile,
        })

        saveString("firstName", firstName)
        saveString("lastName", lastName)
        saveString("age", String(age))
        saveString("weight", String(weight))
        saveString("height", String(height))
        saveString("gender", gender)
        saveString("preferredWeightUnit", preferredWeightUnit)
        saveString("preferredHeightUnit", preferredHeightUnit)
        saveString("publicProfile", String(publicProfile))
        saveString("bio", bio)
        saveString("activityLevel", activityLevel)
        saveString("fitnessGoal", fitnessGoal)
        saveString("diet", diet)

        setSuccessMsg("Profile updated successfully")
        setTimeout(() => setSuccessMsg(""), 3000) // Clear success message after 3 seconds
      } catch (error) {
        console.error("Error saving profile:", error)
        setErrorMsg("Failed to update profile")
      } finally {
        setIsSaving(false)
      }
    }

    const weightUnitOptions = [
      { label: "Kilograms (kg)", value: "Kg" },
      { label: "Pounds (lbs)", value: "Lbs" },
    ]

    const heightUnitOptions = [
      { label: "Centimeters (cm)", value: "cm" },
      { label: "Inches (in)", value: "in" },
    ]

    const activityLevelOptions = [
      { label: "Light", value: "light" },
      { label: "Moderate", value: "moderate" },
      { label: "Very", value: "very" },
      { label: "Extremely", value: "extremely" },
    ]

    const fitnessGoalOptions = [
      { label: "Weight Loss", value: "weight_loss" },
      { label: "Muscle Gain", value: "muscle_gain" },
      { label: "Endurance", value: "endurance" },
      { label: "Strength", value: "strength" },
      { label: "Maintenance", value: "maintenance" },
    ]

    const dietOptions = [
      { label: "Anything", value: "anything" },
      { label: "Vegetarian", value: "vegetarian" },
      { label: "Vegan", value: "vegan" },
      { label: "Keto", value: "keto" },
    ]

    const genderOptions = [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" }
    ]

    if (isLoading) {
      return (
        <Screen
          style={$root}
          preset="auto"
          safeAreaEdges={["top"]}
          contentContainerStyle={themed($screenContentContainer)}
        >
          <ActivityIndicator size="large" color={colors.palette.primary500} />
        </Screen>
      )
    }

    return (
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        contentContainerStyle={themed($screenContentContainer)}
      >
        <Text text="Profile" preset="heading" />

        {errorMsg ? <Text text={errorMsg} style={themed($errorText)} /> : null}

        {successMsg ? <Text text={successMsg} style={themed($successText)} /> : null}

        <View style={themed($formContainer)}>
          <Text text="Personal Information" preset="subheading" style={themed($sectionTitle)} />

          <TextField
            label="First Name"
            value={String(firstName)}
            onChangeText={setFirstName}
            containerStyle={themed($textField)}
          />

          <TextField
            label="Last Name"
            value={String(lastName)}
            onChangeText={setLastName}
            containerStyle={themed($textField)}
          />

          <TextField
            label="Age"
            value={String(age)}
            onChangeText={(value) => setAge(Number(value))}
            containerStyle={themed($textField)}
            keyboardType="numeric"
          />

          <TextField
            label="Bio"
            value={String(bio)}
            onChangeText={setBio}
            containerStyle={themed($bioTextField)}
            multiline={true}
            numberOfLines={4}
            style={$bioInput}
            maxLength={500}
          />

          <View style={themed($row)}>
            <TextField
              label={`Weight (${preferredWeightUnit})`}
              value={String(weight)}
              onChangeText={(value) => setWeight(Number(value))}
              containerStyle={[themed($textField), $halfWidth]}
              keyboardType="decimal-pad"
            />

            <TextField
              label={`Height (${preferredHeightUnit})`}
              value={String(height)}
              onChangeText={(value) => setHeight(Number(value))}
              containerStyle={[themed($textField), $halfWidth]}
              keyboardType="decimal-pad"
            />
          </View>


          <Text style={themed($fieldLabel)}>Gender</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={genderOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={gender}
            value={gender}
            onChange={(item) => {
              setGender(item.value as Gender)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="user"
                size={20}
              />
            )}
          />

          <Text text="Preferences" preset="subheading" style={themed($sectionTitle)} />

          {/* Weight Unit Dropdown */}
          <Text style={themed($fieldLabel)}>Preferred Weight Unit</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={weightUnitOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={preferredWeightUnit}
            value={preferredWeightUnit}
            onChange={(item) => {
              setPreferredWeightUnit(item.value as PreferredWeight)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="filter"
                size={20}
              />
            )}
          />

          {/* Height Unit Dropdown */}
          <Text style={themed($fieldLabel)}>Preferred Height Unit</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={heightUnitOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={preferredHeightUnit}
            value={preferredHeightUnit}
            onChange={(item) => {
              setPreferredHeightUnit(item.value as PreferredHeight)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="filter"
                size={20}
              />
            )}
          />

          {/* Activity Level Dropdown */}
          <Text style={themed($fieldLabel)}>Activity Level</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={activityLevelOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={activityLevel}
            value={activityLevel}
            onChange={(item) => {
              setActivityLevel(item.value as ActivityLevel)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="heart"
                size={20}
              />
            )}
          />

          {/* Fitness Goal Dropdown */}
          <Text style={themed($fieldLabel)}>Fitness Goal</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={fitnessGoalOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={fitnessGoal}
            value={fitnessGoal}
            onChange={(item) => {
              setFitnessGoal(item.value as FitnessGoal)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="barchart"
                size={20}
              />
            )}
          />

          {/* Diet Dropdown */}
          <Text style={themed($fieldLabel)}>Dietary Preference</Text>
          <Dropdown
            style={themed($dropdown)}
            placeholderStyle={themed($placeholderStyle)}
            selectedTextStyle={themed($selectedTextStyle)}
            itemContainerStyle={themed($itemContainerStyle)}
            itemTextStyle={themed($itemTextStyle)}
            data={dietOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={diet}
            value={diet}
            onChange={(item) => {
              setDiet(item.value as Diet)
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            renderLeftIcon={() => (
              <AntDesign
                style={{ marginRight: 10 }}
                color={isFocus ? "white" : "black"}
                name="bells"
                size={20}
              />
            )}
          />

          <Text text="Privacy" preset="subheading" style={themed($sectionTitle)} />
          <View style={themed($toggleContainer)}>
            <Text text="Public Profile" style={themed($toggleLabel)} />
            <Switch value={publicProfile} onValueChange={setPublicProfile} />
          </View>

          <Button
            text="Save Changes"
            style={themed($saveButton)}
            preset="filled"
            disabled={isSaving}
            onPress={saveProfile}
          />
        </View>

        <View style={themed($buttonContainer)}>
          <Button
            style={themed($button)}
            text="Settings"
            onPress={() => navigation.navigate("Settings")}
          />
          <Button style={themed($button)} tx="common:logOut" onPress={logout} />
        </View>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
})

const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $row: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
})

const $halfWidth: ViewStyle = {
  width: "48%",
}

const $toggleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginVertical: spacing.md,
})

const $toggleLabel: ThemedStyle<TextStyle> = () => ({})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  marginBottom: spacing.xl,
  borderRadius: 8,
  backgroundColor: colors.palette.primary500,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
})

const $successText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: "#52b963",
  marginBottom: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  marginBottom: spacing.xs,
  borderRadius: 8,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $dropdown: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 50,
  borderColor: colors.palette.neutral400,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  marginBottom: spacing.md,
  backgroundColor: colors.background,
})

const $placeholderStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

const $selectedTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
})

// Add these new styles for the bio field
const $bioTextField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $bioInput: TextStyle = {
  minHeight: 100,
  textAlignVertical: 'top',
  paddingTop: 5, // Add some padding to ensure text doesn't touch the top
}

// Add this style for items in the dropdown list
const $itemContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 5, 
  backgroundColor: colors.palette.neutral500,
})

const $itemTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.background, // Ensure dropdown item text is visible
})