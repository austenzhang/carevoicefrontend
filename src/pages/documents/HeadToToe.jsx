import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate, Link, useParams } from "react-router-dom";
import FormSelectionDialog from "@/components/FormSelectionDialog";

export default function HeadToToea() {
  const { head_to_toeId } = useParams();
  const [petientId, setPetinentId] = useState({});
  const [docType, setDocType] = useState("Summary");
  const [data, setData] = useState({});
  const [createdTime, setCreatedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [headToToeData, setHeadToToeData] = useState({});
  const [darpData, setDarpData] = useState({});
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sectionOrder = [
    "neurological",
    "HEENT",
    "respiratory",
    "cardiac",
    "peripheral_Vascular",
    "integumentary",
    "musculoskeletal",
    "gastrointestinal",
    "genitourinary",
    "sleep_Rest",
    "psychosocial",
  ];

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/head-to-toe/${head_to_toeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const data = await response.json();
        console.log(data);
        setPetinentId(data.petientId);
        setData(data.data.body);
        setPatientName(data.data.patientName);
        setCreatedTime(data.data.createdTime);
        setIsLoading(false);
        console.log(data.data);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/head-to-toe/${head_to_toeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: docType, body: data }),
      });
      if (!response.ok) {
        throw new Error("Failed to save document");
      }
      console.log("Document saved successfully");
    } catch (err) {
      console.error("Error saving document:", err);
    }
  };

  const handleSummarize = () => {
    setDocType("summary");
    setData("This is a summary of the transcript.");
  };

  const handleInputChange = (key, value) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

    // Function to format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date
        .toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/\//g, ".");
    };

  return (
    <div className="w-[375px] h-[667px] rounded-3xl border border-gray-200 bg-zinc-50  p-4 text-gray-900 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h1 className="font-handwriting text-4xl mb-1">{patientName}</h1>
        <div className="flex justify-between items-end">
          <h2 className="font-handwriting text-xl">Head-to-toe Assessment</h2>
          <span className="text-sm text-gray-500">{formatDate(createdTime)}</span>
        </div>
      </div>

      <div className="DocBodyWrapper flex-grow mb-4 h-full overflow-auto">
        {sectionOrder.map((key) => (
          data[key] !== undefined && (
            <div key={key}>
              <label className="block text-sm font-medium text-zinc-500">
                {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </label>
              <textarea
                value={data[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="p-2 mt-1 mb-4 w-[330px] block rounded-md shadow-sm focus:ring-opacity-50"
                rows={5}
              />
            </div>
          )
        ))}
      </div>

      <div className="space-y-2">
        {docType === "Transcript" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
                onClick={handleSummarize}
              >
                Summarize
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={() => setShowFormSelection(true)}
            >
              Fill out Form
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
            onClick={handleSave}
          >
            Save
          </Button>
        )}
      </div>

      {showFormSelection && (
        <FormSelectionDialog onClose={() => setShowFormSelection(false)} />
      )}
    </div>
  );
}
