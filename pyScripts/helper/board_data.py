"""Module for BoardData and BoardList classes."""
import json

class BoardData:
    """Class to hold data for a single board."""
    def __init__(self):
        self.name: str = ""
        self.variant: str = "N/A"
        self.mcu: str = "N/A"
        self.flash_size: list[str] = []
        self.led_builtin: str = "N/A"
        self.board: str = ""

    def set_name(self, name: str):
        """Set the name of the board."""
        self.name = name

    def set_mcu(self, mcu: str):
        """Set the MCU of the board."""
        self.mcu = mcu

    def set_variant(self, variant: str):
        """Set the variant of the board."""
        self.variant = variant

    def set_flash_size(self, flash_size: str):
        """Set the flash size of the board."""
        if flash_size not in self.flash_size:
            if flash_size == "512KB":
                # add 512KB to the beginning of the list
                self.flash_size.insert(0, flash_size)
            else:
                self.flash_size.append(flash_size)

    def set_led_builtin(self, gpio: str):
        """Set the built-in LED GPIO pin of the board."""
        self.led_builtin = gpio

    def set_board_id(self, board_id: str):
        """Set the board ID of the board."""
        self.board = board_id

    def to_json(self):
        """Convert the board data to JSON format."""
        return json.dumps(self, default=lambda o: o.__dict__, indent=4)

class BoardList(list[BoardData]):
    """Class to hold a list of BoardData objects."""
    def to_json(self):
        """Convert the board list to JSON format."""
        self.sort(key=lambda board: board.board)
        return json.dumps(self, default=lambda o: o.__dict__, indent=4)

    def get_board_by_id(self, board_id: str) -> BoardData | None:
        """Get a board by its ID."""
        for board in self:
            if board.board == board_id:
                return board
        return None
