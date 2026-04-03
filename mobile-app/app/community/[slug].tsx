import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const samplePosts = [
  { author: "Creator Host", role: "Host", body: "Welcome to the native course community. This screen is ready for API wiring." },
  { author: "Student Member", role: "Student", body: "The mobile version can mirror posts, likes, replies, and notifications from the web platform." },
];

export default function CommunityScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "sample-course";

  return (
    <LinearGradient colors={["#0b1228", "#050816", "#03050d"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Course Community</Text>
            <Text style={styles.title}>{slug}</Text>
            <Text style={styles.subtitle}>Mobile sci-fi community feed for enrolled students, creators, and admins.</Text>
          </View>

          {samplePosts.map((post) => (
            <View key={`${post.author}-${post.role}`} style={styles.post}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postMeta}>{post.role}</Text>
              <Text style={styles.postBody}>{post.body}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
  hero: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(7,14,32,0.76)",
    padding: 22,
  },
  eyebrow: { color: "#67e8f9", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700" },
  title: { marginTop: 10, color: "#fff", fontSize: 28, fontWeight: "700", textTransform: "capitalize" },
  subtitle: { marginTop: 10, color: "#cbd5e1", fontSize: 15, lineHeight: 24 },
  post: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(7,14,32,0.76)",
    padding: 18,
  },
  postAuthor: { color: "#fff", fontSize: 15, fontWeight: "700" },
  postMeta: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  postBody: { marginTop: 14, color: "#e2e8f0", fontSize: 15, lineHeight: 24 },
});
