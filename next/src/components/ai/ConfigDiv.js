import React, {useEffect, useState} from 'react';
import {Chip, FormControlLabel, IconButton, Slider, Switch, Tooltip, Typography} from "@mui/material";
import {InfoOutlined} from "@mui/icons-material";
import {StorageKeys} from "@/lib/common/Constants";
import useScreenSize from "@/hooks/useScreenSize";
import CreditSection from "@/components/common/settings/auth/signed-in/CreditSection";
import ApiTypeModelSelect from "@/components/ai/ApiTypeModelSelect";

function ConfigDiv({
                     apiType,
                     setApiType,
                     model,
                     setModel,
                     temperature,
                     setTemperature,
                     stream,
                     setStream,
                     thought,
                     setThought,
                     webSearch,
                     setWebSearch,
                     codeExecution,
                     setCodeExecution,
                     refreshKey,
                   }) {
  const screenSize = useScreenSize();
  const smallScreen = screenSize === 'xs';

  const [developerMode, setDeveloperMode] = useState(false);

  useEffect(() => {
    const storedDeveloperMode = localStorage.getItem(StorageKeys.DeveloperMode);
    if (storedDeveloperMode !== null) {
      setDeveloperMode(storedDeveloperMode === 'true');
    }
  }, []);

  return (
    <>
      <div className="flex-around my-2.5 gap-y-2">
        <ApiTypeModelSelect
          apiType={apiType}
          setApiType={setApiType}
          model={model}
          setModel={setModel}
        />
        <div className="flex-center gap-1">
          <CreditSection refreshKey={refreshKey} decimalPlaces={5}/>
          <Tooltip title="Billing">
            <IconButton size="small" href="/billing" target="_blank">
              <InfoOutlined fontSize="small"/>
            </IconButton>
          </Tooltip>
        </div>
        {developerMode && (
          <>
            <div>
              <Typography variant="body1">Temperature</Typography>
              <Slider
                id="temperature"
                value={temperature}
                onChange={(e, newValue) => setTemperature(newValue)}
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={0}
                max={2}
                size="small"
              />
            </div>
            <FormControlLabel control={
              <Switch
                checked={stream}
                onChange={e => setStream(e.target.checked)}
                size="small"
              />
            } label="Stream"/>
          </>
        )}
        {!smallScreen && (
          <div className="flex-center-nowrap gap-2">
            <Chip
              label="Thought"
              size="medium"
              variant={thought ? "filled" : "outlined"}
              color={thought ? "secondary" : "default"}
              onClick={() => setThought(!thought)}
            />
            <Chip
              label="Web Search"
              size="medium"
              variant={webSearch ? "filled" : "outlined"}
              color={webSearch ? "secondary" : "default"}
              onClick={() => setWebSearch(!webSearch)}
            />
            <Chip
              label="Code Exec"
              size="medium"
              variant={codeExecution ? "filled" : "outlined"}
              color={codeExecution ? "secondary" : "default"}
              onClick={() => setCodeExecution(!codeExecution)}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default ConfigDiv;
