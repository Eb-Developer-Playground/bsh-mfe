import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ListItemType } from '../../models/common/list-item.model';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit {
  @Input() displayInfo!: { type: ListItemType; label: string; value: string };

  @ViewChild('LABELANDVALUE', { static: true })
  labelAndValueTemplate!: TemplateRef<any>;
  @ViewChild('ICONITEM', { static: true }) iconTemplate!: TemplateRef<any>;
  @ViewChild('ICONNAMEINITIALS', { static: true })
  iconNameInitialsTemplate!: TemplateRef<any>;

  nameIntial!: string;

  ngOnInit(): void {
    if (
      this.displayInfo &&
      this.displayInfo.type === ListItemType.ICONNAMEINITIALS
    ) {
      this.nameIntial = this.setNameInitial();
    }
  }

  dynamicTemplateType(templateType: ListItemType) {
    if (!templateType) {
      return this.labelAndValueTemplate;
    }
    const templateTypes = {
      [ListItemType.LABELANDVALUE]: this.labelAndValueTemplate,
      [ListItemType.ICONNAMEINITIALS]: this.iconNameInitialsTemplate,
      [ListItemType.ICONITEM]: this.iconTemplate,
    };
    return templateTypes[templateType];
  }

  private setNameInitial() {
    return `${this.displayInfo.label?.split(' ')[0]?.charAt(0)} ${this.displayInfo.label?.split(' ')[1]?.charAt(0)}`;
  }
}
