#!python
"""
get_esp_data.py
This script downloads and extracts ESP core source data from specified package index URLs.
Part of repository: www.github.com/hredan/esp-board-overview
Author: hredan
Copyright (c) 2025 hredan
"""
import os
import shutil
import urllib.request
import json
import zipfile


def cleanup_directory(directory_path: str):
    """
    Remove the directory if it exists and create a new one.
    :param directory_path: Path to the directory to be removed and created.
    """
    if os.path.exists(directory_path):
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
    else:
        os.mkdir(directory_path)

def download_file(url: str, save_path: str):
    """
    Download a file from a URL and save it to a specified path.
    :param url: URL of the file to download.
    :param save_path: Path where the downloaded file will be saved.
    """
    urllib.request.urlretrieve(url, save_path)
    print(f"Downloaded {url} to {save_path}")

def read_json_file(file_path: str):
    """
    Read a JSON file and return its content.
    :param file_path: Path to the JSON file.
    :return: Content of the JSON file.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_file_name_from_url(url: str):
    """
    Extract the archive name from a URL.
    :param url: URL of the archive.
    :return: Name of the archive.
    """
    return url.rsplit('/', 1)[-1]

def extract_zip_file(zip_path: str, extract_to: str):
    """
    Extract a ZIP file to a specified directory.
    :param zip_path: Path to the ZIP file.
    :param extract_to: Directory where the ZIP file will be extracted.
    """
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
        print(f"Extracted {zip_path} to {extract_to}")

def get_esp_data(directory_path: str, url: str):
    """
    Main function to get ESP data.
    :param directory_path: Path to the directory where ESP data will be stored.
    """

    index_file_name = get_file_name_from_url(url)
    download_file(url, os.path.join(directory_path, index_file_name))

    index_data = read_json_file(os.path.join(directory_path, index_file_name))
    core = index_data["packages"][0]["name"]
    last_core_version = index_data["packages"][0]["platforms"][0]["version"]
    last_source_url = index_data["packages"][0]["platforms"][0]["url"]

    archive_name = get_file_name_from_url(last_source_url)
    download_file(last_source_url, os.path.join(directory_path, archive_name))

    extract_zip_file(os.path.join(directory_path, archive_name), directory_path)

    return core, last_core_version


if __name__ == "__main__":
    ESP_DATA_PATH = "./esp_data"

    index_list = [
        "https://espressif.github.io/arduino-esp32/package_esp32_index.json",
        "https://arduino.esp8266.com/stable/package_esp8266com_index.json"
    ]

    # Get ESP data
    cleanup_directory(ESP_DATA_PATH)
    for index_url in index_list:
        core_name, last_version = get_esp_data(ESP_DATA_PATH, index_url)
        print(f"Core: {core_name}, Last Version: {last_version}")
