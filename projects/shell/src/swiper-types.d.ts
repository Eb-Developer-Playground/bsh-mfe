declare module 'swiper/swiper-element' {
  export class Swiper extends HTMLElement {}
  export class SwiperSlide extends HTMLElement {}
}
declare module 'swiper/element/bundle' {
  export function register(): void;
}
