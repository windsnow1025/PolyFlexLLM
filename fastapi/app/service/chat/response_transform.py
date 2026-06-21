from llm_bridge import ChatResponse, File


def aggregate(chunks: list[ChatResponse]) -> ChatResponse:
    text = ""
    thought = ""
    code = ""
    code_output = ""
    files: list = []
    display = ""
    input_tokens = 0
    output_tokens = 0
    error = ""
    for chunk in chunks:
        if chunk.text:
            text += chunk.text
        if chunk.thought:
            thought += chunk.thought
        if chunk.code:
            code += chunk.code
        if chunk.code_output:
            code_output += chunk.code_output
        if chunk.files:
            files += chunk.files
        if chunk.display:
            display += chunk.display
        if chunk.input_tokens:
            input_tokens = chunk.input_tokens
        if chunk.output_tokens:
            output_tokens += chunk.output_tokens
        if chunk.error:
            error += chunk.error
    return ChatResponse(
        text=text,
        thought=thought,
        code=code,
        code_output=code_output,
        files=files,
        display=display,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        error=error,
    )


def to_log(response: ChatResponse) -> ChatResponse:
    return ChatResponse(
        text=response.text,
        thought=response.thought,
        code=response.code,
        code_output=response.code_output,
        files=[File(name=f.name, type=f.type, data=f"<base64 len={len(f.data)}>") for f in (response.files or [])],
        display=response.display,
        input_tokens=response.input_tokens,
        output_tokens=response.output_tokens,
    )
