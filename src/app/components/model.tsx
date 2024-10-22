import { FFmpeg } from "@ffmpeg/ffmpeg";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Button,
  CircularProgress,
  Grid2 as Grid,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { AudioRecorder } from "react-audio-voice-recorder";
// import * as wasm from "indicasr-wasm";
import * as wasm from "indicasr-wasm";
import { useState } from "react";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Model() {
  const [modelLoading, setModelLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [lang, setLang] = useState("");
  const [text, setText] = useState("");

  const [ffmpeg, _] = useState(new FFmpeg());

  const loadModel = async (l: string) => {
    await ffmpeg.load();
    setModelLoading(true);
    setModel(null);
    setVocab(null);
    const modelPath = `_next/static/model/${l}.onnx`; // Path to the ONNX model
    const vocabPath = `_next/static/model/${l}.vocab`; // Path to the ONNX model

    // Fetch the model as an ArrayBuffer
    const modelBytes = await fetch(modelPath);
    if (!modelBytes.ok) {
      throw new Error("Failed to fetch model");
    }
    const vocabBytes = await fetch(vocabPath);
    if (!vocabBytes.ok) {
      throw new Error("Failed to fetch vocab");
    }
    const modelData = await modelBytes.arrayBuffer();
    const vocabData = await vocabBytes.arrayBuffer();

    // Decode the ArrayBuffer to a string
    const session = await window.ort.InferenceSession.create(modelData);
    const decoder = new TextDecoder("utf-8");

    setModel(session);
    setVocab(decoder.decode(vocabData).split("\n"));
    setModelLoading(false);
  };

  const readFile = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        // @ts-expect-error ignore this for now
        resolve(reader.result); // Resolve the Promise with the data URL
      };

      reader.onerror = () => {
        reject("Error reading file"); // Reject the Promise on error
      };

      reader.readAsArrayBuffer(file); // Start reading the file
    });
  };

  const runModel = async (data: Array<Array<Float32Array>>): Promise<any[]> => {
    const data_length = data[0][0].length;
    const i = data.length;
    const j = data[0].length;
    const k = data[0][0].length;
    const arr = [];
    for (let a = 0; a < i; a++) {
      for (let b = 0; b < j; b++) {
        for (let c = 0; c < k; c++) {
          arr.push(data[a][b][c]);
        }
      }
    }
    const audio_tensor = new window.ort.Tensor(
      "float32",
      new Float32Array(arr),
      [i, j, k]
    );
    const audio_tensor_length = new window.ort.Tensor(
      "int64",
      new BigInt64Array([BigInt(data_length)])
    );
    const feeds = { audio_signal: audio_tensor, length: audio_tensor_length };
    const results = await model.run(feeds);
    return results.logprobs.cpuData;
  };

  const transcodeFile = async (fileBuffer: ArrayBuffer, inputType: string) => {
    await ffmpeg.writeFile(`input.${inputType}`, new Uint8Array(fileBuffer));
    // "-acodec pcm_s16le -ar 44100 -ac 2"
    await ffmpeg.exec([
      "-i",
      "input.webm",
      "-acodec",
      "pcm_s16le",
      "-ar",
      "16000",
      "-ac",
      "2",
      "output.wav",
    ]);

    // @ts-ignore
    const outData: Uint8Array = await ffmpeg.readFile("output.wav");
    return outData.buffer;
  };

  const runInference = async (files: Array<File>, inputType: string) => {
    const arrayBuffer = await readFile(files[0]);
    const transcodedArrayBuffer = await transcodeFile(arrayBuffer, inputType);

    const byteArray = new Uint8Array(transcodedArrayBuffer);
    console.log(byteArray);

    const processed_data = wasm.run_preprocessor(byteArray);
    const logits = await runModel(processed_data);
    const batch_size = 1;

    // subtract 2 for the offset and actual vocab size
    // add 1 for blank
    const vocab_size = vocab.length - 1;

    const time_steps = logits.length / (vocab_size * batch_size);
    const offset = Number(vocab[0]);
    const actual_vocab_size = Number(vocab[1]);

    const text = wasm.decode_logprobs(
      logits,
      new Uint32Array([batch_size, time_steps, vocab_size]),
      vocab.slice(2),
      offset,
      actual_vocab_size
    );

    // @ts-ignore
    setText(text);
    console.log("inference completed");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            select
            fullWidth
            slotProps={{
              input: {
                startAdornment: modelLoading ? (
                  <InputAdornment position="start">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null,
              },
            }}
            variant="outlined"
            onChange={(event) => {
              setLang(event.target.value);
              loadModel(event.target.value);
            }}
            value={lang}
          >
            <MenuItem value="">Select Language</MenuItem>
            <MenuItem value={"hindi"}>Hindi</MenuItem>
            <MenuItem value={"tamil"}>Tamil</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            disabled={!model}
            fullWidth
          >
            Upload Audio
            <VisuallyHiddenInput
              type="file"
              accept=".wav, audio/wav"
              onChange={(event) =>
                runInference(Array.from(event.target.files), "wav")
              }
            />
          </Button>
        </Grid>
        <Grid size={6} alignItems={"center"}>
          {!!model ? (
            <AudioRecorder
              onRecordingComplete={(blob: Blob) => {
                // console.log(blob);
                const file = new File([blob], "file.wav");
                runInference(new Array(file), "webm");
              }}
              audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
              }}
              // downloadOnSavePress={true}
              // downloadFileExtension="wav"
            />
          ) : null}
        </Grid>
        <Grid size={12}>
          <TextField
            placeholder="Transcript"
            variant="outlined"
            rows={4}
            multiline
            fullWidth
            value={text}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
