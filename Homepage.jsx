import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Shield,
  Users,
  Activity,
  Building2,
  HardHat,
  Globe,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function App() {
  const stats = [
    {
      icon: MapPin,
      value: "56",
      label: "Municipalities Affected",
      color: "from-red-400 to-red-600",
    },
    {
      icon: Users,
      value: "70K",
      label: "People Displaced",
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: Activity,
      value: "6.3",
      label: "Earthquake Magnitude",
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: Building2,
      value: "€1.1B",
      label: "Estimated Damage",
      color: "from-blue-400 to-blue-600",
    },
  ];

  const features = [
    {
      icon: Globe,
      title: "Real-Time GIS Mapping",
      desc: "Interactive maps with georeferenced project data",
    },
    {
      icon: Shield,
      title: "Secure & Collaborative",
      desc: "Role-based access for field officers and authorities",
    },
    {
      icon: FileText,
      title: "Progress Reports",
      desc: "Exportable CSV reports with reconstruction indicators",
    },
    {
      icon: HardHat,
      title: "Field Updates",
      desc: "Upload GeoJSON, add notes, track status on-site",
    },
  ];

  return (
    <>
      {/* BACKGROUND IMAGE */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/geolocation.avif)" }}
      />

      {/* DARK OVERLAY FOR READABILITY */}
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <div className="relative min-h-screen text-white">
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full bg-black/60 backdrop-blur-md z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                RebuildTrack
              </h1>
            </div>
            <div className="flex space-x-6">
              <a
                href="#features"
                className="hover:text-cyan-300 transition font-medium"
              >
                Features
              </a>
              <a
                href="#about"
                className="hover:text-cyan-300 transition font-medium"
              >
                About
              </a>
              <a
                href="/login"
                className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition flex items-center space-x-2"
              >
                <span>Launch Platform</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <motion.section
          className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
              Post-Disaster Reconstruction Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Rebuild with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              Data & Precision
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl max-w-3xl mx-auto opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            A cloud-edge GIS platform for monitoring reconstruction progress,
            enabling transparent decision-making and efficient resource
            allocation.
          </motion.p>

          <motion.div
            className="mt-10 flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="/register"
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition flex items-center space-x-2"
            >
              <Globe className="w-5 h-5" />
              <span>Register to explore</span>
            </a>
            <a
              href="#features"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </motion.div>
        </motion.section>

        {/* STATS */}
        <motion.div
          className="max-w-7xl mx-auto px-6 -mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm opacity-80 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FEATURES */}
        <motion.section
          id="features"
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">Platform Capabilities</h2>
              <p className="mt-4 text-lg opacity-80">
                Designed for real-world reconstruction challenges
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-cyan-400 transition"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                    <f.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="opacity-80">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* STORY */}
        <motion.section
          id="about"
          className="py-20 bg-gradient-to-b from-transparent to-black/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-amber-400/30"
            >
              <Clock className="w-4 h-4" />
              <span>April 6, 2009 • 3:32 AM</span>
            </motion.div>

            <h2 className="text-4xl font-bold mb-6">
              A Platform Born from Crisis
            </h2>
            <p className="text-lg leading-relaxed mb-8 opacity-90">
              When a <strong>6.3 magnitude earthquake</strong> struck central
              Italy, it left <strong>309 lives lost</strong>,{" "}
              <strong>70,000 homeless</strong>, and{" "}
              <strong>56 towns in ruins</strong>. Traditional monitoring failed
              under the scale.
            </p>
            <p className="text-lg leading-relaxed opacity-90">
              <strong>RebuildTrack</strong> brings <strong>transparency</strong>
              , <strong>real-time data</strong>, and{" "}
              <strong>collaboration</strong> to reconstruction — ensuring every
              euro, every brick, and every decision is tracked and accountable.
            </p>

            <motion.div
              className="mt-12 flex justify-center flex-wrap gap-6 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {[
                "Cloud-Edge Architecture",
                "GIS-Powered Indicators",
                "Open & Exportable Data",
              ].map((t, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="py-16 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Track Reconstruction?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join field officers and authorities in rebuilding smarter, faster,
              and transparently.
            </p>
            <div className="flex justify-center flex-wrap gap-4">
              <a
                href="/login?role=user"
                className="bg-white text-cyan-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Field Officer Login
              </a>
              <a
                href="/login?role=admin"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-cyan-600 transition"
              >
                Authority Login
              </a>
            </div>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="py-8 bg-black/40 backdrop-blur-sm text-center text-sm">
          <p>
            © 2025 RebuildTrack • Built with React, Vite, Tailwind & Framer
            Motion
          </p>
          <p className="mt-1 opacity-70">
            Inspired by real-world post-disaster recovery systems
          </p>
        </footer>
      </div>
    </>
  );
}
