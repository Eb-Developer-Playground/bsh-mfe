import { CommonModule } from '@angular/common';
import { Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() fullName!: string;
  @Input() subTitle!: string;
  initials!: string;

  constructor() {}

  ngOnInit(): void {
    this.setInitials();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fullName']?.currentValue) this.setInitials();
  }

  setInitials(): void {
  if (!this.fullName) {
    this.initials = '';
    return;
  }
  this.initials = this.fullName
    .split(' ')
    .map(n => n.trim())
    .map(n => n.charAt(0).toUpperCase())
    .join('');
}

}
