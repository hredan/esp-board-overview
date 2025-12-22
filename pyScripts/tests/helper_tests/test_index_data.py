"""Unit tests for index_data.py module."""
import json
import os
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest
from helper.index_data import IndexData, get_core_list


class TestIndexData:
    """Test cases for IndexData class."""

    @pytest.fixture
    def mock_esp32_data(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
        """Mock ESP32 index data."""
        monkeypatch.chdir(tmp_path)
        package_esp32_index_path = tmp_path / "esp_data" / "package_esp32_index.json"
        package_esp32_index_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "packages": [{
                "name": "esp32",
                "platforms": [{
                    "version": "3.0.0"
                }]
            }]
        }
        package_esp32_index_path.write_text(
            json.dumps(data, indent=4), encoding="utf8")
        return tmp_path

    @pytest.fixture
    def mock_esp8266_data(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
        """Mock ESP8266 index data."""
        monkeypatch.chdir(tmp_path)
        package_esp8266_index_path = tmp_path / \
            "esp_data" / "package_esp8266com_index.json"
        package_esp8266_index_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "packages": [{
                "name": "esp8266",
                "platforms": [{
                    "version": "2.7.4"
                }]
            }]
        }
        package_esp8266_index_path.write_text(
            json.dumps(data, indent=4), encoding="utf8")
        return tmp_path

    def test_init_esp32(self, mock_esp32_data: pytest.Function):
        """Test IndexData initialization with esp32 core."""
        root_path = mock_esp32_data
        assert os.path.exists(os.path.join(
            str(root_path), "esp_data", "package_esp32_index.json"))
        index_data = IndexData("esp32")
        assert index_data.core_name == "esp32"
        assert index_data.package_index_path == "./esp_data/package_esp32_index.json"

    def test_init_esp8266(self, mock_esp8266_data: pytest.Function):
        """Test IndexData initialization with esp8266 core."""
        root_path = mock_esp8266_data
        assert os.path.exists(os.path.join(
            str(root_path), "esp_data", "package_esp8266com_index.json"))
        index_data = IndexData("esp8266")
        assert index_data.core_name == "esp8266"
        assert index_data.package_index_path == "./esp_data/package_esp8266com_index.json"

    def test_get_last_core_version_esp8266(self, mock_esp8266_data: pytest.Function):
        """Test getting last core version for ESP8266."""
        root_path = mock_esp8266_data
        assert os.path.exists(os.path.join(
            str(root_path), "esp_data", "package_esp8266com_index.json"))
        index_data = IndexData("esp8266")
        assert index_data.get_last_core_version() == "2.7.4"


class TestGetCoreList:
    """Test cases for get_core_list function."""

    @pytest.fixture
    def mock_index_data(self):
        """Mock index data for both cores."""
        def side_effect(core_name: str) -> MagicMock:
            if core_name == "esp32":
                data = "3.0.0"
            else:
                data = "2.7.4"

            mock_instance = MagicMock()
            mock_instance.get_core_name.return_value = core_name
            mock_instance.get_last_core_version.return_value = data
            return mock_instance

        return side_effect

    def test_get_core_list(self, mock_index_data: pytest.Function):
        """Test retrieving list of cores."""
        with patch("helper.index_data.IndexData", side_effect=mock_index_data):
            core_list = get_core_list()

            assert len(core_list) == 2
            assert core_list[0]["core_name"] == "esp8266"
            assert core_list[1]["core_name"] == "esp32"

    def test_get_core_list_structure(self, mock_index_data: pytest.Function):
        """Test structure of returned core list."""
        with patch("helper.index_data.IndexData", side_effect=mock_index_data):
            core_list = get_core_list()

            for core_info in core_list:
                assert "core" in core_info
                assert "installed_version" in core_info
                assert "latest_version" in core_info
                assert "core_name" in core_info

    def test_get_core_list_versions(self, mock_index_data: pytest.Function):
        """Test versions in core list."""
        with patch("helper.index_data.IndexData", side_effect=mock_index_data):
            core_list = get_core_list()

            esp8266_core = next(
                c for c in core_list if c["core_name"] == "esp8266")
            esp32_core = next(
                c for c in core_list if c["core_name"] == "esp32")

            assert esp8266_core["installed_version"] == "2.7.4"
            assert esp32_core["installed_version"] == "3.0.0"
