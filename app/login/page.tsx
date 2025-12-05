import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  )
}
