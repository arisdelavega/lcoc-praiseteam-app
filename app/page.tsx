import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "3rem 2rem",
          borderRadius: "1rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#4f46e5", fontSize: "2.5rem", marginBottom: "1rem" }}>
          LCOC Praise Team
        </h1>
        <p style={{ color: "#374151", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Welcome! Click below to login and access your setlists and songs.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(90deg, #4f46e5, #818cf8)",
            color: "white",
            borderRadius: "0.75rem",
            textDecoration: "none",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 5px 15px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
