import { useState } from "react";
import imgLogo from "figma:asset/2a2c6e1ca3f5c4ba173c8c3bf0d9759ec43064b0.png";
import { apiResetConfirm } from "../auth/api";

interface ResetPasswordPageProps {
  token: string;
  onDone: () => void;
}

export function ResetPasswordPage({ token, onDone }: ResetPasswordPageProps) {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiResetConfirm(token, password);
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.error ?? "Failed to reset password. The link may have expired.");
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

        {/* ── Left — Branded Panel ── */}
        <div className="hidden md:flex flex-col items-center justify-end flex-1 h-auto lg:h-full min-h-[400px] lg:min-h-0 w-full lg:max-w-[50%] relative rounded-[25px] overflow-hidden pb-[40px] pt-[100px]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-ds-purple-dark rounded-[25px]" />
            <img alt="" className="absolute inset-0 w-full h-full object-cover rounded-[25px]" src={imgLogo} />
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center w-[60%] max-w-[350px]" />
          <p className="relative z-10 font-['Poppins',sans-serif] text-[14px] text-center text-white max-w-[376px] px-4 leading-relaxed" style={{ fontWeight: 400 }}>
            SOLUTIONS FOR ACCOUNT MANAGEMENT (SAM){"\n"}Copyright All Rights Reserved &copy; 2023
          </p>
        </div>

        {/* ── Right — Form ── */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-[435px] lg:flex-1 lg:max-w-none lg:w-auto py-4 lg:py-0">
          <div className="flex flex-col items-center gap-1 w-full text-center">
            <p className="font-['Montserrat',sans-serif] text-[14px] text-black" style={{ fontWeight: 400 }}>Choose a new</p>
            <p className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]" style={{ fontWeight: 700 }}>DS360 Password</p>
          </div>

          {!success ? (
            <>
              {error && (
                <div className="w-full max-w-[435px] bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <p className="font-['Poppins',sans-serif] text-[13px] text-red-600" style={{ fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center w-full max-w-[435px]">
                <div className="flex flex-col gap-2 items-start w-full">
                  <label className="font-['Poppins',sans-serif] text-[14px] text-black" style={{ fontWeight: 500 }}>New Password</label>
                  <div className="relative w-full">
                    <input
                      type={showPass ? "text" : "password"} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" autoComplete="new-password"
                      className="w-full bg-white border border-[#3a3a3a] rounded-[40px] px-5 py-[14px] pr-12 font-['Poppins',sans-serif] text-[15px] text-[#3a3a3a] placeholder:text-[#3a3a3a]/50 outline-none focus:border-ds-purple focus:ring-2 focus:ring-ds-purple/15 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity p-1"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      <svg viewBox="0 0 18 15" fill="none" className="w-[16px] h-[16px]">
                        <path d="M9.105 2C15.945 2 18 8.5 18 8.5C18 8.5 15.946 15 9.105 15C2.265 15 0 8.5 0 8.5C0 8.5 2.266 2 9.105 2ZM9.027 4.18C6.773 4.18 4.944 6.114 4.944 8.5C4.944 10.886 6.773 12.819 9.027 12.819C11.282 12.819 13.109 10.886 13.109 8.5C13.109 6.114 11.282 4.18 9.027 4.18ZM9.027 5.869C10.4 5.869 11.514 7.047 11.514 8.5C11.514 9.953 10.4 11.131 9.027 11.131C7.654 11.131 6.54 9.953 6.54 8.5C6.54 7.047 7.654 5.869 9.027 5.869Z" fill="#3A3A3A" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start w-full">
                  <label className="font-['Poppins',sans-serif] text-[14px] text-black" style={{ fontWeight: 500 }}>Confirm Password</label>
                  <input
                    type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password" autoComplete="new-password"
                    className="w-full bg-white border border-[#3a3a3a] rounded-[40px] px-5 py-[14px] font-['Poppins',sans-serif] text-[15px] text-[#3a3a3a] placeholder:text-[#3a3a3a]/50 outline-none focus:border-ds-purple focus:ring-2 focus:ring-ds-purple/15 transition-all"
                  />
                </div>

                <button
                  type="submit" disabled={isLoading}
                  className={`flex items-center justify-center w-[250px] h-[49px] rounded-[100px] border border-[#46367f] transition-all cursor-pointer ${isLoading ? "bg-[#46367f]/80" : "bg-[#46367f] hover:bg-ds-purple-hover active:scale-[0.98]"}`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                      </svg>
                      <span className="font-['Poppins',sans-serif] text-[14px] text-white" style={{ fontWeight: 500 }}>Updating...</span>
                    </div>
                  ) : (
                    <span className="font-['Poppins',sans-serif] text-[14px] text-white" style={{ fontWeight: 500 }}>Set New Password</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center max-w-[435px]">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                  <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-['Poppins',sans-serif] text-[15px] text-[#3a3a3a]" style={{ fontWeight: 500 }}>
                Password updated successfully.
              </p>
              <button
                type="button" onClick={onDone}
                className="flex items-center justify-center w-[200px] h-[45px] rounded-[100px] bg-[#46367f] hover:bg-ds-purple-hover text-white font-['Poppins',sans-serif] text-[14px] transition-all cursor-pointer border-none"
                style={{ fontWeight: 500 }}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
