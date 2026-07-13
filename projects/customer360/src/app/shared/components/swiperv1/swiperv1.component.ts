import {
  AfterViewInit,
  Component,
  ContentChild,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
type SwiperContainer = HTMLElement & Record<string, any> & { swiper?: { slidePrev: (d?: number) => void; slideNext: (d?: number) => void } };
import { register } from 'swiper/element/bundle';
@Component({
  selector: 'app-swiperv1',
  imports: [],
  templateUrl: './swiperv1.component.html',
  styleUrl: './swiperv1.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Swiperv1Component implements OnInit, AfterViewInit, OnDestroy {
  @Input() swiperContainerId = '';
  index = 0;
  slidePerView = 3;

  @ContentChild('swiper') swiperRef!: ElementRef<SwiperContainer>;
  initialized = false;
  private timeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    register();
  }

  ngAfterViewInit(): void {
    if (!this.swiperRef?.nativeElement) {
      console.warn('Swiper reference not found');
      return;
    }

    this.swiperRef.nativeElement['slidesPerView'] = 3;
    this.swiperRef.nativeElement['pagination'] = true;
    this.swiperRef.nativeElement['navigation'] = false;
    this.swiperRef.nativeElement['watchOverflow'] = true;
    this.swiperRef.nativeElement['slidesOffsetAfter'] = 60;
    this.swiperRef.nativeElement['spaceBetween'] = 20;
    this.swiperRef.nativeElement['loop'] = true;
    this.swiperRef.nativeElement['breakpoints'] = {
      320: {
        slidesPerView: 3,
      },
      560: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 3,
      },
      1900: {
        slidesPerView: 4,
      },
    };

    setTimeout(() => {
      try {
        const swiperElement = document.getElementById(this.swiperContainerId);
        const containerElement = swiperElement?.getElementsByClassName('swiperContainer')[0];
        const shadowRoot = containerElement?.shadowRoot?.firstChild as HTMLElement;

        if (shadowRoot && shadowRoot.style) {
          shadowRoot.style.paddingBottom = '35px';
        }
      } catch (error) {
        console.warn('Error setting swiper padding:', error);
      }
    }, 300);
  }

  changeSlide(prevOrNext: number): void {
    if (!this.swiperRef?.nativeElement?.swiper) {
      console.warn('Swiper instance not available');
      return;
    }

    if (prevOrNext === -1) {
      this.swiperRef.nativeElement.swiper.slidePrev(1000);
    } else {
      this.swiperRef.nativeElement.swiper.slideNext(1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}