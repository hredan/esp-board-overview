import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Params, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Esp8266SchemeListComponent } from './esp8266-scheme-list.component';

@Component({
  selector: 'app-test-dummy',
  template: '',
  standalone: true
})
class TestDummyComponent {}

describe('Esp8266SchemeListComponent', () => {
  let component: Esp8266SchemeListComponent;
  let fixture: ComponentFixture<Esp8266SchemeListComponent>;
  let router: Router;
  let mockActivatedRoute: {
    params: BehaviorSubject<Params>;
    queryParams: BehaviorSubject<Params>;
  };

  beforeEach(async () => {
    mockActivatedRoute = {
      params: new BehaviorSubject({}),
      queryParams: new BehaviorSubject({})
    };

    await TestBed.configureTestingModule({
      imports: [Esp8266SchemeListComponent],
      providers: [
        provideRouter([
          { path: 'esp8266-schemes', component: Esp8266SchemeListComponent },
          { path: 'esp8266-schemes/:schemeId', component: Esp8266SchemeListComponent },
          { path: 'esp8266-partitions', component: TestDummyComponent },
          { path: 'page-not-found', component: TestDummyComponent }
        ]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Esp8266SchemeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render scheme list with memory size column', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ESP8266 Partition Schemes');
    expect(text).toContain('SPIFFS');
    expect(text).toContain('Memory Size');
    expect(component.sortedData.data.length).toBeGreaterThan(0);
  });

  it('should sort by name ascending', () => {
    const sortState: Sort = { active: 'name', direction: 'asc' };
    component.sortData(sortState);

    const names = component.sortedData.data.map((entry) => entry.name);
    const expected = names.slice().sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(expected);
  });

  it('should sort by name descending', () => {
    component.sortedData.data = [
      { name: 'a', isSpiffs: false, memorySizeMb: 2 },
      { name: 'b', isSpiffs: true, memorySizeMb: 4 }
    ];

    component.sortData({ active: 'name', direction: 'desc' });

    expect(component.sortedData.data.map((entry) => entry.name)).toEqual(['b', 'a']);
  });

  it('should reset to name sort when sort state is empty', () => {
    component.sortedData.data = [
      { name: 'b', isSpiffs: false, memorySizeMb: 2 },
      { name: 'a', isSpiffs: true, memorySizeMb: 4 }
    ];

    component.sortData({ active: '', direction: '' });

    expect(component.sortedData.data.map((entry) => entry.name)).toEqual(['a', 'b']);
  });

  it('should sort by memory size ascending with nulls at end', () => {
    component.sortedData.data = [
      { name: 'x', isSpiffs: false, memorySizeMb: null },
      { name: 'a', isSpiffs: true, memorySizeMb: 4 },
      { name: 'b', isSpiffs: false, memorySizeMb: 2 }
    ];

    const sortState: Sort = { active: 'memorySizeMb', direction: 'asc' };
    component.sortData(sortState);

    expect(component.sortedData.data[0].memorySizeMb).toBe(2);
    expect(component.sortedData.data[1].memorySizeMb).toBe(4);
    expect(component.sortedData.data[2].memorySizeMb).toBeNull();
  });

  it('should sort by memory size descending', () => {
    component.sortedData.data = [
      { name: 'a', isSpiffs: false, memorySizeMb: 2 },
      { name: 'b', isSpiffs: true, memorySizeMb: 4 }
    ];

    component.sortData({ active: 'memorySizeMb', direction: 'desc' });

    expect(component.sortedData.data.map((entry) => entry.memorySizeMb)).toEqual([4, 2]);
  });

  it('should keep order stable when both memory sizes are null', () => {
    component.sortedData.data = [
      { name: 'first-null', isSpiffs: false, memorySizeMb: null },
      { name: 'second-null', isSpiffs: true, memorySizeMb: null }
    ];

    const sortState: Sort = { active: 'memorySizeMb', direction: 'asc' };
    component.sortData(sortState);

    expect(component.sortedData.data.map((entry) => entry.name)).toEqual(['first-null', 'second-null']);
  });

  it('should sort by SPIFFS ascending', () => {
    component.sortedData.data = [
      { name: 'with-spiffs', isSpiffs: true, memorySizeMb: 4 },
      { name: 'without-spiffs', isSpiffs: false, memorySizeMb: 4 }
    ];

    const sortState: Sort = { active: 'isSpiffs', direction: 'asc' };
    component.sortData(sortState);

    expect(component.sortedData.data[0].isSpiffs).toBe(false);
    expect(component.sortedData.data[1].isSpiffs).toBe(true);
  });

  it('should sort by SPIFFS descending', () => {
    component.sortedData.data = [
      { name: 'with-spiffs', isSpiffs: true, memorySizeMb: 4 },
      { name: 'without-spiffs', isSpiffs: false, memorySizeMb: 4 }
    ];

    component.sortData({ active: 'isSpiffs', direction: 'desc' });

    expect(component.sortedData.data[0].isSpiffs).toBe(true);
    expect(component.sortedData.data[1].isSpiffs).toBe(false);
  });

  it('should leave order unchanged for unsupported sort field', () => {
    component.sortedData.data = [
      { name: 'b', isSpiffs: false, memorySizeMb: 2 },
      { name: 'a', isSpiffs: true, memorySizeMb: 4 }
    ];

    component.sortData({ active: 'unsupported', direction: 'asc' });

    expect(component.sortedData.data.map((entry) => entry.name)).toEqual(['b', 'a']);
  });

  it('should cover nullable comparator when first value is null', () => {
    component.sortedData.data = [
      { name: 'null-first', isSpiffs: false, memorySizeMb: null },
      { name: 'size-second', isSpiffs: true, memorySizeMb: 4 }
    ];

    component.sortData({ active: 'memorySizeMb', direction: 'asc' });

    expect(component.sortedData.data[0].name).toBe('size-second');
    expect(component.sortedData.data[1].name).toBe('null-first');
  });

  it('should cover nullable comparator when second value is null', () => {
    component.sortedData.data = [
      { name: 'size-first', isSpiffs: false, memorySizeMb: 4 },
      { name: 'null-second', isSpiffs: true, memorySizeMb: null }
    ];

    component.sortData({ active: 'memorySizeMb', direction: 'asc' });

    expect(component.sortedData.data[0].name).toBe('size-first');
    expect(component.sortedData.data[1].name).toBe('null-second');
  });

  it('should apply filters from query params', () => {
    const spiffsEntry = component.allEntries.find((entry) => entry.isSpiffs);
    expect(spiffsEntry).toBeDefined();

    mockActivatedRoute.queryParams.next({ spiffs: 'yes', memory: String(spiffsEntry?.memorySizeMb) });

    expect(component.selectedSpiffsFilter).toBe('yes');
    expect(component.selectedMemorySizeFilter).toBe(String(spiffsEntry?.memorySizeMb));
    expect(component.sortedData.data.every((entry) => entry.isSpiffs)).toBe(true);
    expect(component.sortedData.data.every((entry) => entry.memorySizeMb === spiffsEntry?.memorySizeMb)).toBe(true);
  });

  it('should fall back to all filters for invalid query params', () => {
    mockActivatedRoute.queryParams.next({ spiffs: 'maybe', memory: 'not-a-number' });

    expect(component.selectedSpiffsFilter).toBe('all');
    expect(component.selectedMemorySizeFilter).toBe('all');
    expect(component.sortedData.data.length).toBe(component.allEntries.length);
  });

  it('should accept explicit all filter values from query params', () => {
    mockActivatedRoute.queryParams.next({ spiffs: 'all', memory: 'all' });

    expect(component.selectedSpiffsFilter).toBe('all');
    expect(component.selectedMemorySizeFilter).toBe('all');
  });

  it('should update query params when filters change', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.applySpiffsFilter('yes');
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({ spiffs: 'yes' }),
      queryParamsHandling: 'merge'
    });

    component.applyMemorySizeFilter('4');
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({ memory: '4', spiffs: 'yes' }),
      queryParamsHandling: 'merge'
    });
  });

  it('should navigate to scheme route on row click', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.selectedSpiffsFilter = 'yes';
    component.selectedMemorySizeFilter = '4';
    component.onRowSelect({ name: 'eagle.flash.4m1m', isSpiffs: true, memorySizeMb: 4 });

    expect(navigateSpy).toHaveBeenCalledWith(['/esp8266-schemes', 'eagle.flash.4m1m'], {
      queryParams: { memory: '4', spiffs: 'yes' }
    });
  });

  it('should navigate to base route when closing overlay', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.selectedSpiffsFilter = 'no';
    component.selectedMemorySizeFilter = 'all';

    component.closeOverlay();

    expect(navigateSpy).toHaveBeenCalledWith(['/esp8266-schemes'], {
      queryParams: { memory: null, spiffs: 'no' }
    });
  });

  it('should navigate to partitions route via back button', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onBackToPartitions();

    expect(navigateSpy).toHaveBeenCalledWith(['/esp8266-partitions']);
  });

  it('should open overlay for valid scheme route param', () => {
    const first = component.allEntries[0];

    mockActivatedRoute.params.next({ schemeId: first.name });

    expect(component.isOverlayOpen).toBe(true);
    expect(component.selectedSchemeName).toBe(first.name);
    expect(component.selectedSchemeData.length).toBeGreaterThan(0);
  });

  it('should navigate to page-not-found for invalid scheme route param', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    mockActivatedRoute.params.next({ schemeId: 'not-a-valid-scheme' });

    expect(navigateSpy).toHaveBeenCalledWith(['/page-not-found']);
  });

  it('should close overlay state when route has no schemeId', () => {
    const first = component.allEntries[0];
    mockActivatedRoute.params.next({ schemeId: first.name });
    expect(component.isOverlayOpen).toBe(true);

    mockActivatedRoute.params.next({});
    expect(component.isOverlayOpen).toBe(false);
    expect(component.selectedSchemeName).toBe('');
    expect(component.selectedSchemeData).toEqual([]);
  });
});
