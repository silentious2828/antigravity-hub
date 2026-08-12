#!/usr/bin/env python3
"""Ollama MCP Server - wraps local Ollama models as MCP tools."""

import asyncio
import json
import os
import sys
import httpx
from fastmcp import FastMCP

# Ollama server URL
OLLAMA_URL = "http://localhost:11434/api"

# Available models from Ollama
AVAILABLE_MODELS = [
    "qwen2.5-coder:7b",
    "gemma4:e2b",
    "gemma4:26b",
    "gemma4:e4b",
    "gemma4:e4b-mlx",
    "llama3:latest",
    "gemma4:latest",
    "gemma4:31b-mlx",
    "gemma4:31b",
    "gemma4:31b-cloud",
]

mcp = FastMCP(name="Ollama-MCP-Server")


@mcp.tool()
async def list_models() -> dict:
    """List available Ollama models."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{OLLAMA_URL}/tags")
            if response.status_code == 200:
                data = response.json()
                return {"models": data.get("models", [])}
        except Exception as e:
            print(f"Error fetching models from Ollama: {e}")
    
    # Return locally known models if Ollama is not reachable
    return {"models": [{"name": m} for m in AVAILABLE_MODELS]}


@mcp.tool()
async def chat(model: str, messages: list, stream: bool = False) -> dict:
    """Send a chat completion request to an Ollama model.
    
    Args:
        model: The model name (e.g., "qwen2.5-coder:7b")
        messages: List of message objects with role and content
        stream: Whether to stream the response
    
    Returns:
        dict: The response from Ollama
    """
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": stream,
            }
            response = await client.post(
                f"{OLLAMA_URL}/chat",
                json=payload,
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Ollama error: {response.status_code}", "detail": response.text}
        except Exception as e:
            return {"error": str(e)}


@mcp.tool()
async def generate(model: str, prompt: str, stream: bool = False) -> dict:
    """Generate text completion using an Ollama model.
    
    Args:
        model: The model name (e.g., "qwen2.5-coder:7b")
        prompt: The prompt to generate from
        stream: Whether to stream the response
    
    Returns:
        dict: The response from Ollama
    """
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": stream,
            }
            response = await client.post(
                f"{OLLAMA_URL}/generate",
                json=payload,
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Ollama error: {response.status_code}", "detail": response.text}
        except Exception as e:
            return {"error": str(e)}


async def main():
    """Run the Ollama MCP server."""
    print("Starting Ollama MCP Server...")
    print(f"Ollama server at: {OLLAMA_URL}")
    print(f"Available models: {len(AVAILABLE_MODELS)} models")
    
    # Verify Ollama connection
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{OLLAMA_URL}/tags")
            if resp.status_code == 200:
                data = resp.json()
                print(f"Connected to Ollama! Models: {[m['name'] for m in data.get('models', [])]}")
        except Exception:
            print("Warning: Could not connect to Ollama server. Using configured models.")
    
    print("Ollama MCP Server running on http://localhost:3001/mcp")
    await mcp.run()


if __name__ == "__main__":
    asyncio.run(main())