import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../context/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { LoginFormIcon } from '../components/AuthFormIcons';
import '../auth.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values) {
    try {
      setErrorMessage('');
      await login(values);
      const destination = location.state?.from?.pathname ?? '/app';
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <AuthLayout
      icon={LoginFormIcon}
      title="Welcome back"
      subtitle="Sign in to continue learning from your knowledge vault."
      footer={
        <>
          New here? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required.' })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required.' })}
        />

        {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
