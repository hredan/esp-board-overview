"""" Find built-in LED GPIO pin count from pins_arduino.h files """
import re
import logging

log = logging.getLogger(__name__)
log.setLevel(logging.ERROR)
#components/soc/esp32/include/soc/soc_caps.h
SOC_GPIO_PIN_COUNT = 40

class FindLedBuiltinPinCount:
    """ Class to find built-in LED GPIO with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
    def __init__(self):
        self.defines: dict[str, str] = {}
        self.var_definitions: dict[str, str] = {}

    def find_defines(self, line: str):
        """ find #define entries from pins_arduino.h files """
        match_define = re.match(r"#define +([A-Z_]+) +([A-Z_\d]+)", line)
        if match_define:
            var_name = match_define.group(1)
            var_value = match_define.group(2)
            self.defines[var_name] = var_value
            return
        match_definition = re.match(
            r"#define +([A-Z_]+) *=? *\(?([A-Z_\d]+) +\+ +SOC_GPIO_PIN_COUNT\)?;?", line)
        if match_definition:
            var_name = match_definition.group(1)
            var_name_2 = match_definition.group(2)
            if FindLedBuiltinPinCount.is_number(var_name_2):
                self.defines[var_name] = str(int(var_name_2) + SOC_GPIO_PIN_COUNT)
            elif var_name_2 in self.var_definitions:
                value_2 = self.var_definitions[var_name_2]
                if FindLedBuiltinPinCount.is_number(value_2):
                    self.defines[var_name] = str(int(value_2) + SOC_GPIO_PIN_COUNT)
        match_definition = re.match(
            r"#define +([A-Z_]+) *=? *\(?SOC_GPIO_PIN_COUNT +\+ +([A-Z_\d]+)\)?;?", line)
        if match_definition:
            var_name = match_definition.group(1)
            var_name_2 = match_definition.group(2)
            if FindLedBuiltinPinCount.is_number(var_name_2):
                self.defines[var_name] = str(int(var_name_2) + SOC_GPIO_PIN_COUNT)
            elif var_name_2 in self.var_definitions:
                value_2 = self.var_definitions[var_name_2]
                if FindLedBuiltinPinCount.is_number(value_2):
                    self.defines[var_name] = str(int(value_2) + SOC_GPIO_PIN_COUNT)

    def find_var_definitions(self, line: str):
        """ find static const uint8_t entries from pins_arduino.h files """
        match_var_definition = re.match(
            r"static +const +uint8_t +([A-Z_\d]+) += +(\d+);", line)
        if match_var_definition:
            var_name = match_var_definition.group(1)
            var_value = match_var_definition.group(2)
            self.var_definitions[var_name] = var_value

    @classmethod
    def is_number(cls, s: str) -> bool:
        """ Check if string is a number """
        try:
            int(s)
            return True
        except ValueError:
            return False

    def _soc_pattern_v1(self, line: str) -> str:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT
        variable at beginning of term from pins_arduino.h files """
        match_pin_count = re.match(
            r"^.+LED_BUILTIN *=? *\(?SOC_GPIO_PIN_COUNT +\+ +([A-Z_\d]+)\)?;?",
            line
        )
        if match_pin_count:
            return match_pin_count.group(1)
        return ""

    def _soc_pattern_v2(self, line: str) -> str:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT variable at end of term from pins_arduino.h files """
        match_pin_count = re.match(
            r"^.+LED_BUILTIN *=? *\(?([A-Z_\d]+) +\+ +SOC_GPIO_PIN_COUNT\)?;?",
            line
        )
        if match_pin_count:
            return match_pin_count.group(1)
        return ""

    def _find_soc_gpio_pin_count(self, line: str) -> str:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
        if "LED_BUILTIN" in line and "SOC_GPIO_PIN_COUNT" in line:
            rgb_name = self._soc_pattern_v1(line)
            if rgb_name:
                return rgb_name
            rgb_name = self._soc_pattern_v2(line)
            if rgb_name:
                return rgb_name
            log.error("pattern not working for line:\n %s", line)
        return ""

    def _find_gpio_variable(self, line: str) -> int:
        """ Find built-in LED GPIO pin variable from pins_arduino.h files """
        match_pin_count = re.match(
            r"^.+LED_BUILTIN *=? *([A-Z_\d]+);?",
            line
        )
        if match_pin_count:
            var_name = match_pin_count.group(1)
            if FindLedBuiltinPinCount.is_number(var_name):
                return int(var_name)
            if var_name in self.defines:
                if FindLedBuiltinPinCount.is_number(self.defines[var_name]):
                    return int(self.defines[var_name])
                value_2 = self.defines[var_name]
                if value_2 in self.var_definitions:
                    if FindLedBuiltinPinCount.is_number(self.var_definitions[value_2]):
                        return int(self.var_definitions[value_2])
            elif var_name in self.var_definitions:
                if FindLedBuiltinPinCount.is_number(self.var_definitions[var_name]):
                    return int(self.var_definitions[var_name])
        return -1

    def _find_gpio(self, line: str) -> int:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
        # Example logic to find the built-in LED GPIO pin
        self.find_defines(line)
        self.find_var_definitions(line)
        found_led_entry = False
        builtin_led_gpio = -1
        rgb_name = self._find_soc_gpio_pin_count(line)
        if rgb_name:
            if FindLedBuiltinPinCount.is_number(rgb_name):
                builtin_led_gpio = int(rgb_name) + SOC_GPIO_PIN_COUNT
                found_led_entry = True
            elif rgb_name in self.defines:
                if FindLedBuiltinPinCount.is_number(self.defines[rgb_name]):
                    builtin_led_gpio = int(self.defines[rgb_name]) + SOC_GPIO_PIN_COUNT
                    found_led_entry = True
                rgb_value = self.defines[rgb_name]
                if rgb_value in self.var_definitions:
                    builtin_led_gpio = int(self.var_definitions[rgb_value]) + SOC_GPIO_PIN_COUNT
                    found_led_entry = True
            elif rgb_name in self.var_definitions:
                builtin_led_gpio = int(self.var_definitions[rgb_name]) + SOC_GPIO_PIN_COUNT
                found_led_entry = True
            if found_led_entry:
                return builtin_led_gpio
            log.error("Could not resolve LED built-in GPIO pin from line:\n %s", line)
        return -1

    def find_gpio(self, line: str) -> int:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
        gpio_led = self._find_gpio(line)
        if gpio_led != -1:
            return gpio_led
        return self._find_gpio_variable(line)
