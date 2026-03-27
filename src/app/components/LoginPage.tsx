import { useState } from "react";
import svgPaths from "../../imports/svg-a866f81vzf";
import imgLogo from "figma:asset/2a2c6e1ca3f5c4ba173c8c3bf0d9759ec43064b0.png";
import { apiLogin } from "../auth/api";

// ── DS360 Logo SVG ──────────────────────────────────────────────────
function Ds360Logo() {
  return (
    <div className="relative w-full h-full max-w-[350px] max-h-[350px] aspect-square">
      <svg
        className="w-full h-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 349.999 349.999"
      >
        <path d={svgPaths.p3fe3ae20} fill="#5EA7A3" />
        <path d={svgPaths.p28e53c00} fill="white" />
        <path d={svgPaths.p11e41700} fill="white" />
        <path d={svgPaths.p1c544980} fill="white" />
        <path d={svgPaths.pd3e3970} fill="white" />
        <path d={svgPaths.p2cab6500} fill="#5EA7A3" />
        <path d={svgPaths.p9404200} fill="white" />
        <path d={svgPaths.p3d3deb00} fill="white" />
        <path d={svgPaths.p2a916400} fill="white" />
        <path d={svgPaths.p33f53980} fill="white" />
        <path d={svgPaths.p1f066000} fill="white" />
        <path d={svgPaths.p7474a80} fill="#5EA7A3" />
        <path d={svgPaths.p3e910600} fill="white" />
        <path d={svgPaths.p28b4f3f0} fill="white" />
        <path d={svgPaths.p34f6100} fill="white" />
        <path d={svgPaths.p18b91500} fill="white" />
        <path d={svgPaths.p23389b00} fill="#5EA7A3" />
        <path d={svgPaths.p2e00cd00} fill="#5EA7A3" />
      </svg>
    </div>
  );
}

// ── Eye icon (visible) ──────────────────────────────────────────────
function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 18 15" fill="none" className="w-[18px] h-[18px]">
      <path
        d="M9.105 2C15.945 2 18 8.5 18 8.5C18 8.5 15.946 15 9.105 15C2.265 15 0 8.5 0 8.5C0 8.5 2.266 2 9.105 2ZM9.027 4.18C6.773 4.18 4.944 6.114 4.944 8.5C4.944 10.886 6.773 12.819 9.027 12.819C11.282 12.819 13.109 10.886 13.109 8.5C13.109 6.114 11.282 4.18 9.027 4.18ZM9.027 5.869C10.4 5.869 11.514 7.047 11.514 8.5C11.514 9.953 10.4 11.131 9.027 11.131C7.654 11.131 6.54 9.953 6.54 8.5C6.54 7.047 7.654 5.869 9.027 5.869Z"
        fill="#3A3A3A"
      />
    </svg>
  );
}

// ── Eye icon (hidden) ───────────────────────────────────────────────
function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-[18px] h-[18px]">
      <path d="M8.863 4.92L11.44 7.497 11.452 7.362C11.452 6.008 10.352 4.908 8.998 4.908L8.863 4.92Z" fill="#3A3A3A" />
      <path d="M8.998 3.272C11.256 3.272 13.088 5.104 13.088 7.362C13.088 7.889 12.982 8.393 12.798 8.855L15.19 11.247C16.425 10.217 17.399 8.883 18 7.362C16.581 3.771 13.092 1.227 8.998 1.227C7.853 1.227 6.757 1.431 5.738 1.799L7.505 3.562C7.967 3.382 8.47 3.272 8.998 3.272Z" fill="#3A3A3A" />
      <path d="M0.818 1.043L2.683 2.908 3.055 3.28C1.706 4.335 0.638 5.738 0 7.362C1.415 10.953 4.908 13.497 8.998 13.497C10.266 13.497 11.477 13.252 12.585 12.806L12.933 13.153 15.317 15.542 16.36 14.503 1.861 0 0.818 1.043ZM5.342 5.562L6.605 6.826C6.569 7.002 6.544 7.178 6.544 7.362C6.544 8.716 7.644 9.816 8.998 9.816C9.182 9.816 9.358 9.791 9.53 9.755L10.794 11.018C10.25 11.288 9.644 11.452 8.998 11.452C6.74 11.452 4.908 9.62 4.908 7.362C4.908 6.716 5.072 6.11 5.342 5.562Z" fill="#3A3A3A" />
    </svg>
  );
}

// ── Main Login Page Component ───────────────────────────────────────
interface LoginPageProps {
  onLogin: (token: string) => void;
  onRegister: () => void;
  onForgot: () => void;
}

export function LoginPage({ onLogin, onRegister, onForgot }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.ok && typeof res.token === "string") {
        onLogin(res.token);
      } else {
        setError(res.error ?? "Incorrect email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full bg-white p-4 sm:p-6 md:p-[50px] overflow-auto">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[50px] w-full max-w-[1100px] h-full min-h-0">

        {/* ── Left — Branded Logo Panel ── */}
        <div className="hidden md:flex flex-col items-center justify-end flex-1 h-auto lg:h-full min-h-[400px] lg:min-h-0 w-full lg:max-w-[50%] relative rounded-[25px] overflow-hidden pb-[40px] pt-[100px]">
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-ds-purple-dark rounded-[25px]" />
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-[25px]"
              src={imgLogo}
            />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex-1 flex items-center justify-center w-[60%] max-w-[350px]">
            <Ds360Logo />
          </div>

          {/* Copyright */}
          <p className="relative z-10 font-['Poppins',sans-serif] text-[14px] md:text-[16px] text-center text-white max-w-[376px] px-4 leading-relaxed" style={{ fontWeight: 400 }}>
            SOLUTIONS FOR ACCOUNT MANAGEMENT (SAM)
            {"\n"}Copyright All Rights Reserved &copy; 2023
          </p>
        </div>

        {/* ── Mobile Logo (shown below lg) ── */}
        <div className="flex md:hidden flex-col items-center gap-4 pt-4">
          <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] relative rounded-[20px] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-black rounded-[20px]" />
              <img
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
                src={imgLogo}
              />
            </div>
            <div className="relative z-10 w-[80%] h-[80%]">
              <Ds360Logo />
            </div>
          </div>
        </div>

        {/* ── Right — Login Form ── */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-[435px] lg:flex-1 lg:max-w-none lg:w-auto lg:items-center lg:justify-center py-4 lg:py-0">
          {/* Welcome Text */}
          <div className="flex flex-col items-center gap-1 w-full text-center">
            <p className="font-['Montserrat',sans-serif] text-[14px] sm:text-[16px] text-black" style={{ fontWeight: 400 }}>
              Welcome to the
            </p>
            <p className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]" style={{ fontWeight: 700 }}>
              DebtSales360 Admin Portal
            </p>
          </div>

          {/* Instructions */}
          <p className="font-['Poppins',sans-serif] text-[14px] sm:text-[16px] text-[#5b5b5b] text-center w-full max-w-[435px]" style={{ fontWeight: 400 }}>
            Enter your username and password to login to the Admin Portal.
          </p>

          {/* Error */}
          {error && (
            <div className="w-full max-w-[435px] bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="font-['Poppins',sans-serif] text-[13px] text-red-600" style={{ fontWeight: 500 }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8 items-center w-full max-w-[435px]">
            {/* Email Field */}
            <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
              <label
                htmlFor="login-email"
                className="font-['Poppins',sans-serif] text-[14px] text-black"
                style={{ fontWeight: 500 }}
              >
                Email Address
              </label>
              <div className="relative w-full">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full bg-white border border-[#3a3a3a] rounded-[40px] px-5 py-[14px] font-['Poppins',sans-serif] text-[15px] sm:text-[16px] text-[#3a3a3a] placeholder:text-[#3a3a3a]/50 outline-none focus:border-ds-purple focus:ring-2 focus:ring-ds-purple/15 transition-all"
                  style={{ fontWeight: 400 }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
              <label
                htmlFor="login-password"
                className="font-['Poppins',sans-serif] text-[14px] text-black"
                style={{ fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-white border border-[#3a3a3a] rounded-[40px] px-5 py-[14px] pr-12 font-['Poppins',sans-serif] text-[15px] sm:text-[16px] text-[#3a3a3a] placeholder:text-[#3a3a3a]/50 outline-none focus:border-ds-purple focus:ring-2 focus:ring-ds-purple/15 transition-all"
                  style={{ fontWeight: 400 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative flex items-center justify-center w-[250px] h-[49px] rounded-[100px] border border-[#46367f] transition-all cursor-pointer ${
                isLoading
                  ? "bg-[#46367f]/80"
                  : "bg-[#46367f] hover:bg-ds-purple-hover active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                  </svg>
                  <span
                    className="font-['Poppins',sans-serif] text-[14px] text-white"
                    style={{ fontWeight: 500 }}
                  >
                    Signing In...
                  </span>
                </div>
              ) : (
                <span
                  className="font-['Poppins',sans-serif] text-[14px] text-white"
                  style={{ fontWeight: 500 }}
                >
                  Login
                </span>
              )}
            </button>
          </form>

          {/* Secondary links */}
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              type="button"
              onClick={onForgot}
              className="font-['Poppins',sans-serif] text-[13px] text-ds-purple hover:underline cursor-pointer bg-transparent border-none"
              style={{ fontWeight: 500 }}
            >
              Forgot your password?
            </button>
            <p className="font-['Poppins',sans-serif] text-[13px] text-[#5b5b5b]" style={{ fontWeight: 400 }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onRegister}
                className="text-ds-purple hover:underline cursor-pointer bg-transparent border-none font-['Poppins',sans-serif] text-[13px]"
                style={{ fontWeight: 500 }}
              >
                Request Access
              </button>
            </p>
          </div>

          {/* Mobile copyright */}
          <p className="md:hidden font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center mt-4" style={{ fontWeight: 400 }}>
            SOLUTIONS FOR ACCOUNT MANAGEMENT (SAM)
            {"\n"}Copyright All Rights Reserved &copy; 2023
          </p>
        </div>
      </div>
    </div>
  );
}