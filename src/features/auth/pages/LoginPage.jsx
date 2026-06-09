import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values) {
    try {
      setErrorMessage('')
      await login(values)
      const destination = location.state?.from?.pathname ?? '/app'
      navigate(destination, { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-card__copy">
          <h2 className="auth-card__title">Sign in</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required.' })}
            />
            {errors.email ? (
              <small className="field__error">{errors.email.message}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required.',
              })}
            />
            {errors.password ? (
              <small className="field__error">{errors.password.message}</small>
            ) : null}
          </label>

          {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

          <button className="button button--primary auth-form__submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  )
}
