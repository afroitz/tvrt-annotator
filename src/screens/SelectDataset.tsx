import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectDataset: React.FC = () => {

  const [datasets, setDatasets] = useState<string[]>([]);
  const navigate = useNavigate();

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

  const handleCardClick = (datasetName: string) => {
    navigate(`/annotate/${datasetName}`);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a dataset</h2>
      <ul>
        {datasets.map((datasetName) => (
          <li
          key={datasetName}
          onClick={() => handleCardClick(datasetName)} // Navigate on click
          className="cursor-pointer p-4 border border-gray-300 rounded shadow hover:shadow-lg transition-shadow" // Card styles
        >
          <h3 className="text-lg font-semibold">{datasetName}</h3>
          <p className="text-gray-500">Click to annotate</p>
        </li>
        ))}
      </ul>
    </div>
  )
}

export default SelectDataset