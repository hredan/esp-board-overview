"""Script to modify the esp32_partitions.json file, in case of known issues."""
import json

ESP32_JSON_PATH = "./esp_data/esp32_partitions.json"

print("####### Starting sanity check #######")
with open(ESP32_JSON_PATH, 'r', encoding='utf-8') as file:
    esp32_partitions = json.load(file)

# check aslcanx2
if esp32_partitions["aslcanx2"]["schemes"]["defaultffat"]["build"] == "default_8MB_ffat":
    print("Modifying: aslcanx2 defaultffat build from default_8MB_ffat to default_ffat_8MB")
    esp32_partitions["aslcanx2"]["schemes"]["defaultffat"]["build"] = "default_ffat_8MB"
with open(ESP32_JSON_PATH, 'w', encoding='utf-8') as file:
    json.dump(esp32_partitions, file, ensure_ascii=False, indent=4)
