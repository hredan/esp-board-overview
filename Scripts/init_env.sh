#!/bin/bash
# This script installs google-chrome and the required node packages for the ESP Board Overview web app.
# It is designed to be run in a Linux environment, specifically Ubuntu 22.04.
sudo apt update
sudo apt upgrade -y

sudo apt install python3-venv -y
python3 -m venv /workspaces/esp-board-overview/.venv
source /workspaces/esp-board-overview/.venv/bin/activate
pip install --upgrade pip
pip install -r /workspaces/esp-board-overview/requirements_test.txt

# install angular cli
npm install -g @angular/cli

# install web-app packages
cd /workspaces/esp-board-overview/web-app/
npm install -g npm@latest
npm install