""" Create esp32 board partition schemes from esp32 core """
import json

ESP_DATA_PATH = "./esp_data"

def load_scheme(scheme_name: str) -> dict:
    """
    Load a partition scheme from the partition data.
    :param scheme_name: The name of the partition scheme to load.
    :return: The partition scheme data.
    """
    with open(f"{ESP_DATA_PATH}/esp32-3.2.1/tools/partitions/{scheme_name}.csv",\
               'r', encoding='utf-8') as csv_file:
        csv_lines = csv_file.read().strip().split('\n')
        partition_sheme = []
        for line in csv_lines:
            #print (f"Line {index}: {line}")
            if line.startswith('#') or not line.strip():
                continue
            else:
                parts = line.split(',')
                if len(parts) < 5:
                    print(f"Invalid line in {scheme_name}.csv: {line}")
                    continue
                name, type_, subtype, offset_, size_ = parts[:5]
                partition_sheme.append({
                    "name": name.strip(),
                    "type": type_.strip(),
                    "subtype": subtype.strip(),
                    "offset": offset_.strip(),
                    "size": size_.strip()
                })
        if not partition_sheme:
            print(f"No valid partition data found in {scheme_name}.csv")
            return []
        #print(f"Loaded partition scheme: {scheme_name}")
        return partition_sheme

if __name__ == "__main__":
    schemes = {}
    with open(f"{ESP_DATA_PATH}/esp32_partitions.json", 'r', encoding='utf-8') as file_board_partions:
        board_partition = json.load(file_board_partions)

    for board, scheme_data in board_partition.items():
        if "schemes" in scheme_data:
            for scheme, scheme_data in scheme_data["schemes"].items():
                scheme_file_name = scheme_data["build"]
                if scheme_file_name not in schemes:
                    schemes[scheme_file_name] = load_scheme(scheme_file_name)
        else:
            if "default" in scheme_data and scheme_data["default"] not in schemes:
                schemes[scheme_data["default"]] = load_scheme(scheme_data["default"])
            # else:
            #     print(f"Default: {board} - {scheme_data['default']} already loaded")

    with open(f"{ESP_DATA_PATH}/esp32_partition_schemes.json", 'w', encoding='utf-8') as file_out:
        json.dump(schemes, file_out, ensure_ascii=False, indent=4)
    # Create partition schemes json for each core
    # SCHEME = "default"
    # partition_data = load_scheme(SCHEME)
    # for partition in partition_data:
    #     offset = int(partition['offset'], 16)
    #     size = int(partition['size'], 16)
    #     print(f"Partition Name: {partition['name']} offset: {offset}" + \
    #           f" size: {size} pos: {offset + size}")
    # print(4 * 1024 * 1024)  # 4MB in bytes
