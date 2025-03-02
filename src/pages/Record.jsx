import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";

import "./Record.css";

function Record() {
  const [selectedPatient, setSelectedPatient] = useState({
    id: 1,
    name: "John Doe",
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [recording, setRecording] = useState(false);
  const [patients, setPatients] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  // Refs for visualizers and animation
  const recordingCanvasRef = useRef(null);
  const playbackCanvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients/1");
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data = await response.json();
        setPatients(data.data);
        console.log(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Function to draw the live recording visualizer
  // Function to draw the live recording visualizer
  const drawRecordingVisualizer = () => {
    const canvas = recordingCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    // Remove the line below so that fftSize remains as set in startRecording
    // analyser.fftSize = 2048;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw waveform line
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.beginPath();
      const sliceWidth = WIDTH / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // normalize to roughly [0, 2]
        const y = (v * HEIGHT) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    };

    draw();
  };

  // Function to draw the playback waveform
  const drawPlaybackWaveform = (audioBuffer) => {
    const canvas = playbackCanvasRef.current;
    if (!canvas || !audioBuffer) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#007bff";
    ctx.beginPath();
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  };

  // Start Recording
  const startRecording = async () => {
    if (!consentGiven) {
      alert("Please provide consent before recording.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Live visualizer
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;
    drawRecordingVisualizer();

    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = async () => {
      cancelAnimationFrame(animationIdRef.current);
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      audioChunks.current = [];
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      // Convert to a URL for playback
      setAudioURL(URL.createObjectURL(audioBlob));

      // Upload to backend
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("patient", selectedPatient.name);

      await fetch("http://localhost:8080/api/transcript/transcribe", {
        method: "POST",
        body: formData,
      });

      setLoading(false);
      alert("Recording successfully completed!");
      navigate(`/patient/${selectedPatient.id}`);
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  // Stop Recording
  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
    setLoading(true);
  };

  // When the audioURL is set, decode the audio and draw the waveform
  useEffect(() => {
    if (audioURL) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      fetch(audioURL)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          drawPlaybackWaveform(audioBuffer);
        });
    }
  }, [audioURL]);

  return (
    <div className="w-[375px] h-[667px] rounded-3xl border border-gray-200 bg-zinc-50 p-4 text-gray-900 overflow-hidden flex flex-col">
      <label className="patient-label"></label>

      <div className="mb-4">
        <h1 className="font-handwriting text-4xl">Record Conversation</h1>
      </div>

      <h2 className="font-handwriting text-xl">Select Patient</h2>
      <select
        className="border rounded-md border-zinc-500 p-2 text-xl"
        value={selectedPatient.id}
        onChange={(e) => {
          const selected = patients.find(
            (patient) => patient.id === parseInt(e.target.value)
          );
          if (selected) setSelectedPatient(selected);
        }}
      >
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
        <div className="checkbox-container m-4 flex flex-row items-center self-center">
          <label className="consent-text text-sm font-bold">
            I consent to my voice being recorded.
          </label>

          <input
            type="checkbox"
            id="consentCheckbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          <label htmlFor="consentCheckbox" className="toggle-switch"></label>
        </div>
      <div className=" flex flex-col  items-center justify-center h-full">

        {loading ? (
          <div className="mt-2 text-4xl text-gray-700">Transcribing...</div>
        ) : (
          <div>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`h-[300px] w-[300px] record-button ${recording ? "recording" : ""}`}
            ></button>
            {/* Audio playback and waveform */}
            {audioURL && (
              <>
                <audio src={audioURL} controls className="audio-player"></audio>
                <canvas
                  ref={playbackCanvasRef}
                  width="220"
                  height="80"
                  className="playback-waveform"
                ></canvas>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Record;
