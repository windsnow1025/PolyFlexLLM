import React from 'react';
import {IconButton, Tooltip, Typography, useTheme} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import TextContent from "./text/TextContent";
import {RawEditableState} from "@/lib/common/message/EditableState";
import FileDiv from "./file/FileDiv";
import CodeDiv from "./code/CodeDiv";
import CodeOutputDiv from "./code/CodeOutputDiv";
import {ContentTypeEnum} from "@/client/nest";

function SortableContent({
                           id,
                           index,
                           content,
                           contents,
                           setContents,
                           rawEditableState,
                           isTemporaryChat,
                         }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContentUpdate = (newValue) => {
    setContents(prevContents => {
      const newContents = [...prevContents];
      newContents[index] = {...newContents[index], data: newValue};
      return newContents;
    });
  };

  const handleContentDelete = () => {
    setContents(prevContents => {
      const newContents = [...prevContents];
      newContents.splice(index, 1);
      return newContents;
    });
  };

  const handleCopy = () => {
    if (content.type === ContentTypeEnum.Text) {
      navigator.clipboard.writeText(content.data);
    }
  };

  const theme = useTheme();

  if (content.type === ContentTypeEnum.Text) {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div
          className="flex-column pb-1 px-1 rounded-md"
          style={{
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.info.main}, transparent 80%)`
          }}
        >
          {(rawEditableState !== RawEditableState.AlwaysFalse && !isTemporaryChat) ? (
            <>
              <div className="flex-start-center">
                <div
                  {...listeners}
                  className="mr-2 flex"
                  style={{cursor: 'grab', touchAction: 'none'}}
                >
                  <DragIndicatorIcon fontSize="small"/>
                </div>
                <Typography variant="subtitle2" className="grow">
                  Text Content
                </Typography>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={handleCopy}>
                    <ContentCopyIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={handleContentDelete}>
                    <DeleteIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </div>
              <TextContent
                content={content.data}
                setContent={handleContentUpdate}
                rawEditableState={rawEditableState}
              />
            </>
          ) : (
            <div className="pt-1">
              <TextContent
                content={content.data}
                setContent={handleContentUpdate}
                rawEditableState={rawEditableState}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (content.type === ContentTypeEnum.Code) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="w-full">
        <CodeDiv
          code={content.data}
          setCode={(newCode) => newCode === null ? handleContentDelete() : handleContentUpdate(newCode)}
          isPreview={rawEditableState === RawEditableState.AlwaysFalse}
          isLoading={false}
        />
      </div>
    );
  }

  if (content.type === ContentTypeEnum.CodeOutput) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="w-full">
        <CodeOutputDiv
          output={content.data}
          setOutput={(newOutput) => newOutput === null ? handleContentDelete() : handleContentUpdate(newOutput)}
          isPreview={rawEditableState === RawEditableState.AlwaysFalse}
          isLoading={false}
        />
      </div>
    );
  }

  if (content.type === ContentTypeEnum.File) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className="max-w-full">
        <div className="flex-start-center-nowrap">
          {rawEditableState !== RawEditableState.AlwaysFalse && !isTemporaryChat && (
            <div
              {...listeners}
              className="flex"
              style={{cursor: 'grab', touchAction: 'none'}}
            >
              <DragIndicatorIcon fontSize="small"/>
            </div>
          )}
          <FileDiv
            fileUrl={content.data}
            rawEditableState={rawEditableState}
            onDelete={handleContentDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div>Unknown content type: {JSON.stringify(content)}</div>
  );
}

export default SortableContent;