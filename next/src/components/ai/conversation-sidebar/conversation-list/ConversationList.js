import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from "next/router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  List,
  Snackbar,
  Typography,
} from '@mui/material';
import {ExpandMore as ExpandMoreIcon} from '@mui/icons-material';
import {Temporal} from "@js-temporal/polyfill";
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import ChatLogic from "@/lib/chat/ChatLogic";
import LabelLogic from "@/lib/label/LabelLogic";
import {isEqual} from 'lodash';
import {NO_LABEL_COLOR} from "@/components/ai/conversation-sidebar/conversation-list/label/PresetColors";
import ConversationMenu from "@/components/ai/conversation-sidebar/conversation-list/menu/ConversationMenu";
import {StorageKeys} from "@/lib/common/Constants";
import NewLabelAccordion from "./NewLabelAccordion";
import LabelGroupHeader from "./LabelGroupHeader";
import ConversationItem from "./ConversationItem";

function ConversationList({
                            conversations,
                            setConversations,
                            selectedConversationId,
                            setSelectedConversationId,
                            setMessages,
                            conversationsReloadKey,
                            setConversationsReloadKey,
                            setIsTemporaryChat,
                            abortGenerateRef,
                            clearUIStateRef,
                            conversationUpdatePromiseRef,
                          }) {
  const router = useRouter();

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);

  // Accordion expanded state
  const [expandedAccordion, setExpandedAccordion] = useState({});

  // Auth state
  const [signedIn, setSignedIn] = useState(false);

  // Labels state
  const [labels, setLabels] = useState([]);

  // Loading state
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadingConversationId, setLoadingConversationId] = useState(null);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);

  const conversationLogic = useMemo(() => new ConversationLogic(), []);
  const chatLogic = useMemo(() => new ChatLogic(), []);
  const labelLogic = useMemo(() => new LabelLogic(), []);

  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem(StorageKeys.Token);
    setSignedIn(!!token);
    if (!token) {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadLabels = useCallback(async () => {
    setIsLoadingLabels(true);
    try {
      const fetchedLabels = await labelLogic.fetchLabels();
      setLabels(fetchedLabels || []);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setIsLoadingLabels(false);
    }
  }, [labelLogic]);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const newVersions = await conversationLogic.fetchConversationVersions();

      const currentVersions = conversations.map(conv => ({id: conv.id, version: conv.version}));
      const sortById = (a, b) => a.id - b.id;
      if (isEqual([...newVersions].sort(sortById), [...currentVersions].sort(sortById))) {
        return JSON.parse(JSON.stringify(conversations));
      }

      if (conversationUpdatePromiseRef?.current) {
        await conversationUpdatePromiseRef.current.catch(() => {});
      }

      // Fetch only changed/new conversations
      const currentMap = new Map(conversations.map(c => [c.id, c]));
      const changedOrNewIds = newVersions
        .filter(newVersion => {
          const currentVersion = currentMap.get(newVersion.id);
          return !currentVersion || currentVersion.version !== newVersion.version;
        })
        .map(newVersion => newVersion.id);
      const fetchedConversations = changedOrNewIds.length > 0
        ? await conversationLogic.fetchConversations(changedOrNewIds)
        : [];

      // Merge conversations
      const fetchedMap = new Map(fetchedConversations.map(c => [c.id, c]));
      const mergedConversations = newVersions
        .map(newVersion =>
          fetchedMap.get(newVersion.id) ?? currentMap.get(newVersion.id)
        )
        .sort((a, b) => Temporal.Instant.compare(Temporal.Instant.from(b.updatedAt), Temporal.Instant.from(a.updatedAt)));

      setConversations(mergedConversations);

      if (selectedConversationId) {
        const currentConversation = mergedConversations.find(c => c.id === selectedConversationId);
        if (currentConversation) {
          await ConversationLogic.populatePromptContents(currentConversation.messages);
          setMessages(prevMsgs => {
            const serverMsgs = currentConversation.messages;
            if (!prevMsgs) return serverMsgs;

            const result = [];
            const len = Math.max(prevMsgs.length, serverMsgs.length);

            // Server is truth
            for (let i = 0; i < len; i++) {
              const local = prevMsgs[i];
              const server = serverMsgs[i];

              if (!server) {
                // Server has fewer messages, truncate
                break;
              }
              if (!local) {
                // Server has extra messages, append
                result.push(server);
                continue;
              }
              if (local.id === server.id) {
                // Same UUID, keep local
                result.push(local);
                continue;
              }
              // Different UUID: check if content is equivalent (ignore id)
              // Normalize: strip id and falsy top-level fields (treat undefined and "" as equivalent)
              const normalize = ({id, ...rest}) =>
                Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null && v !== ""));
              if (isEqual(normalize(local), normalize(server))) {
                // Same content, keep local to preserve TransitionGroup key
                result.push(local);
              } else {
                // Content differs, use server from here on
                return [...result, ...serverMsgs.slice(i)];
              }
            }

            return result;
          });
        } else {
          showAlert('Selected conversation not found', 'warning');
        }
      }

      return JSON.parse(JSON.stringify(mergedConversations));
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [conversationLogic, conversations, conversationUpdatePromiseRef, selectedConversationId, setConversations, setMessages]);

  useEffect(() => {
    if (!signedIn) {
      return;
    }
    loadConversations();
    loadLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsReloadKey, signedIn]);

  const activateConversation = async (conversation) => {
    await ConversationLogic.populatePromptContents(conversation.messages);
    setIsTemporaryChat(false);
    setMessages(conversation.messages);
    setSelectedConversationId(conversation.id);
  };

  const selectConversation = async (conversationId) => {
    clearUIStateRef.current?.();

    setLoadingConversationId(conversationId);

    const conversations = await loadConversations();
    const conversation = conversations.find(conversation => conversation.id === conversationId);

    await activateConversation(conversation);
    setLoadingConversationId(null);

    // Check if backend is still generating for this conversation
    try {
      const generating = await chatLogic.checkGenerating(conversationId);
      if (generating) {
        const versionBefore = conversation.version;
        showAlert('Backend is still generating for this conversation. Will auto-refresh when done.', 'info');
        const pollInterval = setInterval(async () => {
          try {
            const stillGenerating = await chatLogic.checkGenerating(conversationId);
            if (!stillGenerating) {
              clearInterval(pollInterval);
              setConversationsReloadKey(prev => prev + 1);
              const updated = await conversationLogic.fetchConversation(conversationId);
              if (updated.version > versionBefore) {
                showAlert('Generation complete. Conversation refreshed.', 'success');
              } else {
                showAlert('Generation ended with no new messages. It either failed or crashed.', 'warning');
              }
            }
          } catch (err) {
            clearInterval(pollInterval);
            showAlert('Failed to check generating status: ' + err.message, 'error');
          }
        }, 3000);
      }
    } catch {
      showAlert('Failed to check generating status: ' + err.message, 'error');
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  const isInitialLoading =
    (isLoadingConversations && conversations.length === 0) ||
    (isLoadingLabels && labels.length === 0);

  if (isInitialLoading) {
    return (
      <div className="local-scroll-scrollable flex-center p-4">
        <CircularProgress/>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="local-scroll-scrollable flex-center p-4">
        <Typography variant="body2" color="text.secondary">Sign in to view conversations</Typography>
      </div>
    );
  }

  // Search filter
  const searchQuery = (router.query.search || '').toLowerCase();
  const filteredConversations = searchQuery
    ? conversations.filter((conv) => {
      if (conv.name?.toLowerCase().includes(searchQuery)) return true;
      return conv.messages?.some((msg) =>
        msg.contents?.some((content) =>
          content.data?.toLowerCase().includes(searchQuery)
        )
      );
    })
    : conversations;

  // Group conversations by label.id
  const groups = filteredConversations.reduce((acc, conv, idx) => {
    const key = conv.label?.id ?? 'no-label';
    if (!acc[key]) acc[key] = [];
    acc[key].push({conv, idx});
    return acc;
  }, {});
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => Temporal.Instant.compare(Temporal.Instant.from(b.conv.updatedAt), Temporal.Instant.from(a.conv.updatedAt)));
  });

  // Build ordered group keys: 'no-label' first, then all labels
  const labelIds = labels.map(label => label.id);
  const groupKeys = ['no-label', ...labelIds];

  const getLabelInfo = (key) => {
    if (key === 'no-label') {
      return {id: 'no-label', name: 'No label', color: NO_LABEL_COLOR};
    }
    return labels.find(label => label.id === key);
  };

  return (
    <>
      <div className="local-scroll-scrollable">
        <div className="local-scroll-unscrollable-y">
          <NewLabelAccordion setLabels={setLabels}/>

          <Box sx={{mb: 1}}/>

          {/* Label Groups */}
          {groupKeys.map((key) => {
            const labelInfo = getLabelInfo(key);
            const isNoLabel = key === 'no-label';

            return (
              <Accordion
                key={`group-${key}`}
                expanded={expandedAccordion[key] !== false}
                onChange={handleAccordionChange(key)}
                disableGutters
              >
                <AccordionSummary
                  component="div"
                  expandIcon={<ExpandMoreIcon/>}
                  sx={{
                    backgroundColor: 'action.selected',
                    '& .MuiAccordionSummary-content': {
                      marginY: 0,
                    },
                }}
                >
                  <div className="flex-center w-full">
                    <LabelGroupHeader
                      label={labelInfo}
                      count={groups[key]?.length || 0}
                      isNoLabel={isNoLabel}
                      setLabels={setLabels}
                      setConversations={setConversations}
                    />
                  </div>
                </AccordionSummary>
                <AccordionDetails sx={{padding: 0}}>
                  <List disablePadding>
                    {groups[key]?.map(({conv, idx}) => (
                      <div key={conv.id}>
                        <ConversationItem
                          conversation={conv}
                          isSelected={conv.id === selectedConversationId}
                          isLoading={loadingConversationId === conv.id}
                          onSelect={selectConversation}
                          setConversations={setConversations}
                          onMenuOpen={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuIndex(idx);
                          }}
                        />
                        <ConversationMenu
                          conversationIndex={idx}
                          anchorEl={anchorEl}
                          setAnchorEl={setAnchorEl}
                          menuIndex={menuIndex}
                          setMenuIndex={setMenuIndex}
                          conversations={conversations}
                          setConversations={setConversations}
                          selectedConversationId={selectedConversationId}
                          setSelectedConversationId={setSelectedConversationId}
                          setMessages={setMessages}
                          setConversationsReloadKey={setConversationsReloadKey}
                          abortGenerateRef={abortGenerateRef}
                          clearUIStateRef={clearUIStateRef}
                          activateConversation={activateConversation}
                          setLoadingConversationId={setLoadingConversationId}
                          labels={labels}
                        />
                      </div>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>

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

export default ConversationList;