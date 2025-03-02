import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BatchGenerationForm from "@/components/batch-generation-form";

export default function PatientPage() {
  const { patientId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch documents for the patient from the API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/patient/${patientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch patient documents.");
        }
        let data = await response.json();
        let innerData = data.data;
        let documents = innerData.documents;
        setPatientName(innerData.patientName);
        documents.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime)); // Sort documents by createdTime (newest first)
        setDocuments(documents);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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

  // Filter transcripts for batch processing
  const transcripts = documents.filter((doc) => doc.type === "Transcript");

  // Map document types to their corresponding routes
  const getDocumentRoute = (type, id) => {
    const typeMap = {
      Transcript: "Transcript",
      Summary: "summary",
      HeadToToe: "head-to-toe",
      DARP: "darp",
    };
    const route = typeMap[type] || "NA";
    return `/${route}/${encodeURIComponent(id)}`;
  };

  return (
    <div className="w-[375px] h-[667px] rounded-3xl border border-gray-200 bg-zinc-50 p-4 overflow-hidden flex flex-col">
      <div className="mb-6">
        <h1 className="font-handwriting text-4xl">{patientName}</h1>
      </div>

      <h2 className="font-handwriting text-2xl mb-4 self-center">Documents</h2>

      <div className="flex flex-col h-full overflow-auto">
        {isLoading ? (
          <p className="text-gray-600 text-center">Loading documents...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-600 text-xl text-center  ">This patient has no document</p>
        ) : (
          <div className="space-y-4 pl-2">
            {documents.map((doc) => (
              <Link
                to={getDocumentRoute(doc.type, doc.id)}
                key={doc.id}
                className="group cursor-pointer mb-2"
              >
                <div className="font-handwriting text-xl">{doc.type}</div>
                <div className="text-sm text-gray-400">
                  {formatDate(doc.createdTime)}
                </div>
                <div className="mb-4 h-0.5 w-0 bg-zinc-500 transition-all duration-300 group-hover:w-full"></div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-auto">
        <Button
          variant="outline"
          className="w-full rounded-md py-3 text-base"
          onClick={() => setIsModalOpen(true)}
        >
          Summarize or Generate Form
        </Button>
      </div>

      <div className="mt-2 flex justify-center">
        <Link
          to={`/record`}
          className="border border-zinc-300 rounded-md  px-3 py-2 w-full text-center hover:bg-zinc-300 transition duration-200"

        >
          Record Conversation
        </Link>
      </div>

      {/* Render modal only when isModalOpen is true */}
      {isModalOpen && (
        <BatchGenerationForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transcripts={transcripts}
          patientId={patientId}
        />
      )}
    </div>
  );
}
