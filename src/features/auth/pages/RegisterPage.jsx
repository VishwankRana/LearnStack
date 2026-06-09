import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      avatar: "",
      bio: "",
    },
  });

  async function onSubmit(values) {
    try {
      setErrorMessage("");
      await registerAccount(values);
      navigate("/app", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__copy">
          <h2 className="auth-card__title">Create your account</h2>
        </div>

        <form
          className="auth-form auth-form--grid"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Vishw"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name ? (
              <small className="field__error">{errors.name.message}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required." })}
            />
            {errors.email ? (
              <small className="field__error">{errors.email.message}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
              })}
            />
            {errors.password ? (
              <small className="field__error">{errors.password.message}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Avatar URL</span>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register("avatar")}
            />
          </label>

          <label className="field field--full">
            <span>Bio</span>
            <textarea
              placeholder="Tell MindVault a bit about yourself."
              rows="4"
              {...register("bio")}
            />
          </label>

          {errorMessage ? (
            <p className="auth-form__error field--full">{errorMessage}</p>
          ) : null}

          <button
            className="button button--primary auth-form__submit field--full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
