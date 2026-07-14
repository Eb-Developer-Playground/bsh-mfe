import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.scss'],
  imports: [CommonModule, MatExpansionModule],
})
export class AdditionalDetailsComponent implements OnInit {
  public signatory = [
    {
      code: 'Both-to-sign',
      title: 'Both to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: "'A' alone or 'B' and 'C' jointly",
      title: "'A' alone or 'B' and 'C' jointly",
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: "'A' with any other",
      title: "'A' with any other",
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'All to sign',
      title: 'All to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Any two to sign',
      title: 'Any two to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Both to sign',
      title: 'Both to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Director/Chief finance',
      title: 'Director/Chief finance',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Either to sign',
      title: 'Either to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Guardian',
      title: 'Guardian',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Legal administer',
      title: 'Legal administer',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Power of attorney',
      title: 'Power of attorney',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Self',
      title: 'Self',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'Three to sign',
      title: 'Three to sign',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: '3rd party mandate',
      title: '3rd party mandate',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
    {
      code: 'other',
      title: 'other',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing. Lorem ipsum dolor sit amet, consectetur adipiscing elit psum dolor sit amet, consectetur adipiscing.',
    },
  ];

  constructor(translateService: TranslateService) {}

  ngOnInit(): void {}
}
