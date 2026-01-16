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
import sys

from helper.partitions_data import Scheme, PartitionList, PartitionData
from helper.collecting_board_data import CollectingBoardData

LOG_FILE = "./esp_data/core_data.log"
# if os.path.exists(LOG_FILE):
#     os.remove(LOG_FILE)

log_partition = logging.getLogger(__name__ + ".partition")
#enable stdout logging for debugging
if os.environ.get('LOG_STDOUT') == '1':
    log_partition.addHandler(logging.StreamHandler(sys.stdout))

logging.basicConfig(filename=LOG_FILE, filemode='w', level=logging.INFO)

class CollectingCoreData:
    """
    This class is used to parse the boards.txt file of an Arduino core and extract
    information about the boards, including the LED_BUILTIN and flash size.
    """
    def __init__(self, core_name:str, core_version: str,
                 core_path: str):
        self.core_name = core_name
        self.core_version = core_version
        self.core_path = core_path
        self.num_of_boards_without_led = 0
        if not os.path.exists(self.core_path):
            raise ValueError(f"Error: could not found {self.core_path}")

        self.boards_txt = f"{self.core_path}/boards.txt"
        if not os.path.exists(self.boards_txt):
            raise ValueError(f"Error: could not found {self.boards_txt}")

        self.partitions: PartitionList
        self.__get_data()
        #self.__set_boars_without_led()

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

    def __get_data(self):
        board_data: CollectingBoardData = CollectingBoardData(self.core_name, self.core_path)
        self.partitions: PartitionList = PartitionList()
        name=""
        partitions_name = ""
        with open(self.boards_txt, 'r', encoding='utf8') as infile:
            for line in infile:
                board_id: str = board_data.collect_board_data(line)
                if board_id:
                    name = board_id
                    self.partitions.add_partition(name, PartitionData())
                if self.core_name == "esp32":
                    # esp32 pattern
                    self.__get_default_partition(line, self.partitions, name)
                    find_partition_name = self.__get_partition_name(line, self.partitions, name)
                    if find_partition_name:
                        partitions_name = find_partition_name
                    self.__get_patition_build(line, self.partitions, name, partitions_name)

        if self.core_name == "esp32":
            self.__check_partitions(self.partitions)
        board_data.final_data()
        self.boards = board_data.get_collected_data()
        self.num_of_boards_without_led = board_data.num_of_boards_without_led


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
                        log_partition.error("Default partition '%s' for '%s' does not exist",
                                            default_partition, board_name)
                        boards_without_partition.append(board_name)
                    else:
                        log_partition.warning("Only default partition '%s' for '%s' exists",
                                           default_partition, board_name)
            else:
                scheme_without_build: list[str] = []
                for scheme_name in partitions[board_name].schemes.keys():
                    if partitions[board_name].schemes[scheme_name].build == "":
                        log_partition.warning("No build name found for '%s' in scheme '%s'",
                                            board_name, scheme_name)
                        scheme_without_build.append(scheme_name)
                if scheme_without_build:
                    for scheme_name in scheme_without_build:
                        del partitions[board_name].schemes[scheme_name]
        log_partition.error("Removing %s boards without partition: %s",
                            len(boards_without_partition), ", ".join(boards_without_partition))
        for board_name in boards_without_partition:
            del partitions[board_name]

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
