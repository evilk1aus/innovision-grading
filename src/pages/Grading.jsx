import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom";

import { createClient } from '@supabase/supabase-js'

import { getRubricForSession, getMaxTotal, getAwardOptionsForSession } from '../rubrics.js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Upserts the Grading table with this panelist's score (and optional award
// nomination) for a project.
// scoresJson is keyed by criterion, e.g. { research_excellence: 18, innovation: 12, ... }.
// award is a string like "data_science:Best Machine Learning Model", or null if
// the panelist didn't nominate this project for an award.
// Conflict target is (project_id, panelist_id) so re-saving updates the same row
// instead of inserting a duplicate.
const updateScores = async (projectId, panelistId, scoresJson, award) => {
  const { data, error } = await supabase
    .from('Grading')
    .upsert(
      {
        project_id: projectId,
        panelist_id: panelistId,
        grade: scoresJson,
        award: award,
      },
      { onConflict: "project_id,panelist_id" }
    );

  if (error) {
    return { error };
  }
  return { data };
};

const SessionTypeSelector = ({ sessionTypes, onSelect }) => (
  <div className="flex flex-col min-h-screen bg-gray-900 w-screen px-6 py-16">
    <div className="flex flex-row justify-center">
      <h2 className="text-blue-300 text-4xl text-center">Select a Session</h2>
    </div>
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

const ScoreInput = ({ value, max, onChange }) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("");
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    onChange(Math.max(0, Math.min(max, num)));
  };

  return (
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={handleChange}
      className="w-20 p-1.5 text-center border border-gray-300 bg-white rounded-md"
    />
  );
};

const AwardSelector = ({ award, onChange, options }) => {
  if (options.length === 0) return null;

  // Group flat options back by category for an <optgroup> layout.
  const grouped = options.reduce((acc, opt) => {
    if (!acc[opt.categoryLabel]) acc[opt.categoryLabel] = [];
    acc[opt.categoryLabel].push(opt);
    return acc;
  }, {});

  return (
    <div className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-gray-700">
      <label className="text-gray-100 text-sm">
        Award nomination <span className="text-gray-400">(optional)</span>
      </label>
      <select
        value={award || ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="p-1.5 border border-gray-300 bg-white rounded-md text-sm max-w-[60%]"
      >
        <option value="">No nomination</option>
        {Object.entries(grouped).map(([categoryLabel, opts]) => (
          <optgroup key={categoryLabel} label={categoryLabel}>
            {opts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

const ProjectCard = ({ project, rubric, panelistId, sessionTypeId }) => {
  const maxTotal = getMaxTotal(rubric);
  const awardOptions = getAwardOptionsForSession(sessionTypeId);

  const initialScores = rubric.reduce((acc, criterion) => {
    acc[criterion.key] = 0;
    return acc;
  }, {});

  const [scores, setScores] = useState(initialScores);
  const [award, setAward] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const setScore = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleAwardChange = (value) => {
    setAward(value);
    setSaved(false);
    setSaveError(null);
  };

  const total = rubric.reduce(
    (sum, criterion) => sum + (Number(scores[criterion.key]) || 0),
    0
  );

  const handleSave = async () => {
    const payload = rubric.reduce((acc, criterion) => {
      acc[criterion.key] = Number(scores[criterion.key]) || 0;
      return acc;
    }, {});

    setSaving(true);
    setSaveError(null);
    const result = await updateScores(project.id, panelistId, payload, award);
    setSaving(false);

    if (result.error) {
      setSaveError(result.error["code"] + " - " + result.error["message"]);
      return;
    }
    setSaved(true);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md p-5">
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-xl font-medium">{project.project_name}</h3>
        <p className="text-gray-300 text-sm">{project.app_name}</p>
        <p className="text-gray-400 text-sm">{project.presenters}</p>
      </div>

      <AwardSelector award={award} onChange={handleAwardChange} options={awardOptions} />

      <div className="mt-4 flex flex-col gap-3">
        {rubric.map((criterion) => (
          <div key={criterion.key} className="flex flex-row items-center justify-between gap-4">
            <label className="text-gray-100 text-sm">
              {criterion.label}{" "}
              <span className="text-gray-400">({criterion.points} points)</span>
            </label>
            <ScoreInput
              value={scores[criterion.key]}
              max={criterion.points}
              onChange={(val) => setScore(criterion.key, val)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-700 flex flex-row items-center justify-between">
        <span className="text-gray-100 font-medium">
          Total: <span className="text-blue-300">{total}</span> / {maxTotal}
        </span>
        <div className="flex flex-row items-center gap-3">
          {saveError && <span className="text-red-400 text-sm">{saveError}</span>}
          {saved && !saveError && <span className="text-green-400 text-sm">Saved</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-gray-900 font-medium rounded-md px-4 py-2 transition-colors"
          >
            {saving ? "Saving..." : "Save Scores"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectList = ({ sessionTypeId, sessionName, projects, onBack, panelistId }) => {
  const rubric = getRubricForSession(sessionTypeId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 w-screen px-6 py-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-blue-300 text-3xl">{sessionName}</h2>
          <button
            onClick={onBack}
            className="text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 rounded-md px-3 py-1.5 transition-colors"
          >
            Change Session
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-400 mt-10 text-center">No projects found for this session.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                rubric={rubric}
                panelistId={panelistId}
                sessionTypeId={sessionTypeId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Grading = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const panelistId = location.state ? location.state.userId : null;

  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [projects, setProjects] = useState([]);
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

  const fetchProjects = async (sessionTypeId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Projects')
      .select("id,session_type,project_name,app_name,presenters")
      .eq("session_type", sessionTypeId);

    setLoading(false);
    if (error) {
      setErrorLog(error["code"] + " - " + error["message"]);
      return;
    }
    setProjects(data);
  };

  const handleSelectSession = async (sessionTypeId) => {
    setSelectedSessionId(sessionTypeId);
    await fetchProjects(sessionTypeId);
  };

  const handleBack = () => {
    setSelectedSessionId(null);
    setProjects([]);
  };

  const goToScoreboard = () => {
    navigate('/scoreboard', { state: location.state });
  };

  const selectedSession = sessionTypes.find((s) => s.id === selectedSessionId);

  if (selectedSessionId !== null) {
    if (loading) {
      return (
        <div className="flex flex-col min-h-screen bg-gray-900 w-screen items-center justify-center">
          <p className="text-gray-300">Loading projects...</p>
        </div>
      );
    }
    return (
      <>
        <div className="relative">
          <button
            onClick={goToScoreboard}
            className="fixed top-4 right-4 z-10 text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 bg-gray-900 rounded-md px-3 py-1.5 transition-colors"
          >
            View Scoreboard
          </button>
          <ProjectList
            sessionTypeId={selectedSessionId}
            sessionName={selectedSession ? selectedSession.name : ""}
            projects={projects}
            onBack={handleBack}
            panelistId={panelistId}
          />
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
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={goToScoreboard}
          className="fixed top-4 right-4 z-10 text-gray-300 hover:text-blue-300 text-sm border border-gray-700 hover:border-blue-400 bg-gray-900 rounded-md px-3 py-1.5 transition-colors"
        >
          View Scoreboard
        </button>
        <SessionTypeSelector sessionTypes={sessionTypes} onSelect={handleSelectSession} />
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

export default Grading
