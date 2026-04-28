""" Create esp32 board partition schemes from esp32 core """
import os
import json
from helper.index_data import get_core_list

ESP_DATA_PATH = "./esp_data"

def load_scheme(scheme_name: str, version: str) -> list[dict[str, str]]:
    """
    Load a partition scheme from the partition data.
    :param scheme_name: The name of the partition scheme to load.
    :return: The partition scheme data.
    """
    csv_file_path = f"{ESP_DATA_PATH}/esp32-core-{version}/tools/partitions/{scheme_name}.csv"
    if not os.path.exists(csv_file_path):
        print(f"Partition scheme file not found: {csv_file_path}")
        return []

    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_lines = csv_file.read().strip().split('\n')
        partition_scheme: list[dict[str, str]] = []
        for line in csv_lines:
            #print (f"Line {index}: {line}")
            if line.startswith('#') or not line.strip():
                continue

            parts = line.split(',')
            if len(parts) < 5:
                print(f"Invalid line in {scheme_name}.csv: {line}")
                continue
            name, type_, subtype, offset_, size_ = parts[:5]
            partition_scheme.append({
                "name": name.strip(),
                "type": type_.strip(),
                "subtype": subtype.strip(),
                "offset": offset_.strip(),
                "size": size_.strip()
            })
        if not partition_scheme:
            print(f"No valid partition data found in {scheme_name}.csv")
            return []
        #print(f"Loaded partition scheme: {scheme_name}")
        return partition_scheme

def get_default_partitions_list(core_version: str) -> list[str]:
    """
    Get a list of default partition schemes from the esp32 core version.
    :param core_version: The version of the esp32 core to check.
    :return: A list of default partition scheme names.
    """
    partition_files = os.listdir(f"{ESP_DATA_PATH}/esp32-core-{core_version}/tools/partitions")
    default_schemes = [os.path.splitext(file)[0] for file in partition_files if file.endswith('.csv')]
    return default_schemes

if __name__ == "__main__":
    schemes = {}
    core_list = get_core_list()
    esp32_core = next((core for core in core_list if core["core_name"] == "esp32"), None)
    if esp32_core:
        default_partitons_list = get_default_partitions_list(esp32_core["installed_version"])
        default_partitons_list.sort()
        for default_partition in default_partitons_list:
            schemes[default_partition] = load_scheme(default_partition, esp32_core["installed_version"])

        PARTITION_SCHEMES_PATH = f"{ESP_DATA_PATH}/esp32_partition_schemes.json"
        with open(PARTITION_SCHEMES_PATH, 'w', encoding='utf-8') as file_out:
            json.dump(schemes, file_out, ensure_ascii=False, indent=4)
