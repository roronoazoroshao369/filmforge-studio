"""Characterize existing OpenAI-compatible *text* base-URL support, offline only.

G0 Task 55: this proves a transport fixture, NOT real OmniRoute support,
provider rights, commercial quota, or any image/video adapter capability.
"""

import json

import httpx
import pytest
from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from openai import InternalServerError

from app.models.llm import ModelCategoryKey, Provider
from app.services.llm.provider_resolver import resolve_provider_config_from_provider


@pytest.mark.asyncio
async def test_text_provider_custom_endpoint_uses_single_mock_request_without_media_routing():
    """A configured OpenAI-compatible text URL is honored; no other host is contacted."""
    requests = []

    def reply(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        assert request.method == "POST"
        assert str(request.url) == "https://gateway.invalid/v1/chat/completions"
        assert request.headers["Authorization"] == "Bearer fixture-key"
        body = json.loads(request.content)
        assert body["model"] == "fixture-text"
        assert body["messages"][-1]["content"] == "An original sentence"
        return httpx.Response(200, json={
            "id": "fixture-chat-id",
            "object": "chat.completion",
            "created": 1,
            "model": "fixture-text",
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": "An original answer"},
                "finish_reason": "stop",
            }],
        })

    provider = Provider(id="gateway-fixture", provider_key="openai", name="Gateway fixture",
                        base_url="https://gateway.invalid/v1", api_key="fixture-key", status="active")
    config = resolve_provider_config_from_provider(provider=provider, category=ModelCategoryKey.text)
    async with httpx.AsyncClient(transport=httpx.MockTransport(reply)) as client:
        llm = ChatOpenAI(model="fixture-text", api_key=config.api_key, base_url=config.base_url,
                         max_retries=0, http_async_client=client)
        answer = await llm.ainvoke("An original sentence")
    assert answer.content == "An original answer"
    assert len(requests) == 1


@pytest.mark.asyncio
async def test_text_mock_gateway_http_503_never_triggers_an_implicit_retry_or_paid_fallback():
    """The existing text transport can explicitly forbid retries; no second create occurs."""
    requests = []

    def unavailable(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(503, json={"error": {"message": "unavailable", "type": "server_error"}})

    async with httpx.AsyncClient(transport=httpx.MockTransport(unavailable)) as client:
        llm = ChatOpenAI(model="fixture-text", api_key="fixture-key",
                         base_url="https://gateway.invalid/v1", max_retries=0,
                         http_async_client=client)
        with pytest.raises(InternalServerError):
            await llm.ainvoke("An original sentence")
    assert len(requests) == 1
    assert requests[0].url.host == "gateway.invalid"


def test_text_gateway_fixture_cannot_bypass_disabled_provider_or_media_category_gate():
    """Routing to a custom endpoint must retain native category and disabled checks."""
    provider = Provider(id="gateway-fixture", provider_key="openai", name="Gateway fixture",
                        base_url="https://gateway.invalid/v1", api_key="fixture-key", status="disabled")
    with pytest.raises(HTTPException) as disabled:
        resolve_provider_config_from_provider(provider=provider, category=ModelCategoryKey.text)
    assert disabled.value.status_code == 503

    provider.status = "active"
    provider.provider_key = "aliyun_bailian"
    with pytest.raises(HTTPException) as unsupported:
        resolve_provider_config_from_provider(provider=provider, category=ModelCategoryKey.video)
    assert unsupported.value.status_code == 400
