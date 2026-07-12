import logging
import os

from dotenv import load_dotenv

from .client.nest_js_client.client import AuthenticatedClient, Client


def init_env():
    load_dotenv()
    is_production = os.environ['ENV'] != 'development'

    if is_production:
        os.environ['NEST_API_BASE_URL'] = f'http://{os.environ['NEST_HOST']}:3000'
    else:
        os.environ['NEST_API_BASE_URL'] = os.environ.get('NEST_API_BASE_URL') or 'http://localhost:3001'
        os.environ['FASTAPI_PATH_PREFIX'] = ""

    logging.info(f"Using {'production' if is_production else 'development'} setting.")


def get_client(token: str | None = None) -> Client | AuthenticatedClient:
    base_url = os.environ["NEST_API_BASE_URL"]
    if token:
        return AuthenticatedClient(
            base_url=base_url,
            token=token,
            raise_on_unexpected_status=True,
        )
    return Client(
        base_url=base_url,
        raise_on_unexpected_status=True,
    )
