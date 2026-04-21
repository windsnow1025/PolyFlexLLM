import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

function DisplayDiv({ display, setDisplay, isPreview }) {

  if (!display) return null;

  return (
    <div className="flex local-scroll-scrollable my-1">
      <div
        dangerouslySetInnerHTML={{ __html: display }}
        className="flex-1 m-px [&_.container]:max-w-none!"
      />
      {!isPreview && (
        <Tooltip title="Remove Display" className="self-start">
          <IconButton aria-label="remove-display" onClick={() => {setDisplay(null)}}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

export default DisplayDiv;