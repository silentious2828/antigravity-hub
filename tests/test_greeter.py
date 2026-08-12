from data_agent_kit.greeter import greet


def test_greet():
    assert greet("World") == "Hello, World!"
