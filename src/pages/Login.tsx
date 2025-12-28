import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // On success, the AuthContext state updates, App.tsx unlocks routes,
      // and we navigate home.
      nav("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-100 px-4">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm mb-8">Secure access to Sentra Operations</p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Email</label>
            <input
              type="email"
              placeholder="operator@sentra.io"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-teal-500 outline-none transition-all text-white"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-teal-500 outline-none transition-all text-white"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <button
            disabled={loading}
            onClick={submit}
            className={`w-full py-4 mt-4 rounded-xl font-bold transition-all shadow-lg ${
              loading 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-teal-500 text-[#020617] hover:bg-teal-400 shadow-teal-500/20"
            }`}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <button 
            onClick={() => nav("/register")} 
            className="text-teal-400 hover:underline font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </main>
  );
}