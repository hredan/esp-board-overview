""""
Tests for LED_BUILTIN pin count extraction in CoreData for esp32.
https://github.com/hredan/esp-board-overview/issues/7

components/soc/esp32/include/soc/soc_caps.h
#define SOC_GPIO_PIN_COUNT 40
"""

from pathlib import Path
import pytest
from helper.collecting_core_data import CollectingCoreData


# pylint: disable=unused-import
from tests.helper_tests.collection_core_data_fixture import fixture_setup_esp32_base # pyright: ignore

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v1")
def fixture_setup_esp32_led_builtin_pin_count_v1(setup_esp32_base: pytest.Function):
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

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v2")
def fixture_setup_esp32_led_builtin_pin_count_v2(setup_esp32_base: pytest.Function):
    """
    Fixture to set up the test environment for CoreData.
    e.g. https://github.com/espressif/arduino-esp32/blob/3.3.5/variants/wipy3/pins_arduino.h
    """
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
#define PIN_RGB_LED 40  // ->2812 RGB !!!
static const uint8_t LED_BUILTIN = (PIN_RGB_LED + SOC_GPIO_PIN_COUNT);
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v3")
def fixture_setup_esp32_led_builtin_pin_count_v3(setup_esp32_base: pytest.Function):
    """
    Fixture to set up the test environment for CoreData.
    e.g. https://github.com/espressif/arduino-esp32/blob/3.3.5/variants/adafruit_camera_esp32s3/pins_arduino.h
    """
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t PIN_NEOPIXEL = 1;
static const uint8_t LED_BUILTIN = PIN_NEOPIXEL + SOC_GPIO_PIN_COUNT;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v4")
def fixture_setup_esp32_led_builtin_pin_count_v4(setup_esp32_base: pytest.Function):
    """
    Fixture to set up the test environment for CoreData.
    e.g. https://github.com/espressif/arduino-esp32/blob/3.3.5/variants/um_bling/pins_arduino.h
    """
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t RGB_DATA = 18;
#define RGB_BUILTIN    (RGB_DATA + SOC_GPIO_PIN_COUNT)
static const uint8_t LED_BUILTIN = RGB_BUILTIN;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v5")
def fixture_setup_esp32_led_builtin_pin_count_v5(setup_esp32_base: pytest.Function):
    """
    Fixture to set up the test environment for CoreData.
    e.g. https://github.com/espressif/arduino-esp32/blob/3.3.5/variants/dfrobot_firebeetle2_esp32s3/pins_arduino.h
    """
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t D13 = 21;
static const uint8_t LED_BUILTIN = D13;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path

@pytest.fixture(name="setup_esp32_led_builtin_pin_count_v6")
def fixture_setup_esp32_led_builtin_pin_count_v6(setup_esp32_base: pytest.Function):
    """
    Fixture to set up the test environment for CoreData.
    e.g. https://github.com/espressif/arduino-esp32/blob/3.3.5/variants/waveshare_esp32_c6_zero/pins_arduino.h
    """
    core_path: Path = Path(str(setup_esp32_base))
    # Create a mock variant directory
    variant_path = core_path / "variants" / "d1_mini32"
    variant_path.mkdir(parents=True)
    # Create a mock pins_arduino.h file
    pins_arduino_content = """
static const uint8_t PIN_RGB_LED = 8;
static const uint8_t RGB_BUILTIN = SOC_GPIO_PIN_COUNT + PIN_RGB_LED;
static const uint8_t LED_BUILTIN = RGB_BUILTIN;
    """
    (variant_path / "pins_arduino.h").write_text(pins_arduino_content)
    return core_path
class TestLEDBuiltinPinCountEsp32:
    """Test cases for the CoreData LED_BUILTIN pin count extraction."""
    def test_get_data_esp32_led_builtin_pin_count_v1(self,
                                                  setup_esp32_led_builtin_pin_count_v1: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v1."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v1))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "80"

    def test_get_data_esp32_led_builtin_pin_count_v2(self,
                                                  setup_esp32_led_builtin_pin_count_v2: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v2."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v2))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "80"

    def test_get_data_esp32_led_builtin_pin_count_v3(self,
                                                  setup_esp32_led_builtin_pin_count_v3: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v3."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v3))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "41"

    def test_get_data_esp32_led_builtin_pin_count_v4(self,
                                                  setup_esp32_led_builtin_pin_count_v4: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v4."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v4))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "58"

    def test_get_data_esp32_led_builtin_pin_count_v5(self,
                                                  setup_esp32_led_builtin_pin_count_v5: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v5."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v5))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "21"

    def test_get_data_esp32_led_builtin_pin_count_v6(self,
                                                  setup_esp32_led_builtin_pin_count_v6: pytest.Function):
        """Test the __get_data method of CoreData from esp32 test set v6."""
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_led_builtin_pin_count_v6))
        board_data = core_data.boards.get_board_by_id("d1_mini32")
        assert board_data is not None
        assert board_data.led_builtin == "48"
