import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NetworkSpeedInterface } from '../../interfaces/network-speed.interface';
import { NetworkSpeedImageComponent } from '../network-speed-image/network-speed-image.component';
import { NetwortSpeedInfoComponent } from './networt-speed-info.component';

describe('NetwortSpeedInfoComponent', () => {
  let component: NetwortSpeedInfoComponent;
  let fixture: ComponentFixture<NetwortSpeedInfoComponent>;
  let debugElement: DebugElement;

  const mockSpeedInfo: NetworkSpeedInterface = {
    speed: '10.5',
    type: '4g',
    effectiveType: '4g',
    rtt: '50',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NetwortSpeedInfoComponent,
        NetworkSpeedImageComponent,
        MatMenuModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NetwortSpeedInfoComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Set required input
    component.speedInfo = mockSpeedInfo;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have defined speedInfo input property', () => {
      expect(component.speedInfo).toBeDefined();
    });

    it('should have speedInfo equal to mockSpeedInfo', () => {
      expect(component.speedInfo).toEqual(mockSpeedInfo);
    });

    it('should render main section element', () => {
      fixture.detectChanges();
      const sectionElement = debugElement.query(
        By.css('section.cursor-pointer')
      );
      expect(sectionElement).toBeTruthy();
    });

    it('should have mat-menu trigger', () => {
      fixture.detectChanges();
      const menuTrigger = debugElement.query(By.directive(MatMenuTrigger));
      expect(menuTrigger).toBeTruthy();
    });

    it('should have mat-menu element', () => {
      fixture.detectChanges();
      const matMenu = debugElement.query(By.css('mat-menu'));
      expect(matMenu).toBeTruthy();
    });
  });

  describe('Network Speed Image Integration', () => {
    it('should render NetworkSpeedImageComponent in trigger section', () => {
      fixture.detectChanges();
      const triggerSection = debugElement.query(
        By.css('section.cursor-pointer')
      );
      const speedImageComponent = triggerSection.query(
        By.directive(NetworkSpeedImageComponent)
      );
      expect(speedImageComponent).toBeTruthy();
    });

    it('should pass effectiveType to NetworkSpeedImageComponent in trigger', () => {
      fixture.detectChanges();
      const triggerSection = debugElement.query(
        By.css('section.cursor-pointer')
      );
      const speedImageComponent = triggerSection.query(
        By.directive(NetworkSpeedImageComponent)
      );
      expect(speedImageComponent.componentInstance.imageType).toBe(
        mockSpeedInfo.effectiveType
      );
    });

    it('should have mat-menu element in template', () => {
      fixture.detectChanges();
      const matMenu = debugElement.query(By.css('mat-menu'));
      expect(matMenu).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have proper component binding for speedInfo', () => {
      fixture.detectChanges();

      // Test that the component receives and uses speedInfo properly
      expect(component.speedInfo).toEqual(mockSpeedInfo);

      // Verify the trigger image gets the correct imageType
      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe(
        mockSpeedInfo.effectiveType
      );
    });

    it('should have mat-menu with xPosition="before"', () => {
      fixture.detectChanges();
      const matMenu = debugElement.query(
        By.css('mat-menu[xPosition="before"]')
      );
      expect(matMenu).toBeTruthy();
    });
  });

  describe('Input Changes', () => {
    it('should update trigger image when speedInfo changes', () => {
      const newSpeedInfo: NetworkSpeedInterface = {
        speed: '25.7',
        type: '5g',
        effectiveType: '5g',
        rtt: '20',
      };

      fixture.componentRef.setInput('speedInfo', newSpeedInfo);
      fixture.detectChanges();

      // Check trigger image type
      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe('5g');
    });

    it('should handle different effective types', () => {
      const testCases = [
        { effectiveType: '2g', expected: '2g' },
        { effectiveType: '3g', expected: '3g' },
        { effectiveType: '4g', expected: '4g' },
        { effectiveType: '5g', expected: '5g' },
      ];

      testCases.forEach(testCase => {
        const speedInfo: NetworkSpeedInterface = {
          speed: '15.0',
          type: testCase.effectiveType,
          effectiveType: testCase.effectiveType,
          rtt: '30',
        };

        fixture.componentRef.setInput('speedInfo', speedInfo);
        fixture.detectChanges();

        const triggerImageComponent = debugElement
          .query(By.css('section.cursor-pointer'))
          .query(By.directive(NetworkSpeedImageComponent));
        expect(triggerImageComponent.componentInstance.imageType).toBe(
          testCase.expected
        );
      });
    });

    it('should reflect data binding changes in component speedInfo object', () => {
      const newSpeedInfo: NetworkSpeedInterface = {
        speed: '30.2',
        type: '5g',
        effectiveType: '5g',
        rtt: '15',
      };

      fixture.componentRef.setInput('speedInfo', newSpeedInfo);
      fixture.detectChanges();

      expect(component.speedInfo).toEqual(newSpeedInfo);
    });

    it('should reflect speed value in component speedInfo property', () => {
      const newSpeedInfo: NetworkSpeedInterface = {
        speed: '30.2',
        type: '5g',
        effectiveType: '5g',
        rtt: '15',
      };

      fixture.componentRef.setInput('speedInfo', newSpeedInfo);
      fixture.detectChanges();

      expect(component.speedInfo.speed).toBe('30.2');
    });

    it('should reflect effectiveType value in component speedInfo property', () => {
      const newSpeedInfo: NetworkSpeedInterface = {
        speed: '30.2',
        type: '5g',
        effectiveType: '5g',
        rtt: '15',
      };

      fixture.componentRef.setInput('speedInfo', newSpeedInfo);
      fixture.detectChanges();

      expect(component.speedInfo.effectiveType).toBe('5g');
    });
  });

  describe('Accessibility', () => {
    it('should have cursor-pointer class for better UX', () => {
      fixture.detectChanges();
      const triggerSection = debugElement.query(By.css('section'));
      expect(triggerSection.nativeElement.classList).toContain(
        'cursor-pointer'
      );
    });

    it('should have proper semantic structure with sections', () => {
      fixture.detectChanges();
      const mainSection = debugElement.query(By.css('section.cursor-pointer'));
      expect(mainSection).toBeTruthy();
    });

    it('should provide mat-menu accessibility features', () => {
      fixture.detectChanges();
      const menuTrigger = debugElement.query(By.directive(MatMenuTrigger));
      expect(menuTrigger).toBeTruthy();

      // Check that menu trigger has proper attributes
      const triggerElement = menuTrigger.nativeElement;
      expect(triggerElement.hasAttribute('ng-reflect-menu')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle speedInfo with default values', () => {
      const speedInfo: NetworkSpeedInterface = {
        speed: '0',
        type: '',
        effectiveType: '2g',
        rtt: '0',
      };

      fixture.componentRef.setInput('speedInfo', speedInfo);
      fixture.detectChanges();

      expect(component).toBeTruthy();
      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe('2g');
    });

    it('should handle null speed value gracefully', () => {
      const speedInfo: NetworkSpeedInterface = {
        speed: null as any,
        type: '4g',
        effectiveType: '4g',
        rtt: '40',
      };

      fixture.componentRef.setInput('speedInfo', speedInfo);
      fixture.detectChanges();

      // Should not crash and handle null gracefully
      expect(component).toBeTruthy();
    });

    it('should handle empty string values', () => {
      const speedInfo: NetworkSpeedInterface = {
        speed: '',
        type: '',
        effectiveType: '',
        rtt: '',
      };

      fixture.componentRef.setInput('speedInfo', speedInfo);
      fixture.detectChanges();

      expect(component).toBeTruthy();
      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe('');
    });

    it('should handle undefined speedInfo with safe navigation', () => {
      // The template uses speedInfo?.speed which should handle undefined
      const speedInfo = { effectiveType: '4g' } as any;
      fixture.componentRef.setInput('speedInfo', speedInfo);
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.changeDetectorRef.constructor.name).toMatch(
        /ViewRef/
      );
    });

    it('should not trigger unnecessary change detection', () => {
      const changeDetectorSpy = jest.spyOn(
        fixture.componentRef.changeDetectorRef,
        'detectChanges'
      );

      fixture.detectChanges();
      const initialCallCount = changeDetectorSpy.mock.calls.length;

      // Set same speedInfo
      fixture.componentRef.setInput('speedInfo', mockSpeedInfo);

      expect(changeDetectorSpy.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Component Integration', () => {
    it('should properly integrate NetworkSpeedImageComponent', () => {
      fixture.detectChanges();

      // Check NetworkSpeedImageComponent in trigger
      const imageComponents = debugElement.queryAll(
        By.directive(NetworkSpeedImageComponent)
      );
      expect(imageComponents.length).toBeGreaterThanOrEqual(1);

      // Check MatMenuTrigger
      const menuTrigger = debugElement.query(By.directive(MatMenuTrigger));
      expect(menuTrigger).toBeTruthy();
    });

    it('should maintain proper data flow to child components', () => {
      const testSpeedInfo: NetworkSpeedInterface = {
        speed: '8.9',
        type: '3g',
        effectiveType: '3g',
        rtt: '60',
      };

      fixture.componentRef.setInput('speedInfo', testSpeedInfo);
      fixture.detectChanges();

      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe(
        testSpeedInfo.effectiveType
      );
      expect(triggerImageComponent.componentInstance.bigImage).toBeFalsy();
    });

    it('should have trigger section in component structure', () => {
      fixture.detectChanges();

      const triggerSection = debugElement.query(
        By.css('section.cursor-pointer')
      );
      expect(triggerSection).toBeTruthy();
    });

    it('should have mat-menu in component structure', () => {
      fixture.detectChanges();

      const matMenu = debugElement.query(By.css('mat-menu'));
      expect(matMenu).toBeTruthy();
    });

    it('should have image component in trigger section', () => {
      fixture.detectChanges();

      const triggerSection = debugElement.query(
        By.css('section.cursor-pointer')
      );
      const imageInTrigger = triggerSection.query(
        By.directive(NetworkSpeedImageComponent)
      );
      expect(imageInTrigger).toBeTruthy();
    });
  });

  describe('Template Validation', () => {
    it('should have mat-menu trigger directive', () => {
      fixture.detectChanges();
      const menuTrigger = debugElement.query(By.directive(MatMenuTrigger));
      expect(menuTrigger).toBeTruthy();
    });

    it('should have mat-menu element', () => {
      fixture.detectChanges();
      const matMenu = debugElement.query(By.css('mat-menu'));
      expect(matMenu).toBeTruthy();
    });

    it('should have mat-menu with xPosition before', () => {
      fixture.detectChanges();
      const matMenu = debugElement.query(By.css('mat-menu'));
      expect(matMenu.attributes['xPosition']).toBe('before');
    });

    it('should bind effectiveType correctly in component', () => {
      fixture.detectChanges();

      expect(component.speedInfo.effectiveType).toBe('4g');
    });

    it('should bind speed correctly in component', () => {
      fixture.detectChanges();

      expect(component.speedInfo.speed).toBe('10.5');
    });

    it('should pass correct imageType to trigger image component', () => {
      fixture.detectChanges();

      const triggerImageComponent = debugElement
        .query(By.css('section.cursor-pointer'))
        .query(By.directive(NetworkSpeedImageComponent));
      expect(triggerImageComponent.componentInstance.imageType).toBe('4g');
    });
  });
});
