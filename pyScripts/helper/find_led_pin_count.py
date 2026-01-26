"""" Find built-in LED GPIO pin count from pins_arduino.h files """
import re

#components/soc/esp32/include/soc/soc_caps.h
SOC_GPIO_PIN_COUNT = 40

class FindLedBuiltinPinCount:
    """ Class to find built-in LED GPIO with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
    def __init__(self):
        self.defines: dict[str, str] = {}
        self.var_definitions: dict[str, str] = {}

    @classmethod
    def find_defines(cls, line: str, defines: dict[str, str]):
        """ find #define entries from pins_arduino.h files """
        match_define = re.match(r"#define +([A-Z_]+) +([A-Z_\d]+)", line)
        if match_define:
            var_name = match_define.group(1)
            var_value = match_define.group(2)
            defines[var_name] = var_value

    @classmethod
    def find_var_definitions(cls, line: str, var_definitions: dict[str, str]):
        """ find static const uint8_t entries from pins_arduino.h files """
        match_var_definition = re.match(
            r"static +const +uint8_t +([A-Z_]+) += +(\d+);", line)
        if match_var_definition:
            var_name = match_var_definition.group(1)
            var_value = match_var_definition.group(2)
            var_definitions[var_name] = var_value

    @classmethod
    def is_number(cls, s: str) -> bool:
        """ Check if string is a number """
        try:
            int(s)
            return True
        except ValueError:
            return False

    def find_gpio(self, line: str) -> int:
        """ Find built-in LED GPIO pin with SOC_GPIO_PIN_COUNT from pins_arduino.h files """
        # Example logic to find the built-in LED GPIO pin
        FindLedBuiltinPinCount.find_defines(line, self.defines)
        FindLedBuiltinPinCount.find_var_definitions(line, self.var_definitions)
        found_led_entry = False
        builtin_led_gpio = -1
        match_pin_count = re.match(
            r"^.+LED_BUILTIN += +\(?SOC_GPIO_PIN_COUNT +\+ +([A-Z_]+)\)?;",
            line
        )
        if match_pin_count:
            rgb_name = match_pin_count.group(1)
            if rgb_name in self.defines:
                if FindLedBuiltinPinCount.is_number(self.defines[rgb_name]):
                    builtin_led_gpio = int(self.defines[rgb_name]) + SOC_GPIO_PIN_COUNT
                    found_led_entry = True
                rgb_value = self.defines[rgb_name]
                if rgb_value in self.var_definitions:
                    builtin_led_gpio = int(self.var_definitions[rgb_value]) + SOC_GPIO_PIN_COUNT
                    found_led_entry = True
                if found_led_entry:
                    return builtin_led_gpio
        return -1
