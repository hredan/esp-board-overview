"""Test cases for the CoreData class."""
import json
from pathlib import Path
from typing import Any
import pytest

from helper.collecting_core_data import CollectingCoreData

from helper.partitions_data import PartitionList

# wildcard import is only used for test fixtures
# pylint: disable=unused-wildcard-import, wildcard-import
from tests.helper_tests.collection_core_data_fixture import *


class TestPartitionData:
    """Test cases for the CoreData partition data extraction."""

    def test_export_partitions_esp32(self, setup_esp32: pytest.Function, tmpdir: Path):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values
        expected_data = {
            "d1_mini32": {
                'default': 'default',
                'schemes': {
                    "default": {
                        "full_name": "Default",
                        "build": "default"
                    },
                    "no_ota": {
                        "full_name": "No OTA (Large APP)",
                        "build": "no_ota"
                    }
                }
            }
        }

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

    def test_export_partitions_esp32_no_scheme_data(self,
                                                    setup_esp32_scheme_data_with_csv: pytest.Function,
                                                    tmpdir: Path,
                                                    ):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData(
            "esp32", "3.2.0", str(setup_esp32_scheme_data_with_csv))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values

        expected_data: dict[str, dict[str, str | dict[str, dict[str, str]]]] = {
            "d1_mini32": {
                'default': 'default',
                'schemes': {}
            }
        }

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

    def test_export_partitions_esp32_no_(self,
                                         setup_esp32_scheme_data: pytest.Function,
                                         tmpdir: Path,
                                         caplog: pytest.LogCaptureFixture):
        """Test the export_json method of CoreData."""
        file = tmpdir / "esp32.json"
        core_data = CollectingCoreData(
            "esp32", "3.2.0", str(setup_esp32_scheme_data))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values

        expected_data = {}

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

        # check log output
        log_records = caplog.get_records("call")
        assert len(log_records) == 2
        assert log_records[0].levelname == "ERROR"
        assert log_records[0].name == "helper.collecting_partition_data.partition"
        assert "Default partition 'default' for 'd1_mini32' does not exist" in \
            log_records[0].message

        assert log_records[1].levelname == "ERROR"
        assert "Removing 1 boards without partition: d1_mini32" in log_records[1].message

    def test_export_partitions_esp8266_with_flash_id(self,
                                                     setup_esp8266: pytest.Function,
                                                     tmpdir: Path):
        """Test ESP8266 partition export with flash_id."""
        file = tmpdir / "esp8266.json"
        core_data = CollectingCoreData("esp8266", "2.7.4", str(setup_esp8266))
        core_data.partitions_export_json(filename=str(file))

        with open(str(file), 'r', encoding='utf8') as in_file:
            data: dict[str, Any] = json.loads(in_file.read())

        assert isinstance(data, dict)
        assert data["d1_mini"]["default"] == "4M"
        assert data["d1_mini"]["schemes"]["4M"]["full_name"] == "4MB (FS:1MB OTA:~1019KB)"
        assert data["d1_mini"]["schemes"]["4M"]["flash_id"] == "eagle.flash.4m.ld"
        assert "autoflash" not in data["d1_mini"]["schemes"]
