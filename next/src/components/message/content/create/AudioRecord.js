import React, {useState} from 'react';
import {Alert, CircularProgress, IconButton, Snackbar, Tooltip} from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import FileLogic from "@/lib/common/file/FileLogic";

function AudioRecord({setFile, isUploading, setIsUploading}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileLogic = new FileLogic();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, {type: 'audio/webm'});
        const audioFile = new File([audioBlob], 'recording.webm', {type: 'audio/webm'});

        await uploadAudio(audioFile);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async (audioFile) => {
    setIsUploading(true);

    try {
      const uploadedUrls = await fileLogic.uploadFiles([audioFile]);
      setFile(uploadedUrls[0]);

      setAlertMessage("Audio uploaded successfully");
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Tooltip title={isRecording ? "Stop Recording" : (isUploading ? "Uploading..." : "Start Recording")}>
        <span>
          <IconButton
            size="small"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading && !isRecording}
          >
            {isUploading && !isRecording ? (
              <CircularProgress size={20}/>
            ) : (
              isRecording ? <StopIcon color="error" fontSize="small"/> : <MicIcon fontSize="small"/>
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AudioRecord;