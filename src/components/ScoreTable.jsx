import { criteria } from "../Const.js";

const ScoreTable = ({ projects }) => {
  return (
    <div className="p-4 bg-gray-900 text-gray-100">
      <table className="min-w-full border border-gray-700 text-sm text-left bg-gray-800 rounded-lg overflow-hidden">
        <colgroup>
          <col span={3} />
          <col className="bg-gray-700" span={5} />
          <col className="bg-gray-600" span={5} />
        </colgroup>
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th colSpan={3}></th>
            <th className="px-4 py-2 border border-gray-700 text-center" colSpan={5}>Panelist 1</th>
            <th className="px-4 py-2 border border-gray-700 text-center" colSpan={5}>Panelist 2</th>
          </tr>
        </thead>
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th className="px-4 py-2 border border-gray-700">ID</th>
            <th className="px-4 py-2 border border-gray-700">Project Title</th>
            <th className="px-4 py-2 border border-gray-700">Project Category</th>
            {
              criteria.map((criterion, _index) => (
                <th className="px-4 py-2 border border-gray-700">{criterion.properName}</th>
              ))
            }
            {
              criteria.map((criterion, _index) => (
                <th className="px-4 py-2 border border-gray-700">{criterion.properName}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => {
            return (
              <tr key={index} className={`border-b border-gray-700 ${index % 2 == 0 ? "bg-gray-700" : ""}`}>
                <td className="px-4 py-2 border border-gray-700 text-center">{index}</td>
                <td className="px-4 py-2 border border-gray-700 text-center">{project.title}</td>
                <td className="px-4 py-2 border border-gray-700 text-center">{project.category_name}</td>
                {
                  project.grades.map((criteria, _i) => 
                    Object.entries(criteria).map((point, _i) => {
                      return (
                        <td className="px-4 py-2 border border-gray-700 text-center">{`${point[1]}`}</td>
                      )}
                    )
                  )
                }
              </tr>
             )
            }
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;
