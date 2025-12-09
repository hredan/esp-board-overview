"""Unit tests for board_data.py"""
from helper.board_data import BoardData, BoardList

def test_set_name():
    """Test setting the name of the board."""
    board = BoardData()
    board.set_name("TestBoard")
    assert board.name == "TestBoard"

def test_to_json():
    """Test BoardData to_json method."""
    board = BoardData()
    board.set_name("TestBoard")
    board.set_mcu("TestMCU")
    board.set_variant("TestVariant")
    board.set_flash_size("256KB")
    board.set_led_builtin("2")
    board.set_board_id("12345")

    expected_json = '''{
    "name": "TestBoard",
    "variant": "TestVariant",
    "mcu": "TestMCU",
    "flash_size": [
        "256KB"
    ],
    "led_builtin": "2",
    "board": "12345"
}'''

    assert board.to_json() == expected_json  # Ensure __str__ works as expected

def test_board_list_to_json():
    """Test BoardList to_json method."""
    board1 = BoardData()
    board1.set_name("Board1")
    board1.set_mcu("MCU1")

    board2 = BoardData()
    board2.set_name("Board2")
    board2.set_mcu("MCU2")

    board_list = BoardList()
    board_list.append(board1)
    board_list.append(board2)

    expected_json = '''[
    {
        "name": "Board1",
        "variant": "N/A",
        "mcu": "MCU1",
        "flash_size": [],
        "led_builtin": "N/A",
        "board": ""
    },
    {
        "name": "Board2",
        "variant": "N/A",
        "mcu": "MCU2",
        "flash_size": [],
        "led_builtin": "N/A",
        "board": ""
    }
]'''

    assert board_list.to_json() == expected_json  # Ensure BoardList __str__ works as expected
