from ...client.nest_js_client.api.files.files_controller_get_web_url import asyncio as get_web_url_async
from ...config import get_client


async def get_storage_url(token: str) -> str:
    client = get_client(token)
    async with client as client:
        result = await get_web_url_async(client=client)
        return result.web_url


async def upload_files(token: str, files: list[tuple[str, bytes, str]]) -> list[str]:
    client = get_client(token)
    async with client as client:
        httpx_client = client.get_async_httpx_client()

        files_data = [
            ("files", (filename, file_bytes, mime_type))
            for filename, file_bytes, mime_type in files
        ]

        response = await httpx_client.post(
            "/files",
            files=files_data,
        )
        response.raise_for_status()

        return response.json()["urls"]
