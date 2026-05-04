import { TestBed } from '@angular/core/testing';

import { Esp32DataService } from './esp32-data.service';

describe('Esp32DataService', () => {
  let service: Esp32DataService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Esp32DataService);
    service.boardsData = [
      {
        "board": "esp32_devkitc_v4",
        "name": "ESP32 DevKitC V4",
        "variant": "esp32",
        "led_builtin": "GPIO2",
        "mcu": "ESP32",
        "flash_size": ["4MB"],

      },
      {
        "board": "esp32_devkitc_v4_16mb",
        "name": "ESP32 DevKitC V4 16MB",
        "variant": "esp32",
        "led_builtin": "GPIO2",
        "mcu": "ESP32",
        "flash_size": [],
      }
    ];
    service.partitionsData = {
      "esp32_devkitc_v4": {
        "default": "default_4MB",
        "schemes": {
          "default_4MB": {
            "full_name": "Default 4MB Partition Scheme",
            "build": "default_4MB"
          }
        }
      },
      "esp32_devkitc_v4_16mb": {
        "default": "default_16MB",
        "schemes": {}
      },
      "board_default_partition_not_in_schemes": {
        "default": "default_4MB",
        "schemes": {
          "default_8MB": {
            "full_name": "Default 8MB Partition Scheme",
            "build": "default_8MB"
          }
        }
      }
    };
    service.defaultSchemes = {
      "default_4MB": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "0",
          "size": "0x6000"
        },
        {
          "name": "otadata",
          "type": "data",
          "subtype": "ota",
          "offset": "0x6000",
          "size": "0x2000"
        },
        {
            "name": "coredump",
            "type": "data",
            "subtype": "coredump",
            "offset": "0x3F0000",
            "size": "0x10000"
        }
      ],
      "k_suffix_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "36K",
          "size": "20K"
        },
        {
          "name": "factory",
          "type": "app",
          "subtype": "factory",
          "offset": "64K",
          "size": "1900K"
        }
      ]
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default scheme for a board', () => {
    const defaultScheme = service.getDefaultScheme('esp32_devkitc_v4');
    expect(defaultScheme).toBe('default_4MB');
  });

  it('should return default scheme for a board with no schemes', () => {
    const defaultScheme = service.getDefaultScheme('esp32_devkitc_v4_16mb');
    expect(defaultScheme).toBe('default_16MB');
  });

  it('should return first scheme if default scheme is not in schemes', () => {
    const defaultScheme = service.getDefaultScheme('board_default_partition_not_in_schemes');
    expect(defaultScheme).toBe('default_8MB');
  });

  it('should return memory size for a board', () => {
    const memorySize = service.getMemorySize('esp32_devkitc_v4');
    expect(memorySize).toBe('4MB');
  });

  it('should return N/A for a board with no flash size', () => {
    const memorySize = service.getMemorySize('esp32_devkitc_v4_16mb');
    expect(memorySize).toBe('N/A');
  });

  it('should return N/A for an unknown board', () => {
    const memorySize = service.getMemorySize('unknown_board');
    expect(memorySize).toBe('N/A');
  });

  it('should return board name for a board', () => {
    const boardName = service.getBoardName('esp32_devkitc_v4');
    expect(boardName).toBe('ESP32 DevKitC V4');
  });

  it('should return unknown for an unknown board', () => {
    const boardName = service.getBoardName('unknown_board');
    expect(boardName).toBe("N/A");
  });

  it ('should return partition routes', () => {
    const routes = service.getPartitionRoutes();
    expect(routes.length).toBe(3);
    expect(routes[0]).toEqual({ boardId: 'esp32_devkitc_v4', schemeId: 'default_4MB' });
    expect(routes[1]).toEqual({ boardId: 'esp32_devkitc_v4_16mb', schemeId: 'default_16MB' });
    expect(routes[2]).toEqual({ boardId: 'board_default_partition_not_in_schemes', schemeId: 'default_8MB' });
  });

  it('should return memory size in MB from the last partition entry of a default scheme', () => {
    const result = service.getMemorySizeOfScheme('default_4MB');
    expect(result).toEqual(4);
  });

  it('should return null for unknown scheme in getMemorySizeOfScheme', () => {
    const result = service.getMemorySizeOfScheme('unknown_scheme');
    expect(result).toBeNull();
  });

  it('should return memory size in MB for K-suffixed scheme values', () => {
    const result = service.getMemorySizeOfScheme('k_suffix_scheme');
    expect(result).toBeCloseTo(1.91796875);
  });
});
