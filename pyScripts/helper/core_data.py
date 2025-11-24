"""
createTable.py
This script generates a table of esp boards with information about board name,
builtin led, and flashsize.

Part of repository: www.gitub.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan"""
import re
import logging
import os

from helper.partitions_data import Scheme, PartitionList, PartitionData
from helper.board_data import BoardData, BoardList

LOG_FILE = "./esp_data/core_data.log"
# if os.path.exists(LOG_FILE):
#     os.remove(LOG_FILE)

log_board = logging.getLogger(__name__ + ".board")
log_board.setLevel(logging.ERROR)
log_partition = logging.getLogger(__name__ + ".partition")
#log_partition.setLevel(logging.ERROR)
logging.basicConfig(filename=LOG_FILE, filemode='w', level=logging.INFO)


class CoreData:
    """
    This class is used to parse the boards.txt file of an Arduino core and extract
    information about the boards, including the LED_BUILTIN and flash size.
    """
    def __init__(self, core_name:str, core_version: str,
                 core_path: str):
        self.core_name = core_name
        self.core_version = core_version
        self.num_of_boards_without_led = 0
        self.core_path = core_path
        if not os.path.exists(self.core_path):
            raise ValueError(f"Error: could not found {self.core_path}")

        self.boards_txt = f"{self.core_path}/boards.txt"
        if not os.path.exists(self.boards_txt):
            raise ValueError(f"Error: could not found {self.boards_txt}")
        self.boards: BoardList
        self.partitions: PartitionList
        self.__get_data()
        self.__find_led_builtin()
        #self.__set_boars_without_led()

    def __get_board_name(self, line:str)-> tuple[str, str]:
        match_board = re.match(r"(.+)\.name=(.+)", line)
        if match_board:
            board_id=match_board.group(1)
            name_full=match_board.group(2)

            return board_id, name_full
        return "", ""

    def __get_variant(self, line:str, board: BoardData, name:str):
        match_variant = re.match(name + r"\.build\.variant=(.+)", line)
        if match_variant:
            board.set_variant(match_variant.group(1))

    def __get_mcu(self, line:str, board: BoardData, name:str):
        match_mcu = re.match(name + r"\.build\.mcu=(.+)", line)
        if match_mcu:
            board.set_mcu(match_mcu.group(1))

    def __get_default_partition(self, line:str, partitions: PartitionList, name:str):
        match_partition = re.match(name + r"\.build\.partitions=(.+)", line)
        if match_partition:
            default_partition = match_partition.group(1)
            partitions[name].set_default(default_partition)

    def __get_partition_name(self, line:str, partitions: PartitionList, name:str):
        pattern = name + r"\.menu\.PartitionScheme\.([^\.]+)=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_name = match_partition.group(1)
            partitions_full_name = match_partition.group(2)
            scheme: Scheme = Scheme()
            scheme.set_full_name(partitions_full_name)
            partitions[name].add_scheme(partition_name, scheme)
            return partition_name
        return ""

    def __get_patition_build(self, line:str,
                             partitions: PartitionList,
                             name:str,
                             partitions_name:str):
        pattern = name + r"\.menu\.PartitionScheme\." \
            + partitions_name + r"\.build\.partitions=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_build = match_partition.group(1)
            if partitions[name].schemes[partitions_name].build == "":
                partitions[name].schemes[partitions_name].set_build(partition_build)
            else:
                log_partition.warning("%s has more than one build partition for %s",
                                      name, partitions_name)

    def __special_pattern_esp8266(self, line:str, name:str) -> str:
        pattern = name + r"\.menu\.eesz\.(.+)\.build\.flash_size=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            flash_partition = match_partition.group(1)
            # if flash_partition != "autoflash":
            #     if "flash_partitions" not in boards[name]:
            #         boards[name]["flash_partitions"] = [flash_partition]
            #     else:
            #         boards[name]["flash_partitions"].append(flash_partition)
            # else:
            #     return ""
            if flash_partition == "autoflash":
                return ""
            # align flash size unit with esp32 (M-> MB or K-> KB)
            flash_size = match_partition.group(2)
            if flash_size[-1] != "B":
                flash_size = flash_size + "B"
            return flash_size
        return ""

    def __get_data(self):
        self.boards: BoardList = BoardList()
        self.partitions: PartitionList = PartitionList()
        board_data: BoardData = BoardData()
        name=""
        partitions_name = ""
        with open(self.boards_txt, 'r', encoding='utf8') as infile:
            for line in infile:
                flash_size = None
                board_id, name_full = self.__get_board_name(line)
                if board_id:
                    name = board_id
                    self.partitions.add_partition(name, PartitionData())
                    if board_data.name:
                        self.boards.append(board_data)
                    board_data = BoardData()
                    board_data.set_name(name_full)
                    board_data.set_board_id(board_id)
                self.__get_variant(line, board_data, name)
                self.__get_mcu(line, board_data, name)
                if self.core_name == "esp8266":
                    flash_size = self.__special_pattern_esp8266(line, name)
                else:
                    # esp32 pattern
                    match_partition = re.match(name + r"\.build\.flash_size=(.+)", line)
                    if match_partition:
                        flash_size = match_partition.group(1)
                    self.__get_default_partition(line, self.partitions, name)
                    find_partition_name = self.__get_partition_name(line, self.partitions, name)
                    if find_partition_name:
                        partitions_name = find_partition_name
                    self.__get_patition_build(line, self.partitions, name, partitions_name)
                # store flash size
                if flash_size:
                    board_data.set_flash_size(flash_size)
            # add last board
            if board_data.name:
                self.boards.append(board_data)
        self.__check_partitions(self.partitions)


    def __partition_scheme_exists(self, name: str) -> bool:
        """
        Check if the partition scheme exists in the partitions directory.
        :param name: The name of the partition scheme to check.
        :return: True if the partition scheme exists, False otherwise.
        """
        partition_scheme_path = f"{self.core_path}/tools/partitions/{name}.csv"
        return os.path.exists(partition_scheme_path)

    def __check_partitions(self, partitions: PartitionList):
        """
        Check if the partitions have a default partition and at least one scheme.
        :param partitions: The partitions dictionary to check.
        :return: None
        """
        boards_without_partition: list[str] = []
        for board_name in partitions.keys():
            # check if there is at least one scheme or a valid default partition
            if len(partitions[board_name].schemes) == 0:
                if partitions[board_name].default == "":
                    log_partition.error("No default partition and no schemes found for %s",
                                        board_name)
                    boards_without_partition.append(board_name)
                else:
                    default_partition = partitions[board_name].default
                    if not self.__partition_scheme_exists(default_partition):
                        log_partition.error("Default partition %s for %s does not exist",
                                            default_partition, board_name)
                        boards_without_partition.append(board_name)
                    else:
                        log_partition.warning("Only default partition %s for %s exists",
                                           default_partition, board_name)
            else:
                scheme_without_build: list[str] = []
                for scheme_name in partitions[board_name].schemes.keys():
                    if partitions[board_name].schemes[scheme_name].build == "":
                        log_partition.warning("No build name found for %s in scheme %s",
                                            board_name, scheme_name)
                        scheme_without_build.append(scheme_name)
                if scheme_without_build:
                    for scheme_name in scheme_without_build:
                        del partitions[board_name].schemes[scheme_name]
        log_partition.error("Removing %s boards without partition: %s",
                            len(boards_without_partition), ", ".join(boards_without_partition))
        for board_name in boards_without_partition:
            del partitions[board_name]

    def __find_led_builtin(self):
        """ find gpio for built-in led from pins_arduino.h files """
        for board in self.boards:
            found_led_entry = False
            if board.variant:
                file_path = f"{self.core_path}/variants/{board.variant}/pins_arduino.h"
                if not os.path.isfile(file_path):
                    log_board.error("Could not find pins_arduino.h for %s variant: %s",
                                   board.name, board.variant)
                    board.led_builtin="N/A"
                else:
                    with open(file_path, 'r', encoding='utf8') as infile:
                        for line in infile:
                            if self.core_name == "esp8266":
                                match_built_in_led = re.match(r"^.+ LED_BUILTIN +\(?(\d+)\)?", line)
                                # #define LED_BUILTIN    (13)
                                # #define LED_BUILTIN    13
                            else:
                                match_built_in_led = re.match(r"^.+ LED_BUILTIN = (\d+)", line)

                            if match_built_in_led:
                                builtin_led_gpio = match_built_in_led.group(1)
                                board.led_builtin=builtin_led_gpio
                                found_led_entry = True
            else:
                board.led_builtin="N/A"
            if not found_led_entry:
                self.num_of_boards_without_led += 1

    def partitions_export_json(self, filename:str):
        """
        Export the partition schemes of the boards to a JSON file.
        :param filename: The name of the JSON file to export to.
        :return: None
        """
        with open(filename, "w", encoding='utf8') as file:
            file.write(self.partitions.to_json())

    def boards_export_json(self, filename:str):
        """
        Export the table of boards with their name, LED_BUILTIN, and flash size to a JSON file.
        :param filename: The name of the JSON file to export to.
        :return: None
        """
        with open(filename, "w", encoding='utf8') as file:
            file.write(self.boards.to_json())
