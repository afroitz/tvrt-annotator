import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

/**
 * Dataset selection and importing screen
 */
const SelectDataset: React.FC = () => {

  const [datasets, setDatasets] = useState<string[]>([]);
  const navigate = useNavigate();

  /**
   * Initially, load list of available datasets
   */
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const datasetNames = await window.electronApi.getDatasetNames();
        setDatasets(datasetNames);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDatasets();
  }, []);

  /**
   * Logic for opening a dataset for annotation
   */
  const handleCardClick = (datasetName: string) => {
    navigate(`/annotate/${datasetName}`);
  };

  /**
   * Logic for importing a dataset
   */
  const handleImportClick = async () => {
    try {
      await window.electronApi.importDataset();
      const datasetNames = await window.electronApi.getDatasetNames();
      setDatasets(datasetNames);
    } catch (error) {
      if(error.message.includes("Dataset with the same name already exists.")) {
        alert("Dataset with the same name already exists.");
      } else if (error.message.includes("Invalid dataset structure")) {
        alert("Invalid dataset structure.");
      } else {
        console.error(error);
      }
    }
  }

  /**
   * Logic for deleting a dataset
   */
  const handleDeleteClick = async (datasetName: string) => {
    if (window.confirm(`Are you sure you want to delete the dataset "${datasetName}"?`)) {
      try {
        await window.electronApi.deleteDataset(datasetName);
        const datasetNames = await window.electronApi.getDatasetNames();
        setDatasets(datasetNames);
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Select a dataset</h2>
      <ul>
        {datasets.length === 0 && <li className="p-4 border border-gray-300 rounded shadow mb-2">No datasets found. Click below to import a dataset.</li>}
        {datasets.map((datasetName) => (
          <li
          key={datasetName}
          onClick={() => handleCardClick(datasetName)} // Navigate on click
          className="cursor-pointer p-4 border border-gray-300 rounded shadow hover:shadow-lg transition-shadow mb-2 flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold">{datasetName}</h3>
            <p className="text-gray-500">Click to annotate</p>
          </div>
          <div 
            className="flex flex-col items-center justify-center text-red-500 hover:text-red-700 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click from bubbling up to the li
              handleDeleteClick(datasetName);
            }}
          >
            <FaTrash/>
            <p>Delete</p>
          </div>
        </li>
        ))}
      </ul>
      <button onClick={handleImportClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:shadow-lg transition-shadow">Import a dataset</button>
    </div>
  )
}

export default SelectDataset