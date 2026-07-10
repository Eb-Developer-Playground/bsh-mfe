import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoSignatureComponent } from './photo-signature.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PhotoSignatureComponent', () => {
  let component: PhotoSignatureComponent;
  let fixture: ComponentFixture<PhotoSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoSignatureComponent, TranslateModule.forRoot()],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhotoSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
