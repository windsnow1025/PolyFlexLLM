import ChatClient from "./ChatClient";
import {ApiTypeModel, ChatResponse} from "@/lib/chat/ChatResponse";
import {Content, ContentTypeEnum, Message, MessageRoleEnum} from "@/client/nest";
import {type AbortIntent, ContentType as ReqContentType, Message as ReqMessage, Role as ReqRole} from "@/client/fastapi";
import {getErrorStatus, handleError} from "@/lib/common/ErrorHandler";

export default class ChatLogic {
  private chatClient: ChatClient;
  static getInitMessages = (): Message[] => [
    {
      id: crypto.randomUUID(),
      role: MessageRoleEnum.System,
      contents: [
        {
          type: ContentTypeEnum.Text,
          data: "You are a helpful assistant."
        }
      ],
    },
    {
      id: crypto.randomUUID(),
      role: MessageRoleEnum.User,
      contents: [
        {
          type: ContentTypeEnum.Text,
          data: ""
        }
      ],
    }
  ];
  static getEmptyUserMessage = (): Message => ({
    id: crypto.randomUUID(),
    role: MessageRoleEnum.User,
    contents: [
      {
        type: ContentTypeEnum.Text,
        data: ""
      }
    ],
  });
  static getEmptyAssistantMessage = (id?: string): Message => ({
    id: id ?? crypto.randomUUID(),
    role: MessageRoleEnum.Assistant,
    contents: [],
  });
  static defaultApiTypeModels: ApiTypeModel[] = [
    {apiType: "", model: "", input: 0, output: 0},
  ];

  constructor() {
    this.chatClient = new ChatClient();
  }

  // For deleting files from storage
  static getFileUrlsFromMessage(message: Message): string[] {
    return message.contents
      .filter(content => content.type === ContentTypeEnum.File)
      .map(content => content.data);
  }

  // For deleting files from storage
  static getFileUrlsFromMessages(messages: Message[]): string[] {
    return messages
      .flatMap(message => ChatLogic.getFileUrlsFromMessage(message));
  }

  // For non-stream response
  static createAssistantMessage(chatResponse: ChatResponse, id?: string): Message {
    const contents: Content[] = [];

    if (chatResponse.code) {
      contents.push({
        type: ContentTypeEnum.Code,
        data: chatResponse.code
      });
    }

    if (chatResponse.code_output) {
      contents.push({
        type: ContentTypeEnum.CodeOutput,
        data: chatResponse.code_output
      });
    }

    if (chatResponse.text) {
      contents.push({
        type: ContentTypeEnum.Text,
        data: chatResponse.text
      });
    }

    return {
      id: id ?? crypto.randomUUID(),
      role: MessageRoleEnum.Assistant,
      contents: contents,
      thought: chatResponse.thought,
      display: chatResponse.display,
    };
  }

  // For stream response
  static updateMessage(
    messages: Message[],
    index: number,
    chunk: ChatResponse,
  ): Message[] {
    const newMessages = [...messages];

    if (index < 0 || index >= newMessages.length) {
      return newMessages;
    }

    // Deep Copy
    const currentMessage = {...newMessages[index]};
    currentMessage.contents = [...currentMessage.contents];

    const appendOrCreateContent = (type: ContentTypeEnum, data: string) => {
      const lastContent = currentMessage.contents.at(-1);
      if (lastContent && lastContent.type === type) {
        lastContent.data += data;
      } else {
        currentMessage.contents.push({type, data});
      }
    };

    if (chunk.code) {
      appendOrCreateContent(ContentTypeEnum.Code, chunk.code);
    }

    if (chunk.code_output) {
      appendOrCreateContent(ContentTypeEnum.CodeOutput, chunk.code_output);
    }

    if (chunk.text) {
      appendOrCreateContent(ContentTypeEnum.Text, chunk.text);
    }

    if (chunk.thought) {
      currentMessage.thought = (currentMessage.thought || '') + chunk.thought;
    }
    if (chunk.display) {
      currentMessage.display = (currentMessage.display || '') + chunk.display;
    }

    // Replace the message in the array with the updated one
    newMessages[index] = currentMessage;

    return newMessages;
  }

  // For chat config
  static getAllApiTypes(apiModels: ApiTypeModel[]): string[] {
    const apiTypes = apiModels.map(model => model.apiType);
    return Array.from(new Set(apiTypes));
  }

  // For chat config
  static getDefaultApiType(apiModels: ApiTypeModel[]): string {
    return ChatLogic.getAllApiTypes(apiModels)[0];
  }

  // For chat config
  static filterApiTypeModelsByApiType(
    apiTypeModels: ApiTypeModel[], apiType: string
  ): ApiTypeModel[] {
    if (!Array.isArray(apiTypeModels) || !apiTypeModels.length || !apiType) {
      return ChatLogic.defaultApiTypeModels;
    }
    return apiTypeModels
      .filter(apiModel => apiModel.apiType === apiType)
  }

  // For chat config
  static filterDefaultModelByApiType(apiTypeModels: ApiTypeModel[], apiType: string): string {
    return ChatLogic.filterApiTypeModelsByApiType(apiTypeModels, apiType)[0].model;
  }

  // For chat config
  async fetchApiTypeModels(): Promise<ApiTypeModel[]> {
    try {
      return await this.chatClient.fetchApiModels();
    } catch (error) {
      throw new Error("Failed to fetch API Models");
    }
  }

  // For chat request: UI Messages -> Req Messages
  private static convertMessagesFromUIToReq(messages: Message[]): ReqMessage[] {
    return messages.map((msg) => ({
      role: msg.role as ReqRole,
      contents: msg.contents
        .filter(content =>
          content.type === ContentTypeEnum.Text ||
          content.type === ContentTypeEnum.File
        )
        .map(content => ({
          type: content.type as ReqContentType,
          data: content.data,
        })),
    }));
  }

  async nonStreamGenerate(
    messages: Message[],
    api_type: string,
    model: string,
    temperature: number,
    thought: boolean,
    web_search: boolean,
    code_execution: boolean,
    conversation_id?: number,
    assistant_message_id?: string,
  ): Promise<ChatResponse> {
    try {
      const filteredMessages = ChatLogic.convertMessagesFromUIToReq(messages);
      const content = await this.chatClient.nonStreamGenerate(
        filteredMessages, api_type, model, temperature, thought, web_search, code_execution,
        conversation_id, assistant_message_id
      );
      if (content.error) {
        throw new Error(content.error);
      }

      return {
        text: content.text,
        audio: content.audio,
        code: content.code,
        code_output: content.code_output,
        thought: content.thought,
        files: content.files,
        display: content.display,
      };
    } catch (error) {
      handleError(error, 'Failed to generate non-streaming chat response');
    }
  }

  async* streamGenerate(
    messages: Message[],
    api_type: string,
    model: string,
    temperature: number,
    thought: boolean,
    web_search: boolean,
    code_execution: boolean,
    conversation_id?: number,
    assistant_message_id?: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatResponse, void, unknown> {
    try {
      const filteredMessages = ChatLogic.convertMessagesFromUIToReq(messages);
      const response = this.chatClient.streamGenerate(
        filteredMessages, api_type, model, temperature, thought, web_search, code_execution,
        conversation_id, assistant_message_id, signal
      );

      for await (const chunk of response) {
        if (chunk.error) {
          throw new Error(`chunk.error: ${chunk.error}`);
        }

        yield {
          text: chunk.text,
          audio: chunk.audio,
          code: chunk.code,
          code_output: chunk.code_output,
          thought: chunk.thought,
          files: chunk.files,
          display: chunk.display,
        }
      }
    } catch (error) {
      handleError(error, 'Failed to generate streaming chat response');
    }
  }

  async* resumeStream(
    conversation_id: number,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatResponse, void, unknown> {
    try {
      const response = this.chatClient.resumeStream(
        conversation_id, signal
      );

      for await (const chunk of response) {
        if (chunk.error) {
          throw new Error(`chunk.error: ${chunk.error}`);
        }

        yield {
          assistant_message_id: chunk.assistant_message_id,
          text: chunk.text,
          audio: chunk.audio,
          code: chunk.code,
          code_output: chunk.code_output,
          thought: chunk.thought,
          files: chunk.files,
          display: chunk.display,
        }
      }
    } catch (error) {
      if (getErrorStatus(error) === 404) return;
      handleError(error, 'Failed to resume streaming chat response');
    }
  }

  async abortChat(conversationId: number, intent: AbortIntent): Promise<boolean> {
    try {
      return await this.chatClient.abortChat(conversationId, intent);
    } catch (error) {
      handleError(error, 'Failed to abort chat');
    }
  }

  async checkGenerating(conversationId: number): Promise<boolean> {
    try {
      return await this.chatClient.checkGenerating(conversationId);
    } catch (error) {
      handleError(error, 'Failed to check generating status');
    }
  }
}
