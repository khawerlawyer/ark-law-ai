import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D1B2A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>⚖️ ARK LAW AI</div>
        <div style={{ fontSize: 12, color: "#6E8099", marginTop: 4 }}>The Legal Intelligence Engine</div>
        <div style={{ fontSize: 11, color: "#3EB489", marginTop: 2 }}>by Attorney & AI Innovator Khawer Rabbani</div>
      </div>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: "#C9A84C",
            colorBackground: "#162032",
            colorText: "#FAF6EE",
            colorInputBackground: "#1E2D40",
            colorInputText: "#FAF6EE",
            borderRadius: "8px",
          },
          elements: {
            card: { border: "1px solid #2B3F57", boxShadow: "none" },
            headerTitle: { color: "#C9A84C" },
            headerSubtitle: { color: "#B8C4D0" },
            formFieldLabel: { color: "#B8C4D0" },
            footerActionLink: { color: "#C9A84C" },
            identityPreviewText: { color: "#FAF6EE" },
          }
        }}
      />
    </div>
  );
}
