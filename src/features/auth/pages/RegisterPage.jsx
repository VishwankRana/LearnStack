import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { useAuth } from '../../../context/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterFormIcon } from '../components/AuthFormIcons';
import '../auth.css';

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      avatar: '',
      bio: '',
    },
  });

  async function onSubmit(values) {
    try {
      setErrorMessage('');
      await registerAccount(values);
      navigate('/app', { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <AuthLayout
      icon={RegisterFormIcon}
      title="Create your account"
      subtitle="Start organizing notes, documents, and AI-powered study tools."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required.' })}
        />

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
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Use at least 8 characters."
          {...register('password', {
            required: 'Password is required.',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters.',
            },
          })}
        />

        {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
