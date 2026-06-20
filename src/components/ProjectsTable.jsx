import EditableCell from "../components/EditableCell";
import { criteria, generalAwards, specialAwards } from "../Const.js";
import Button from '../components/Button';

const ProjectsTable = ({ projects, grades, setGrades, setHasUnsavedChanges, editable, awards, setAwards, categoryId }) => {
  const handleCellSave = (id, field, newValue) => {
    if (isNaN(Number(newValue)) || Number(newValue) < 0 || Number(newValue) > 10) {
      return;
    }

    console.log(`Changing cell ${field} for ${id}`)
    setGrades(prevGrades => {
      const updatedGrades = {};

      for (const [id, grade] of Object.entries(prevGrades)) {
        updatedGrades[id] = grade
      }

      if (!(id in updatedGrades)) {
        if (newValue > 0) {
          updatedGrades[id] = {[field]: +newValue};
          setHasUnsavedChanges(true);
        }
      } else {
        updatedGrades[id] = prevGrades[id];
        if (!(field in updatedGrades[id])) {
          updatedGrades[id][field] = {};
        }
        updatedGrades[id][field] = +newValue;
        setHasUnsavedChanges(true);
      }

      return updatedGrades;
    });
  };

  const handleChangeAward = (awardDbName, projectId) => {
    if (!editable) {
      return
    }
    
    console.log(`New award: ${awardDbName} - ${projectId}`)
    setAwards({
      ...awards,
      [awardDbName]: projectId,
    });
  }

  const specificAwards = specialAwards[categoryId];

  return (
    <div className="p-4 bg-gray-900 text-gray-100">
      <table className="min-w-full border border-gray-700 text-sm text-left bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th className="px-4 py-2 border border-gray-700">ID</th>
            <th className="px-4 py-2 border border-gray-700">Project Title</th>
            {
              criteria.map((criterion, _index) => (
                <th className="px-4 py-2 border border-gray-700">{criterion.properName}</th>
              ))
            }
            { specificAwards.length > 0 && <><th className="px-4 py-2 border border-gray-700 bg-amber-600 text-gray-900">Project Title</th>
            <th className="px-4 py-2 border border-gray-700 bg-amber-400 text-gray-900" colSpan={specificAwards.length}>Special Awards</th></> }
            <th className="px-4 py-2 border border-gray-700 bg-green-600 text-gray-900">Project Title</th>
            <th className="px-4 py-2 border border-gray-700 bg-green-400 text-gray-900" colSpan={generalAwards.length}>General Awards</th>
          </tr>
        </thead>
        <tbody>
          {
            projects.map((entry, index) => {
              const generalAwardBg = entry.id in grades ? (Object.keys(grades[entry.id]).length == criteria.length ? "bg-lime-800" : "bg-yellow-800") : index % 2 == 0 ? "bg-gray-900" : "bg-gray-800";
              return (
                <tr key={index} 
                  className={`${entry.id in grades ? (Object.keys(grades[entry.id]).length == criteria.length ? "bg-lime-700" : "bg-yellow-700") : index % 2 == 0 ? "bg-gray-800" : "bg-gray-700"} order-b border-gray-700`}
                >
                  <td className="px-4 py-2 border border-gray-700 text-center">{entry.id}</td>
                  <td className="px-4 py-2 border border-gray-700 text-center">{entry.title}</td>
                  {
                    criteria.map((criterion, _index) => {
                      const grade = grades[entry.id] && grades[entry.id][criterion.dbName] ? grades[entry.id][criterion.dbName] : 0
                      return (
                        <td className="border border-gray-700 text-center">
                          <EditableCell
                            value={grade}
                            onSave={(newValue) => handleCellSave(entry.id, [criterion.dbName], newValue)}
                            editable={editable}
                          />
                        </td>
                      )
                    })
                  }
                  { specificAwards.length > 0 && <td className="px-4 py-2 border border-gray-700 text-center">{entry.title}</td> }
                  {
                    specificAwards.map((award, _index) => {
                      let awardSelected = awards[award.dbName] ? awards[award.dbName] == entry.id : false
                      return (
                        <td className={`border border-gray-700 h-full p-0 ${generalAwardBg}`}>
                          <div className="px-4 py-2 flex items-center">
                          <Button
                            type="button"
                            color={awardSelected ? "bg-lime-500" : "bg-gray-500/90"}
                            textColor={awardSelected ? "text-stone-900" : "text-gray-300"}
                            onClick={() => handleChangeAward(award.dbName, entry.id)}
                          >
                            {award.properName}
                          </Button>
                          </div>
                        </td>
                      )
                    })
                  }
                  <td className="px-4 py-2 border border-gray-700 text-center">{entry.title}</td>
                  {
                    generalAwards.map((award, _index) => {
                      let awardSelected = awards[award.dbName] ? awards[award.dbName] == entry.id : false
                      return (
                        <td className={`border border-gray-700 h-full p-0 ${generalAwardBg}`}>
                          <div className="px-4 py-2 flex items-center">
                          <Button
                            type="button"
                            color={awardSelected ? "bg-lime-500" : "bg-gray-500/90"}
                            textColor={awardSelected ? "text-stone-900" : "text-gray-300"}
                            onClick={() => handleChangeAward(award.dbName, entry.id)}
                          >
                            {award.properName}
                          </Button>
                          </div>
                        </td>
                      )
                    })
                  }
                </tr>
               )
            })
          }
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
