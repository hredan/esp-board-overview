"""Module for handling partition data structures."""
class Scheme:
    """Class to hold data for a partition scheme."""
    def __init__(self):
        self.full_name = ""
        self.build = ""

    def set_full_name(self, name: str):
        """Set the name of the scheme."""
        self.full_name = name
    def set_build(self, build: str):
        """Set the build of the scheme."""
        self.build = build

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

class PartitionList(dict[str, PartitionData]):
    """Class to hold a list of PartitionData objects."""
    def add_partition(self, board_name: str, partition: PartitionData):
        """Add a partition table to the list."""
        self[board_name] = partition

    def to_json(self):
        """Convert the partition list to JSON format."""
        import json
        return json.dumps(self, default=lambda o: o.__dict__, indent=4)
