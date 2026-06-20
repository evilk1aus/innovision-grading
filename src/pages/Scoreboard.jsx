import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

import { createClient } from '@supabase/supabase-js'

import { getRubricForSession, getMaxTotal, sumGrade } from '../rubrics.js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)

const SessionTypeSelector = ({ sessionTypes, onSelect }) => (
  <div className="flex flex-col min-h-screen bg-gray-900 w-screen px-6 py-16">
    <div className="flex flex-row justify-center">
      <h2 className="text-blue-300 text-4xl text-center">Scoreboard</h2>
    </div>
    <p className="text-gray-400 text-center mt-2">Select a session to view average scores</p>
    <div className="max-w-3xl w-full mx-auto mt-12 grid grid-cols-1 gap-4">
      {sessionTypes.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelect(session.id)}
          className="text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-400 rounded-md px-5 py-4 transition-colors"
        >
          <span className="text-blue-300 font-medium">{session.name}</span>
        </button>
      ))}
    </div>
  </div>
);

const RankBadge = ({ rank }) => {
  const styles = {
    1: "bg-yellow-400 text-gray-900",
    2: "bg-gray-300 text-gray-900",
    3: "bg-amber-600 text-gray-900",
  };
  const style = styles[rank] || "bg-gray-700 text-gray-200";
  return (
    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${style}`}>
      {rank}
    </span>
  );
};

const ScoreboardRow = ({ rank, project, average, maxTotal, panelistCount }) => (
  <div className="flex flex-row items-center gap-4 bg-gray-800 border border-gray-700 rounded-md px-5 py-4">
    <RankBadge rank={rank} />
    <div className="flex-1 min-w-0">
      <h3 className="text-blue-300 font-medium truncate">{project.project_name}</h3>
      <p className="text-gray-300 text-sm truncate">{project.app_name}</p>
      <p className="text-gray-400 text-xs truncate">{project.presenters}</p>
    </div>
    <div className="flex flex-col items-end shrink-0">
      <span className="text-gray-100 font-medium text-lg">
        {average === null ? "—" : average.toFixed(2)}
        {average !== null && <span className="text-gray-400 text-sm"> / {maxTotal}</span>}
      </span>
      <span className="text-gray-400 text-xs">
        {panelistCount === 0
          ? "No scores yet"
          : `${panelistCount} panelist${panelistCount === 1 ? "" : "s"}`}
      </span>
    </div>
  </div>
);

const ScoreboardList = ({ sessionTypeId, sessionName, rows, loading, onBack, onRefresh }) => {
  const rubric = getRubricForSession(sessionTypeId);
  const maxTotal = getMaxTotal(rubric);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 w-screen px-6 py-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex flex-row items-center justify-between gap-3">
          <h2 className="text-blue-300 text-3xl">{sessionName}</h2>
          <div className="flex flex-row items-center gap-3 shrink-0">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 rounded-md px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={onBack}
              className="text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 rounded-md px-3 py-1.5 transition-colors"
            >
              Change Session
            </button>
          </div>
        </div>

        {loading && rows.length === 0 ? (
          <p className="text-gray-300 mt-10 text-center">Loading scores...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-400 mt-10 text-center">No projects found for this session.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {rows.map((row, idx) => (
              <ScoreboardRow
                key={row.project.id}
                rank={idx + 1}
                project={row.project}
                average={row.average}
                maxTotal={maxTotal}
                panelistCount={row.panelistCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Scoreboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorLog, setErrorLog] = useState(null);

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('SessionType')
      .select("id,name")
      .order("id", { ascending: true });

    if (error) {
      setErrorLog(error["code"] + " - " + error["message"]);
      return;
    }
    setSessionTypes(data);
  };

  const fetchScores = async (sessionTypeId) => {
    setLoading(true);

    const { data: projects, error: projectsError } = await supabase
      .from('Projects')
      .select("id,session_type,project_name,app_name,presenters")
      .eq("session_type", sessionTypeId);

    if (projectsError) {
      setLoading(false);
      setErrorLog(projectsError["code"] + " - " + projectsError["message"]);
      return;
    }

    if (!projects || projects.length === 0) {
      setLoading(false);
      setRows([]);
      return;
    }

    const projectIds = projects.map((p) => p.id);

    const { data: gradingRows, error: gradingError } = await supabase
      .from('Grading')
      .select("project_id,grade")
      .in("project_id", projectIds);

    setLoading(false);
    if (gradingError) {
      setErrorLog(gradingError["code"] + " - " + gradingError["message"]);
      return;
    }

    const rubric = getRubricForSession(sessionTypeId);

    const computedRows = projects.map((project) => {
      const relevantGrades = (gradingRows || []).filter((g) => g.project_id === project.id);
      const panelistCount = relevantGrades.length;
      const average =
        panelistCount === 0
          ? null
          : relevantGrades.reduce((sum, g) => sum + sumGrade(g.grade, rubric), 0) / panelistCount;

      return { project, average, panelistCount };
    });

    // Rank by average descending; projects with no scores yet sort last.
    computedRows.sort((a, b) => {
      if (a.average === null && b.average === null) return 0;
      if (a.average === null) return 1;
      if (b.average === null) return -1;
      return b.average - a.average;
    });

    setRows(computedRows);
  };

  const handleSelectSession = async (sessionTypeId) => {
    setSelectedSessionId(sessionTypeId);
    await fetchScores(sessionTypeId);
  };

  const handleBack = () => {
    setSelectedSessionId(null);
    setRows([]);
  };

  const handleRefresh = () => {
    if (selectedSessionId !== null) {
      fetchScores(selectedSessionId);
    }
  };

  const goToGrading = () => {
    navigate('/grading', { state: location.state });
  };

  const selectedSession = sessionTypes.find((s) => s.id === selectedSessionId);

  return (
    <>
      <div className="relative">
        <button
          onClick={goToGrading}
          className="fixed top-4 right-4 z-10 text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 bg-gray-900 rounded-md px-3 py-1.5 transition-colors"
        >
          Back to Grading
        </button>

        {selectedSessionId !== null ? (
          <ScoreboardList
            sessionTypeId={selectedSessionId}
            sessionName={selectedSession ? selectedSession.name : ""}
            rows={rows}
            loading={loading}
            onBack={handleBack}
            onRefresh={handleRefresh}
          />
        ) : (
          <SessionTypeSelector sessionTypes={sessionTypes} onSelect={handleSelectSession} />
        )}
      </div>

      {errorLog != null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 border border-gray-700 rounded-md p-6 max-w-md">
            <p className="text-gray-100">An error occurred. Please check the error message below.</p>
            <p className="text-red-400 text-sm mt-2">{errorLog}</p>
            <div className="flex flex-row justify-end mt-4">
              <button
                onClick={() => setErrorLog(null)}
                className="bg-blue-500 hover:bg-blue-400 text-gray-900 font-medium rounded-md px-4 py-2 transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Scoreboard
