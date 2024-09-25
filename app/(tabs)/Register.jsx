import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';

function Register() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");         
  const [gender, setGender] = useState("");     
  const [dob, setDob] = useState("");           

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Validate if all required fields are filled
    if (!name || !email || !mobile || !password || !gender || !dob) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    try {
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
            name,
            gender,
            dob,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token); 
        Alert.alert("Success", "User created successfully", [
          { text: "OK", onPress: () => navigation.navigate('Home') } 
        ]);
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };
  return (
    <ScrollView>
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Welcome Onboard!</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />
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
        <TextInput
          style={styles.input}
          placeholder="Enter Gender (e.g., male/female)"
          value={gender}
          onChangeText={setGender}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Date of Birth (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButton}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </ScrollView>
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
    paddingBottom: 20,
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginButton: {
    fontSize: 14,
    color: "#50C2C9",
    fontWeight: "bold",
  },
});

export default Register;
