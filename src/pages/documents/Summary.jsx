import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate, Link, useParams } from "react-router-dom";
import FormSelectionDialog from "@/components/FormSelectionDialog";

export default function Summary() {
  const { summaryId } = useParams();
  const [body, setBody] = useState("");
  const [createdTime, setCreatedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/summary/${summaryId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const data = await response.json();
        console.log(data);
        setBody(data.data.body);
        setPatientName(data.patientName);
        setCreatedTime(data.createdTime);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/summary/{sumammaryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: body }),
      });
      if (!response.ok) {
        throw new Error("Failed to save document");
      }
      console.log("Document saved successfully");
    } catch (err) {
      console.error("Error saving document:", err);
    }
  };

  const handleTextChange = (e) => {
    setBody(e.target.value);
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
    <div className="w-[375px] h-[667px] rounded-3xl border border-gray-200 bg-zinc-50 p-4 text-gray-900 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h1 className="font-handwriting text-4xl mb-1">{patientName}</h1>
        <div className="flex justify-between items-end">
          <h2 className="font-handwriting text-2xl">Summary</h2>
          <span className="text-sm text-gray-500">{formatDate(createdTime)}</span>
        </div>
      </div>

      <div className="DocBodyWrapper flex-grow mb-4 ">
        <textarea
          value={body}
          onChange={handleTextChange}
          className="w-full h-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>

      {showFormSelection && (
        <FormSelectionDialog onClose={() => setShowFormSelection(false)} />
      )}
    </div>
  );
}
