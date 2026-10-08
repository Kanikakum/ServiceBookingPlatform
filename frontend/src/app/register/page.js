import RegisterForm from '../../components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account — ServiceBooking',
  description: 'Register as a customer or service provider on ServiceBooking.',
};

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <RegisterForm />
      </div>
    </div>
  );
}
