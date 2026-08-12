from fastmcp import FastMCP

mcp = FastMCP("Jupyter AI Tools")

@mcp.tool()
def greet(name: str) -> str:
    """Greets a person by name."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run()