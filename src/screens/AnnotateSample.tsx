import SampleDisplay from "@/components/SampleDisplay";
import { AnnotationSample, SampleAnnotations } from "@/types/types";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  // Create a ref for the scrollable sample area
  const sampleDisplayRef = useRef<HTMLDivElement>(null);

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

  // Scroll to the bottom of the sample display area when the component mounts or updates
  useEffect(() => {
    if (sampleDisplayRef.current) {
      const scrollHeight = sampleDisplayRef.current.scrollHeight;
      sampleDisplayRef.current.scrollTop = scrollHeight;
    }
  }, [sampleData]);

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
    <div className="flex w-full h-full box-border">
      {/* Main/sample area */}
      <div className="w-2/3 pr-4 flex flex-col">
        {/* Sample navigation UI */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handlePreviousSample}
              disabled={sampleIndex === 0}
              className="flex gap-2 items-center px-2 py-1 border border-black rounded-lg disabled:border-gray-500 disabled:text-gray-500 disabled:bg-gray-100 hover:bg-gray-300"
            >
              <FaChevronLeft />
              Previous
            </button>
            <button
              onClick={handleNextSample}
              disabled={sampleIndex >= rowCount - 1}
              className="flex gap-2 items-center px-2 py-1 border border-black rounded-lg disabled:border-gray-500 disabled:text-gray-500 disabled:bg-gray-100 hover:bg-gray-300"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
          <div className="py-2">
            <p>
              Sample <span className="font-bold">{sampleIndex + 1}</span> /{' '}
              <span className="font-bold">{rowCount}</span>
            </p>
          </div>
        </div>

        {/* Scrollable sample display area */}
        <div className="flex-grow overflow-y-auto mt-4" ref={sampleDisplayRef}>
          {sampleData ? (
            <SampleDisplay sample={sampleData} />
          ) : (
            <div>No data</div>
          )}
        </div>
      </div>

      {/* Annotation controls */}
      <div className="w-1/3 border-l border-black pl-4">
        hey
      </div>
    </div>
  );
}

export default AnnotateSample;