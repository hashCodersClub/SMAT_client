import { FiUsers, FiUserCheck, FiCheckCircle, FiLayers } from "react-icons/fi";

const TrainerStats = ({ trainers }) => {
  const total = trainers.length;
  const active = trainers.filter((t) => t.status === "ACTIVE").length;
  const available = trainers.filter(
    (t) => t.availability === "AVAILABLE",
  ).length;
  const skills = new Set(trainers.flatMap((t) => t.skills)).size;

  const stats = [
    {
      label: "Total Trainers",
      value: total,
      description: "Trainer profiles",
      icon: FiUsers,
      gradient: "from-blue-500 to-cyan-400",
      delay: "0ms",
    },
    {
      label: "Active Trainers",
      value: active,
      description: "Currently active",
      icon: FiUserCheck,
      gradient: "from-emerald-500 to-teal-400",
      delay: "100ms",
    },
    {
      label: "Available",
      value: available,
      description: "Ready for requirements",
      icon: FiCheckCircle,
      gradient: "from-purple-500 to-pink-400",
      delay: "200ms",
    },
    {
      label: "Skills",
      value: skills,
      description: "Unique technologies",
      icon: FiLayers,
      gradient: "from-amber-500 to-orange-400",
      delay: "300ms",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .stat-card {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          transition: transform 0.3s ease, box-shadow 0.4s ease, border-color 0.3s ease;
          will-change: transform, box-shadow;
        }

        .stat-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
        }

        .stat-card .icon-wrap {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover .icon-wrap {
          transform: scale(1.08) rotate(-3deg);
          box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.2);
        }

        .stat-value {
          font-feature-settings: "tnum";
        }
      `}</style>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-card rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/50"
              style={{
                animationDelay: stat.delay,
                borderColor: "rgba(255,255,255,0.3)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-400/80">
                    {stat.label}
                  </p>
                  <h3
                    className={`stat-value mt-2 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </h3>
                  <p className="mt-1 text-xs font-light text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`icon-wrap rounded-2xl bg-gradient-to-br ${stat.gradient} p-3.5 text-white shadow-lg`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TrainerStats;
