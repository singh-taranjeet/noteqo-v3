import { LoginForm } from "@/features/auth";

export const metadata = {
  title: "Log In | Noteqo",
  description: "Log in to your securely encrypted note workspace.",
};

export default function LoginPage() {
  return <LoginForm />;
}
