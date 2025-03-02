import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function BatchGenerationForm({ isOpen, onClose, transcripts, patientId }) {
  const [documentType, setDocumentType] = useState("summary");
  const [selectedTranscripts, setSelectedTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleTranscriptToggle = (id) => {
    setSelectedTranscripts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
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
  const handleSubmit = async () => {
    setIsLoading(true);
    let endpoint = "/sandbox-api/convert-transcripts"; // Default endpoint

    switch (documentType) {
      case "summary":
        endpoint = "/sandbox-api/convert-to-summary";
        break;
      case "head-to-toe":
        endpoint = "/sandbox-api/convert-to-head-to-toe";
        break;
      case "darp":
        endpoint = "/sandbox-api/convert-to-darp";
        break;
      default:
        console.error("Invalid document type:", documentType);
        setIsLoading(false);
        return;
    }

    const payload = {
      transcript_ids: selectedTranscripts,
      patientId: patientId,
    };

    console.log("Sending request to:", endpoint, "with payload:", payload);

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
      console.log("Document generated successfully:", result);

      alert("Successful");
      navigate(`/patient/${patientId}`);
    } catch (error) {
      console.error("Error generating document:", error);
    }

    setIsLoading(false);
    window.location.reload();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] p-4 rounded-lg">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">What would you like to generate?</h2>

          <RadioGroup
            defaultValue="summary"
            onValueChange={setDocumentType}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="summary" id="summary" />
              <Label htmlFor="summary">Summary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="head-to-toe" id="head-to-toe" />
              <Label htmlFor="head-to-toe">Head to Toe Assessment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="darp" id="darp" />
              <Label htmlFor="darp">DARP</Label>
            </div>
          </RadioGroup>

          <div>
            <h3 className="text-base mb-2">Select transcripts to generate from</h3>
            <div className="space-y-2">
              {transcripts.map((transcript, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    variant="outline"
                    id={`transcript-${index}`}
                    onCheckedChange={() =>
                      handleTranscriptToggle(transcript.id)
                    }
                  />
                  <Label htmlFor={`transcript-${index}`} className="text-sm">
                    {formatDate(transcript.createdTime)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {isLoading ? "Generating..." : "Fill out"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
