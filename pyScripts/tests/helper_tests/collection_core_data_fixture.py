"""Fixtures for testing CoreData collection."""
from pathlib import Path
import pytest

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
