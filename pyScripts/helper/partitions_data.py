"""Module for handling partition data structures."""
import json


class Scheme:
    """Class to hold data for a partition scheme."""

    def __init__(self):
        self.full_name = ""
        self.build = ""
        self.flash_id = ""

    def set_full_name(self, name: str):
        """Set the name of the scheme."""
        self.full_name = name

    def set_build(self, build: str):
        """Set the build of the scheme."""
        self.build = build

    def set_flash_id(self, flash_id: str):
        """Set the flash id of the scheme."""
        self.flash_id = flash_id

    def to_dict(self) -> dict[str, str]:
        """Convert the scheme to a serializable dictionary."""
        data = {
            "full_name": self.full_name,
        }
        if self.build:
            data["build"] = self.build
        if self.flash_id:
            data["flash_id"] = self.flash_id
        return data


class PartitionData:
    """Class to hold data for a partition table."""

    def __init__(self):
        self.default = ""
        self.schemes = dict[str, Scheme]()

    def set_default(self, default: str):
        """Set the default scheme of the partition table."""
        self.default = default

    def add_scheme(self, scheme_name: str, scheme: Scheme):
        """Add a scheme to the partition table."""
        self.schemes[scheme_name] = scheme

    def to_dict(self) -> dict[str, str | dict[str, dict[str, str]]]:
        """Convert the partition data to a serializable dictionary."""
        return {
            "default": self.default,
            "schemes": {
                scheme_name: scheme.to_dict()
                for scheme_name, scheme in self.schemes.items()
            }
        }


class PartitionList(dict[str, PartitionData]):
    """Class to hold a list of PartitionData objects."""

    def add_partition(self, board_name: str, partition: PartitionData):
        """Add a partition table to the list."""
        self[board_name] = partition

    def to_json(self):
        """Convert the partition list to JSON format."""
        return json.dumps(
            {
                board_name: partition_data.to_dict()
                for board_name, partition_data in self.items()
            },
            indent=4
        )
