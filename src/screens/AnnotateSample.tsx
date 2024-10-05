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

  // Handle radio button changes (updates annotation)
  const handleLabelChange = async (rumorIndex: number, selectedLabel: string) => {

    const isRemoval = selectedLabel === "No label";
    const existingAnnotationsForSample = annotationData.find((sample) => sample.sampleIndex === sampleIndex);

    const updatedAnnotationsForSample: SampleAnnotations = {
      sampleIndex: sampleIndex,
      annotations: existingAnnotationsForSample ? 
        [...existingAnnotationsForSample.annotations.filter((ann) => ann.rumorIndex !== rumorIndex)]
        : []
    }

    if(!isRemoval){
      updatedAnnotationsForSample.annotations.push({ rumorIndex, label: selectedLabel })
    }

    await window.electronApi.updateAnnotation(datasetName, sampleIndex, updatedAnnotationsForSample);
    setAnnotationData((prev) => {
      const existingSampleIndex = prev.findIndex((sample) => sample.sampleIndex === sampleIndex);

      if (existingSampleIndex > -1) {
        prev[existingSampleIndex] = updatedAnnotationsForSample;
      } else {
        prev.push(updatedAnnotationsForSample);
      }

      return [...prev];
    });
  }

  // Helper function to get the selected label for a rumor
  const getSelectedLabel = (rumorIndex: number): string => {
    const annotationForSample = annotationData.find((sample) => sample.sampleIndex === sampleIndex);

    if (!annotationForSample) {
      return "No label";
    }

    const annotationForRumor = annotationForSample.annotations.find((ann) => ann.rumorIndex === rumorIndex);

    return annotationForRumor?.label || "No label";
  };

  return (
    <div className="flex w-full h-full box-border">
      { screenReady && <>
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
        <h2 className="text-xl font-bold mb-4">Annotate Rumors</h2>
        {rumors.map((rumor, rumorIndex) => (
          <div key={rumorIndex} className="mb-6">
            <p className="italic mb-2">"{rumor}"</p>
            <div>
              {/* No label option */}
              <label className="block mb-1">
                <input
                  className="mr-2"
                  type="radio"
                  name={`rumor-${rumorIndex}`}
                  value="No label"
                  checked={getSelectedLabel(rumorIndex) === "No label"}
                  onChange={() => handleLabelChange(rumorIndex, "No label")}
                />
                No label
              </label>

              {/* Labels */}
              {labels.map((label, labelIndex) => (
                <label key={labelIndex} className="block mb-1">
                  <input
                    className="mr-2"
                    type="radio"
                    name={`rumor-${rumorIndex}`}
                    value={label}
                    checked={getSelectedLabel(rumorIndex) === label}
                    onChange={() => handleLabelChange(rumorIndex, label)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      </>}
      { !screenReady && <div>Loading...</div> }
    </div>
  );
}

export default AnnotateSample;