# ChatRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**messages** | [**Array&lt;Message&gt;**](Message.md) |  | [default to undefined]
**api_type** | **string** |  | [default to undefined]
**model** | **string** |  | [default to undefined]
**temperature** | **number** |  | [default to undefined]
**stream** | **boolean** |  | [default to undefined]
**thought** | **boolean** |  | [default to undefined]
**web_search** | **boolean** |  | [default to undefined]
**code_execution** | **boolean** |  | [default to undefined]
**structured_output_schema** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**conversation_id** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { ChatRequest } from './api';

const instance: ChatRequest = {
    messages,
    api_type,
    model,
    temperature,
    stream,
    thought,
    web_search,
    code_execution,
    structured_output_schema,
    conversation_id,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
