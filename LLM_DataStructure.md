# AI Chat Data Structures

## 1. UI Layer (Message)

```typescript
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum ContentType {
  Text = 'text',
  File = 'file',
  Code = 'code',
  CodeOutput = 'code_output',
}

export class Content {
  type: ContentType;
  data: string;
}

export class Message {
  id?: string;
  role: MessageRole;
  contents: Content[];

  promptId?: number;
  thought?: string;
  display?: string;
}
```

## 2. Request (to FastAPI)

```typescript
export interface ChatRequest {
  messages: Array<Message>;
  api_type: string;
  model: string;
  temperature: number;
  stream: boolean;
  thought: boolean;
  web_search: boolean;
  code_execution: boolean;
}

export interface Content {
  type: ContentType;
  data: string;
}

export const ContentType = {
  Text: 'text',
  File: 'file'
} as const;

export interface Message {
  role: Role;
  contents: Array<Content>;
}

export const Role = {
  User: 'user',
  Assistant: 'assistant',
  System: 'system'
} as const;
```

## 3. Response (from FastAPI)

```typescript
export interface ResponseFile {
  name: string;
  data: string;
  type: string;
}

export interface ChatResponse {
  text?: string;
  audio?: string;
  thought?: string;
  code?: string;
  code_output?: string;
  files?: ResponseFile[];
  display?: string;
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
}
```
