import json

esp32_json_path = "./esp_data/esp32_partitions.json"

with open(esp32_json_path, 'r', encoding='utf-8') as file:
    esp32_partitions = json.load(file)

# check aslcanx2
esp32_partitions["aslcanx2"]["schemes"]["defaultffat"]["build"] = "default_ffat_8MB"
with open(esp32_json_path, 'w', encoding='utf-8') as file:
    json.dump(esp32_partitions, file, ensure_ascii=False, indent=4)
