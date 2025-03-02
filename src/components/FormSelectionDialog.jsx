import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/Label";
import { useNavigate } from "react-router-dom";

export default function FormSelectionDialog({ onClose, transcriptId, patientId }) {
  const [selectedForm, setSelectedForm] = useState("head-to-toe");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFillOut = async () => {
    setIsLoading(true);
    let endpoint = "/sandbox-api/convert-transcripts";
    
    switch (selectedForm) {
      case "head-to-toe":
        endpoint = "/sandbox-api/convert-to-head-to-toe";
        break;
      case "darp":
        endpoint = "/sandbox-api/convert-to-darp";
        break;
      default:
        console.error("Invalid document type:", selectedForm);
        setIsLoading(false);
        return;
    }
  
    const payload = {
      transcript_ids: [transcriptId],
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
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 w-[340px] p-4 rounded-lg">
        <div className="mb-4">
          <h2 className="text-lg mb-4">Which Form do you want to fill out?</h2>
          <RadioGroup
            value={selectedForm}
            onValueChange={setSelectedForm}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="head-to-toe" id="head-to-toe" />
              <Label htmlFor="head-to-toe">Head to Toe Assessment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="darp" id="darp" />
              <Label htmlFor="darp">DARP</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleFillOut}
            className="hover:bg-zinc-700 text-white text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Fill out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
