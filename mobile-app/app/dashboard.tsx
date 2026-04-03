import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cards = [
  { label: "Available balance", value: "₦124,500", tone: "#86efac" },
  { label: "Students", value: "82", tone: "#67e8f9" },
  { label: "Communities", value: "14", tone: "#f0abfc" },
];

export default function DashboardScreen() {
  return (
    <LinearGradient colors={["#0b1228", "#050816", "#03050d"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Creator Capsule</Text>
              <Text style={styles.title}>Mobile dashboard</Text>
              <Text style={styles.subtitle}>Balances, students, withdrawals, and community in one native view.</Text>
            </View>
            <Pressable onPress={() => router.push("/community/sample-course")}>
              <Text style={styles.link}>Open community</Text>
            </Pressable>
          </View>

          <View style={styles.cardGrid}>
            {cards.map((card) => (
              <View key={card.label} style={styles.statCard}>
                <Text style={[styles.statLabel, { color: card.tone }]}>{card.label}</Text>
                <Text style={styles.statValue}>{card.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  eyebrow: { color: "#67e8f9", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  title: { marginTop: 10, color: "#fff", fontSize: 30, fontWeight: "700" },
  subtitle: { marginTop: 10, color: "#cbd5e1", fontSize: 15, lineHeight: 24, maxWidth: 260 },
  link: { color: "#a5f3fc", fontSize: 14, fontWeight: "700", marginTop: 8 },
  cardGrid: { gap: 12 },
  statCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(7,14,32,0.76)",
    padding: 20,
  },
  statLabel: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  statValue: { marginTop: 12, color: "#fff", fontSize: 26, fontWeight: "700" },
});
