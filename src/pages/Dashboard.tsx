import Header from "@/components/layout/Header";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6">
        <ProgressDashboard />
      </div>
    </div>
  );
};

export default Dashboard;


