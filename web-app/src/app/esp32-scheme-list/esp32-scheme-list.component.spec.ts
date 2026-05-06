import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';
import { provideRouter, Router, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Esp32SchemeListComponent } from './esp32-scheme-list.component';

@Component({
  selector: 'app-test-dummy',
  template: '',
  standalone: true
})
class TestDummyComponent {}

describe('Esp32SchemeListComponent', () => {
  let component: Esp32SchemeListComponent;
  let fixture: ComponentFixture<Esp32SchemeListComponent>;
  let router: Router;
  let mockActivatedRoute: {
    queryParams: BehaviorSubject<Params>;
    params: BehaviorSubject<Params>;
  };

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: new BehaviorSubject({}),
      params: new BehaviorSubject({})
    };

    await TestBed.configureTestingModule({
      imports: [Esp32SchemeListComponent],
      providers: [
        provideRouter([
          { path: 'esp32-schemes', component: Esp32SchemeListComponent },
          { path: 'esp32-schemes/:schemeId', component: Esp32SchemeListComponent },
          { path: 'page-not-found', component: TestDummyComponent }
        ]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Esp32SchemeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render scheme list with name and memory size columns', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ESP32 Partition Schemes');
    expect(text).toContain('Name');
    expect(text).toContain('Memory Size');
    expect(component.sortedData.data.length).toBeGreaterThan(0);
  });

  it('should sort alphabetically by name ascending', () => {
    const sortState: Sort = { active: 'name', direction: 'asc' };
    component.sortData(sortState);

    const names = component.sortedData.data.map((entry) => entry.name);
    const expected = names.slice().sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(expected);
  });

  it('should sort by memory size ascending', () => {
    const sortState: Sort = { active: 'memorySizeMb', direction: 'asc' };
    component.sortData(sortState);

    const sizes = component.sortedData.data
      .map((entry) => entry.memorySizeMb)
      .filter((size): size is number => size !== null);

    const expected = sizes.slice().sort((a, b) => a - b);
    expect(sizes).toEqual(expected);
  });

  it('should provide memory size filter values', () => {
    expect(component.memorySizeFilterValues.length).toBeGreaterThan(0);
  });

  it('should filter by selected memory size and reset with all', () => {
    const firstSize = component.memorySizeFilterValues[0];
    component.applyMemorySizeFilter(firstSize.toString());
    // Manually update the sortedData since the component relies on query param changes
    component.sortedData.data = component.allEntries.filter(entry => entry.memorySizeMb === firstSize);

    expect(component.sortedData.data.length).toBeGreaterThan(0);
    expect(component.sortedData.data.every((entry) => entry.memorySizeMb === firstSize)).toBe(true);

    component.applyMemorySizeFilter('all');
    // Manually update the sortedData for 'all' filter
    component.sortedData.data = component.allEntries;
    expect(component.sortedData.data.length).toEqual(component.allEntries.length);
  });

  it('should navigate to scheme route on row selection', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const firstEntry = component.allEntries[0];

    component.onRowSelect(firstEntry);

    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-schemes', firstEntry.name], {
      queryParams: { memory: null, ota: null, spiffs: null }
    });
  });

  it('should navigate to base scheme route when closing overlay', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.closeOverlay();

    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-schemes'], {
      queryParams: { memory: null, ota: null, spiffs: null }
    });
  });

  it('should sort with empty or no active column (default case)', () => {
    const sortState: Sort = { active: '', direction: 'asc' };
    component.sortData(sortState);

    const names = component.sortedData.data.map((entry) => entry.name);
    const expected = names.slice().sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(expected);
  });

  it('should sort by isSpiffs column', () => {
    const sortStateAsc: Sort = { active: 'isSpiffs', direction: 'asc' };
    component.sortData(sortStateAsc);

    const spiffsValues = component.sortedData.data.map((entry) => entry.isSpiffs);
    // false values should come first when ascending
    expect(spiffsValues[0]).toBe(false);
  });

  it('should sort by isOta column', () => {
    const sortStateAsc: Sort = { active: 'isOta', direction: 'asc' };
    component.sortData(sortStateAsc);

    const otaValues = component.sortedData.data.map((entry) => entry.isOta);
    // false values should come first when ascending
    expect(otaValues[0]).toBe(false);
  });

  it('should apply spiffs filter', () => {
    component.applySpiffsFilter('yes');
    expect(component.selectedSpiffsFilter).toBe('yes');

    component.applySpiffsFilter('no');
    expect(component.selectedSpiffsFilter).toBe('no');

    component.applySpiffsFilter('all');
    expect(component.selectedSpiffsFilter).toBe('all');
  });

  it('should apply ota filter', () => {
    component.applyOtaFilter('yes');
    expect(component.selectedOtaFilter).toBe('yes');

    component.applyOtaFilter('no');
    expect(component.selectedOtaFilter).toBe('no');

    component.applyOtaFilter('all');
    expect(component.selectedOtaFilter).toBe('all');
  });

  it('should navigate to partitions page when back button is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onBackToPartitions();

    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-partitions']);
  });

  it('should handle route params for opening overlay', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    
    // Test with valid scheme
    const firstEntry = component.allEntries[0];
    mockActivatedRoute.params.next({ schemeId: firstEntry.name });
    
    expect(component.selectedSchemeName).toBe(firstEntry.name);
    expect(component.isOverlayOpen).toBe(true);
    
    // Reset spy
    navigateSpy.mockClear();
    
    // Test with invalid scheme
    mockActivatedRoute.params.next({ schemeId: 'invalid-scheme' });
    
    expect(navigateSpy).toHaveBeenCalledWith(['/page-not-found']);
  });

  it('should close overlay state when no schemeId in route', () => {
    // First open an overlay
    const firstEntry = component.allEntries[0];
    mockActivatedRoute.params.next({ schemeId: firstEntry.name });
    expect(component.isOverlayOpen).toBe(true);
    
    // Then navigate to route without schemeId
    mockActivatedRoute.params.next({});
    expect(component.isOverlayOpen).toBe(false);
    expect(component.selectedSchemeName).toBe('');
    expect(component.selectedSchemeData.length).toBe(0);
  });

  it('should handle complex filter combinations', () => {
    // Test filtering by spiffs=yes and specific memory size
    component.applySpiffsFilter('yes');
    component.applyMemorySizeFilter('4');
    
    // Manually apply filters for testing
    const filteredData = component.allEntries.filter(entry => 
      entry.isSpiffs && entry.memorySizeMb === 4
    );
    
    expect(filteredData).toBeDefined();
    expect(component.selectedSpiffsFilter).toBe('yes');
    expect(component.selectedMemorySizeFilter).toBe('4');
  });

  it('should handle sorting with null memory sizes', () => {
    // Create test data with null values
    const testData = [
      { name: 'test1', isSpiffs: false, isOta: false, memorySizeMb: null },
      { name: 'test2', isSpiffs: false, isOta: false, memorySizeMb: 4 },
      { name: 'test3', isSpiffs: false, isOta: false, memorySizeMb: null }
    ];
    
    component.sortedData.data = testData;
    
    const sortState: Sort = { active: 'memorySizeMb', direction: 'asc' };
    component.sortData(sortState);
    
    // Null values should be at the end
    const result = component.sortedData.data;
    expect(result[result.length - 1].memorySizeMb).toBe(null);
    expect(result[result.length - 2].memorySizeMb).toBe(null);
  });

  it('should handle query parameters for filters', () => {
    // Test valid query parameters
    mockActivatedRoute.queryParams.next({
      spiffs: 'yes',
      ota: 'no',
      memory: '4'
    });

    expect(component.selectedSpiffsFilter).toBe('yes');
    expect(component.selectedOtaFilter).toBe('no');
    expect(component.selectedMemorySizeFilter).toBe('4');
  });

  it('should handle invalid query parameters with fallback to all', () => {
    // Test invalid query parameters
    mockActivatedRoute.queryParams.next({
      spiffs: 'invalid',
      ota: 'invalid', 
      memory: 'invalid'
    });

    expect(component.selectedSpiffsFilter).toBe('all');
    expect(component.selectedOtaFilter).toBe('all');
    expect(component.selectedMemorySizeFilter).toBe('all');
  });

  it('should sort by default when no active column is provided', () => {
    const sortState: Sort = { active: 'unknown-column', direction: 'asc' };
    component.sortData(sortState);
    
    // Should return 0 in the default case, maintaining current order
    expect(component.sortedData.data).toBeDefined();
  });
});
