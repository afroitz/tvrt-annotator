const AnnotateSample: React.FC = () => {

  const test = async () => {
    try {
      const sample = await window.electronApi.loadSample('24_09_28-test_scrape.csv', 5)
      console.log(JSON.stringify(sample, null, 2));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Annotate Sample</h1>
      <button onClick={test}>Load sample</button>
    </div>
  );
}

export default AnnotateSample;