"""
createTable.py
This script generates a table of esp boards with information about board name,
builtin led, and flashsize.

Part of repository: www.gitub.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan"""
import logging
import os

from helper.collecting_partition_data import CollectingPartitionData
from helper.collecting_board_data import CollectingBoardData

LOG_FILE = "./esp_data/core_data.log"
# if os.path.exists(LOG_FILE):
#     os.remove(LOG_FILE)

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

        self.__get_data()
        #self.__set_boars_without_led()


    def __get_data(self):
        board_data: CollectingBoardData = CollectingBoardData(self.core_name, self.core_path)
        partition_data: CollectingPartitionData = CollectingPartitionData(self.core_name, self.core_path)

        name=""
        with open(self.boards_txt, 'r', encoding='utf8') as infile:
            for line in infile:
                board_id: str = board_data.collect_board_data(line)
                if board_id:
                    name = board_id
                    partition_data.add_partition(name)

                partition_data.collect_partition_data(line)

        partition_data.check_partitions()
        self.partitions = partition_data.get_partitions_data()

        board_data.final_data()
        self.boards = board_data.get_collected_data()
        self.num_of_boards_without_led = board_data.num_of_boards_without_led

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
