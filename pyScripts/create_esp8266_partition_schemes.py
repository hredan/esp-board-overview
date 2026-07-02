""" Create esp8266 partition schemes from eagle.flash LD files """
import os
import re
import json
from helper.index_data import get_core_list

ESP_DATA_PATH = "./esp_data"

# Matches: /* sketch @0x40200000 (~935KB) (958448B) */
RE_WITH_APPROX = re.compile(
    r"/\*\s+(\w+)\s+@(0x[0-9A-Fa-f]+)\s+\(~(\d+)KB\)\s+\((\d+)B\)\s+\*/"
)
# Matches: /* eeprom @0x402FB000 (4KB) */
RE_KB_ONLY = re.compile(
    r"/\*\s+(\w+)\s+@(0x[0-9A-Fa-f]+)\s+\((\d+)KB\)\s+\*/"
)

"""
	Memory Map für ESP8266EX
    Physikalische Flash-Adresse:  0x200000
	Memory Map Basis:            +0x40000000
	────────────────────────────────────────
CPU-Adresse im IROM:          0x40200000
"""
SKETCH_BASE = 0x40200000


def parse_ld_file(ld_path: str) -> list[dict[str, str]]:
    """
    Parse an eagle.flash LD file header and extract partition entries.
    Offsets are normalized: the sketch base address (0x40200000) is subtracted
    so the sketch offset becomes 0x0. Each entry contains name, offset and size
    as hex strings.
    """
    raw: list[tuple[int, int]] = []  # (offset_abs, size_bytes)
    names: list[str] = []

    with open(ld_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line.startswith("/*"):
                if line and not line.startswith("/*"):
                    break
                continue

            match_approx = RE_WITH_APPROX.search(line)
            if match_approx:
                names.append(match_approx.group(1))
                raw.append((int(match_approx.group(2), 16),
                           int(match_approx.group(4))))
                continue

            match_kb = RE_KB_ONLY.search(line)
            if match_kb:
                names.append(match_kb.group(1))
                raw.append((int(match_kb.group(2), 16),
                           int(match_kb.group(3)) * 1024))

    partition_entries: list[dict[str, str]] = []
    for name, (offset_abs, size_bytes) in zip(names, raw):
        if size_bytes == 0:
            continue
        partition_entries.append({
            "name": name,
            "offset": hex(offset_abs - SKETCH_BASE),
            "size": hex(size_bytes),
        })
    return partition_entries


def get_scheme_name(filename: str) -> str:
    """Return the scheme name derived from the LD filename (without extension)."""
    return os.path.splitext(filename)[0]


if __name__ == "__main__":
    core_list = get_core_list()
    esp8266_core = next(
        (core for core in core_list if core["core_name"] == "esp8266"), None
    )
    if not esp8266_core:
        print("esp8266 core not found in core list")
        raise SystemExit(1)

    version = esp8266_core["installed_version"]
    LD_DIR = f"{ESP_DATA_PATH}/esp8266-{version}/tools/sdk/ld"

    ld_files = sorted(
        f for f in os.listdir(LD_DIR)
        if f.startswith("eagle.flash") and f.endswith(".ld")
    )

    schemes: dict[str, list[dict[str, str]]] = {}
    for ld_file in ld_files:
        scheme_name = get_scheme_name(ld_file)
        parsed_partitions = parse_ld_file(os.path.join(LD_DIR, ld_file))
        if parsed_partitions:
            schemes[scheme_name] = parsed_partitions
        else:
            print(f"No partitions found in {ld_file}")

    OUT_PATH = f"{ESP_DATA_PATH}/esp8266_partition_schemes.json"
    with open(OUT_PATH, "w", encoding="utf-8") as out_file:
        json.dump(schemes, out_file, ensure_ascii=False, indent=4)
    print(f"Written {len(schemes)} schemes to {OUT_PATH}")
