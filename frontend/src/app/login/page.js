import LoginForm from '../../components/auth/LoginForm';

export const metadata = {
  title: 'Sign In — ServiceBooking',
  description: 'Sign in to access your customer or provider dashboard.',
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
