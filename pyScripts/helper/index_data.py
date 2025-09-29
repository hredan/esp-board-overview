"""
This module provides functionality to load and manage package index data for ESP cores.
Part of repository: www.github.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan
"""
import json
class IndexData:
    """Class to handle ESP core package index data."""
    def __init__(self, core_name):
        self.core_name = core_name
        if core_name == "esp32":
            self.package_index_path = "./esp_data/package_esp32_index.json"
        elif core_name == "esp8266":
            self.package_index_path = "./esp_data/package_esp8266com_index.json"
        self.index_data = self.__load_index_data()

    def __load_index_data(self):
        """ Load the index data from the JSON file.
        :return: Parsed JSON data."""
        with open(self.package_index_path, 'r', encoding="utf8") as file:
            index_data = json.load(file)
        return index_data

    def get_core_name(self):
        """ Get the core name from the index data.
        :return: Core name as a string."""
        return self.index_data["packages"][0]["name"]

    def get_last_core_version(self):
        """ Get the last core version from the index data.
        :return: Last core version as a string."""
        return self.index_data["packages"][0]["platforms"][0]["version"]

def get_core_list() -> list[dict[str, str]]:
    """Retrieve a list of core names from the index data.
    :return: List of core names."""
    core_list: list[dict[str, str]] = []
    core_names = ["esp8266", "esp32"]
    for core_name in core_names:
        index_data = IndexData(core_name)
        core_info: dict[str, str] = {
            "core": f"{index_data.get_core_name()}:{index_data.get_core_name()}",
            "installed_version": index_data.get_last_core_version(),
            "latest_version": index_data.get_last_core_version(),
            "core_name": index_data.get_core_name()
        }
        core_list.append(core_info)
    return core_list
