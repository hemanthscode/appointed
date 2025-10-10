import React, { useEffect, useState } from "react";
import { Layout } from "../components/common";
import Card from "../components/ui/Card";
import StatsCard from "../components/cards/StatsCard";
import { useToast } from "../contexts/ToastContext";
import adminService from "../services/adminService";
import appointmentService from "../services/appointmentService";
import { Calendar, Clock } from "lucide-react";
import { ANIMATIONS } from "../utils";

const Dashboard = () => {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const data = await adminService.getSystemStats();
        setStats(data);
      } catch {
        toast.addToast("Failed to load system statistics.", "error");
      }
      setLoadingStats(false);
    }

    async function fetchAppointments() {
      setLoadingAppointments(true);
      try {
        const data = await appointmentService.getAppointments({
          page: 1,
          limit: 5,
          status: "confirmed",
        });
        // Defensive check
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } catch {
        toast.addToast("Failed to load upcoming appointments.", "error");
      }
      setLoadingAppointments(false);
    }

    fetchStats();
    fetchAppointments();
  }, [toast]);

  return (
    <Layout headerTitle="Dashboard">
      <section className="max-w-7xl mx-auto p-6 text-white space-y-8">
        <h1 className="text-4xl font-bold">Dashboard Overview</h1>

        {loadingStats ? (
          <p>Loading statistics...</p>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label="Total Users" value={stats.totalUsers} icon={Calendar} />
            <StatsCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} />
            <StatsCard label="Total Appointments" value={stats.totalAppointments} icon={Calendar} />
          </div>
        ) : (
          <p>No statistics available.</p>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {loadingAppointments ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            <ul>
              {appointments.map(({ id, date, time, teacher, student }) => (
                <Card key={id} className="p-4 mb-4">
                  <p>
                    {new Date(date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at {time} —{" "}
                    {teacher?.name ?? "Teacher"} / {student?.name ?? "Student"}
                  </p>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
