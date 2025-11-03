import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import logoIcon from "../assets/logo.png";
import googleIcon from "../assets/google.png";
import { useGoogleAuth, useSignup } from "../features/user/useUserQuery";
import Button from "./ui/Button";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function SignUp() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const { mutate: signupMutation, isPending } = useSignup();
  const googleAuth = useGoogleAuth();

  const password = watch("password");

  const onSubmit = async (data) => {
    signupMutation(data, {
      onSuccess: (response) => {
        toast.success(t("SignUpToast"));
        const role = response?.data?.user?.role || "user";
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      },
      onError: (error) => {
        console.error("Signup error:", error);

        const message =
          error?.response?.data?.message ||
          "Signup failed. Please try again or use a different email.";

        toast.error(message);
      },
    });
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-background dark:bg-background_dark py-5">
      <div className="w-full max-w-sm rounded-3xl shadow-2xl bg-accent dark:bg-accent_dark font-sans">
        {/* Header */}
        <div className="flex items-center justify-center p-6 mb-4 rounded-t-2xl bg-accent dark:bg-accent_dark">
          <img src={logoIcon} alt="PayFlow Logo" className="w-10 h-10 mr-4" />
          <h1 className="text-3xl font-robotoCondensed text-black">
            {t("SignUpNow")}
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 space-y-7 rounded-2xl bg-primary dark:bg-primary_dark"
        >
          {/* Username */}
          <div>
            <input
              type="text"
              placeholder={t("UserNamePlaceHolder")}
              {...register("username", { required: t("UserNameIsRequired") })}
              className={`w-full px-4 py-3 text-lg text-gray-900 rounded-xl font-robotoCondensed focus:outline-none focus:ring-2 ${
                errors.username ? "focus:ring-red-500" : "focus:ring-white"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder={t("PasswordPlaceHolder")}
              {...register("password", {
                required: t("PasswordIsRequired"),
                minLength: { value: 6, message: t("PasswordIsInvalid") },
              })}
              className={`w-full px-4 py-3 text-lg text-gray-900 font-robotoCondensed rounded-xl focus:outline-none focus:ring-2 ${
                errors.password ? "focus:ring-red-500" : "focus:ring-white"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder={t("ConfirmPasswordPlaceHolder")}
              {...register("confirmPassword", {
                required: t("ConfirmPasswordIsRequired"),
                validate: (value) =>
                  value === password || t("PasswordDidn'tMatch"),
              })}
              className={`w-full px-4 py-3 text-lg text-gray-900 font-robotoCondensed rounded-xl focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "focus:ring-red-500"
                  : "focus:ring-white"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder={t("EmailPlaceHolder")}
              {...register("email", {
                required: t("EmailIsRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("EmailIsInvalid"),
                },
              })}
              className={`w-full px-4 py-3 text-lg text-gray-900 rounded-xl font-robotoCondensed focus:outline-none focus:ring-2 ${
                errors.email ? "focus:ring-red-500" : "focus:ring-white"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="w-full flex items-center">
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="text-lg font-quicksand mx-auto"
            >
              {isPending ? t("SignUpIsPending") : t("SignUp")}
            </Button>
          </div>

          {/* Divider + Google Button */}
          <div className="text-center pt-2">
            <div className="relative flex items-center justify-center my-4">
              <div className="flex-grow border-t border-white/50"></div>
              <span className="flex-shrink mx-4 font-robotoCondensed text-white text-sm">
                {t("OrSignUpWith")}
              </span>
              <div className="flex-grow border-t border-white/50"></div>
            </div>

            <Button
              type="button"
              onClick={googleAuth}
              className="flex items-center justify-center py-3 space-x-2 bg-white before:bg-accent before:dark:bg-accent_dark"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              <span className="text-gray-700 font-medium">{t("Google")}</span>
            </Button>
          </div>

          {/* Link to Login */}
          <div className="text-center mt-6">
            <p className="text-white">
              <span className="pr-3 font-quicksand">{t("AlreadyAMember")}</span>
              <Link
                to="/login"
                className="relative text-white group font-semibold hover:text-secondary hover:dark:text-secondary_dark"
              >
                {t("LoginNow")}
                <span className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-secondary dark:bg-secondary_dark transition-all duration-500 group-hover:w-full" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
