import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={["#0b1228", "#050816", "#03050d"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NexaPay Mobile</Text>
        </View>
        <Text style={styles.title}>Payments, creators, and community in your pocket.</Text>
        <Text style={styles.subtitle}>
          Fresh native workspace for iOS and Android, styled to match the sci-fi web experience.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile launch sequence</Text>
          <Text style={styles.cardText}>1. Sign in as creator or admin.</Text>
          <Text style={styles.cardText}>2. Review payouts, students, and communities.</Text>
          <Text style={styles.cardText}>3. Deep-link into course spaces and creator operations.</Text>
        </View>

        <View style={styles.actions}>
          <Link href="/login" style={[styles.button, styles.primaryButton]}>
            Sign in
          </Link>
          <Link href="/dashboard" style={[styles.button, styles.secondaryButton]}>
            Preview dashboard
          </Link>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingVertical: 20, justifyContent: "center" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.35)",
    backgroundColor: "rgba(34, 211, 238, 0.10)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: { color: "#cffafe", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  title: { marginTop: 24, color: "#f8fafc", fontSize: 36, lineHeight: 42, fontWeight: "700" },
  subtitle: { marginTop: 16, color: "#cbd5e1", fontSize: 16, lineHeight: 28 },
  card: {
    marginTop: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    backgroundColor: "rgba(7, 14, 32, 0.72)",
    padding: 20,
  },
  cardTitle: { color: "#67e8f9", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  cardText: { marginTop: 12, color: "#e2e8f0", fontSize: 15, lineHeight: 24 },
  actions: { marginTop: 28, gap: 12 },
  button: {
    overflow: "hidden",
    borderRadius: 999,
    paddingVertical: 16,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  primaryButton: {
    color: "#ecfeff",
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.36)",
    backgroundColor: "rgba(34,211,238,0.18)",
  },
  secondaryButton: {
    color: "#dbeafe",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
