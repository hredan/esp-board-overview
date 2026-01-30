""" Collecting partition data from boards.txt """
import re
import os
import sys
import logging
from helper.partitions_data import PartitionList, PartitionData, Scheme

log_partition = logging.getLogger(__name__ + ".partition")
#enable stdout logging for debugging
if os.environ.get('LOG_STDOUT') == '1':
    log_partition.addHandler(logging.StreamHandler(sys.stdout))
class CollectingPartitionData:
    """ Class for collecting partition data from boards.txt """
    def __init__(self, core_name:str, core_path: str):
        self.core_name = core_name
        self.core_path = core_path
        self.board_id = ""
        self.partition_name = ""
        self.partition_list: PartitionList = PartitionList()

    def __get_default_partition(self, line:str):
        match_partition = re.match(self.board_id + r"\.build\.partitions=(.+)", line)
        if match_partition:
            default_partition = match_partition.group(1)
            self.partition_list[self.board_id].set_default(default_partition)

    def __get_partition_name(self, line:str):
        pattern = self.board_id + r"\.menu\.PartitionScheme\.([^\.]+)=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_name = match_partition.group(1)
            partitions_full_name = match_partition.group(2)
            scheme: Scheme = Scheme()
            scheme.set_full_name(partitions_full_name)
            self.partition_list[self.board_id].add_scheme(partition_name, scheme)
            self.partition_name = partition_name

    def __get_partition_build(self, line:str):
        pattern = self.board_id + r"\.menu\.PartitionScheme\." \
            + self.partition_name + r"\.build\.partitions=(.+)"
        match_partition = re.match(pattern, line)
        if match_partition:
            partition_build = match_partition.group(1)
            if self.partition_list[self.board_id].schemes[self.partition_name].build == "":
                self.partition_list[self.board_id].schemes[self.partition_name].set_build(partition_build)
            else:
                log_partition.warning("%s has more than one build partition for %s",
                                      self.board_id, self.partition_name)

    def __partition_scheme_exists(self, name: str) -> bool:
        """
        Check if the partition scheme exists in the partitions directory.
        :param name: The name of the partition scheme to check.
        :return: True if the partition scheme exists, False otherwise.
        """
        partition_scheme_path = f"{self.core_path}/tools/partitions/{name}.csv"
        return os.path.exists(partition_scheme_path)

    def __check_esp32_partitions(self):
        """
        Check if the esp32 partitions have a default partition and at least one scheme.
        """
        boards_without_partition: list[str] = []
        for board_name, partition_data in self.partition_list.items():
            # check if there is at least one scheme or a valid default partition
            if len(partition_data.schemes) == 0:
                if partition_data.default == "":
                    log_partition.error("No default partition and no schemes found for %s",
                                        board_name)
                    boards_without_partition.append(board_name)
                else:
                    default_partition = partition_data.default
                    if not self.__partition_scheme_exists(default_partition):
                        log_partition.error("Default partition '%s' for '%s' does not exist",
                                            default_partition, board_name)
                        boards_without_partition.append(board_name)
                    else:
                        log_partition.warning("Only default partition '%s' for '%s' exists",
                                        default_partition, board_name)
            else:
                scheme_without_build: list[str] = []
                for scheme_name in partition_data.schemes.keys():
                    if partition_data.schemes[scheme_name].build == "":
                        log_partition.warning("No build name found for '%s' in scheme '%s'",
                                            board_name, scheme_name)
                        scheme_without_build.append(scheme_name)
                if scheme_without_build:
                    for scheme_name in scheme_without_build:
                        del partition_data.schemes[scheme_name]
        log_partition.error("Removing %s boards without partition: %s",
                            len(boards_without_partition), ", ".join(boards_without_partition))
        for board_name in boards_without_partition:
            del self.partition_list[board_name]

    def check_partitions(self):
        """
        Check if the partitions have a default partition and at least one scheme.
        """
        if self.core_name == "esp32":
            self.__check_esp32_partitions()

    def add_partition(self, board_name:str):
        """ Add partition data to the partition list """
        self.board_id = board_name
        self.partition_list.add_partition(board_name, PartitionData())

    def collect_partition_data(self, line: str):
        """ Collecting partition data """
        if self.core_name == "esp32":
            # esp32 pattern
            self.__get_default_partition(line)
            self.__get_partition_name(line)
            self.__get_partition_build(line)

    def get_partitions_data(self) -> PartitionList:
        """ Get collected partition data """
        return self.partition_list
