import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

function Register() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    // Debugging: Log the input values before making the request
    console.log("Registering user with:", {
      email,
      mobile,
      password,
      confirmPassword,
    });

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      console.log("Passwords do not match"); // Debugging: Log password mismatch
      return;
    }

    try {
      // Debugging: Log the API call is being made
      console.log(
        "Sending request to: https://drip-advisor-backend.vercel.app/users/signup"
      );

      const response = await fetch(
        "https://drip-advisor-backend.vercel.app/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name: mobile, // Assuming name is mobile for now
            gender: "male", // You can update or collect this as needed
            dob: "1990-01-01", // Placeholder for DOB, can be added to the form
          }),
        }
      );

      // Debugging: Log the response status and data
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data); // Debugging: Log the response data

      if (response.ok) {
        Alert.alert("Success", "User created successfully");
        console.log("User created successfully"); // Debugging: Log success message
      } else {
        Alert.alert("Error", data.message || "Registration failed");
        console.error("Error:", data.message || "Unknown error"); // Debugging: Log error message
      }
    } catch (error) {
      // Debugging: Log any exceptions
      console.error("Error during registration:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Welcome Onboard!</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your Mobile Number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  formContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: "#50C2C9",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});

export default Register;
