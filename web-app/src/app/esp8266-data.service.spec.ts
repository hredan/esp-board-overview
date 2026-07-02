import { TestBed } from '@angular/core/testing';

import { Esp8266DataService } from './esp8266-data.service';

describe('Esp8266DataService', () => {
  let service: Esp8266DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Esp8266DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getBoardName should return board name when board exists', () => {
    service.boardsData = [
      {
        name: 'NodeMCU',
        board: 'nodemcuv2',
        variant: 'nodemcu',
        led_builtin: '2',
        mcu: 'esp8266',
        flash_size: ['4MB']
      }
    ];

    expect(service.getBoardName('nodemcuv2')).toBe('NodeMCU');
  });

  it('getBoardName should return N/A when board does not exist', () => {
    service.boardsData = [];

    expect(service.getBoardName('missing')).toBe('N/A');
  });

  it('getDefaultScheme should return empty string when board is missing', () => {
    service.partitionsData = {};

    expect(service.getDefaultScheme('missing')).toBe('');
  });

  it('getDefaultScheme should return configured default when it exists', () => {
    service.partitionsData = {
      d1: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' },
          '4m2m': { full_name: '4M (2M FS)', flash_id: 'eagle.flash.4m2m.ld' }
        }
      }
    };

    expect(service.getDefaultScheme('d1')).toBe('4m1m');
  });

  it('getDefaultScheme should fallback to first scheme when default is invalid', () => {
    service.partitionsData = {
      d1: {
        default: 'missing',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' },
          '4m2m': { full_name: '4M (2M FS)', flash_id: 'eagle.flash.4m2m.ld' }
        }
      }
    };

    expect(service.getDefaultScheme('d1')).toBe('4m1m');
  });

  it('getSchemeEntries should return [] when flash id is missing', () => {
    service.partitionsData = {
      d1: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: '' }
        }
      }
    };

    expect(service.getSchemeEntries('d1', '4m1m')).toEqual([]);
  });

  it('getSchemeEntries should map .ld key and return matching entries', () => {
    service.partitionsData = {
      d1: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' }
        }
      }
    };
    service.schemesData = {
      'eagle.flash.4m1m': [
        { name: 'irom0_0_seg', offset: '0x40201010', size: '0x3FAFF0' }
      ]
    };

    expect(service.getSchemeEntries('d1', '4m1m')).toEqual([
      { name: 'irom0_0_seg', offset: '0x40201010', size: '0x3FAFF0' }
    ]);
  });

  it('getSchemeEntries should return [] when scheme data key is missing', () => {
    service.partitionsData = {
      d1: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' }
        }
      }
    };
    service.schemesData = {};

    expect(service.getSchemeEntries('d1', '4m1m')).toEqual([]);
  });

  it('getPartitionRoutes should return all board/scheme combinations', () => {
    service.partitionsData = {
      d1: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' },
          '4m2m': { full_name: '4M (2M FS)', flash_id: 'eagle.flash.4m2m.ld' }
        }
      },
      nodemcu: {
        default: '4m1m',
        schemes: {
          '4m1m': { full_name: '4M (1M FS)', flash_id: 'eagle.flash.4m1m.ld' }
        }
      }
    };

    expect(service.getPartitionRoutes()).toEqual([
      { boardId: 'd1', schemeId: '4m1m' },
      { boardId: 'd1', schemeId: '4m2m' },
      { boardId: 'nodemcu', schemeId: '4m1m' }
    ]);
  });
});
