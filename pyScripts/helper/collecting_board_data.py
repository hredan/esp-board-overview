""" Module for collecting board data from boards.txt """
import re
import os
import logging
import sys
from helper.board_data import BoardList, BoardData

log_board = logging.getLogger(__name__ + ".board")
log_board.setLevel(logging.ERROR)

if os.environ.get('LOG_STDOUT') == '1':
    log_board.addHandler(logging.StreamHandler(sys.stdout))

SOC_GPIO_PIN_COUNT = 40

class CollectingBoardData:
    """ Class for collecting board data from boards.txt """
    def __init__(self, core_name: str, core_path: str):
        self.core_name = core_name
        self.core_path = core_path
        self.boards_list: BoardList = BoardList()
        self.board_data: BoardData = BoardData()
        self.num_of_boards_without_led = 0
        self.name = ""

    def __get_board_name(self, line:str)-> tuple[str, str]:
        match_board = re.match(r"(.+)\.name=(.+)", line)
        if match_board:
            board_id=match_board.group(1)
            name_full=match_board.group(2)

            return board_id, name_full
        return "", ""

    def __get_variant(self, line:str) -> bool:
        match_variant = re.match(self.name + r"\.build\.variant=(.+)", line)
        if match_variant:
            self.board_data.set_variant(match_variant.group(1))
            return True
        return False

    def __get_mcu(self, line:str) -> bool:
        match_mcu = re.match(self.name + r"\.build\.mcu=(.+)", line)
        if match_mcu:
            self.board_data.set_mcu(match_mcu.group(1))
            return True
        return False

    def __get_flash_size_esp8266(self, line:str) -> bool:
        pattern = self.name + r"\.menu\.eesz\.(.+)\.build\.flash_size=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            flash_partition = match_partition.group(1)
            if flash_partition == "autoflash":
                return False
            # align flash size unit with esp32 (M-> MB or K-> KB)
            flash_size = match_partition.group(2)
            if flash_size[-1] != "B":
                flash_size = flash_size + "B"
            self.board_data.set_flash_size(flash_size)
            return True
        return False

    def __get_flash_size_esp32(self, line:str) -> bool:
        match_flash = re.match(self.name + r"\.build\.flash_size=(.+)", line)
        if match_flash:
            self.board_data.set_flash_size(match_flash.group(1))
            return True
        return False

    def __get_flash_size(self, line:str) -> bool:
        if self.core_name == "esp8266":
            return self.__get_flash_size_esp8266(line)
        return self.__get_flash_size_esp32(line)

    def collect_board_data(self, board_txt_line: str) -> str:
        """ Collecting board data """
        # collect board name and id
        board_id, name_full = self.__get_board_name(board_txt_line)
        if board_id:
            self.name = board_id
            # if there is already a board collected, save it before starting a new one
            if self.board_data.name:
                self.boards_list.append(self.board_data)
            self.board_data = BoardData()
            self.board_data.set_name(name_full)
            self.board_data.set_board_id(board_id)
            return board_id
        if self.__get_variant(board_txt_line):
            return ""
        if self.__get_mcu(board_txt_line):
            return ""
        if self.__get_flash_size(board_txt_line):
            return ""
        return ""

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
        match_var_definition = re.match(r"static +const +uint8_t +([A-Z_]+) += +(\d+);", line)
        if match_var_definition:
            var_name = match_var_definition.group(1)
            var_value = match_var_definition.group(2)
            var_definitions[var_name] = var_value

    def find_led_builtin(self):
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
                    board.led_builtin="N/A"
                else:
                    defines = {}
                    var_definitions = {}
                    with open(file_path, 'r', encoding='utf8') as infile:
                        for line in infile:
                            if self.core_name == "esp32":
                                CollectingBoardData.find_defines(line, defines)
                                CollectingBoardData.find_var_definitions(line, var_definitions)

                                match_pin_count = re.match(
                                    r"^.+LED_BUILTIN += +\(?SOC_GPIO_PIN_COUNT +\+ +([A-Z_]+)\)?;",
                                    line
                                    )
                                if match_pin_count:
                                    rgb_name = match_pin_count.group(1)
                                    if rgb_name in defines:
                                        rgb_value = defines[rgb_name]
                                        if rgb_value in var_definitions:
                                            builtin_led_gpio = int(var_definitions[rgb_value]) + SOC_GPIO_PIN_COUNT
                                            board.led_builtin=str(builtin_led_gpio)
                                            found_led_entry = True
                                            break
                            match_built_in_led = re.match(r"^.+ LED_BUILTIN[\(\= ]+(\d+)\)?", line)
                            # #define LED_BUILTIN    (13)
                            # #define LED_BUILTIN    13
                            # static const uint8_t BUILTIN_LED = 2;

                            if match_built_in_led:
                                builtin_led_gpio = match_built_in_led.group(1)
                                board.led_builtin=builtin_led_gpio
                                found_led_entry = True
                                break
            else:
                board.led_builtin="N/A"
            if not found_led_entry:
                self.num_of_boards_without_led += 1
    def final_data(self):
        """ finalize collected data after board.txt is parsed """
        # append the last collected board data
        if self.board_data.name:
            self.boards_list.append(self.board_data)
        self.find_led_builtin()

    def get_collected_data(self):
        """ Get collected board data """
        return self.boards_list
