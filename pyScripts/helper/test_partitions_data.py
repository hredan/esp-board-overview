"""Unit tests for partitions_data.py"""
from pyScripts.helper.partitions_data import PartitionData, Scheme, PartitionList

def test_partition_data():
    """Test the PartitionData and Scheme classes."""
    partition = PartitionData()
    partition.set_default("DefaultScheme")

    scheme1 = Scheme()
    scheme1.set_full_name("DefaultScheme")
    scheme1.set_build("build1")

    scheme2 = Scheme()
    scheme2.set_full_name("AlternativeScheme")
    scheme2.set_build("build2")

    partition.add_scheme("DefaultScheme", scheme1)
    partition.add_scheme("AlternativeScheme", scheme2)

    assert partition.default == "DefaultScheme"
    assert "DefaultScheme" in partition.schemes
    assert "AlternativeScheme" in partition.schemes
    assert partition.schemes["DefaultScheme"].full_name == "DefaultScheme"
    assert partition.schemes["AlternativeScheme"].build == "build2"

def test_partition_list():
    """Test the PartitionList class."""
    partition_list = PartitionList()

    partition1 = PartitionData()
    partition1.set_default("Scheme1")

    partition2 = PartitionData()
    partition2.set_default("Scheme2")

    partition_list.add_partition("Board1", partition1)
    partition_list.add_partition("Board2", partition2)

    assert "Board1" in partition_list
    assert "Board2" in partition_list
    assert partition_list["Board2"].default == "Scheme2"

def test_partition_list_to_json():
    """Test the to_json method of PartitionList."""
    partition_list = PartitionList()

    partition = PartitionData()
    partition.set_default("minimal")

    scheme = Scheme()
    scheme.set_full_name("Minimal (1.3MB APP/700KB SPIFFS)")
    scheme.set_build("minimal")

    partition.add_scheme("minimal", scheme)
    partition_list.add_partition("esp32c2", partition)

    expected_json = """{
    "esp32c2": {
        "default": "minimal",
        "schemes": {
            "minimal": {
                "full_name": "Minimal (1.3MB APP/700KB SPIFFS)",
                "build": "minimal"
            }
        }
    }
}"""

    json_output = partition_list.to_json()
    assert json_output.strip() == expected_json.strip()
