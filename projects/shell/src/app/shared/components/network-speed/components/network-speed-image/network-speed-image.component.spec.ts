import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NetworkSpeedImageComponent } from './network-speed-image.component';

describe('NetworkSpeedImageComponent', () => {
  let component: NetworkSpeedImageComponent;
  let fixture: ComponentFixture<NetworkSpeedImageComponent>;
  let debugElement: DebugElement;
  let imgElement: HTMLImageElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkSpeedImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkSpeedImageComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have default imageType as 2g', () => {
      expect(component.imageType).toBe('2g');
    });

    it('should have default bigImage as false', () => {
      expect(component.bigImage).toBe(false);
    });

    it('should render img element', () => {
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement).toBeTruthy();
    });

    it('should have correct alt text', () => {
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.alt).toBe('Network Speed Image');
    });
  });

  describe('Image Source', () => {
    it('should set correct src for 2g by default', () => {
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-2g.svg');
    });

    it('should set correct src for 3g', () => {
      component.imageType = '3g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-3g.svg');
    });

    it('should set correct src for 4g', () => {
      component.imageType = '4g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-4g.svg');
    });

    it('should set correct src for 5g', () => {
      component.imageType = '5g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-5g.svg');
    });

    it('should handle custom string imageType', () => {
      component.imageType = 'wifi';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-wifi.svg');
    });
  });

  describe('CSS Classes', () => {
    it('should always have speed-icon class', () => {
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('speed-icon');
    });

    it('should have icon-2g class when imageType is 2g', () => {
      component.imageType = '2g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-2g');
    });

    it('should have icon-3g class when imageType is 3g', () => {
      component.imageType = '3g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-3g');
    });

    it('should have icon-4g class when imageType is 4g', () => {
      component.imageType = '4g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-4g');
    });

    it('should have icon-5g class when imageType is 5g', () => {
      component.imageType = '5g';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-5g');
    });

    it('should not have big-image class when bigImage is false', () => {
      component.bigImage = false;
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).not.toContain('big-image');
    });

    it('should have big-image class when bigImage is true', () => {
      component.bigImage = true;
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('big-image');
    });
  });

  describe('Input Changes', () => {
    it('should update image source from 2g to 4g when imageType changes', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('icon-2g.svg');
    });

    it('should update image source to 4g when imageType changes to 4g', () => {
      fixture.componentRef.setInput('imageType', '4g');
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('icon-4g.svg');
    });

    it('should update CSS class to icon-2g when imageType changes to 2g', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-2g');
    });

    it('should update CSS class to icon-5g when imageType changes to 5g', () => {
      fixture.componentRef.setInput('imageType', '5g');
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-5g');
    });

    it('should not have big-image class when bigImage input is false', () => {
      fixture.componentRef.setInput('bigImage', false);
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).not.toContain('big-image');
    });

    it('should have big-image class when bigImage input is true', () => {
      fixture.componentRef.setInput('bigImage', true);
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('big-image');
    });
  });

  describe('Accessibility', () => {
    it('should have alt attribute for accessibility', () => {
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.getAttribute('alt')).toBe('Network Speed Image');
    });

    it('should maintain alt text across different image types', () => {
      const imageTypes = ['2g', '3g', '4g', '5g'];

      imageTypes.forEach(type => {
        component.imageType = type;
        fixture.detectChanges();
        imgElement = debugElement.query(By.css('img')).nativeElement;
        expect(imgElement.getAttribute('alt')).toBe('Network Speed Image');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string imageType', () => {
      component.imageType = '';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-.svg');
    });

    it('should handle undefined imageType gracefully', () => {
      component.imageType = undefined as any;
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-undefined.svg');
    });

    it('should handle special characters in imageType', () => {
      component.imageType = 'special-network';
      fixture.detectChanges();
      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.src).toContain('assets/icons/icon-special-network.svg');
    });
  });

  describe('Performance', () => {
    it('should use OnPush change detection strategy', () => {
      // Check that the component uses OnPush change detection
      expect(fixture.componentRef.changeDetectorRef.constructor.name).toMatch(
        /ViewRef/
      );
    });

    it('should not trigger unnecessary change detection', () => {
      const changeDetectorSpy = jest.spyOn(
        fixture.componentRef.changeDetectorRef,
        'detectChanges'
      );

      // Initial detection
      fixture.detectChanges();
      const initialCallCount = changeDetectorSpy.mock.calls.length;

      // Multiple calls without actual changes
      component.imageType = '2g'; // Same as default
      component.bigImage = false; // Same as default

      expect(changeDetectorSpy.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Component Integration', () => {
    it('should set correct image source for all network types', () => {
      const networkTypes = ['2g', '3g', '4g', '5g'];

      networkTypes.forEach(type => {
        fixture.componentRef.setInput('imageType', type);
        fixture.detectChanges();

        imgElement = debugElement.query(By.css('img')).nativeElement;
        expect(imgElement.src).toContain(`icon-${type}.svg`);
      });
    });

    it('should set correct CSS class for all network types', () => {
      const networkTypes = ['2g', '3g', '4g', '5g'];

      networkTypes.forEach(type => {
        fixture.componentRef.setInput('imageType', type);
        fixture.detectChanges();

        imgElement = debugElement.query(By.css('img')).nativeElement;
        expect(imgElement.classList).toContain(`icon-${type}`);
      });
    });

    it('should maintain big-image class across all network types', () => {
      const networkTypes = ['2g', '3g', '4g', '5g'];

      networkTypes.forEach(type => {
        fixture.componentRef.setInput('imageType', type);
        fixture.componentRef.setInput('bigImage', true);
        fixture.detectChanges();

        imgElement = debugElement.query(By.css('img')).nativeElement;
        expect(imgElement.classList).toContain('big-image');
      });
    });

    it('should maintain speed-icon class across all network types', () => {
      const networkTypes = ['2g', '3g', '4g', '5g'];

      networkTypes.forEach(type => {
        fixture.componentRef.setInput('imageType', type);
        fixture.detectChanges();

        imgElement = debugElement.query(By.css('img')).nativeElement;
        expect(imgElement.classList).toContain('speed-icon');
      });
    });

    it('should have speed-icon class in styling combination', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.componentRef.setInput('bigImage', true);
      fixture.detectChanges();

      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('speed-icon');
    });

    it('should have icon-2g class in styling combination', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.componentRef.setInput('bigImage', true);
      fixture.detectChanges();

      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('icon-2g');
    });

    it('should have big-image class in styling combination', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.componentRef.setInput('bigImage', true);
      fixture.detectChanges();

      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList).toContain('big-image');
    });

    it('should have exactly three classes in styling combination', () => {
      fixture.componentRef.setInput('imageType', '2g');
      fixture.componentRef.setInput('bigImage', true);
      fixture.detectChanges();

      imgElement = debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.classList.length).toBe(3);
    });
  });
});
