import { useEffect, useState } from "react";
import Navbar from "./NavBar";

const API_URL = import.meta.env.VITE_API_URL;

const StatsPage = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoogleCharts = () => {
      return new Promise((resolve) => {
        if (window.google) {
          resolve();
        } else {
          const script = document.createElement("script");
          script.src = "https://www.gstatic.com/charts/loader.js";
          script.onload = resolve;
          document.head.appendChild(script);
        }
      });
    };

    const fetchAndDraw = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Niste autorizovani ili je server greška (401)");
        }

        const result = await res.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Neispravan format podataka sa servera");
        }

        const stats = result.data;

        const dataForChart = [["Model", "Usage"]];
        stats.forEach((s) => {
          dataForChart.push([s.modelName, s.usage]);
        });

        await loadGoogleCharts();

        window.google.charts.load("current", { packages: ["corechart"] });
        window.google.charts.setOnLoadCallback(() => {
          drawChart(dataForChart);
        });

        setChartData(dataForChart);
        setLoading(false);
      } catch (err) {
        console.error("Greška:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    const drawChart = (dataRows) => {
      if (!window.google || !dataRows.length) return;

      const data = window.google.visualization.arrayToDataTable(dataRows);

      const options = {
        pieHole: 0.4,
        height: 400,
        backgroundColor: "transparent",
        legend: {
          textStyle: { color: "#e2e8f0" },
        },
        titleTextStyle: {
          color: "#f1f5f9",
          fontSize: 18,
        },
        chartArea: { width: "90%", height: "80%" },
      };

      const chart = new window.google.visualization.PieChart(
        document.getElementById("chart_div"),
      );
      chart.draw(data, options);
    };

    fetchAndDraw();

    const handleResize = () => {
      if (chartData.length) {
        drawChart(chartData);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-8 bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-slate-100 text-xl font-semibold">
            📊 Model Usage Statistics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pregled korišćenja AI modela u sistemu
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-slate-300 animate-pulse">
            Učitavanje podataka...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
            Greška: {error}
          </div>
        )}

        {/* Chart container */}
        {!loading && !error && (
          <div className="bg-slate-700 rounded-lg p-4 shadow-inner">
            <div id="chart_div" className="w-full min-h-[400px]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
