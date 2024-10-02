import SampleDisplay from "@/components/SampleDisplay";
import { AnnotationSample } from "@/types/types";
import { useEffect, useState, useCallback } from "react";

const AnnotateSample: React.FC = () => {
  const datasetName = 'my_test_dataset';

  // [94, 184, 236, 246, 335, 377, 378, 387, 449, 467, 469, 609, 826, 943, 1092, 1290, 1365, 1512, 1523, 1584, 1678, 1763, 1856, 1955, 2091, 2148, 2211, 2376, 2449, 2489, 2491, 2508, 2510, 2545, 2938, 2979, 2980, 2985, 2992, 3097, 3144, 3147, 3156, 3470, 3479, 3482, 3488, 3572, 3836, 3898, 3904]
  
  const [sampleIndex, setSampleIndex] = useState(377);
  const [sampleData, setSampleData] = useState<AnnotationSample>(null);
  const [rowCount, setRowCount] = useState(0);

  // Load the current sample based on sampleIndex
  const loadSample = useCallback(async (index: number) => {
    try {
      const sample = await window.electronApi.loadSample(datasetName, index);
      setSampleData(sample);
    } catch (error) {
      console.error(error);
    }
  }, [datasetName]);

  // Load the number of rows in the file on component mount
  useEffect(() => {
    const fetchRowCount = async () => {
      try {
        const fileInfo = await window.electronApi.getDatasetInfo(datasetName);
        setRowCount(fileInfo.rows);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRowCount();
  }, [datasetName]);

  // Update the sample data whenever the sampleIndex changes
  useEffect(() => {
    loadSample(sampleIndex);
  }, [sampleIndex, loadSample]);

  // Handlers for navigating samples
  const handleNextSample = () => {
    if (sampleIndex < rowCount - 1) {
      setSampleIndex(sampleIndex + 1);
    }
  };

  const handlePreviousSample = () => {
    if (sampleIndex > 0) {
      setSampleIndex(sampleIndex - 1);
    }
  };

  return (
    <div>
      {/* Annotation UI */}
      <div>
        <div>
          <button onClick={handlePreviousSample} disabled={sampleIndex === 0}>
            Previous
          </button>
          <button onClick={handleNextSample} disabled={sampleIndex >= rowCount - 1}>
            Next
          </button>
        </div>
        <div>
          <p>Sample {sampleIndex + 1} of {rowCount}</p>
        </div>
      </div>
      {/* Display of the sample */}
      {sampleData ? 
        <SampleDisplay sample={sampleData} />
        : <div>No data</div>
      }

      
    </div>
  );
}

export default AnnotateSample;