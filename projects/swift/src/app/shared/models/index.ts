export interface Service {
  title: string;
  text: string;
  icon: string;
  value: string;
  url?: string;
}

export interface ServiceSection {
  title: string;
  text: string;
  services: Service[];
}
