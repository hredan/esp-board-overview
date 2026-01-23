""" Module for finding built-in LED GPIO from pins_arduino.h files """
import re
import os
import logging

from helper.board_data import BoardList

SOC_GPIO_PIN_COUNT = 40

log_board = logging.getLogger(__name__)
log_board.setLevel(logging.ERROR)


class FindLedBuiltinGpio:
    """ Class for finding built-in LED GPIO from pins_arduino.h files """

    def __init__(self, core_path: str, core_name: str, boards_list: BoardList):
        self.core_path = core_path
        self.core_name = core_name
        self.boards_list = boards_list
        self.num_of_boards_without_led = 0

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

    def find_led_builtin(self) -> int:
        """ find gpio for built-in led from pins_arduino.h files """
        defines: dict[str, str] = {}
        var_definitions: dict[str, str] = {}
        for board in self.boards_list:
            found_led_entry = False
            if board.variant != "N/A":
                file_path = f"{self.core_path}/variants/{board.variant}/pins_arduino.h"
                if not os.path.isfile(file_path):
                    log_board.error("Could not find pins_arduino.h for %s variant: %s",
                                    board.name, board.variant)
                    board.led_builtin = "N/A"
                else:
                    defines = {}
                    var_definitions = {}
                    with open(file_path, 'r', encoding='utf8') as infile:
                        for line in infile:
                            if self.core_name == "esp32":
                                FindLedBuiltinGpio.find_defines(line, defines)
                                FindLedBuiltinGpio.find_var_definitions(
                                    line, var_definitions)

                                match_pin_count = re.match(
                                    r"^.+LED_BUILTIN += +\(?SOC_GPIO_PIN_COUNT +\+ +([A-Z_]+)\)?;",
                                    line
                                )
                                if match_pin_count:
                                    rgb_name = match_pin_count.group(1)
                                    if rgb_name in defines:
                                        if FindLedBuiltinGpio.is_number(defines[rgb_name]):
                                            builtin_led_gpio = int(
                                                defines[rgb_name]) + SOC_GPIO_PIN_COUNT
                                            board.led_builtin = str(
                                                builtin_led_gpio)
                                            found_led_entry = True
                                            break
                                        rgb_value = defines[rgb_name]
                                        if rgb_value in var_definitions:
                                            builtin_led_gpio = int(
                                                var_definitions[rgb_value]) + SOC_GPIO_PIN_COUNT
                                            board.led_builtin = str(
                                                builtin_led_gpio)
                                            found_led_entry = True
                                            break
                            match_built_in_led = re.match(
                                r"^.+ LED_BUILTIN[\(\= ]+(\d+)\)?", line)
                            # #define LED_BUILTIN    (13)
                            # #define LED_BUILTIN    13
                            # static const uint8_t BUILTIN_LED = 2;

                            if match_built_in_led:
                                builtin_led_gpio = match_built_in_led.group(1)
                                board.led_builtin = builtin_led_gpio
                                found_led_entry = True
                                break
            else:
                board.led_builtin = "N/A"
            if not found_led_entry:
                self.num_of_boards_without_led += 1
        return self.num_of_boards_without_led
