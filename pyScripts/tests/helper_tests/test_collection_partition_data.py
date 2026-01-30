"""Test cases for the CoreData class."""
import json
from pathlib import Path
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
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_scheme_data_with_csv))
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
        core_data = CollectingCoreData("esp32", "3.2.0", str(setup_esp32_scheme_data))
        # clear the output buffer
        core_data.partitions_export_json(filename=str(file))
        # Check if the output contains the expected values

        expected_data = {}

        with open(str(file), 'r', encoding='utf8') as file:
            data: PartitionList = json.loads(file.read())
        assert isinstance(data, dict)
        assert data == expected_data

        #check log output
        log_records = caplog.get_records("call")
        assert len(log_records) == 2
        assert log_records[0].levelname == "ERROR"
        assert log_records[0].name == "helper.collecting_partition_data.partition"
        assert "Default partition 'default' for 'd1_mini32' does not exist" in \
            log_records[0].message

        assert log_records[1].levelname == "ERROR"
        assert "Removing 1 boards without partition: d1_mini32" in log_records[1].message
