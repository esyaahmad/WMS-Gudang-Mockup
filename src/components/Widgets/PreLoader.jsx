export default function PreLoader() {
  return (
    <div id="preloader">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 backdrop-blur-lg">
        <div className="bg-white p-5 rounded-lg shadow-lg">Loading...</div>
      </div>
    </div>
  );
}
