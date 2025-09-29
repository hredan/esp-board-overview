#!/bin/bash
source ./.venv/bin/activate
python ./pyScripts/get_esp_data.py
python ./pyScripts/create_table.py
python ./pyScripts/partition_sanity_check.py
python ./pyScripts/create_partition_schemes.py

cp /workspaces/esp-board-overview/esp_data/core_list.json /workspaces/esp-board-overview/web-app/data/
cp /workspaces/esp-board-overview/esp_data/esp32.json /workspaces/esp-board-overview/web-app/data/
cp /workspaces/esp-board-overview/esp_data/esp8266.json /workspaces/esp-board-overview/web-app/data/
cp /workspaces/esp-board-overview/esp_data/esp32_partition_schemes.json /workspaces/esp-board-overview/web-app/data/