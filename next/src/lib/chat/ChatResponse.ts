export interface ApiTypeModel {
  apiType: string;
  model: string;
  input: number;
  output: number;
}

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
