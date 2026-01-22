import Link from "next/link";

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Welcome to LCOC Praise Team!</h1>
      <p>Click below to login and access your setlists and songs.</p>
      <Link
        href="/login"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#4f46e5",
          color: "white",
          borderRadius: "0.5rem",
          textDecoration: "none",
        }}
      >
        Go to Login
      </Link>
    </main>
  );
}
