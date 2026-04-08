import React from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import { Link } from "react-router-dom";
import {
  CloudRain,
  Wind,
  Thermometer,
  Waves,
  BrainCircuit,
  PlusCircle,
  Trophy,
  History,
  Loader2,
} from "lucide-react";
import CatchCard from "../cmps/CatchCard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, aiTip, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div
        className="container py-5 d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <Loader2 size={48} className="animate-spin mb-3" color="#0AC4E0" />
        <p className="text-sand opacity-75">Diving for your data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 text-sand">
            Good Morning,{" "}
            {user?.user_name || user?.first_name || "SpearFreshFish"}!
          </h2>
          <p className="opacity-75 mb-0 text-white">
            Ready for your next deep-sea adventure?
          </p>
        </div>
        <Link
          to="/log-catch"
          className="btn btn-accent btn-lg d-flex align-items-center gap-2"
        >
          <PlusCircle size={20} />
          <span>Log New Catch</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger border-0 glass-card text-white mb-4">
          {error}
        </div>
      )}

      {/* Hero Analytics Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="glass-card h-100">
            <h5 className="mb-4 d-flex align-items-center gap-2 text-white">
              <CloudRain size={20} color="#0AC4E0" />
              Conditions at Eilat, Israel
            </h5>
            <div className="row text-center text-white">
              <ConditionItem
                icon={<Thermometer size={32} />}
                value="24°C"
                label="Air"
              />
              <ConditionItem
                icon={<Waves size={32} />}
                value="18°C"
                label="Water"
              />
              <ConditionItem
                icon={<Wind size={32} />}
                value="12 km/h"
                label="Wind"
              />
              <ConditionItem
                icon={<History size={32} />}
                value="High"
                label="Tide"
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-card h-100 border-0 bg-gradient-cyan">
            <h5
              className="mb-3 d-flex align-items-center gap-2"
              style={{ color: "#0AC4E0" }}
            >
              <BrainCircuit size={20} />
              AI Pro Tip
            </h5>
            <p className="mb-0 fs-5 text-sand italic">"{aiTip}"</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="row g-4 mb-5">
        <StatCard label="Total Catches" value={stats.totalCatches} />
        <StatCard label="Total Sessions" value={stats.totalSessions} />
        <StatCard
          label="Biggest Fish"
          value={
            stats.biggestFish > 0 ? `${stats.biggestFish.toFixed(1)} kg` : "--"
          }
          icon={<Trophy size={20} color="#0AC4E0" />}
        />
        <StatCard label="Hours Logged" value={`${stats.hoursLogged}h`} />
      </div>

      {/* Recent Activity Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 text-white">Recent Catches</h4>
          <Link
            to="/catches"
            className="text-accent text-decoration-none small fw-bold"
          >
            View All Activity
          </Link>
        </div>

        {stats.recentCatches.length > 0 ? (
          <div className="row g-3">
            {stats.recentCatches.map((item) => (
              <div className="col-md-3" key={item.id}>
                <CatchCard catchItem={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-5">
            <p className="mb-0 opacity-50 text-white">
              Your tackle box is empty. Go catch some fish!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

/* --- Sub-Components for Cleanliness --- */

const ConditionItem: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="col-3">
    <div className="opacity-75 mb-2">{icon}</div>
    <div className="h4 mb-0">{value}</div>
    <div className="small opacity-50">{label}</div>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="col-md-3">
    <div className="glass-card text-center py-4 text-white h-100">
      {icon && <div className="mb-2">{icon}</div>}
      <h6 className="opacity-50 text-uppercase mb-2 small">{label}</h6>
      <div className="display-6 fw-bold">{value}</div>
    </div>
  </div>
);

export default Dashboard;
