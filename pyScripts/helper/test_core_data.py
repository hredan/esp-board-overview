"""Test cases for the CoreData class."""
import json
from pathlib import Path
import pytest
from helper.core_data import CoreData
from helper.board_data import BoardList


@pytest.fixture(name="setup", scope="function")
def fixture_setup(tmp_path: Path):
    """Fixture to set up the test environment for CoreData."""
    # Create a temporary directory structure for the test
    # This is a mock of the Arduino core path
    core_path = tmp_path / "packages" / "esp8266" / "hardware" / "esp8266" / "2.7.4"
    core_path.mkdir(parents=True)
    # Create a mock boards.txt file
    boards_txt_content = """
generic.name=Generic ESP8266 Module
generic.build.variant=generic
generic.build.mcu=esp8266
generic.menu.eesz.1M512.build.flash_size=1M
generic.menu.eesz.2M64.build.flash_size=2M
generic.menu.eesz.4M2M.build.flash_size=4M
generic.menu.eesz.512K32.build.flash_size=512K
generic.menu.eesz.autoflash.build.flash_size=16M
d1_mini.name=LOLIN(WEMOS) D1 R2 & mini
d1_mini.build.variant=d1_mini
d1_mini.build.mcu=esp8266
d1_mini.menu.eesz.4M.build.flash_size=4M
    """
    boards_txt_path = core_path / "boards.txt"
    boards_txt_path.write_text(boards_txt_content)

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define LED_BUILTIN 2
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32")
def fixture_setup_esp32(tmp_path: Path):
    """Fixture to set up the test environment for CoreData."""
    # Create a temporary directory structure for the test
    # This is a mock of the Arduino core path
    core_path = tmp_path / "packages" / "esp32" / "hardware" / "esp32" / "3.2.0"
    core_path.mkdir(parents=True)
    # Create a mock boards.txt file
    boards_txt_content = """
d1_mini32.name=WEMOS D1 MINI ESP32
d1_mini32.build.variant=d1_mini32
d1_mini32.build.mcu=esp32
d1_mini32.build.flash_size=4MB
    """
    boards_txt_path = core_path / "boards.txt"
    boards_txt_path.write_text(boards_txt_content)

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t LED_BUILTIN = 2;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_without_variant_flash_size")
def fixture_setup_esp32_without_variant_flash_size(tmp_path: Path):
    """Fixture to set up the test environment for CoreData."""
    # Create a temporary directory structure for the test
    # This is a mock of the Arduino core path
    core_path = tmp_path / "packages" / "esp32" / "hardware" / "esp32" / "3.2.0"
    core_path.mkdir(parents=True)
    # Create a mock boards.txt file
    boards_txt_content = """
d1_mini32.name=WEMOS D1 MINI ESP32
    """
    boards_txt_path = core_path / "boards.txt"
    boards_txt_path.write_text(boards_txt_content)

    return core_path

@pytest.fixture(name="setup_wrong_led_builtin_value")
def fixture_setup_wrong_led_builtin_value(tmp_path: Path):
    """Fixture to set up the test environment for CoreData with wrong LED_BUILTIN value."""
    # Create a temporary directory structure for the test
    # This is a mock of the Arduino core path
    core_path = tmp_path / "packages" / "esp8266" / "hardware" / "esp8266" / "2.7.4"
    core_path.mkdir(parents=True)
    # Create a mock boards.txt file
    boards_txt_content = """
d1_mini.name=LOLIN(WEMOS) D1 R2 & mini
d1_mini.build.variant=d1_mini
d1_mini.build.mcu=esp8266
d1_mini.menu.eesz.4M.build.flash_size=4M
    """
    boards_txt_path = core_path / "boards.txt"
    boards_txt_path.write_text(boards_txt_content)

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define LED_BUILTIN wrong_value
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_missing_board_txt")
def fixture_setup_missing_board_txt(tmp_path: Path):
    """Fixture to set up the test environment for CoreData with missing boards.txt."""
    # Create a temporary directory structure for the test
    # This is a mock of the Arduino core path
    core_path = tmp_path / "packages" / "esp8266" / "hardware" / "esp8266" / "2.7.4"
    core_path.mkdir(parents=True)
    return core_path

class TestCoreData:
    """Test cases for the CoreData class."""

    def test_core_data_initialization(self, setup: pytest.Function):
        """Test the initialization of CoreData with a valid core path."""
        core_path = str(setup)
        core_data = CoreData("esp8266", "2.7.4", core_path)
        assert core_data.core_name == "esp8266"
        assert core_data.core_path == core_path

    def test_core_data_initialization_core_path_error(self, setup: pytest.Function):
        """Test the initialization of CoreData with an invalid core path."""
        with pytest.raises(ValueError):
            CoreData("esp8266", "2.7.4", str(setup) + "/invalid_path")

    def test_core_data_initialization_missing_board_txt(self,
                                                        setup_missing_board_txt: pytest.Function):
        """Test the initialization of CoreData with a missing boards.txt file."""
        core_path = str(setup_missing_board_txt)
        with pytest.raises(ValueError) as e_missing_board_txt:
            CoreData("esp8266", "2.7.4", core_path)
        assert str(e_missing_board_txt.value
                ) == f"Error: could not found {core_path}/boards.txt"

    def test_get_data(self, setup: pytest.Function):
        """Test the __get_data method of CoreData."""
        core_data = CoreData("esp8266", "2.7.4", str(setup))
        boards = core_data.boards
        assert len(boards) == 2
        board_data = boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.board == "d1_mini"
        assert board_data.name == "LOLIN(WEMOS) D1 R2 & mini"
        assert board_data.variant == "d1_mini"
        assert board_data.flash_size == ["4MB"]

    def test_sort_flash_size(self, setup: pytest.Function):
        """Test the __get_data method of CoreData."""
        core_data = CoreData("esp8266", "2.7.4", str(setup))
        board_data = core_data.boards.get_board_by_id("generic")
        assert board_data is not None
        assert board_data.board == "generic"
        assert board_data.flash_size == ["512KB", "1MB", "2MB", "4MB"]

    def test_get_data_esp32(self, setup_esp32: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set."""
        core_data = CoreData("esp32", "3.2.0", str(setup_esp32))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.board == "d1_mini32"
        assert board_data.name == "WEMOS D1 MINI ESP32"
        assert board_data.variant == "d1_mini32"
        assert board_data.flash_size == ["4MB"]

    def test_find_led_builtin(self, setup: pytest.Function):
        """Test the __find_led_builtin method of CoreData."""
        core_data = CoreData("esp8266", "2.7.4", str(setup))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "2"

    def test_wrong_led_builtin_value(self,setup_wrong_led_builtin_value: pytest.Function):
        """Test the __find_led_builtin method of CoreData with wrong LED_BUILTIN value."""
        core_data = CoreData("esp8266", "2.7.4", str(setup_wrong_led_builtin_value))
        board_data = core_data.boards.get_board_by_id("d1_mini")
        assert board_data is not None
        assert board_data.led_builtin == "N/A"

    def test_export_json(self, setup_wrong_led_builtin_value: pytest.Function, tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp8266.json"
        core_data = CoreData("esp8266", "2.7.4", str(setup_wrong_led_builtin_value))
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
        core_data = CoreData("esp32", "3.2.0", str(setup_esp32))
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
        core_data = CoreData("esp32", "3.2.0", str(setup_esp32_without_variant_flash_size))
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
