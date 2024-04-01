import { EFeature } from 'src/app/core/models/common.model';

export interface MenuItem {
  id?: number;
  label?: any;
  icon?: string;
  link?: string;
  subItems?: any;
  parentId?: number;
  isUiElement?: boolean;
  name?: string;
  disabled?: boolean;
  featureName?: EFeature;
  activeString?: string | string[];
}
