import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LinearGradient colors={["#0b1228", "#050816", "#03050d"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Mobile Access</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Native auth UI scaffold for the NexaPay mobile app.</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            style={styles.input}
          />

          <Pressable
            style={styles.button}
            onPress={() => {
              Alert.alert("Scaffold ready", "Connect this screen to your existing NextAuth/API flow next.");
            }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingVertical: 20, justifyContent: "center" },
  back: { color: "#7dd3fc", fontSize: 15, fontWeight: "600" },
  card: {
    marginTop: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(7,14,32,0.76)",
    padding: 22,
  },
  eyebrow: { color: "#67e8f9", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  title: { marginTop: 12, color: "#fff", fontSize: 30, fontWeight: "700" },
  subtitle: { marginTop: 10, color: "#cbd5e1", fontSize: 15, lineHeight: 24 },
  input: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    marginTop: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.36)",
    backgroundColor: "rgba(34,211,238,0.18)",
    paddingVertical: 15,
  },
  buttonText: {
    color: "#ecfeff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
});
