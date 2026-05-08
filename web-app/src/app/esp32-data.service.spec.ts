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
      ],
      "spiffs_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "0x9000",
          "size": "0x5000"
        },
        {
          "name": "spiffs",
          "type": "data",
          "subtype": "spiffs",
          "offset": "0x290000",
          "size": "0x170000"
        }
      ],
      "ota_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "0x9000",
          "size": "0x6000"
        },
        {
          "name": "otadata",
          "type": "data",
          "subtype": "ota",
          "offset": "0xf000",
          "size": "0x2000"
        },
        {
          "name": "ota_0",
          "type": "app",
          "subtype": "ota_0",
          "offset": "0x11000",
          "size": "0x1E0000"
        },
        {
          "name": "ota_1",
          "type": "app",
          "subtype": "ota_1",
          "offset": "0x1f1000",
          "size": "0x1E0000"
        }
      ],
      "incomplete_ota_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "0x9000",
          "size": "0x6000"
        },
        {
          "name": "otadata",
          "type": "data",
          "subtype": "ota",
          "offset": "0xf000",
          "size": "0x2000"
        },
        {
          "name": "ota_0",
          "type": "app",
          "subtype": "ota_0",
          "offset": "0x11000",
          "size": "0x1E0000"
        }
      ],
      "no_otadata_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "0x9000",
          "size": "0x6000"
        },
        {
          "name": "ota_0",
          "type": "app",
          "subtype": "ota_0",
          "offset": "0x11000",
          "size": "0x1E0000"
        }
      ],
      "m_suffix_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "1M",
          "size": "2M"
        }
      ],
      "invalid_partition_scheme": [
        {
          "name": "nvs",
          "type": "data",
          "subtype": "nvs",
          "offset": "invalid",
          "size": "also_invalid"
        }
      ],
      "empty_scheme": []
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

  it('should return memory size in MB for M-suffixed scheme values', () => {
    const result = service.getMemorySizeOfScheme('m_suffix_scheme');
    expect(result).toBe(3); // 1M offset + 2M size = 3M total
  });

  it('should return null for scheme with invalid partition values', () => {
    const result = service.getMemorySizeOfScheme('invalid_partition_scheme');
    expect(result).toBeNull();
  });

  it('should return null for empty scheme in getMemorySizeOfScheme', () => {
    const result = service.getMemorySizeOfScheme('empty_scheme');
    expect(result).toBeNull();
  });

  // Tests for isSpiffsScheme
  it('should return true for scheme with spiffs partition', () => {
    const result = service.isSpiffsScheme('spiffs_scheme');
    expect(result).toBe(true);
  });

  it('should return false for scheme without spiffs partition', () => {
    const result = service.isSpiffsScheme('default_4MB');
    expect(result).toBe(false);
  });

  it('should return false for unknown scheme in isSpiffsScheme', () => {
    const result = service.isSpiffsScheme('unknown_scheme');
    expect(result).toBe(false);
  });

  // Tests for isOtaScheme  
  it('should return true for valid OTA scheme', () => {
    const result = service.isOtaScheme('ota_scheme');
    expect(result).toBe(true);
  });

  it('should return false for incomplete OTA scheme (less than 2 ota partitions)', () => {
    const result = service.isOtaScheme('incomplete_ota_scheme');
    expect(result).toBe(false);
  });

  it('should return false for scheme without otadata partition', () => {
    const result = service.isOtaScheme('no_otadata_scheme');
    expect(result).toBe(false);
  });

  it('should return false for empty scheme in isOtaScheme', () => {
    const result = service.isOtaScheme('empty_scheme');
    expect(result).toBe(false);
  });

  it('should return false for unknown scheme in isOtaScheme', () => {
    const result = service.isOtaScheme('unknown_scheme');
    expect(result).toBe(false);
  });

  // Tests for getSchemeRoutes
  it('should return scheme routes', () => {
    const routes = service.getSchemeRoutes();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.some(route => route.schemeId === 'default_4MB')).toBe(true);
    expect(routes.some(route => route.schemeId === 'spiffs_scheme')).toBe(true);
    expect(routes.some(route => route.schemeId === 'ota_scheme')).toBe(true);
  });

  // Tests for getMemorySize with multiple flash sizes
  it('should return concatenated flash sizes for board with multiple sizes', () => {
    service.boardsData = [
      {
        "board": "multi_flash_board",
        "name": "Multi Flash Board", 
        "variant": "esp32",
        "led_builtin": "GPIO2",
        "mcu": "ESP32",
        "flash_size": ["4MB", "8MB", "16MB"]
      }
    ];

    const result = service.getMemorySize('multi_flash_board');
    expect(result).toBe('4MB,8MB,16MB');
  });

  // Additional edge case tests for parsePartitionValue (testing private method indirectly)
  it('should handle numeric string values in partition parsing', () => {
    const result = service.getMemorySizeOfScheme('default_4MB'); // Uses numeric hex values
    expect(result).toBe(4);
  });

  it('should handle whitespace in partition values', () => {
    // Test with scheme that has whitespace
    service.defaultSchemes['whitespace_scheme'] = [
      {
        "name": "nvs",
        "type": "data", 
        "subtype": "nvs",
        "offset": " 0 ",
        "size": " 0x1000 "
      }
    ];
    
    const result = service.getMemorySizeOfScheme('whitespace_scheme');
    expect(result).toBeCloseTo(0.00390625); // 0x1000 bytes in MB
  });

  it('should handle mixed case K suffix in partition values', () => {
    service.defaultSchemes['mixed_case_k'] = [
      {
        "name": "nvs",
        "type": "data",
        "subtype": "nvs", 
        "offset": "0",
        "size": "4K"
      }
    ];
    
    const result = service.getMemorySizeOfScheme('mixed_case_k');
    expect(result).toBeCloseTo(0.00390625); // 4K bytes in MB
  });

  it('should handle mixed case M suffix in partition values', () => {
    service.defaultSchemes['mixed_case_m'] = [
      {
        "name": "nvs", 
        "type": "data",
        "subtype": "nvs",
        "offset": "0",
        "size": "1M"
      }
    ];
    
    const result = service.getMemorySizeOfScheme('mixed_case_m');
    expect(result).toBe(1); // 1M in MB
  });

  it('should return null for invalid K suffix values', () => {
    service.defaultSchemes['invalid_k'] = [
      {
        "name": "nvs",
        "type": "data", 
        "subtype": "nvs",
        "offset": "0",
        "size": "invalidK"
      }
    ];
    
    const result = service.getMemorySizeOfScheme('invalid_k');
    expect(result).toBeNull();
  });

  it('should return null for invalid M suffix values', () => {
    service.defaultSchemes['invalid_m'] = [
      {
        "name": "nvs",
        "type": "data",
        "subtype": "nvs", 
        "offset": "0",
        "size": "invalidM"
      }
    ];
    
    const result = service.getMemorySizeOfScheme('invalid_m');
    expect(result).toBeNull();
  });

  it('should handle OTA scheme with case-insensitive otadata matching', () => {
    service.defaultSchemes['case_insensitive_ota'] = [
      {
        "name": " OTADATA ",
        "type": "data",
        "subtype": "ota",
        "offset": "0x9000", 
        "size": "0x2000"
      },
      {
        "name": "ota_0",
        "type": "app",
        "subtype": " OTA_0 ",
        "offset": "0x10000",
        "size": "0x1E0000"
      },
      {
        "name": "ota_1", 
        "type": "app",
        "subtype": " ota_1 ",
        "offset": "0x1f0000",
        "size": "0x1E0000"
      }
    ];
    
    const result = service.isOtaScheme('case_insensitive_ota');
    expect(result).toBe(true);
  });
});
