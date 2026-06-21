import React from 'react';
import {DndContext, PointerSensor, rectIntersection, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext} from "@dnd-kit/sortable";
import SortableContent from './SortableContent';
import {ContentTypeEnum} from "@/client/nest";

function SortableContents({
                            contents,
                            setContents,
                            rawEditableState,
                            selectedConversationId,
                          }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 5},
    })
  );

  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.split('-')[1]);
    const newIndex = parseInt(over.id.split('-')[1]);

    const newContents = [...contents];
    const [movedItem] = newContents.splice(oldIndex, 1);
    newContents.splice(newIndex, 0, movedItem);

    setContents(newContents);
  };

  const renderGroupedContents = () => {
    const grouped = [];
    let currentFileGroup = [];

    contents.forEach((content, index) => {
      const itemWithIndex = { content, index };

      if (content.type === ContentTypeEnum.Text) { // If text content
        // 1. Push the collected file group
        if (currentFileGroup.length > 0) {
          grouped.push({ type: 'fileGroup', items: currentFileGroup });
          currentFileGroup = [];
        }
        // 2. Push the text content
        grouped.push({ type: 'text', items: [itemWithIndex] });
      } else { // If file content
        // Collect the file content
        currentFileGroup.push(itemWithIndex);
      }
    });

    // Push the remaining file group
    if (currentFileGroup.length > 0) {
      grouped.push({ type: 'fileGroup', items: currentFileGroup });
    }

    return grouped.map((group, groupIndex) => {
      if (group.type === 'text') {
        const { content, index } = group.items[0];
        return (
          <SortableContent
            key={`content-${index}`}
            id={`content-${index}`}
            index={index}
            content={content}
            contents={contents}
            setContents={setContents}
            rawEditableState={rawEditableState}
            selectedConversationId={selectedConversationId}
          />
        );
      }

      if (group.type === 'fileGroup') {
        return (
          <div key={`group-${groupIndex}`} className="flex-start-center gap-y-2">
            {group.items.map(({ content, index }) => (
              <SortableContent
                key={`content-${index}`}
                id={`content-${index}`}
                index={index}
                content={content}
                contents={contents}
                setContents={setContents}
                rawEditableState={rawEditableState}
                selectedConversationId={selectedConversationId}
              />
            ))}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={contents.map((_, index) => `content-${index}`)}
      >
        <div className="flex-column gap-y-2 mt-2">
          {renderGroupedContents()}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableContents;