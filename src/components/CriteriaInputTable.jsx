import { useState } from "react";

const CriteriaInputTable = ({inputs, setInputs}) => {

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-100">
      <table className="min-w-full border border-gray-700 text-sm text-left bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th className="px-4 py-2 border border-gray-700">Name</th>
            <th className="px-4 py-2 border border-gray-700">Design</th>
            <th className="px-4 py-2 border border-gray-700">Usability</th>
            <th className="px-4 py-2 border border-gray-700">Functionality</th>
            <th className="px-4 py-2 border border-gray-700">Ease of Installation</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-800">
            <td className="px-4 py-2 border border-gray-700">{inputs.name}</td>
            <td className="px-4 py-2 border border-gray-700">
              <input
                type="text"
                name="design"
                value={inputs.design}
                onChange={handleChange}
                className="w-full px-2 py-1 bg-gray-700 text-gray-100 border border-gray-600 rounded"
                placeholder="Score"
              />
            </td>
            <td className="px-4 py-2 border border-gray-700">
              <input
                type="text"
                name="usability"
                value={inputs.usability}
                onChange={handleChange}
                className="w-full px-2 py-1 bg-gray-700 text-gray-100 border border-gray-600 rounded"
                placeholder="Score"
              />
            </td>
            <td className="px-4 py-2 border border-gray-700">
              <input
                type="text"
                name="functionality"
                value={inputs.functionality}
                onChange={handleChange}
                className="w-full px-2 py-1 bg-gray-700 text-gray-100 border border-gray-600 rounded"
                placeholder="Score"
              />
            </td>
            <td className="px-4 py-2 border border-gray-700">
              <input
                type="text"
                name="installation"
                value={inputs.installation}
                onChange={handleChange}
                className="w-full px-2 py-1 bg-gray-700 text-gray-100 border border-gray-600 rounded"
                placeholder="Score"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CriteriaInputTable;
