import {ApiTypeModel, ChatResponse} from "./ChatResponse";
import {getAPIBaseURLs, getFastAPIOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {handleError} from "@/lib/common/ErrorHandler";
import {type AbortIntent, type ChatRequest, DefaultApi, type Message} from "@/client/fastapi";
import {StorageKeys} from "@/lib/common/Constants";

export default class ChatClient {
  private async* consumeStream(
    url: string,
    method: string,
    body: string | undefined,
    onOpenCallback?: () => void,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatResponse, void, unknown> {
    const token = localStorage.getItem(StorageKeys.Token)!;

    const queue: ChatResponse[] = [];
    let resolveQueue: (() => void) | null = null;
    let isDone = false;
    let errorOccurred: Error | null = null;

    fetchEventSource(url, {
      method: method,
      body: body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      openWhenHidden: true,
      signal: signal,
      async onopen(response: Response) {
        if (!response.ok) {
          const status = response.status;
          const statusText = response.statusText;
          let resJson;
          try {
            resJson = await response.json();
          } catch (error) {
            console.error(error);
          }
          const message = resJson?.detail ?? '';

          const err: Error & {isAxiosError: true; response: object} = Object.assign(
            new Error(message),
            {
              isAxiosError: true as const,
              response: {status, statusText, data: {message}},
            },
          );
          throw err;
        }

        if (onOpenCallback) {
          onOpenCallback();
        }
      },
      onmessage(event: EventSourceMessage) {
        const parsedData = JSON.parse(event.data);
        if (parsedData.done) {
          return;
        }
        queue.push(parsedData);
        if (resolveQueue) {
          resolveQueue();
          resolveQueue = null;
        }
      },
      onclose() {
        isDone = true;
        if (resolveQueue) {
          resolveQueue();
        }
      },
      onerror(err) {
        errorOccurred = err;
        isDone = true;
        if (resolveQueue) {
          resolveQueue();
        }
        throw err;
      }
    }).catch(() => {});

    while (!isDone || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise<void>(resolve => resolveQueue = resolve);
      }
    }

    if (errorOccurred) {
      throw errorOccurred;
    }
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
  ): Promise<ChatResponse> {
    const requestData: ChatRequest = {
      messages: messages,
      api_type: api_type,
      model: model,
      temperature: temperature,
      stream: false,
      thought: thought,
      web_search: web_search,
      code_execution: code_execution,
      conversation_id: conversation_id,
    };

    try {
      const api = new DefaultApi(getFastAPIOpenAPIConfiguration());
      const res = await api.generateChatPost(requestData);
      return res.data;
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
    onOpenCallback?: () => void,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatResponse, void, unknown> {
    const requestData: ChatRequest = {
      messages: messages,
      api_type: api_type,
      model: model,
      temperature: temperature,
      stream: true,
      thought: thought,
      web_search: web_search,
      code_execution: code_execution,
      conversation_id: conversation_id,
    };

    yield* this.consumeStream(
      `${getAPIBaseURLs().fastAPI}/chat`,
      "POST",
      JSON.stringify(requestData),
      onOpenCallback,
      signal,
    );
  }

  async* resumeStream(
    conversation_id: number,
    onOpenCallback?: () => void,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatResponse, void, unknown> {
    yield* this.consumeStream(
      `${getAPIBaseURLs().fastAPI}/chat/stream/${conversation_id}`,
      "GET",
      undefined,
      onOpenCallback,
      signal,
    );
  }

  async abortChat(conversationId: number, intent: AbortIntent): Promise<boolean> {
    const api = new DefaultApi(getFastAPIOpenAPIConfiguration());
    const res = await api.abortChatChatAbortPost({conversation_id: conversationId, intent: intent});
    return res.data;
  }

  async checkGenerating(conversationId: number): Promise<boolean> {
    const api = new DefaultApi(getFastAPIOpenAPIConfiguration());
    const res = await api.isGeneratingChatGeneratingConversationIdGet(conversationId);
    return res.data;
  }

  async fetchApiModels(): Promise<ApiTypeModel[]> {
    const api = new DefaultApi(getFastAPIOpenAPIConfiguration());
    const res = await api.getModelsModelGet();
    return res.data;
  }
}
