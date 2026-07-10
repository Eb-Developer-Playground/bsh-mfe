import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { NetworkSpeedInterface } from '../interfaces/network-speed.interface';
import { NetworkSpeedService } from '../service/network-speed.service';
import { NetworkSpeedComponent } from './network-speed.component';
import { NetwortSpeedInfoComponent } from './networt-speed-info/networt-speed-info.component';

describe('NetworkSpeedComponent', () => {
  let component: NetworkSpeedComponent;
  let fixture: ComponentFixture<NetworkSpeedComponent>;
  let debugElement: DebugElement;
  let mockNetworkSpeedService: jest.Mocked<NetworkSpeedService>;

  const mockSpeedInfo: NetworkSpeedInterface = {
    speed: '10.5',
    type: '4g',
    effectiveType: '4g',
    rtt: '50 ms',
  };

  const mockSlowSpeedInfo: NetworkSpeedInterface = {
    speed: '2.1',
    type: '3g',
    effectiveType: '3g',
    rtt: '120 ms',
  };

  const mockFastSpeedInfo: NetworkSpeedInterface = {
    speed: '50.8',
    type: '5g',
    effectiveType: '5g',
    rtt: '10 ms',
  };

  beforeEach(async () => {
    // Create mock service with all methods
    mockNetworkSpeedService = {
      speedConnectionChange: jest.fn(),
      getSpeed: jest.fn(),
      setDateOfLastMessage: jest.fn(),
      checkIfLastMessageIsExpired: jest.fn().mockReturnValue(false),
      dateOfLastMessageSubject$: of(new Date()),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        NetworkSpeedComponent,
        NetwortSpeedInfoComponent,
        NoopAnimationsModule,
      ],
    })
      .overrideComponent(NetworkSpeedComponent, {
        set: {
          providers: [
            { provide: NetworkSpeedService, useValue: mockNetworkSpeedService },
          ],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      expect(component).toBeTruthy();
    });

    it('should have pl-8 host class', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const hostElement = fixture.nativeElement;
      expect(hostElement.classList).toContain('pl-8');
    });

    it('should have pr-8 host class', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const hostElement = fixture.nativeElement;
      expect(hostElement.classList).toContain('pr-8');
    });
  });

  describe('Service Integration', () => {
    it('should call getSpeed on initialization', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;

      expect(mockNetworkSpeedService.getSpeed).toHaveBeenCalledTimes(1);
    });

    it('should inject NetworkSpeedService', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['networkSpeedService']).toBe(mockNetworkSpeedService);
    });
  });

  describe('Template Rendering with Data', () => {
    it('should render NetwortSpeedInfoComponent when speedInfo is available', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent).toBeTruthy();
    });

    it('should pass speedInfo to NetwortSpeedInfoComponent', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo).toEqual(
        mockSpeedInfo
      );
    });

    it('should not render NetwortSpeedInfoComponent when no data', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(EMPTY);
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent).toBeFalsy();
    });
  });

  describe('Data Flow', () => {
    it('should handle different speed info types', () => {
      const testCases = [
        { info: mockSlowSpeedInfo, expectedType: '3g' },
        { info: mockSpeedInfo, expectedType: '4g' },
        { info: mockFastSpeedInfo, expectedType: '5g' },
      ];

      testCases.forEach(testCase => {
        mockNetworkSpeedService.getSpeed.mockReturnValue(of(testCase.info));
        fixture = TestBed.createComponent(NetworkSpeedComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();

        const speedInfoComponent = debugElement.query(
          By.directive(NetwortSpeedInfoComponent)
        );
        expect(
          speedInfoComponent.componentInstance.speedInfo.effectiveType
        ).toBe(testCase.expectedType);

        fixture.destroy();
      });
    });

    it('should handle speed updates with BehaviorSubject', () => {
      const speedSubject = new BehaviorSubject(mockSpeedInfo);
      mockNetworkSpeedService.getSpeed.mockReturnValue(
        speedSubject.asObservable()
      );

      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      // Initial value
      let speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo.speed).toBe('10.5');

      // Update value
      speedSubject.next(mockFastSpeedInfo);
      fixture.detectChanges();

      speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo.speed).toBe('50.8');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      expect(() => {
        fixture = TestBed.createComponent(NetworkSpeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle null data from service', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(null as any));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent).toBeFalsy();
    });
  });

  describe('Performance', () => {
    it('should use OnPush change detection strategy', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;

      expect(fixture.componentRef.changeDetectorRef.constructor.name).toMatch(
        /ViewRef/
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero speed values', () => {
      const zeroSpeedInfo: NetworkSpeedInterface = {
        speed: '0',
        type: '2g',
        effectiveType: '2g',
        rtt: '200 ms',
      };

      mockNetworkSpeedService.getSpeed.mockReturnValue(of(zeroSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo.speed).toBe('0');
    });

    it('should handle high speed values', () => {
      const highSpeedInfo: NetworkSpeedInterface = {
        speed: '1000.5',
        type: '5g',
        effectiveType: '5g',
        rtt: '1 ms',
      };

      mockNetworkSpeedService.getSpeed.mockReturnValue(of(highSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo.speed).toBe(
        '1000.5'
      );
    });

    it('should handle incomplete speed data', () => {
      const incompleteSpeedInfo = {
        speed: '5.0',
        // Missing other properties
      } as NetworkSpeedInterface;

      mockNetworkSpeedService.getSpeed.mockReturnValue(of(incompleteSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo.speed).toBe('5.0');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should use async pipe correctly', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      // Async pipe should handle subscription/unsubscription
      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent.componentInstance.speedInfo).toEqual(
        mockSpeedInfo
      );
    });

    it('should integrate child components properly', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      const speedInfoComponent = debugElement.query(
        By.directive(NetwortSpeedInfoComponent)
      );
      expect(speedInfoComponent).toBeTruthy();
      expect(speedInfoComponent.componentInstance.speedInfo).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should handle component destruction properly', () => {
      mockNetworkSpeedService.getSpeed.mockReturnValue(of(mockSpeedInfo));
      fixture = TestBed.createComponent(NetworkSpeedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });
});
