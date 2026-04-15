import { RegisterForm } from '@/features/auth';

export const metadata = {
  title: 'Create Account | Noteqo',
  description: 'Sign up for a securely encrypted document workspace.'
};

export default function RegisterPage() {
  return <RegisterForm />;
}
