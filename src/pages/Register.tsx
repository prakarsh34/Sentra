import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  // Ensure your AuthContext actually calls it 'register'
  // If your context uses 'signUp', change this line:
  const { register } = useAuth(); 
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Fixed type annotation for consistency
  const [role, setRole] = useState<"citizen" | "responder">("citizen");

  const submit = async () => {
    try {
      await register(email, password, role);
      // Once registered, the user exists, and App.tsx will 
      // now allow the navbar links to work!
      nav("/");
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed. Check console.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-100">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-8">Join the Sentra Emergency Network</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-teal-500 outline-none transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-teal-500 outline-none transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 block">Account Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "citizen" | "responder")}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl focus:border-teal-500 outline-none transition-colors text-white"
            >
              <option value="citizen" className="bg-slate-900">Citizen (Reporter)</option>
              <option value="responder" className="bg-slate-900">Responder (Operations)</option>
            </select>
          </div>

          <button
            onClick={submit}
            className="w-full py-4 mt-4 rounded-xl bg-teal-500 text-[#020617] font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
          >
            Register to Platform
          </button>
        </div>
        
        <p className="mt-6 text-center text-xs text-slate-500">
          By registering, you agree to the emergency operational guidelines.
        </p>
      </div>
    </main>
  );
}