import React, {useEffect, useRef} from 'react';
import {Button, CircularProgress, Tooltip} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {AbortIntent} from "@/client/fastapi";

function SendButton({
                      isGenerating,
                      handleGenerate,
                      abortGenerate,
                      disabled,
                    }) {
  const sendButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.activeElement.blur();
        setTimeout(() => sendButtonRef.current.click(), 0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClick = () => {
    if (!isGenerating) {
      handleGenerate();
    } else {
      abortGenerate(AbortIntent.Keep);
    }
  };

  return (
    <div className="m-2">
      <Tooltip title="Ctrl/Cmd + Enter">
        <span>
          <Button
            id="send"
            variant="contained"
            color="primary"
            onClick={handleClick}
            startIcon={isGenerating ? <CircularProgress size={16} color="inherit"/> : <PlayArrowIcon/>}
            disabled={disabled}
            ref={sendButtonRef}
          >
            {isGenerating ? "Stop" : "Send"}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}

export default SendButton;
