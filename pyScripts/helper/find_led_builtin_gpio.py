""" Module for finding built-in LED GPIO from pins_arduino.h files """
import re
import os
import logging

from helper.board_data import BoardList, BoardData
from helper.find_led_pin_count import FindLedBuiltinPinCount

log_board = logging.getLogger(__name__)
log_board.setLevel(logging.ERROR)


class FindLedBuiltinGpio:
    """ Class for finding built-in LED GPIO from pins_arduino.h files """

    def __init__(self, core_path: str, core_name: str, boards_list: BoardList):
        self.core_path = core_path
        self.core_name = core_name
        self.boards_list = boards_list
        self.num_of_boards_without_led = 0

    def find_led_gpio(self, line: str) -> int:
        """ find gpio for built-in led from pins_arduino.h files """
        match_built_in_led = re.match(
            r"^.+ LED_BUILTIN[\(\= ]+(\d+)\)?", line)
        # #define LED_BUILTIN    (13)
        # #define LED_BUILTIN    13
        # static const uint8_t BUILTIN_LED = 2;

        if match_built_in_led:
            builtin_led_gpio = match_built_in_led.group(1)
            return int(builtin_led_gpio)
        return -1

    @classmethod
    def log_led_not_found(cls, found_led_entry: bool, file_path: str, board: BoardData):
        """ log error if no built-in led found """
        ignore_list = [
            "esp32s2-devkit-lipo-usb", # LED_BUILTIN only in comment, variable named BUT_BUILTIN
            "Microduino-esp32", # LED_BUILTIN = -1
            "arduino_nano_nora", # LED_BUILTIN in comment but not defined
            "thingpulse_epulse_feather", # LED_BUILTIN = -1
                       ]
        if not found_led_entry and os.path.isfile(file_path) and board.variant not in ignore_list:
            with open(file_path, 'r', encoding='utf8') as infile:
                infile_content = infile.read()
                if "LED_BUILTIN" in infile_content:
                    log_board.error("No built-in LED found for board: %s\n%s", board.name, file_path)

    def find_led_builtin(self) -> int:
        """ find gpio for built-in led from pins_arduino.h files """
        for board in self.boards_list:
            found_led_entry = False
            if board.variant != "N/A":
                file_path = f"{self.core_path}/variants/{board.variant}/pins_arduino.h"
                if not os.path.isfile(file_path):
                    log_board.error("Could not find pins_arduino.h for %s variant: %s",
                                    board.name, board.variant)
                    board.led_builtin = "N/A"
                else:
                    with open(file_path, 'r', encoding='utf8') as infile:
                        if self.core_name == "esp32":
                            find_pin_count = FindLedBuiltinPinCount()
                        else:
                            find_pin_count = None
                        for line in infile:
                            if find_pin_count:
                                gpio_led = find_pin_count.find_gpio(line)
                                if gpio_led != -1:
                                    board.led_builtin = str(gpio_led)
                                    found_led_entry = True
                                    break
                            gpio_led = self.find_led_gpio(line)
                            if gpio_led != -1:
                                board.led_builtin = str(gpio_led)
                                found_led_entry = True
                                break
                FindLedBuiltinGpio.log_led_not_found(found_led_entry, file_path, board)
            else:
                board.led_builtin = "N/A"
            if not found_led_entry:
                self.num_of_boards_without_led += 1
        return self.num_of_boards_without_led
