import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sort } from '@angular/material/sort';
import { provideRouter, Router } from '@angular/router';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Esp32SchemeListComponent],
      providers: [
        provideRouter([
          { path: 'esp32-schemes', component: Esp32SchemeListComponent },
          { path: 'esp32-schemes/:schemeId', component: Esp32SchemeListComponent },
          { path: 'page-not-found', component: TestDummyComponent }
        ])
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

    expect(component.sortedData.data.length).toBeGreaterThan(0);
    expect(component.sortedData.data.every((entry) => entry.memorySizeMb === firstSize)).toBe(true);

    component.applyMemorySizeFilter('all');
    expect(component.sortedData.data.length).toEqual(component.allEntries.length);
  });

  it('should navigate to scheme route on row selection', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const firstEntry = component.allEntries[0];

    component.onRowSelect(firstEntry);

    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-schemes', firstEntry.name]);
  });

  it('should navigate to base scheme route when closing overlay', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.closeOverlay();

    expect(navigateSpy).toHaveBeenCalledWith(['/esp32-schemes']);
  });
});
