""" Module for collecting board data from boards.txt """
import re
import os
import logging
import sys
from helper.board_data import BoardList, BoardData
from helper.find_led_builtin_gpio import FindLedBuiltinGpio

log_board = logging.getLogger(__name__)
log_board.setLevel(logging.ERROR)

if os.environ.get('LOG_STDOUT') == '1':
    log_board.addHandler(logging.StreamHandler(sys.stdout))

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

    def final_data(self):
        """ finalize collected data after board.txt is parsed """
        # append the last collected board data
        if self.board_data.name:
            self.boards_list.append(self.board_data)
        led_finder = FindLedBuiltinGpio(self.core_path, self.core_name, self.boards_list)
        self.num_of_boards_without_led = led_finder.find_led_builtin()

    def get_collected_data(self):
        """ Get collected board data """
        return self.boards_list
