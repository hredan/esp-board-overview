"""
createTable.py
This script generates a table of esp boards with information about board name,
builtin led, and flashsize.

Part of repository: www.gitub.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan"""
import re
import json
import logging
import os

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
        self.boards, self.partitions = self.__get_data()
        self.__find_led_builtin()
        self.__set_boars_without_led()

    def __get_board_name(self, line:str, boards: dict)-> str:
        match_board = re.match(r"(.+)\.name=(.+)", line)
        if match_board:
            name=match_board.group(1)
            name_full=match_board.group(2)
            boards[name]={"name": name_full}
            return name
        return None

    def __get_variant(self, line:str, boards: dict, name:str):
        match_variant = re.match(name + r"\.build\.variant=(.+)", line)
        if match_variant:
            boards[name]["variant"] = match_variant.group(1)

    def __get_mcu(self, line:str, boards: dict, name:str):
        match_mcu = re.match(name + r"\.build\.mcu=(.+)", line)
        if match_mcu:
            boards[name]["mcu"] = match_mcu.group(1)

    def __get_default_partition(self, line:str, partitions: dict, name:str):
        match_partition = re.match(name + r"\.build\.partitions=(.+)", line)
        if match_partition:
            default_partition = match_partition.group(1)
            partitions[name] = {"default": default_partition}

    def __get_partition_name(self, line:str, partitions: dict, name:str):
        pattern = name + r"\.menu\.PartitionScheme\.([^\.]+)=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_name = match_partition.group(1)
            partitions_full_name = match_partition.group(2)
            if "schemes" not in partitions[name]:
                partitions[name]["schemes"] = {}
            partitions[name]["schemes"][partition_name] = {"full_name":partitions_full_name}
            return partition_name
        return None

    def __get_patition_build(self, line:str, partitions: dict, name:str, partitions_name:str):
        pattern = name + r"\.menu\.PartitionScheme\." \
            + partitions_name + r"\.build\.partitions=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_build = match_partition.group(1)
            if "build" not in partitions[name]["schemes"][partitions_name]:
                partitions[name]["schemes"][partitions_name]["build"] = partition_build
            else:
                log_partition.warning("%s has more than one build partition for %s",
                                      name, partitions_name)

    def __special_pattern_esp8266(self, line:str, boards: dict, name:str):
        pattern = name + r"\.menu\.eesz\.(.+)\.build\.flash_size=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            flash_partition = match_partition.group(1)
            if flash_partition != "autoflash":
                if "flash_partitions" not in boards[name]:
                    boards[name]["flash_partitions"] = [flash_partition]
                else:
                    boards[name]["flash_partitions"].append(flash_partition)
            else:
                return None
            # align flash size unit with esp32 (M-> MB or K-> KB)
            flash_size = match_partition.group(2)
            if flash_size[-1] != "B":
                flash_size = flash_size + "B"
            return flash_size
        return None

    def __get_data(self):
        boards = {}
        partitions = {}
        name=""
        partitions_name = ""
        with open(self.boards_txt, 'r', encoding='utf8') as infile:
            for line in infile:
                flash_size = None
                find_name = self.__get_board_name(line, boards)
                if find_name:
                    name = find_name
                self.__get_variant(line, boards, name)
                self.__get_mcu(line, boards, name)
                if self.core_name == "esp8266":
                    flash_size = self.__special_pattern_esp8266(line, boards, name)
                else:
                    # esp32 pattern
                    match_partition = re.match(name + r"\.build\.flash_size=(.+)", line)
                    if match_partition:
                        flash_size = match_partition.group(1)
                    self.__get_default_partition(line, partitions, name)
                    find_partition_name = self.__get_partition_name(line, partitions, name)
                    if find_partition_name:
                        partitions_name = find_partition_name
                    self.__get_patition_build(line, partitions, name, partitions_name)

                # store flash size
                if flash_size:
                    if "flash_size" in boards[name]:
                        if flash_size not in boards[name]["flash_size"]:
                            # print(f"Warning: {name} has more than on flash size " +
                            #       f"{boards[name]['flash_size']} {flash_size}")
                            log_board.warning("%s has more than one flash size: %s %s",
                                           name, boards[name]['flash_size'], flash_size)
                            if flash_size == "512KB":
                                # add 512KB to the beginning of the list
                                boards[name]["flash_size"].insert(0, flash_size)
                            else:
                                boards[name]["flash_size"].append(flash_size)
                    else:
                        boards[name]["flash_size"] = [flash_size]
        self.__check_partitions(partitions)
        return boards, partitions

    def __partition_scheme_exists(self, name: str) -> bool:
        """
        Check if the partition scheme exists in the partitions directory.
        :param name: The name of the partition scheme to check.
        :return: True if the partition scheme exists, False otherwise.
        """
        partition_scheme_path = f"{self.core_path}/tools/partitions/{name}.csv"
        return os.path.exists(partition_scheme_path)

    def __check_partitions(self, partitions: dict):
        """
        Check if the partitions have a default partition and at least one scheme.
        :param partitions: The partitions dictionary to check.
        :return: None
        """
        boards_without_partition = []
        for board_name in partitions.keys():
            if "schemes" not in partitions[board_name]:
                if "default" not in partitions[board_name]:
                    log_partition.error("No default partition and no schemes found for %s",
                                        board_name)
                    boards_without_partition.append(board_name)
                else:
                    default_partition = partitions[board_name]["default"]
                    if not self.__partition_scheme_exists(default_partition):
                        log_partition.error("Default partition %s for %s does not exist",
                                            default_partition, board_name)
                        boards_without_partition.append(board_name)
                    else:
                        log_partition.warning("Only default partition %s for %s exists",
                                           default_partition, board_name)
            else:
                scheme_without_build = []
                for scheme_name in partitions[board_name]["schemes"].keys():
                    if "build" not in partitions[board_name]["schemes"][scheme_name]:
                        log_partition.warning("No build partition found for %s in scheme %s",
                                            board_name, scheme_name)
                        scheme_without_build.append(scheme_name)
                if scheme_without_build:
                    for scheme_name in scheme_without_build:
                        del partitions[board_name]["schemes"][scheme_name]
        log_partition.error("Removing %s boards without partition: %s",
                            len(boards_without_partition), ", ".join(boards_without_partition))
        for board_name in boards_without_partition:
            del partitions[board_name]

    def __set_boars_without_led(self):
        boards_names = self.boards.keys()
        for board_name in boards_names:
            board_entries = self.boards[board_name].keys()
            if not 'LED_BUILTIN' in board_entries:
                log_board.warning("Could not find LED Entry for %s variant: %s",
                               board_name, self.boards[board_name]['variant'])
                self.boards[board_name]["LED_BUILTIN"]="N/A"
                variant = self.boards[board_name]['variant']
                file_path = f"{self.core_path}/variants/{variant}/pins_arduino.h"
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf8') as infile:
                        for line_num, line in enumerate(infile):
                            if "LED_BUILTIN" in line:
                                log_board.warning("LED could not parse: variant %s ln %d:%s",
                                                  variant, line_num, line)

    def __find_led_builtin(self):
        boards_names = self.boards.keys()
        for board_name in boards_names:
            found_led_entry = False
            if "variant" in self.boards[board_name]:
                variant = self.boards[board_name]['variant']
                file_path = f"{self.core_path}/variants/{variant}/pins_arduino.h"
                if not os.path.isfile(file_path):
                    log_board.error("Could not find pins_arduino.h for %s variant: %s",
                                   board_name, variant)
                    self.boards[board_name]["LED_BUILTIN"]="N/A"
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
                                self.boards[board_name]["LED_BUILTIN"]=builtin_led_gpio
                                found_led_entry = True
            else:
                self.boards[board_name]["LED_BUILTIN"]="N/A"
            if not found_led_entry:
                self.num_of_boards_without_led += 1

    def print_table(self, ignore_missing_led=True):
        """
        Print the table of boards with their name, LED_BUILTIN, and flash size.
        :param ignore_missing_led: If True, ignore boards with LED_BUILTIN = N/A.
        :return: None
        """
        names = sorted(self.boards.keys())
        for board_name in names:
            if ignore_missing_led and self.boards[board_name]["LED_BUILTIN"] == "N/A":
                continue
            name= self.boards[board_name]['name']
            led=self.boards[board_name]['LED_BUILTIN']
            flash_size=self.boards[board_name]['flash_size']
            print(f"{name} | {board_name} | {led} | {flash_size}")

    def boards_export_csv(self, filename:str, ignore_missing_led=True):
        """
        Export the table of boards with their name, LED_BUILTIN, and flash size to a CSV file.	
        :param filename: The name of the CSV file to export to.
        :param ignore_missing_led: If True, ignore boards with LED_BUILTIN = N/A.
        :return: None
        """
        names = sorted(self.boards.keys())
        with open(filename, "w", encoding='utf8') as file:
            file.write("name,board,variant,LED,mcu,flash_size\n")
            for board_name in names:
                if ignore_missing_led and self.boards[board_name]["LED_BUILTIN"] == "N/A":
                    continue
                name= self.boards[board_name]['name']
                led=self.boards[board_name]['LED_BUILTIN']
                if 'flash_size' in self.boards[board_name]:
                    flash_size_value=self.boards[board_name]['flash_size']
                    flash_size=f"[{';'.join(flash_size_value)}]"
                else:
                    flash_size='[N/A]'
                if 'variant' in self.boards[board_name]:
                    variant=self.boards[board_name]['variant']
                else:
                    variant='N/A'
                if 'mcu' in self.boards[board_name]:
                    mcu=self.boards[board_name]['mcu']
                else:
                    mcu='N/A'
                file.write(f"{name},{board_name},{variant},{led},{mcu},{flash_size}\n")

    def partitions_export_json(self, filename:str):
        """
        Export the partition schemes of the boards to a JSON file.
        :param filename: The name of the JSON file to export to.
        :return: None
        """
        with open(filename, "w", encoding='utf8') as file:
            json.dump(self.partitions, file, indent=4, ensure_ascii=False)

    def boards_export_json(self, filename:str):
        """
        Export the table of boards with their name, LED_BUILTIN, and flash size to a JSON file.
        :param filename: The name of the JSON file to export to.
        :return: None
        """
        boards = []
        names = sorted(self.boards.keys())
        for board_name in names:
            board_data = self.boards[board_name]
            # fill missing data entries with "N/A"
            board_data['board'] = board_name
            if 'LED_BUILTIN' not in board_data:
                board_data['LED_BUILTIN'] = "N/A"
            if 'flash_size' not in board_data:
                board_data['flash_size'] = '[N/A]'
            else:
                flash_size_value = board_data['flash_size']
                board_data['flash_size'] = f"[{';'.join(flash_size_value)}]"
            if 'variant' not in board_data:
                board_data['variant'] = "N/A"
            else:
                if self.core_name == "esp8266":
                    board_data['linkPins'] = "https://github.com/esp8266/Arduino/blob/" \
                        f"{self.core_version}/variants/{board_data['variant']}/pins_arduino.h"
                elif self.core_name == "esp32":
                    board_data['linkPins'] = "https://github.com/espressif/arduino-esp32/blob/" \
                        f"{self.core_version}/variants/{board_data['variant']}/pins_arduino.h"
            if 'mcu' not in board_data:
                board_data['mcu'] = "N/A"

            boards.append(board_data)

        with open(filename, "w", encoding='utf8') as file:
            json.dump(boards, file, indent=4, ensure_ascii=False)
