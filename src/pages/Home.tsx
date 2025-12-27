import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-red-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Real-Time Emergency <br />
            <span className="text-red-600">Response Platform</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mb-10">
            Sentra enables citizens to report emergencies instantly and empowers
            responders to verify, prioritize, and coordinate action in real time.
          </p>

          <div className="flex gap-4">
            <Link
              to="/report"
              className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-xl font-semibold shadow-lg"
            >
              🚨 Report Incident
            </Link>

            <Link
              to="/dashboard"
              className="bg-white border hover:bg-gray-100 px-7 py-3 rounded-xl font-semibold shadow"
            >
              🧑‍✈️ Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <Feature title="Instant Reporting" />
          <Feature title="Live Monitoring" />
          <Feature title="Smart Verification" />
        </div>
      </section>
    </div>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div className="p-6 rounded-xl border bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">
        Built for speed, reliability, and real-time response.
      </p>
    </div>
  );
}

export default Home;
