"""
create_table.py
This script generates a table of esp boards with information about board name,
builtin led, and flashsize.

Part of repository: www.gitub.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan
"""
import os.path
import json

from helper.core_data import CoreData
from helper.index_data import get_core_list

if __name__ == "__main__":
    ESP_DATA_PATH = "./esp_data"
    core_list_path = os.path.join(ESP_DATA_PATH, "core_list.json")
    core_info_list = get_core_list()
    with open(core_list_path, 'w', encoding='utf-8') as f:
        json.dump(core_info_list, f, ensure_ascii=False, indent=4)
    # Create Board Data json for each core
    for core_info in core_info_list:
        core_name = core_info["core_name"]
        core_version = core_info["latest_version"]
        CORE_DATA_PATH = f"./esp_data/{core_name}-{core_version}"
        cd = CoreData(core_info["core_name"], core_info["installed_version"], CORE_DATA_PATH)
        print(f"### core: {core_name} ###")
        print(f"number of boards: {len(cd.boards)}")
        print(f"number of boards without led: {cd.num_of_boards_without_led}")
        # save data in json file
        json_path = os.path.join(ESP_DATA_PATH, core_info['core_name'] + ".json")
        cd.boards_export_json(filename=json_path)
        cd.partitions_export_json(filename=os.path.join(ESP_DATA_PATH, core_info['core_name'] \
                                                        + "_partitions.json"))
