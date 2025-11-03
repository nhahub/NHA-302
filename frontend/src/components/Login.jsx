import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import logoIcon from "../assets/logo.png";
import googleIcon from "../assets/google.png";
import { useGoogleAuth, useLogin } from "../features/user/useUserQuery";
import Button from "./ui/Button";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function Login() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { mutate: loginMutation, isPending } = useLogin();
  const googleAuth = useGoogleAuth();
  const onSubmit = async (data) => {
    console.log(data);
    loginMutation(data, {
      onSuccess: () => {
        toast.success(t("LoginToast"));
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
        const message =
          error?.response?.data?.message ||
          "There is no account with this email. Please sign up.";
        toast.error(message);
      },
    });
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-background dark:bg-background_dark">
      <div className="w-full max-w-sm rounded-3xl shadow-2xl bg-accent dark:bg-accent_dark font-sans">
        {/* Header */}
        <div className="flex items-center justify-center p-6 mb-4 rounded-t-2xl bg-accent dark:bg-accent_dark">
          <img src={logoIcon} alt="PayFlow Logo" className="w-10 h-10 mr-4" />
          <h1 className="text-3xl font-robotoCondensed text-black">
            {t("Login")}
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 space-y-7 rounded-2xl bg-primary dark:bg-primary_dark"
        >
          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder={t("EmailPlaceHolder")}
              className={`w-full px-4 py-3 text-lg text-gray-900 rounded-xl font-robotoCondensed focus:outline-none focus:ring-2 ${
                errors.email ? "focus:ring-red-500" : "focus:ring-white"
              }`}
              {...register("email", {
                required: t("EmailIsRequired"),
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: t("EmailIsInvalid"),
                },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder={t("PasswordPlaceHolder")}
              className={`w-full px-4 py-3 text-lg text-gray-900 rounded-xl font-robotoCondensed focus:outline-none focus:ring-2 ${
                errors.password ? "focus:ring-red-500" : "focus:ring-white"
              }`}
              {...register("password", {
                required: t("PasswordIsRequired"),
                minLength: {
                  value: 6,
                  message: t("PasswordIsInvalid"),
                },
              })}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="w-full flex items-center">
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="py-3 text-lg font-quicksand mx-auto"
            >
              {isPending ? t("LoginIsPending") : t("Login")}
            </Button>
          </div>

          <div className="text-center pt-2">
            <div className="relative flex items-center justify-center my-4">
              <div className="flex-grow border-t border-white/50"></div>
              <span className="flex-shrink mx-4 text-white text-sm font-robotoCondensed">
                {t("OrLoginWith")}
              </span>
              <div className="flex-grow border-t border-white/50"></div>
            </div>

            <Button
              type="button"
              className="flex items-center justify-center py-3 space-x-2 bg-white before:bg-accent before:dark:bg-accent_dark"
              onClick={googleAuth}
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              <span className="text-gray-700 font-medium">{t("Google")}</span>
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-white font-quicksand ">
              <span className="pr-3">{t("OrSignUpWith")}</span>
              <Link
                to="/signup"
                className="relative text-white group font-semibold hover:text-secondary hover:dark:text-secondary_dark"
              >
                {t("SignUpNow")}
                <span className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-secondary dark:bg-secondary_dark transition-all duration-500 group-hover:w-full" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
