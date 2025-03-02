import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate, Link, useParams } from "react-router-dom";
import FormSelectionDialog from "@/components/FormSelectionDialog";

export default function Transcript() {
  const { transcriptId } = useParams();
  const [body, setBody] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [createdTime, setCreatedTime] = useState("");
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/transcript/${transcriptId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const data = await response.json();
        setBody(data.data.body);
        setPatientName(data.data.name);
        setPatientId(data.data.patientId);
        setCreatedTime(data.data.createdTime);
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
      const response = await fetch(`/api/transcript/${transcriptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: body }),
      });
      if (!response.ok) {
        throw new Error("Failed to update document");
      }
      alert("Document updated successfully!");
    } catch (err) {
      console.error("Error updating document:", err);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    let endpoint = "/sandbox-api/convert-to-summary";

    const payload = {
      transcript_ids: [transcriptId],
      patientId: [patientId],
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const result = await response.json();
      alert("Summary generated successfully!");
      navigate(`/patient/${patientId}`);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="w-[375px] h-[667px] rounded-3xl border border-gray-200 bg-zinc-50  p-4 text-gray-900 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h1 className="font-handwriting text-4xl mb-1">{patientName}</h1>
        <div className="flex justify-between items-end">
          <h2 className="font-handwriting text-2xl">Transcript</h2>
          <span className="text-sm text-gray-500">
            {new Date(createdTime).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="DocBodyWrapper flex-grow mb-4 ">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
            onClick={handleSummarize}
            disabled={isSummarizing}
          >
            {isSummarizing ? "Generating..." : "Summarize"}
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-400 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
            onClick={() => setShowFormSelection(true)}
          >
            Fill out Form
          </Button>
        </div>
      </div>

      {showFormSelection && (
        <FormSelectionDialog
          transcriptId={transcriptId}
          patientId={patientId}
          onClose={() => setShowFormSelection(false)}
        />
      )}
    </div>
  );
}
