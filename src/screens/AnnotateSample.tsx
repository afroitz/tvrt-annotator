import SampleDisplay from "@/components/SampleDisplay";
import { AnnotationSample } from "@/types/types";
import { useEffect, useState, useCallback } from "react";

const AnnotateSample: React.FC = () => {
  const fileName = '24_09_28-test_scrape.csv';
  
  const [sampleIndex, setSampleIndex] = useState(0);
  const [sampleData, setSampleData] = useState<AnnotationSample>(null);
  const [rowCount, setRowCount] = useState(0);

  // Load the current sample based on sampleIndex
  const loadSample = useCallback(async (index: number) => {
    try {
      const sample = await window.electronApi.loadSample(fileName, index);
      setSampleData(sample);
    } catch (error) {
      console.error(error);
    }
  }, [fileName]);

  // Load the number of rows in the file on component mount
  useEffect(() => {
    const fetchRowCount = async () => {
      try {
        const fileInfo = await window.electronApi.getAnnotationFileInfo(fileName);
        setRowCount(fileInfo.rows);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRowCount();
  }, [fileName]);

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