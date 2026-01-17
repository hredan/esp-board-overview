""""Test cases for the CollectingCoreData -> CollectingBoardData"""
import json
from pathlib import Path
import pytest

from helper.collecting_core_data import CollectingCoreData
from helper.board_data import BoardList

# wildcard import is only used for test fixtures
# pylint: disable=unused-wildcard-import, wildcard-import
from tests.helper_tests.collection_core_data_fixture import *

class TestBoardData:
    """Test cases for the CoreData class."""

    def test_core_data_initialization(self, setup_esp8266: pytest.Function):
        """Test the initialization of CoreData with a valid core path."""
        core_path = str(setup_esp8266)
        core_data = CollectingCoreData("esp8266", "2.7.4", core_path)
        assert core_data.core_name == "esp8266"
        assert core_data.core_path == core_path

    def test_core_data_initialization_core_path_error(self, setup_esp8266: pytest.Function):
        """Test the initialization of CoreData with an invalid core path."""
        with pytest.raises(ValueError):
            CollectingCoreData("esp8266", "2.7.4", str(setup_esp8266) + "/invalid_path")

    def test_core_data_initialization_missing_board_txt(self,
                                                        setup_missing_board_txt: pytest.Function):
        """Test the initialization of CoreData with a missing boards.txt file."""
        core_path = str(setup_missing_board_txt)
        with pytest.raises(ValueError) as e_missing_board_txt:
            CollectingCoreData("esp8266", "2.7.4", core_path)
        assert str(e_missing_board_txt.value
                ) == f"Error: could not found {core_path}/boards.txt"

    def test_get_data(self, setup_esp8266: pytest.Function):
        """Test the __get_data method of CoreData."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_esp8266))
        boards = core_data.boards
        assert len(boards) == 2
        board_data = boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.board == "d1_mini"
        assert board_data.name == "LOLIN(WEMOS) D1 R2 & mini"
        assert board_data.variant == "d1_mini"
        assert board_data.flash_size == ["4MB"]

    def test_sort_flash_size(self, setup_esp8266: pytest.Function):
        """Test the __get_data method of CoreData."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_esp8266))
        board_data = core_data.boards.get_board_by_id("generic")
        assert board_data is not None
        assert board_data.board == "generic"
        assert board_data.flash_size == ["512KB", "1MB", "2MB", "4MB"]

    def test_get_data_esp32(self, setup_esp32: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.board == "d1_mini32"
        assert board_data.name == "WEMOS D1 MINI ESP32"
        assert board_data.variant == "d1_mini32"
        assert board_data.flash_size == ["4MB"]

    def test_get_data_esp32_led_builtin(self, setup_esp32: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "2"

    def test_find_led_builtin(self, setup_esp8266: pytest.Function):
        """Test the __find_led_builtin method of CoreData."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_esp8266))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "2"

    def test_wrong_led_builtin_value(self,setup_wrong_led_builtin_value: pytest.Function):
        """Test the __find_led_builtin method of CoreData with wrong LED_BUILTIN value."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_wrong_led_builtin_value))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "N/A"

    def test_d1_mini_led_builtin_v1(self, setup_d1_mini_led_builtin_v1: pytest.Function):
        """Test the __find_led_builtin method of CoreData with LED_BUILTIN value 13."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_d1_mini_led_builtin_v1))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "13"

    def test_d1_mini_led_builtin_v2(self, setup_d1_mini_led_builtin_v2: pytest.Function):
        """Test the __find_led_builtin method of CoreData with LED_BUILTIN value 13."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_d1_mini_led_builtin_v2))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "13"

    def test_d1_mini_led_builtin_v3(self, setup_d1_mini_led_builtin_v3: pytest.Function):
        """Test the __find_led_builtin method of CoreData with LED_BUILTIN value 13."""
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_d1_mini_led_builtin_v3))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "2"

    def test_export_json(self, setup_wrong_led_builtin_value: pytest.Function, tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp8266.json"
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_wrong_led_builtin_value))
        # clear the output buffer
        core_data.boards_export_json(filename=str(file))
        # Check if the output contains the expected values
        expected_data: dict[str, str | list[str]] = {
            "board": "d1_mini",
            "variant": "d1_mini",
            "led_builtin": "N/A",
            "mcu": "esp8266",
            "flash_size": ["4MB"],
            "name": "LOLIN(WEMOS) D1 R2 & mini"
        }
        with open(str(file), 'r', encoding='utf8') as file:
            data: BoardList = json.loads(file.read())
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0] == expected_data

    def test_export_json_esp32(self, setup_esp32: pytest.Function, tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32))
        # clear the output buffer
        core_data.boards_export_json(filename=str(file))
        # Check if the output contains the expected values
        expected_data: dict[str, str | list[str]] = {
            "board": "d1_mini32",
            "variant": "d1_mini32",
            "led_builtin": "2",
            "mcu": "esp32",
            "flash_size": ["4MB"],
            "name": "WEMOS D1 MINI ESP32"
        }
        with open(str(file), 'r', encoding='utf8') as file:
            data: BoardList = json.loads(file.read())
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0] == expected_data

    def test_export_json_esp32_na(self, setup_esp32_without_variant_flash_size: pytest.Function,
                                tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_without_variant_flash_size))
        # clear the output buffer
        core_data.boards_export_json(filename=str(file))
        # Check if the output contains the expected values
        expected_data: dict[str, str | list[str]] = {
            "board": "d1_mini32",
            "variant": "N/A",
            "led_builtin": "N/A",
            "mcu": "N/A",
            "flash_size": [],
            "name": "WEMOS D1 MINI ESP32"
        }
        with open(str(file), 'r', encoding='utf8') as file:
            data: BoardList = json.loads(file.read())
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0] == expected_data