import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompilerOutputComponent } from './compiler-output.component';

describe('CompilerOutputComponent', () => {
  let component: CompilerOutputComponent;
  let fixture: ComponentFixture<CompilerOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompilerOutputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompilerOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
