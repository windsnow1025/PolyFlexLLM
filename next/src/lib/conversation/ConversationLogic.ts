import {Temporal} from "@js-temporal/polyfill";
import {isEqual} from "lodash";
import {handleError} from "@/lib/common/ErrorHandler";
import ConversationClient from "./ConversationClient";
import {ConversationReqDto, ConversationResDto, ConversationVersionResDto, Message} from "@/client/nest";
import PromptLogic from "@/lib/prompt/PromptLogic";

export default class ConversationLogic {
  private conversationService: ConversationClient;

  constructor() {
    this.conversationService = new ConversationClient();
  }

  static async populatePromptContents(messages: Message[]): Promise<void> {
    const promptLogic = new PromptLogic();
    for (const message of messages) {
      if (message.promptId) {
        const prompt = await promptLogic.fetchPrompt(message.promptId);
        message.contents = prompt.contents;
      }
    }
  }

  static stripPromptContents(messages: Message[]): Message[] {
    return messages.map(message => {
      if (message.promptId) {
        return {...message, contents: []};
      }
      return message;
    });
  }

  static formatDate(dateString: string): string {
    const instant = Temporal.Instant.from(dateString);
    const duration = Temporal.Now.instant().since(instant);

    const diffMins = Math.max(0, Math.floor(duration.total({unit: 'minute'})));
    const diffHours = Math.max(0, Math.floor(duration.total({unit: 'hour'})));
    const diffDays = Math.max(0, Math.floor(duration.total({unit: 'day'})));

    const rtf = new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'});

    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 7) return rtf.format(-diffDays, 'day');

    const plainDate = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate();
    return plainDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  static mergeMessages(prevMsgs: Message[] | null, serverMsgs: Message[]): Message[] {
    if (!prevMsgs) return serverMsgs;

    // Normalize: strip id and falsy top-level fields (treat undefined and "" as equivalent)
    const normalize = ({id, ...rest}: Message) =>
      Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null && v !== ""));

    const result: Message[] = [];
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
      if (isEqual(normalize(local), normalize(server))) {
        // Same content, keep local to preserve TransitionGroup key
        result.push(local);
      } else {
        // Content differs, use server from here on
        return [...result, ...serverMsgs.slice(i)];
      }
    }

    return result;
  }

  async fetchConversations(ids?: number[]): Promise<ConversationResDto[]> {
    try {
      return await this.conversationService.fetchConversations(ids);
    } catch (err) {
      handleError(err, 'Failed to fetch conversations');
    }
  }

  async fetchConversationVersions(): Promise<ConversationVersionResDto[]> {
    try {
      return await this.conversationService.fetchConversationVersions();
    } catch (error) {
      handleError(error, 'Failed to fetch conversation versions');
    }
  }

  async fetchConversation(id: number): Promise<ConversationResDto> {
    try {
      return await this.conversationService.fetchConversation(id);
    } catch (error) {
      handleError(error, 'Failed to fetch conversation');
    }
  }

  async fetchPublicConversation(id: number): Promise<ConversationResDto> {
    try {
      return await this.conversationService.fetchPublicConversation(id);
    } catch (error) {
      handleError(error, 'Failed to fetch public conversation');
    }
  }

  async addConversation(conversation: ConversationReqDto): Promise<ConversationResDto> {
    try {
      return await this.conversationService.saveConversation(conversation);
    } catch (error) {
      handleError(error, 'Failed to add conversation');
    }
  }

  async cloneConversationForUser(
    id: number, username: string
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.cloneConversationForUser(id, username);
    } catch (error) {
      handleError(error, 'Failed to add conversation for user');
    }
  }

  async updateConversation(
    id: number, etag: string, conversation: ConversationReqDto
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.updateConversation(id, etag, conversation);
    } catch (error) {
      handleError(error, 'Failed to update conversation');
    }
  }

  async updateConversationName(
    id: number, etag: string, name: string
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.updateConversationName(id, etag, name);
    } catch (error) {
      handleError(error, 'Failed to update conversation name');
    }
  }

  async updateConversationPublic(
    id: number, etag: string, isPublic: boolean
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.updateConversationPublic(id, etag, isPublic);
    } catch (error) {
      handleError(error, 'Failed to update conversation public status');
    }
  }

  async updateConversationLabelLink(
    id: number, etag: string, labelId: number | null
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.updateConversationLabelLink(id, etag, labelId);
    } catch (error) {
      handleError(error, 'Failed to update conversation label');
    }
  }

  async addUserToConversation(
    id: number, etag: string, username: string
  ): Promise<ConversationResDto> {
    try {
      return await this.conversationService.addUserToConversation(id, etag, username);
    } catch (error) {
      handleError(error, 'Failed to share conversation');
    }
  }

  async deleteConversation(id: number) {
    try {
      await this.conversationService.deleteConversation(id);
    } catch (error) {
      handleError(error, 'Failed to delete conversation');
    }
  }
}
