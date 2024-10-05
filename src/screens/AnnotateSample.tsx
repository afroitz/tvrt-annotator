import SampleDisplay from "@/components/SampleDisplay";
import { AnnotationSample, SampleAnnotations } from "@/types/types";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

const AnnotateSample: React.FC = () => {

  const { datasetName } = useParams();
  const [screenReady, setScreenReady] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [rumors, setRumors] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [annotationData, setAnnotationData] = useState<SampleAnnotations[]>([]);
  const [sampleData, setSampleData] = useState<AnnotationSample | null>(null);

  const initAnnotation = async () => {
    setScreenReady(false)

    try {
      // load dataset info
      const datasetInfo = await window.electronApi.getDatasetInfo(datasetName);

      // init annotation
      const annotationInfo = await window.electronApi.startOrContinueAnnotation(datasetName);

      // set state
      setRowCount(datasetInfo.rows);
      setRumors(datasetInfo.taskInfo.rumors);
      setLabels(datasetInfo.taskInfo.labels);
      setSampleIndex(annotationInfo.meta.selectedSample);
      setAnnotationData(annotationInfo.data.annotatedSamples);

      setScreenReady(true)


    } catch (e) {
      console.log("Error initializing annotation screen", e);
    }
  }

  // Initialize annotation screen when datasetName changes
  useEffect(() => {
    initAnnotation()
  }, [datasetName])
  

  // Load the current sample based on sampleIndex
  const loadSample = useCallback(async (index: number) => {
    try {
      const sample = await window.electronApi.loadSample(datasetName, index);
      setSampleData(sample);
      await window.electronApi.updateAnnotationMeta(datasetName, { selectedSample: index });
    } catch (error) {
      console.error(error);
    }
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