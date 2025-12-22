"""Test cases for the CoreData class."""
import json
from pathlib import Path
import pytest

from pyScripts.helper.collecting_core_data import CollectingCoreData
from helper.board_data import BoardList
from helper.partitions_data import PartitionList


@pytest.fixture(name="setup_esp8266", scope="function")
def fixture_setup_esp8266(tmp_path: Path):
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

@pytest.fixture(name="setup_esp32_base", scope="function")
def fixture_setup_esp32_base(tmp_path: Path):
    """Fixture to set up the test environment for esp32 CoreData."""
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
d1_mini32.build.partitions=default
d1_mini32.menu.PartitionScheme.default=Default
d1_mini32.menu.PartitionScheme.default.build.partitions=default
d1_mini32.menu.PartitionScheme.no_ota=No OTA (Large APP)
d1_mini32.menu.PartitionScheme.no_ota.build.partitions=no_ota
    """
    boards_txt_path = core_path / "boards.txt"
    boards_txt_path.write_text(boards_txt_content)
    return core_path

@pytest.fixture(name="setup_esp32")
def fixture_setup_esp32(setup_esp32_base: pytest.Function):
    """Fixture to set up the test environment for CoreData."""
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t LED_BUILTIN = 2;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_led_builtin_pin_count")
def fixture_setup_esp32_led_builtin_pin_count(setup_esp32_base: pytest.Function):
    """Fixture to set up the test environment for CoreData."""
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t RGB_DATA = 40;
static const uint8_t RGB_PWR = 34;
#define PIN_RGB_LED RGB_DATA
static const uint8_t LED_BUILTIN = SOC_GPIO_PIN_COUNT + PIN_RGB_LED;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_scheme_data")
def fixture_setup_esp32_scheme_data(tmp_path: Path):
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
d1_mini32.build.partitions=default
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

@pytest.fixture(name="setup_esp32_scheme_data_with_csv")
def fixture_setup_esp32_scheme_data_with_csv(setup_esp32_scheme_data: pytest.Function):
    """
        Fixture to setup the test environment for esp32 with
        only default scheme and partition csv.
    """
    core_path: Path = Path(str(setup_esp32_scheme_data))
    # Create a mock partitions directory
    partitions_path = core_path / "tools" / "partitions"
    partitions_path.mkdir(parents=True)
    # Create a mock default.csv file
    default_csv_content = ""
    (partitions_path / "default.csv").write_text(default_csv_content)
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

@pytest.fixture(name="setup_esp8266_di_mini_base")
def fixture_setup_esp8266_di_mini_base(tmp_path: Path):
    """Fixture to set up the esp8266 CoreData with d1_mini."""
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
    return core_path

@pytest.fixture(name="setup_wrong_led_builtin_value")
def fixture_setup_wrong_led_builtin_value(setup_esp8266_di_mini_base: pytest.Function):
    """Fixture to set up the test environment for CoreData with wrong LED_BUILTIN value."""
    core_path: Path = Path(str(setup_esp8266_di_mini_base))

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define LED_BUILTIN wrong_value
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_d1_mini_led_builtin_v1")
def fixture_setup_d1_mini_led_builtin_v1(setup_esp8266_di_mini_base: pytest.Function):
    """Fixture to set up the test environment for CoreData with wrong LED_BUILTIN value."""
    core_path: Path = Path(str(setup_esp8266_di_mini_base))

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define LED_BUILTIN      13
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_d1_mini_led_builtin_v2")
def fixture_setup_d1_mini_led_builtin_v2(setup_esp8266_di_mini_base: pytest.Function):
    """Fixture to set up the test environment for CoreData with wrong LED_BUILTIN value."""
    core_path: Path = Path(str(setup_esp8266_di_mini_base))

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define LED_BUILTIN      (13)
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_d1_mini_led_builtin_v3")
def fixture_setup_d1_mini_led_builtin_v3(setup_esp8266_di_mini_base: pytest.Function):
    """Fixture to set up the test environment for CoreData with wrong LED_BUILTIN value."""
    core_path: Path = Path(str(setup_esp8266_di_mini_base))

    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t LED_BUILTIN = 2;
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

    def test_get_data_esp32_led_builtin_pin_count(self,
                                                  setup_esp32_led_builtin_pin_count: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "80"

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

class TestPartitionData:
    """Test cases for the CoreData partition data extraction."""
    def test_export_partitions_esp32(self, setup_esp32: pytest.Function, tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values
        expected_data = {
            "d1_mini32": {
                'default': 'default',
                'schemes': {
                    "default": {
                            "full_name": "Default",
                            "build": "default"
                        },
                        "no_ota": {
                            "full_name": "No OTA (Large APP)",
                            "build": "no_ota"
                        }
                }
            }
        }

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

    def test_export_partitions_esp32_no_scheme_data(self,
                                                    setup_esp32_scheme_data_with_csv: pytest.Function,
                                                    tmpdir: Path,
                                                    ):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_scheme_data_with_csv))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values

        expected_data: dict[str, dict[str, str | dict[str, dict[str, str]]]] = {
            "d1_mini32": {
                'default': 'default',
                'schemes': {}
            }
        }

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

    def test_export_partitions_esp32_no_(self,
                                         setup_esp32_scheme_data: pytest.Function,
                                         tmpdir: Path,
                                         caplog: pytest.LogCaptureFixture):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_scheme_data))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values

        expected_data = {}

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

        #check log output
        log_records = caplog.get_records("call")
        assert len(log_records) == 2
        assert log_records[0].levelname == "ERROR"
        assert log_records[0].name == "pyScripts.helper.collecting_core_data.partition"
        assert "Default partition 'default' for 'd1_mini32' does not exist" in \
            log_records[0].message

        assert log_records[1].levelname == "ERROR"
        assert "Removing 1 boards without partition: d1_mini32" in log_records[1].message
