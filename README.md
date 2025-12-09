# ESP Board Overview
This repository generates an ESP board overview for the ESP8266 and ESP32 core as github page.  
[ESP Board Overview github page](https://hredan.github.io/esp-board-overview)

# How it works
## ESP Board Data generation
### By source code (recommended)
* Download source code of last packages from ESP32 and ESP8266  
```python pyScripts/get_esp_data.py```
* Generate json files for the web-app  
```python pyScripts/create_table.py```
### By installation of core data
* Install last cores from ESP32 and ESP8266  
```Scripts/install_esp_cores.sh```
* Generate json files for the web-app  
````python pyScripts/create_table_from_installed_core.py````
# Disclaimer
All this code is released under the GPL, and all of it is to be used at your own risk. If you find any bugs, please let me know via the GitHub issue tracker or drop me an email ([hredan@sleepuino.de](mailto:hredan@sleepuino.de)).