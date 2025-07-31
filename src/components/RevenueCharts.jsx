import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const RevenueCharts = ({ bookings }) => {
  const [chartPeriod, setChartPeriod] = useState("monthly");

  const getChartData = () => {
    const now = new Date();
    let labels = [];
    let data = [];

    if (chartPeriod === "weekly") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));

        const dayRevenue = bookings
          .filter((booking) => {
            const bookingDate = new Date(
              booking.createdAt || booking.bookingInfo?.checkIn
            );
            return bookingDate.toDateString() === date.toDateString();
          })
          .reduce(
            (sum, booking) => sum + (booking.paymentDetails?.totalAmount || 0),
            0
          );

        data.push(dayRevenue);
      }
    } else if (chartPeriod === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString("en-US", { month: "short" }));

        const monthRevenue = bookings
          .filter((booking) => {
            const bookingDate = new Date(
              booking.createdAt || booking.bookingInfo?.checkIn
            );
            return (
              bookingDate.getMonth() === date.getMonth() &&
              bookingDate.getFullYear() === date.getFullYear()
            );
          })
          .reduce(
            (sum, booking) => sum + (booking.paymentDetails?.totalAmount || 0),
            0
          );

        data.push(monthRevenue);
      }
    } else if (chartPeriod === "yearly") {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        labels.push(year.toString());

        const yearRevenue = bookings
          .filter((booking) => {
            const bookingDate = new Date(
              booking.createdAt || booking.bookingInfo?.checkIn
            );
            return bookingDate.getFullYear() === year;
          })
          .reduce(
            (sum, booking) => sum + (booking.paymentDetails?.totalAmount || 0),
            0
          );

        data.push(yearRevenue);
      }
    }

    return { labels, data };
  };

  const chartData = getChartData();

  const barChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: chartData.data,
        backgroundColor: "rgba(255, 193, 7, 0.6)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue Trend (₹)",
        data: chartData.data,
        borderColor: "rgba(255, 193, 7, 1)",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Revenue - ${
          chartPeriod.charAt(0).toUpperCase() + chartPeriod.slice(1)
        }`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="w-full space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-dark flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue Chart
          </h3>
          <div className="flex space-x-1 sm:space-x-2">
            {["weekly", "monthly", "yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 rounded text-xs ${
                  chartPeriod === period
                    ? "bg-secondary text-dark"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 sm:h-64 w-full">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-dark mb-4">
          Revenue Trend
        </h3>
        <div className="h-48 sm:h-64 w-full">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default RevenueCharts;
